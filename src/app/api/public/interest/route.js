import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Interesse-aanvraag van een bezoeker op de advertentiepagina. Server-side
// (service role): koppelt de interesse automatisch aan de juiste tenant van het nestje.
export async function POST(request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'Serverconfiguratie ontbreekt.' }, { status: 500 });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Ongeldige body.' }, { status: 400 }); }
  const { token, cat_id, name, contact, message } = body || {};
  if (!token || !cat_id || !name?.trim()) {
    return NextResponse.json({ error: 'Onvolledige aanvraag.' }, { status: 400 });
  }

  // Valideer dat het nestje bij de token hoort en de kitten in dat nestje zit.
  const { data: litter } = await db.from('litters').select('id, tenant_id').eq('share_token', token).single();
  if (!litter) return NextResponse.json({ error: 'Ongeldige link.' }, { status: 404 });
  const { data: cat } = await db.from('cats').select('id, litter_id').eq('id', cat_id).single();
  if (!cat || cat.litter_id !== litter.id) return NextResponse.json({ error: 'Onbekende kitten.' }, { status: 400 });

  const { error } = await db.from('kitten_interests').insert([{
    cat_id,
    litter_id: litter.id,
    tenant_id: litter.tenant_id || null,
    name: name.trim(),
    contact: (contact || '').trim() || null,
    message: (message || '').trim() || null,
    status: 'nieuw',
  }]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
