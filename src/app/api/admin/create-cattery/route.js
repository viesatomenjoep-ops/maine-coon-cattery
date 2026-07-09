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

export async function POST(request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt.' }, { status: 500 });

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Controleer dat de aanvrager een ingelogde superadmin is.
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
  if (!caller) return NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 });

  const { data: prof } = await admin.from('profiles').select('is_superadmin').eq('user_id', caller.id).single();
  if (!prof?.is_superadmin) return NextResponse.json({ error: 'Alleen een superadmin mag catteries aanmaken.' }, { status: 403 });

  // 2. Invoer valideren.
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Ongeldige body.' }, { status: 400 }); }
  const catteryName = (body.catteryName || '').trim();
  const ownerName = (body.ownerName || '').trim();
  const ownerEmail = (body.ownerEmail || '').trim().toLowerCase();
  const ownerPassword = body.ownerPassword || '';
  if (!catteryName || !ownerEmail || ownerPassword.length < 6) {
    return NextResponse.json({ error: 'Vul cattery-naam, e-mail en een wachtwoord (min. 6 tekens) in.' }, { status: 400 });
  }

  // 3. Tenant aanmaken.
  const { data: tenant, error: tErr } = await admin
    .from('tenants')
    .insert([{ name: catteryName, slug: slugify(catteryName), plan: 'trial', status: 'active' }])
    .select()
    .single();
  if (tErr) return NextResponse.json({ error: 'Cattery aanmaken mislukt: ' + tErr.message }, { status: 500 });

  // 4. Eigenaar-login aanmaken.
  const { data: created, error: uErr } = await admin.auth.admin.createUser({
    email: ownerEmail,
    password: ownerPassword,
    email_confirm: true,
    user_metadata: { role: 'admin', name: ownerName || catteryName },
  });
  if (uErr) {
    // Ruim de zojuist aangemaakte tenant weer op bij een fout.
    await admin.from('tenants').delete().eq('id', tenant.id);
    return NextResponse.json({ error: 'Login aanmaken mislukt: ' + uErr.message }, { status: 500 });
  }

  // 5. Profiel koppelen (gebruiker → tenant, als owner).
  const { error: pErr } = await admin.from('profiles').insert([{
    user_id: created.user.id,
    tenant_id: tenant.id,
    role: 'owner',
    is_superadmin: false,
    name: ownerName || catteryName,
  }]);
  if (pErr) return NextResponse.json({ error: 'Profiel koppelen mislukt: ' + pErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, tenant, ownerEmail });
}
