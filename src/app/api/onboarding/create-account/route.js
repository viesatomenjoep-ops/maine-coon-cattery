import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100);
}

// Zelf een fokkerij aanmaken na het registreren met Google. De gebruiker is op
// dit moment al ingelogd via Supabase; we maken alleen nog zijn eigen omgeving
// (tenant) en koppelen zijn profiel daaraan.
export async function POST(request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'Serverconfiguratie ontbreekt.' }, { status: 500 });

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Wie vraagt dit aan?
  let caller = null;
  try {
    const cookieStore = await cookies();
    const supa = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supa.auth.getUser();
    caller = user;
  } catch {}
  if (!caller) return NextResponse.json({ error: 'Je bent niet ingelogd.' }, { status: 401 });

  // 2. Heeft deze gebruiker al een omgeving? Dan niet nog een keer aanmaken.
  const { data: existing } = await admin
    .from('profiles')
    .select('tenant_id')
    .eq('user_id', caller.id)
    .maybeSingle();
  if (existing?.tenant_id) {
    return NextResponse.json({ ok: true, alreadyLinked: true, tenantId: existing.tenant_id });
  }

  // 3. Gegevens uit het registratieformulier valideren.
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Ongeldige aanvraag.' }, { status: 400 }); }
  const catteryName = (body.catteryName || '').trim();
  if (catteryName.length < 2) {
    return NextResponse.json({ error: 'Vul de naam van je fokkerij in.' }, { status: 400 });
  }

  const details = {
    species: (body.species || '').trim(),
    breed: (body.breed || '').trim(),
    animal_count: (body.animalCount || '').trim(),
    litters_per_year: (body.littersPerYear || '').trim(),
    contact_name: (body.contactName || '').trim(),
    phone: (body.phone || '').trim(),
    street: (body.street || '').trim(),
    zipcode: (body.zipcode || '').trim(),
    city: (body.city || '').trim(),
    country: (body.country || '').trim(),
  };

  // 4. Zorg dat de slug uniek is — die wordt straks de eigen webpagina.
  const base = slugify(catteryName) || 'fokkerij';
  let slug = base;
  for (let i = 2; i < 50; i++) {
    const { data: taken } = await admin.from('tenants').select('id').eq('slug', slug).maybeSingle();
    if (!taken) break;
    slug = `${base}-${i}`;
  }

  // 5. Omgeving aanmaken.
  const { data: tenant, error: tErr } = await admin
    .from('tenants')
    .insert([{ name: catteryName, slug, plan: 'trial', status: 'active' }])
    .select()
    .single();
  if (tErr) return NextResponse.json({ error: 'Aanmaken mislukt: ' + tErr.message }, { status: 500 });

  // 6. De extra registratiegegevens erbij zetten. Bestaat een kolom nog niet in
  //    de database, dan mag dat het aanmaken niet laten mislukken — daarom apart
  //    en per veld, en we negeren een fout hier bewust.
  const extra = Object.fromEntries(Object.entries(details).filter(([, v]) => v));
  if (Object.keys(extra).length) {
    try { await admin.from('tenants').update(extra).eq('id', tenant.id); } catch {}
  }

  const ownerName = details.contact_name || caller.user_metadata?.full_name || caller.user_metadata?.name || caller.email;

  // 7. Profiel koppelen aan de nieuwe omgeving.
  const { error: pErr } = await admin.from('profiles').insert([{
    user_id: caller.id,
    tenant_id: tenant.id,
    role: 'owner',
    is_superadmin: false,
    name: ownerName,
  }]);
  if (pErr) {
    await admin.from('tenants').delete().eq('id', tenant.id);
    return NextResponse.json({ error: 'Koppelen mislukt: ' + pErr.message }, { status: 500 });
  }

  // 8. Rol vastleggen zodat inloggen meteen naar het beheer gaat. De opgegeven
  //    gegevens bewaren we hier ook, zodat ze nooit verloren gaan.
  await admin.auth.admin.updateUserById(caller.id, {
    user_metadata: { ...caller.user_metadata, role: 'admin', name: ownerName, breeder_profile: details },
  });

  return NextResponse.json({ ok: true, tenant });
}
