import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Verrijk een lijst katten met gewichten, media, documenten, geplande zorg en
// ouderfoto's. Toont alleen GEPUBLICEERDE bestanden (advertentie-vinkjes).
async function enrichKittens(db, kittensData) {
  const catIds = (kittensData || []).map((k) => k.id);
  const idFilter = catIds.length ? catIds : ['00000000-0000-0000-0000-000000000000'];
  const { data: weightsData } = await db.from('cat_weights').select('*').in('cat_id', idFilter).order('weigh_date', { ascending: true });
  const { data: allMedia } = await db.from('media').select('*').in('cat_id', idFilter);
  const { data: allDocs } = await db.from('documents').select('*').in('cat_id', idFilter);
  const { data: allVaccs } = await db.from('vaccinations').select('*').in('cat_id', idFilter);

  // Ouderfoto's per nestje ophalen.
  const litterIds = [...new Set((kittensData || []).map((k) => k.litter_id).filter(Boolean))];
  let littersById = {};
  if (litterIds.length) {
    const { data: lits } = await db.from('litters').select('id, sire_name, dam_name, sire_image_url, dam_image_url').in('id', litterIds);
    (lits || []).forEach((l) => { littersById[l.id] = l; });
  }

  return (kittensData || []).map((k) => {
    const weights = (weightsData || []).filter((w) => w.cat_id === k.id).map((w) => ({
      date: new Date(w.weigh_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
      grams: w.weight_grams,
    }));
    // Alleen gepubliceerde foto's en documenten.
    const mediaVisible = (allMedia || []).filter((m) => (m.cat_id === k.id || m.media_url?.includes(k.id)) && m.is_public !== false);
    const documents = (allDocs || []).filter((d) => d.cat_id === k.id && d.is_private === false);
    const catVaccs = (allVaccs || []).filter((v) => v.cat_id === k.id);
    // Aankomende zorg: geplande datum, nog niet afgevinkt.
    const treatments = catVaccs
      .filter((v) => v.next_due_date && !v.completed)
      .map((v) => ({ type: v.vaccine_name, due: v.next_due_date, note: v.veterinarian_info }))
      .sort((a, b) => new Date(a.due) - new Date(b.due));
    // Gedane zorg: afgevinkt of met een uitvoerdatum.
    const careDone = catVaccs
      .filter((v) => v.completed || v.vaccination_date)
      .map((v) => ({ type: v.vaccine_name, date: v.vaccination_date || v.next_due_date, note: v.veterinarian_info }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const lit = littersById[k.litter_id] || {};
    // Advertentie-zichtbaarheid (vinkjes), standaard alles aan.
    const adv = k.ad_settings || {};
    const on = (key) => adv[key] !== false;
    return {
      ...k,
      weights: on('showGrowth') ? weights : [],
      media: mediaVisible,
      documents,
      treatments: on('showCare') ? treatments : [],
      careDone: on('showCare') ? careDone : [],
      sire_name: lit.sire_name || null, dam_name: lit.dam_name || null,
      sire_image_url: on('showParents') ? (lit.sire_image_url || null) : null,
      dam_image_url: on('showParents') ? (lit.dam_image_url || null) : null,
      showPrice: on('showPrice'),
    };
  });
}

async function newsFor(db, catIds, kittensData) {
  const { data: allNews } = await db.from('timeline_updates').select('*').order('created_at', { ascending: false });
  return (allNews || [])
    .filter((n) => !n.cat_id || catIds.includes(n.cat_id))
    .map((n) => ({
      id: n.id,
      date: n.created_at ? new Date(n.created_at).toLocaleDateString('nl-NL') : 'Onbekend',
      title: n.title,
      text: n.content,
      tag: n.cat_id ? (kittensData.find((k) => k.id === n.cat_id)?.name || 'Kitten update') : 'Cattery nieuws',
    }));
}

export async function GET(request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'Serverconfiguratie ontbreekt.' }, { status: 500 });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const token = new URL(request.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Geen token.' }, { status: 400 });

  // 1. Klant-token: toon alle kittens van die klant.
  const { data: customer } = await db.from('customers').select('*').eq('token', token).single();
  if (customer) {
    const { data: kittensData } = await db.from('cats').select('*').eq('customer_id', customer.id);
    const { data: littersData } = await db.from('litters').select('*').eq('customer_id', customer.id);
    const kittens = await enrichKittens(db, kittensData);
    const updates = await newsFor(db, (kittensData || []).map((k) => k.id), kittensData || []);
    return NextResponse.json({ customer, kittens, litters: littersData || [], updates });
  }

  // 2. Geheime kitten-link (NL of BE): toon die ene kitten met de juiste prijs.
  let cat = null;
  let nationality = null;
  const nl = await db.from('cats').select('*').eq('secret_token_nl', token).single();
  if (nl.data) { cat = nl.data; nationality = 'NL'; }
  if (!cat) {
    const be = await db.from('cats').select('*').eq('secret_token_be', token).single();
    if (be.data) { cat = be.data; nationality = 'BE'; }
  }

  if (cat) {
    const enriched = await enrichKittens(db, [cat]);
    const showPrice = (cat.ad_settings || {}).showPrice !== false;
    const price = showPrice ? (nationality === 'BE' ? cat.price_be : cat.price_nl) : null;
    const kitten = { ...enriched[0], price, nationality };
    const updates = await newsFor(db, [cat.id], [cat]);
    const pseudoCustomer = { name: cat.reserved_by || cat.customer_name || 'Welkom', email: null };
    return NextResponse.json({ customer: pseudoCustomer, kittens: [kitten], litters: [], updates, single: true });
  }

  return NextResponse.json({ error: 'not_found' }, { status: 404 });
}
