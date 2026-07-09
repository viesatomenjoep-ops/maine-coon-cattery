import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const norm = (s) => (s || '').toLowerCase();

// Publieke advertentiepagina van een nestje via de share_token. Server-side
// (service role), zodat de database per tenant afgeschermd kan blijven.
export async function GET(request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'Serverconfiguratie ontbreekt.' }, { status: 500 });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const token = new URL(request.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Geen token.' }, { status: 400 });

  const { data: litter } = await db.from('litters').select('*').eq('share_token', token).single();
  if (!litter) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const { data: kits } = await db.from('cats').select('*').eq('litter_id', litter.id);
  const catIds = (kits || []).map((k) => k.id);
  const idFilter = catIds.length ? catIds : ['00000000-0000-0000-0000-000000000000'];
  const { data: vaccs } = await db.from('vaccinations').select('*').in('cat_id', idFilter);
  const { data: docs } = await db.from('documents').select('*').in('cat_id', idFilter);

  const kittens = (kits || []).map((k) => {
    const adv = k.ad_settings || {};
    const on = (key) => adv[key] !== false; // standaard aan
    const kv = (vaccs || []).filter((v) => v.cat_id === k.id);
    const done = kv.filter((v) => v.vaccination_date).length;
    const upcoming = on('showCare') ? kv.filter((v) => v.next_due_date && !v.completed)
      .map((v) => ({ type: v.vaccine_name, due: v.next_due_date }))
      .sort((a, b) => new Date(a.due) - new Date(b.due)) : [];
    const kd = (docs || []).filter((d) => d.cat_id === k.id);
    const hasPassport = kd.some((d) => norm(d.document_type) === 'paspoort');
    // Alleen advertentie-veilige velden teruggeven (geen tokens/privégegevens).
    return {
      id: k.id, name: k.name, gender: k.gender, color: k.color, pattern: k.pattern,
      status: k.status, price_nl: on('showPrice') ? k.price_nl : null, cover_image: k.cover_image,
      date_of_birth: k.date_of_birth, ems_code: k.ems_code, registration_no: k.registration_no,
      chip_number: k.chip_number ? true : false, vaccCount: done, upcoming, hasPassport,
    };
  });

  const safeLitter = {
    id: litter.id, name: litter.name, sire_name: litter.sire_name,
    dam_name: litter.dam_name, date_of_birth: litter.date_of_birth,
    sire_image_url: litter.sire_image_url || null,
    dam_image_url: litter.dam_image_url || null,
    ad_text: litter.ad_text || null,
  };

  return NextResponse.json({ litter: safeLitter, kittens });
}
