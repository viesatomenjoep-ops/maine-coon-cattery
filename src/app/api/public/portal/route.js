import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Publieke klant-portal: haalt alle gegevens van één klant op via de token.
// Draait server-side met de service-role sleutel, zodat de database volledig
// per tenant afgeschermd kan blijven (fase B) zonder deze pagina te breken.
export async function GET(request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'Serverconfiguratie ontbreekt.' }, { status: 500 });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const token = new URL(request.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Geen token.' }, { status: 400 });

  const { data: customer } = await db.from('customers').select('*').eq('token', token).single();
  if (!customer) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { data: kittensData } = await db.from('cats').select('*').eq('customer_id', customer.id);
  const { data: littersData } = await db.from('litters').select('*').eq('customer_id', customer.id);
  const catIds = (kittensData || []).map((k) => k.id);
  const idFilter = catIds.length ? catIds : ['00000000-0000-0000-0000-000000000000'];

  const { data: weightsData } = await db.from('cat_weights').select('*').in('cat_id', idFilter).order('weigh_date', { ascending: true });
  const { data: allMedia } = await db.from('media').select('*').in('cat_id', idFilter);
  const { data: allDocs } = await db.from('documents').select('*').in('cat_id', idFilter);
  const { data: allVaccs } = await db.from('vaccinations').select('*').in('cat_id', idFilter);
  const { data: allNews } = await db.from('timeline_updates').select('*').order('created_at', { ascending: false });

  const kittens = (kittensData || []).map((k) => {
    const weights = (weightsData || []).filter((w) => w.cat_id === k.id).map((w) => ({
      date: new Date(w.weigh_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
      grams: w.weight_grams,
    }));
    const media = (allMedia || []).filter((m) => m.cat_id === k.id || m.media_url?.includes(k.id));
    const documents = (allDocs || []).filter((d) => d.cat_id === k.id);
    const treatments = (allVaccs || [])
      .filter((v) => v.cat_id === k.id && v.next_due_date)
      .map((v) => ({ type: v.vaccine_name, due: v.next_due_date, note: v.veterinarian_info }))
      .sort((a, b) => new Date(a.due) - new Date(b.due));
    return { ...k, weights, media, documents, treatments };
  });

  const updates = (allNews || [])
    .filter((n) => !n.cat_id || catIds.includes(n.cat_id))
    .map((n) => ({
      id: n.id,
      date: n.created_at ? new Date(n.created_at).toLocaleDateString('nl-NL') : 'Onbekend',
      title: n.title,
      text: n.content,
      tag: n.cat_id ? (kittensData.find((k) => k.id === n.cat_id)?.name || 'Kitten update') : 'Cattery nieuws',
    }));

  return NextResponse.json({ customer, kittens, litters: littersData || [], updates });
}
