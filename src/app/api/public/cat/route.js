import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
const norm = (s) => (s || '').toLowerCase();

// Publieke premium showcase van één kat (kitten, kater of poes) via de geheime token.
export async function GET(request) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'Serverconfiguratie ontbreekt.' }, { status: 500 });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const token = new URL(request.url).searchParams.get('token');
  if (!token) return NextResponse.json({ error: 'Geen token.' }, { status: 400 });

  let cat = null;
  let nationality = null;
  const nl = await db.from('cats').select('*').eq('secret_token_nl', token).single();
  if (nl.data) { cat = nl.data; nationality = 'NL'; }
  if (!cat) {
    const be = await db.from('cats').select('*').eq('secret_token_be', token).single();
    if (be.data) { cat = be.data; nationality = 'BE'; }
  }
  if (!cat) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let tenant = { name: 'Cattery' };
  if (cat.tenant_id) {
    const { data: t } = await db.from('tenants').select('name').eq('id', cat.tenant_id).single();
    if (t) tenant = { name: t.name };
  }

  let litter = {};
  if (cat.litter_id) {
    const { data: l } = await db.from('litters').select('name, sire_name, dam_name, sire_image_url, dam_image_url').eq('id', cat.litter_id).single();
    if (l) litter = l;
  }

  const { data: vaccs } = await db.from('vaccinations').select('*').eq('cat_id', cat.id);
  const { data: media } = await db.from('media').select('*').eq('cat_id', cat.id);
  const { data: docs } = await db.from('documents').select('*').eq('cat_id', cat.id);
  const { data: weights } = await db.from('cat_weights').select('*').eq('cat_id', cat.id).order('weigh_date', { ascending: true });

  const adv = cat.ad_settings || {};
  const on = (k) => adv[k] !== false;
  const done = (vaccs || []).filter((v) => v.vaccination_date).length;
  const upcoming = on('showCare') ? (vaccs || []).filter((v) => v.next_due_date && !v.completed).map((v) => ({ type: v.vaccine_name, due: v.next_due_date })).sort((a, b) => new Date(a.due) - new Date(b.due)) : [];
  const careDone = on('showCare') ? (vaccs || []).filter((v) => v.completed || v.vaccination_date).map((v) => ({ type: v.vaccine_name, date: v.vaccination_date || v.next_due_date })).sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
  const gallery = (media || []).filter((m) => m.is_public !== false).map((m) => m.media_url);
  const hasPassport = (docs || []).some((d) => norm(d.document_type) === 'paspoort');
  const price = on('showPrice') ? (nationality === 'BE' ? cat.price_be : cat.price_nl) : null;

  return NextResponse.json({
    tenant,
    cat: {
      id: cat.id, name: cat.name, gender: cat.gender, color: cat.color, pattern: cat.pattern,
      status: cat.status, date_of_birth: cat.date_of_birth, ems_code: cat.ems_code,
      registration_no: cat.registration_no, chip_number: cat.chip_number ? true : false,
      cover_image: cat.cover_image, is_own_breeding_cat: cat.is_own_breeding_cat,
      price, nationality, vaccCount: done, upcoming, careDone, hasPassport, gallery,
      weights: on('showGrowth') ? (weights || []).map((w) => ({ date: new Date(w.weigh_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }), grams: w.weight_grams })) : [],
      litter_name: litter.name || null,
      sire_name: on('showParents') ? (litter.sire_name || null) : null,
      dam_name: on('showParents') ? (litter.dam_name || null) : null,
      sire_image_url: on('showParents') ? (litter.sire_image_url || null) : null,
      dam_image_url: on('showParents') ? (litter.dam_image_url || null) : null,
    },
  });
}
