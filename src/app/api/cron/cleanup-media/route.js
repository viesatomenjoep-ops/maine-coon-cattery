import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

function authorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return (request.headers.get('authorization') || '') === `Bearer ${secret}`;
}

async function handle(request) {
  if (!authorized(request)) return NextResponse.json({ error: 'Niet geautoriseerd.' }, { status: 401 });
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt.' }, { status: 500 });
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: litters } = await db.from('litters').select('id, ad_video').not('ad_video', 'is', null);
  const now = Date.now();
  let removed = 0;

  for (const l of litters || []) {
    const v = l.ad_video || {};
    const uploaded = v.uploaded_at ? new Date(v.uploaded_at).getTime() : null;
    if (!uploaded || (now - uploaded) < YEAR_MS) continue;
    // Ouder dan 1 jaar: verwijderen uit Cloudinary + referentie wissen.
    try {
      if (v.public_id) await cloudinary.uploader.destroy(v.public_id, { resource_type: 'video' });
    } catch (e) { /* al verwijderd of onbereikbaar */ }
    await db.from('litters').update({ ad_video: null }).eq('id', l.id);
    removed++;
  }

  return NextResponse.json({ ok: true, removed });
}

export async function GET(request) { return handle(request); }
export async function POST(request) { return handle(request); }
