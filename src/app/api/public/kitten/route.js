import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Openbare detailpagina van één gepubliceerde kitten (legacy /portal/kitten).
export async function GET(request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'Serverconfiguratie ontbreekt.' }, { status: 500 });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Geen id.' }, { status: 400 });

  const { data: cat } = await db.from('cats').select('*').eq('id', id).single();
  // Alleen gepubliceerde kittens zijn openbaar zichtbaar.
  if (!cat || !cat.published) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let litter = null;
  if (cat.litter_id) {
    const { data: l } = await db.from('litters').select('*').eq('id', cat.litter_id).single();
    litter = l || null;
  }
  return NextResponse.json({ cat, litter });
}
