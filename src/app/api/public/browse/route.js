import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Openbare browse van gepubliceerde kittens (legacy /portal). Server-side.
export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'Serverconfiguratie ontbreekt.' }, { status: 500 });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: cats } = await db.from('cats').select('*').eq('published', true);
  const litterIds = [...new Set((cats || []).map((k) => k.litter_id).filter(Boolean))];
  const { data: litters } = litterIds.length
    ? await db.from('litters').select('*').in('id', litterIds)
    : { data: [] };

  return NextResponse.json({ cats: cats || [], litters: litters || [] });
}
