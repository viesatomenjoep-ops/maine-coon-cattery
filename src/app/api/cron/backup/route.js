import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const TABLES = [
  'litters', 'cats', 'customers', 'documents', 'media',
  'timeline_updates', 'vaccinations', 'cat_weights', 'site_content',
];

const DEFAULT_RECIPIENTS = [
  'tomjo118735@gmail.com',
  'tomvanbiene@gmail.com',
  'mazzel37@icloud.com',
];

// Bepaal of het verzoek toegestaan is: ofwel de geheime cron-sleutel (Vercel),
// ofwel een ingelogde admin (handmatige knop in het portaal).
async function isAuthorized(request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization') || '';
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.user_metadata?.role === 'admin') return true;
  } catch {}
  return false;
}

function getRecipients() {
  const env = process.env.BACKUP_EMAIL_TO;
  if (env) return env.split(',').map((s) => s.trim()).filter(Boolean);
  return DEFAULT_RECIPIENTS;
}

async function handle(request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Niet geautoriseerd.' }, { status: 401 });
  }

  // 1. Alle gegevens ophalen met de service-role sleutel (volledige toegang, server-side).
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt.' }, { status: 500 });
  }
  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const backup = {
    _meta: {
      exported_at: new Date().toISOString(),
      cattery: "Wendy's Dream Maine Coon Cattery",
      note: 'Automatische back-up uit Supabase. Foto-bestanden staan in Cloudinary; hier staan de links.',
    },
  };
  const counts = {};
  for (const t of TABLES) {
    const { data, error } = await admin.from(t).select('*');
    if (error) return NextResponse.json({ error: `${t}: ${error.message}` }, { status: 500 });
    backup[t] = data || [];
    counts[t] = (data || []).length;
  }

  // 2. E-mail versturen via SMTP (bijv. Gmail met app-wachtwoord).
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, BACKUP_EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return NextResponse.json({
      error: 'E-mailinstellingen ontbreken (SMTP_HOST / SMTP_USER / SMTP_PASS). Stel deze in bij Vercel.',
      counts,
    }, { status: 500 });
  }

  const port = Number(SMTP_PORT) || 465;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const recipients = getRecipients();
  const stamp = new Date().toISOString().slice(0, 10);
  const totaal = Object.values(counts).reduce((a, b) => a + b, 0);
  const overzicht = Object.entries(counts).map(([k, v]) => `- ${k}: ${v}`).join('\n');

  await transporter.sendMail({
    from: BACKUP_EMAIL_FROM || `Wendy's Dream Back-up <${SMTP_USER}>`,
    to: recipients.join(', '),
    subject: `Wekelijkse back-up Wendy's Dream — ${stamp}`,
    text: `Hoi,\n\nIn de bijlage vind je de automatische back-up van alle gegevens van Wendy's Dream (${stamp}).\n\nInhoud (${totaal} records in totaal):\n${overzicht}\n\nBewaar dit bestand goed. De foto's zelf staan in Cloudinary; in deze back-up staan de links.\n\nDit is een automatisch bericht.`,
    attachments: [
      {
        filename: `wendysdream-backup-${stamp}.json`,
        content: JSON.stringify(backup, null, 2),
        contentType: 'application/json',
      },
    ],
  });

  return NextResponse.json({ ok: true, sent_to: recipients, counts });
}

export const GET = handle;
export const POST = handle;
