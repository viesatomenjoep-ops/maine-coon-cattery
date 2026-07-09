import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Service-role client + controle dat de aanvrager superadmin is.
async function guard() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return { error: NextResponse.json({ error: 'Serverconfiguratie ontbreekt.' }, { status: 500 }) };
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
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
  if (!caller) return { error: NextResponse.json({ error: 'Niet ingelogd.' }, { status: 401 }) };
  const { data: prof } = await admin.from('profiles').select('is_superadmin').eq('user_id', caller.id).single();
  if (!prof?.is_superadmin) return { error: NextResponse.json({ error: 'Alleen superadmin.' }, { status: 403 }) };
  return { admin };
}

export async function GET() {
  const g = await guard();
  if (g.error) return g.error;
  const db = g.admin;

  const { data: tenants } = await db.from('tenants').select('*').order('created_at', { ascending: true });
  const { data: profiles } = await db.from('profiles').select('*');
  const { data: cats } = await db.from('cats').select('id, tenant_id, is_own_breeding_cat');
  const { data: customers } = await db.from('customers').select('id, tenant_id');
  const { data: litters } = await db.from('litters').select('id, tenant_id');

  // E-mailadressen bij de profielen halen (alleen via service role beschikbaar).
  let emailById = {};
  try {
    const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
    (list?.users || []).forEach((u) => { emailById[u.id] = u.email; });
  } catch {}

  const countBy = (arr, tid, pred = () => true) => (arr || []).filter((r) => r.tenant_id === tid && pred(r)).length;

  const tenantRows = (tenants || []).map((t) => ({
    ...t,
    kittens: countBy(cats, t.id, (c) => !c.is_own_breeding_cat),
    breedingCats: countBy(cats, t.id, (c) => c.is_own_breeding_cat),
    customers: countBy(customers, t.id),
    litters: countBy(litters, t.id),
    owners: (profiles || []).filter((p) => p.tenant_id === t.id).map((p) => emailById[p.user_id] || p.name || p.user_id),
  }));

  const userRows = (profiles || []).map((p) => ({
    user_id: p.user_id,
    email: emailById[p.user_id] || '(onbekend e-mail)',
    name: p.name,
    tenant_id: p.tenant_id,
    role: p.role,
    is_superadmin: p.is_superadmin,
  }));

  const totals = {
    tenants: (tenants || []).length,
    kittens: (cats || []).filter((c) => !c.is_own_breeding_cat).length,
    customers: (customers || []).length,
  };

  return NextResponse.json({ tenants: tenantRows, users: userRows, totals });
}
