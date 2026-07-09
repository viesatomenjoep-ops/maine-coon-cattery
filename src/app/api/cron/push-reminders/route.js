import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Op welke dagen-vóór sturen we een herinnering? (dagelijkse cron → elk moment 1×)
// 7 = week ervoor, 3 = paar dagen, 1 = dag ervoor, 0 = vandaag, -1 = net te laat.
const REMINDER_DAYS = new Set([7, 3, 1, 0, -1]);

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

function labelFor(days) {
  if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? 'dag' : 'dagen'} te laat`;
  if (days === 0) return 'vandaag';
  return `over ${days} ${days === 1 ? 'dag' : 'dagen'}`;
}

function authorized(request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization') || '';
  // Vercel cron stuurt automatisch de CRON_SECRET mee. Zonder secret: sta toe
  // (dan beschermt alleen de obscure route), met secret: strikt controleren.
  if (!cronSecret) return true;
  return authHeader === `Bearer ${cronSecret}`;
}

async function handle(request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Niet geautoriseerd.' }, { status: 401 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!serviceKey) return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt.' }, { status: 500 });
  if (!vapidPublic || !vapidPrivate) return NextResponse.json({ error: 'VAPID-sleutels ontbreken.' }, { status: 500 });

  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:info@example.com', vapidPublic, vapidPrivate);

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Katten + geplande behandelingen ophalen.
  const { data: cats } = await db.from('cats').select('id, name');
  const catName = Object.fromEntries((cats || []).map((c) => [c.id, c.name]));
  const { data: vaccs } = await db.from('vaccinations').select('cat_id, vaccine_name, next_due_date');

  const due = (vaccs || [])
    .filter((v) => v.next_due_date)
    .map((v) => ({ ...v, days: daysUntil(v.next_due_date) }))
    .filter((v) => v.days !== null && REMINDER_DAYS.has(v.days));

  if (due.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, note: 'Geen behandelingen op een herinnermoment vandaag.' });
  }

  // 2. Abonnementen ophalen.
  const { data: subs } = await db.from('push_subscriptions').select('*');
  if (!subs || subs.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, note: 'Geen push-abonnementen.' });
  }

  // 3. Voor elke behandeling een melding naar elk abonnement.
  let sent = 0;
  const toDelete = [];
  for (const t of due) {
    const naam = catName[t.cat_id] || 'een kitten';
    const payload = JSON.stringify({
      title: `🐾 ${t.vaccine_name} — ${naam}`,
      body: t.days < 0
        ? `Let op: ${(t.vaccine_name || '').toLowerCase()} is ${labelFor(t.days)}.`
        : `${t.vaccine_name} nodig ${labelFor(t.days)} (${new Date(t.next_due_date).toLocaleDateString('nl-NL')}).`,
      url: `/admin/cats/${t.cat_id}`,
      tag: `treatment-${t.cat_id}-${t.next_due_date}`,
    });
    for (const s of subs) {
      const subscription = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
      try {
        await webpush.sendNotification(subscription, payload);
        sent++;
      } catch (err) {
        // Verlopen/ongeldige abonnementen opruimen.
        if (err?.statusCode === 404 || err?.statusCode === 410) toDelete.push(s.endpoint);
      }
    }
  }

  if (toDelete.length) {
    await db.from('push_subscriptions').delete().in('endpoint', toDelete);
  }

  return NextResponse.json({ ok: true, sent, treatments: due.length, subscriptions: subs.length, cleaned: toDelete.length });
}

export async function GET(request) { return handle(request); }
export async function POST(request) { return handle(request); }
