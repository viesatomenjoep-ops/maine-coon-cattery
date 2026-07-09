import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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
  return { admin, callerId: caller.id };
}

// Beheeracties voor de superadmin: gebruiker aan een cattery koppelen,
// superadmin-rol togglen, of een cattery hernoemen.
export async function POST(request) {
  const g = await guard();
  if (g.error) return g.error;
  const db = g.admin;

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Ongeldige body.' }, { status: 400 }); }
  const { action } = body || {};

  if (action === 'setTenant') {
    const { user_id, tenant_id } = body;
    if (!user_id) return NextResponse.json({ error: 'user_id ontbreekt.' }, { status: 400 });
    const { error } = await db.from('profiles').update({ tenant_id: tenant_id || null }).eq('user_id', user_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'setSuperadmin') {
    const { user_id, value } = body;
    if (!user_id) return NextResponse.json({ error: 'user_id ontbreekt.' }, { status: 400 });
    // Voorkom dat je jezelf per ongeluk je eigen superadmin-rechten ontneemt.
    if (user_id === g.callerId && !value) {
      return NextResponse.json({ error: 'Je kunt je eigen superadmin-rol niet uitzetten.' }, { status: 400 });
    }
    const { error } = await db.from('profiles').update({ is_superadmin: !!value }).eq('user_id', user_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (action === 'renameTenant') {
    const { tenant_id, name } = body;
    if (!tenant_id || !name?.trim()) return NextResponse.json({ error: 'Naam ontbreekt.' }, { status: 400 });
    const { error } = await db.from('tenants').update({ name: name.trim() }).eq('id', tenant_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Onbekende actie.' }, { status: 400 });
}
