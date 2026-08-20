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

  // 3. Naam valideren.
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Ongeldige aanvraag.' }, { status: 400 }); }
  const catteryName = (body.catteryName || '').trim();
  if (catteryName.length < 2) {
    return NextResponse.json({ error: 'Vul de naam van je fokkerij in.' }, { status: 400 });
  }

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

  const ownerName = caller.user_metadata?.full_name || caller.user_metadata?.name || caller.email;

  // 6. Profiel koppelen aan de nieuwe omgeving.
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

  // 7. Rol vastleggen, zodat het inloggen hem meteen naar het beheer stuurt.
  await admin.auth.admin.updateUserById(caller.id, {
    user_metadata: { ...caller.user_metadata, role: 'admin', name: ownerName },
  });

  return NextResponse.json({ ok: true, tenant });
}
