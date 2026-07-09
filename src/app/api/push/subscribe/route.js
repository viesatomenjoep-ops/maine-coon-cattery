import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function admin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Sla een nieuw push-abonnement op (upsert op endpoint).
export async function POST(request) {
  const db = admin();
  if (!db) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt.' }, { status: 500 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Ongeldige body.' }, { status: 400 }); }

  const sub = body?.subscription;
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'Onvolledig abonnement.' }, { status: 400 });
  }

  const { error } = await db
    .from('push_subscriptions')
    .upsert({ endpoint, p256dh, auth, label: body?.label || null }, { onConflict: 'endpoint' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Verwijder een abonnement (bij uitzetten van meldingen).
export async function DELETE(request) {
  const db = admin();
  if (!db) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt.' }, { status: 500 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Ongeldige body.' }, { status: 400 }); }
  const endpoint = body?.endpoint;
  if (!endpoint) return NextResponse.json({ error: 'Endpoint ontbreekt.' }, { status: 400 });

  const { error } = await db.from('push_subscriptions').delete().eq('endpoint', endpoint);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
