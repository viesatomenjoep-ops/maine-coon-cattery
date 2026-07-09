'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PageHead, Card, Btn } from '@/components/admin';

// Alle tabellen die samen jouw volledige cattery-administratie vormen.
const TABLES = [
  { key: 'litters', label: 'Nestjes' },
  { key: 'cats', label: 'Katten & kittens' },
  { key: 'customers', label: 'Klanten' },
  { key: 'documents', label: 'Documenten (links)' },
  { key: 'media', label: 'Media (links)' },
  { key: 'timeline_updates', label: 'Nieuws & updates' },
  { key: 'vaccinations', label: 'Vaccinaties' },
  { key: 'cat_weights', label: 'Gewichten' },
  { key: 'site_content', label: 'Website-inhoud' },
];

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function toCsv(rows) {
  if (!rows || rows.length === 0) return '';
  // Verzamel alle kolomnamen die in de rijen voorkomen
  const cols = Array.from(rows.reduce((set, r) => { Object.keys(r).forEach((k) => set.add(k)); return set; }, new Set()));
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    let s = typeof v === 'object' ? JSON.stringify(v) : String(v);
    if (/[",\n;]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const header = cols.join(',');
  const lines = rows.map((r) => cols.map((c) => esc(r[c])).join(','));
  return [header, ...lines].join('\n');
}

const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

export default function BackupPage() {
  const [busy, setBusy] = useState(false);
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState('');
  const [lastAt, setLastAt] = useState(null);
  const [mailing, setMailing] = useState(false);
  const [mailMsg, setMailMsg] = useState('');
  const [mailErr, setMailErr] = useState('');

  const fetchAll = async () => {
    const result = {};
    const tallCounts = {};
    for (const t of TABLES) {
      const { data, error } = await supabase.from(t.key).select('*');
      if (error) throw new Error(`${t.label}: ${error.message}`);
      result[t.key] = data || [];
      tallCounts[t.key] = (data || []).length;
    }
    return { result, tallCounts };
  };

  const downloadJson = async () => {
    setBusy(true); setError('');
    try {
      const { result, tallCounts } = await fetchAll();
      const backup = {
        _meta: {
          exported_at: new Date().toISOString(),
          cattery: "Wendy's Dream Maine Coon Cattery",
          note: 'Volledige back-up van alle gegevens uit Supabase. Foto-bestanden staan in Cloudinary; hier staan de links (media_url / file_url).',
        },
        ...result,
      };
      downloadBlob(JSON.stringify(backup, null, 2), `wendysdream-backup-${stamp()}.json`, 'application/json');
      setCounts(tallCounts);
      setLastAt(new Date());
    } catch (e) {
      setError(e.message || 'Er ging iets mis bij het maken van de back-up.');
    }
    setBusy(false);
  };

  const sendTestMail = async () => {
    setMailing(true); setMailMsg(''); setMailErr('');
    try {
      const res = await fetch('/api/cron/backup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Versturen mislukt.');
      setMailMsg(`Back-up verstuurd naar: ${(data.sent_to || []).join(', ')}`);
    } catch (e) {
      setMailErr(e.message || 'Er ging iets mis bij het versturen.');
    }
    setMailing(false);
  };

  const downloadCsv = async (tableKey, label) => {
    setBusy(true); setError('');
    try {
      const { data, error } = await supabase.from(tableKey).select('*');
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) { alert(`Geen gegevens gevonden voor: ${label}.`); setBusy(false); return; }
      downloadBlob(toCsv(data), `wendysdream-${tableKey}-${stamp()}.csv`, 'text/csv;charset=utf-8;');
    } catch (e) {
      setError(e.message || 'Er ging iets mis bij het exporteren.');
    }
    setBusy(false);
  };

  return (
    <div className="max-w-4xl pb-16">
      <PageHead label="Beveiliging" title="Back-up & Export" />

      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-forest-700">
        Maak met één klik een kopie van al je gegevens (nestjes, kittens, klanten, chipnummers, documenten en meer).
        Bewaar dit bestand op je computer of in de cloud, zodat je nooit iets kwijtraakt — ook niet als er iets met
        de database gebeurt. Tip: doe dit bijvoorbeeld elke maand.
      </p>

      <Card className="mb-6">
        <h2 className="mb-2 font-display text-xl text-forest-900">1. Volledige back-up (aanbevolen)</h2>
        <p className="mb-5 text-sm text-forest-700">
          Download álles in één bestand (JSON). Dit is de complete kopie die je kunt bewaren.
        </p>
        <Btn variant="brass" onClick={downloadJson} disabled={busy} className="text-base px-6 py-3">
          {busy ? 'Bezig…' : '💾 Download volledige back-up'}
        </Btn>

        {lastAt && !error && (
          <p className="mt-4 text-sm font-medium text-emerald-700">
            ✅ Back-up gedownload op {lastAt.toLocaleString('nl-NL')}.
          </p>
        )}
        {error && <p className="mt-4 text-sm font-semibold text-red-700">⚠️ {error}</p>}

        {counts && (
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TABLES.map((t) => (
              <div key={t.key} className="rounded-xl border border-forest-900/10 bg-white/70 px-3 py-2 text-sm">
                <span className="text-forest-600">{t.label}: </span>
                <span className="font-semibold text-forest-900">{counts[t.key] ?? 0}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="mb-6">
        <h2 className="mb-2 font-display text-xl text-forest-900">2. Automatische wekelijkse back-up per e-mail</h2>
        <p className="mb-5 text-sm text-forest-700">
          Elke maandagochtend wordt automatisch een back-up gemaakt en gemaild naar de vaste ontvangers
          (tomjo118735@gmail.com, tomvanbiene@gmail.com en mazzel37@icloud.com). Test hieronder of het werkt:
        </p>
        <Btn variant="solid" onClick={sendTestMail} disabled={mailing} className="text-base px-6 py-3">
          {mailing ? 'Versturen…' : '✉️ Stuur nu een test-back-up per e-mail'}
        </Btn>
        {mailMsg && <p className="mt-4 text-sm font-medium text-emerald-700">✅ {mailMsg}</p>}
        {mailErr && <p className="mt-4 text-sm font-semibold text-red-700">⚠️ {mailErr}</p>}
      </Card>

      <Card>
        <h2 className="mb-2 font-display text-xl text-forest-900">3. Losse Excel-exports (CSV)</h2>
        <p className="mb-5 text-sm text-forest-700">
          Handig om te openen in Excel of Numbers. Kies wat je wilt downloaden:
        </p>
        <div className="flex flex-wrap gap-3">
          <Btn variant="ghost" onClick={() => downloadCsv('litters', 'Nestjes')} disabled={busy}>📄 Nestjes (CSV)</Btn>
          <Btn variant="ghost" onClick={() => downloadCsv('cats', 'Katten & kittens')} disabled={busy}>📄 Katten & kittens (CSV)</Btn>
          <Btn variant="ghost" onClick={() => downloadCsv('customers', 'Klanten')} disabled={busy}>📄 Klanten (CSV)</Btn>
        </div>
      </Card>

      <p className="mt-8 max-w-2xl text-xs leading-relaxed text-forest-600">
        Let op: de foto's zelf staan veilig in Cloudinary. In deze back-up staan de webadressen (links) naar die foto's,
        zodat ze altijd terug te vinden zijn.
      </p>
    </div>
  );
}
