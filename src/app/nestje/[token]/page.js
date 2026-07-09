'use client';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Logo, PawMark } from '@/components/ui';
import { treatmentIcon, urgency, formatDate } from '@/lib/treatments';
import Lightbox from '@/components/Lightbox';

const norm = (s) => (s || '').toLowerCase();
const isAvailable = (s) => norm(s) === 'beschikbaar';
const sexLabel = (g) => {
  const v = norm(g);
  if (/kater|mann|\bmale\b|\bm\b/.test(v)) return 'Kater';
  if (/poes|vrouw|female|\bf\b/.test(v)) return 'Poes';
  return g || 'Onbekend';
};
const STATUS_META = {
  beschikbaar: { label: 'Beschikbaar', cls: 'bg-emerald-100 text-emerald-700' },
  gereserveerd: { label: 'Gereserveerd', cls: 'bg-amber-100 text-amber-800' },
  verkocht: { label: 'Verkocht', cls: 'bg-red-100 text-red-700' },
  houden: { label: 'Niet te koop', cls: 'bg-stone-100 text-stone-600' },
};

export default function LitterAdPage({ params }) {
  const { token } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [interestFor, setInterestFor] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sentFor, setSentFor] = useState([]); // ids waarvoor al interesse gestuurd is
  const [zoom, setZoom] = useState(null); // foto voor fullscreen weergave

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/public/litter?token=${encodeURIComponent(token)}`);
        if (!res.ok) { setError(true); setLoading(false); return; }
        const json = await res.json();
        setData(json);
      } catch {
        setError(true);
      }
      setLoading(false);
    }
    load();
  }, [token]);

  const submitInterest = async () => {
    if (!form.name.trim()) return alert('Vul je naam in.');
    setSubmitting(true);
    let err = null;
    try {
      const res = await fetch('/api/public/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          cat_id: interestFor.id,
          name: form.name.trim(),
          contact: form.contact.trim(),
          message: form.message.trim(),
        }),
      });
      if (!res.ok) err = true;
    } catch { err = true; }
    setSubmitting(false);
    if (err) { alert('Er ging iets mis. Probeer het later opnieuw.'); return; }
    setSentFor((s) => [...s, interestFor.id]);
    setInterestFor(null);
    setForm({ name: '', contact: '', message: '' });
  };

  if (loading) return <div className="grid min-h-screen place-items-center bg-cream-50 text-forest-700">De advertentie wordt geladen…</div>;
  if (error || !data) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-50">
        <div className="max-w-md px-6 text-center">
          <PawMark className="mx-auto mb-4 h-10 w-10 text-brass-400" />
          <h1 className="mb-3 font-display text-3xl text-forest-950">Advertentie niet gevonden</h1>
          <p className="text-forest-700">Deze link is niet geldig of verlopen. Vraag de cattery om een nieuwe link.</p>
        </div>
      </div>
    );
  }

  const { litter, kittens } = data;
  const available = kittens.filter((k) => isAvailable(k.status));

  return (
    <div className="min-h-screen bg-cream-50 pb-20">
      <header className="flex items-center justify-center border-b border-forest-900/10 bg-white py-6"><Logo /></header>

      <main className="mx-auto max-w-5xl px-6 pt-12">
        <div className="mb-10 text-center">
          <PawMark className="mx-auto mb-4 h-8 w-8 text-brass-400" />
          <h1 className="font-display text-4xl text-forest-950">{litter.name}</h1>
          <p className="mt-2 text-forest-700">
            {litter.sire_name || 'Onbekende vader'} × {litter.dam_name || 'Onbekende moeder'}
            {litter.date_of_birth && <> · geboren {new Date(litter.date_of_birth).toLocaleDateString('nl-NL')}</>}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-5 py-2 text-sm font-semibold text-emerald-800">
            🐾 Op dit moment {available.length} {available.length === 1 ? 'kitten' : 'kittens'} beschikbaar
          </div>

          {/* Ouders van het nestje */}
          {(litter.sire_image_url || litter.dam_image_url) && (
            <div className="mt-8 flex items-start justify-center gap-8">
              <div className="text-center">
                <div className="mx-auto h-28 w-28 overflow-hidden rounded-2xl border border-forest-900/10 bg-forest-50 shadow-sm">
                  {litter.sire_image_url ? <img src={litter.sire_image_url} alt="Vader" onClick={() => setZoom(litter.sire_image_url)} className="h-full w-full cursor-zoom-in object-cover" /> : <div className="flex h-full w-full items-center justify-center"><PawMark className="h-7 w-7 text-forest-200" /></div>}
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-forest-600/60">Vader</p>
                <p className="text-sm font-semibold text-forest-900">{litter.sire_name || '—'}</p>
              </div>
              <div className="text-center">
                <div className="mx-auto h-28 w-28 overflow-hidden rounded-2xl border border-forest-900/10 bg-forest-50 shadow-sm">
                  {litter.dam_image_url ? <img src={litter.dam_image_url} alt="Moeder" onClick={() => setZoom(litter.dam_image_url)} className="h-full w-full cursor-zoom-in object-cover" /> : <div className="flex h-full w-full items-center justify-center"><PawMark className="h-7 w-7 text-forest-200" /></div>}
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-forest-600/60">Moeder</p>
                <p className="text-sm font-semibold text-forest-900">{litter.dam_name || '—'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Advertentietekst / verhaal van de cattery */}
        {litter.ad_text && (
          <div className="mx-auto mb-12 max-w-3xl rounded-3xl border border-forest-900/10 bg-white/70 p-8 shadow-soft md:p-10">
            <p className="whitespace-pre-line text-center text-base leading-relaxed text-forest-800 md:text-lg">{litter.ad_text}</p>
          </div>
        )}

        {kittens.length === 0 ? (
          <p className="text-center text-forest-600">Er zijn nog geen kittens gepubliceerd in dit nestje.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {kittens.map((k) => {
              const meta = STATUS_META[norm(k.status)] || STATUS_META.beschikbaar;
              const canReserve = isAvailable(k.status);
              const alreadySent = sentFor.includes(k.id);
              return (
                <div key={k.id} className="relative overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-soft">
                  <div className="pointer-events-none absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-forest-800 shadow-sm backdrop-blur-sm">
                    🐾 {tenant.name} · Maine Coon Cattery
                  </div>
                  {k.cover_image ? (
                    <img src={k.cover_image} alt={k.name} onClick={() => setZoom(k.cover_image)} className="h-56 w-full cursor-zoom-in object-cover transition hover:opacity-95" />
                  ) : (
                    <div className="flex h-56 w-full items-center justify-center bg-forest-50"><PawMark className="h-8 w-8 text-forest-200" /></div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-2xl text-forest-900">{k.name}</h3>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold uppercase tracking-wide ${meta.cls}`}>{meta.label}</span>
                    </div>
                    <p className="mt-1 text-sm text-forest-600">{sexLabel(k.gender)} · {[k.color, k.pattern].filter(Boolean).join(' ') || 'Maine Coon'}</p>

                    {/* Bruikbare advertentiegegevens */}
                    <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      {k.date_of_birth && <Item label="Geboren" value={new Date(k.date_of_birth).toLocaleDateString('nl-NL')} />}
                      {k.ems_code && <Item label="EMS-code" value={k.ems_code} />}
                      {k.registration_no && <Item label="Stamboom" value={k.registration_no} />}
                      <Item label="Chip" value={k.chip_number ? 'Aanwezig' : 'Volgt'} />
                      <Item label="Inentingen" value={`${k.vaccCount} gedaan`} />
                      <Item label="Paspoort" value={k.hasPassport ? 'Aanwezig' : 'Volgt'} />
                      {k.price_nl ? <Item label="Prijs" value={`€ ${k.price_nl}`} /> : null}
                    </dl>

                    {k.upcoming && k.upcoming.length > 0 && (
                      <div className="mt-4 rounded-xl border border-forest-900/10 bg-cream-50 p-3">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-forest-700">Aankomende zorg</p>
                        <div className="space-y-1.5">
                          {k.upcoming.map((t, i) => {
                            const u = urgency(t.due);
                            return (
                              <div key={i} className="flex items-center justify-between gap-2 text-xs text-forest-700">
                                <span>{treatmentIcon(t.type)} {t.type} · {formatDate(t.due)}</span>
                                {u && <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${u.cls}`}>{u.label}</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-5">
                      {alreadySent ? (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800">✓ Je interesse is verstuurd! De cattery neemt contact op.</div>
                      ) : canReserve ? (
                        <button onClick={() => setInterestFor(k)} className="w-full rounded-xl bg-brass-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-brass-600">Ik ben geïnteresseerd in {k.name}</button>
                      ) : (
                        <div className="rounded-xl border border-forest-900/10 bg-forest-50 px-4 py-3 text-center text-sm text-forest-600">Deze kitten is niet meer beschikbaar.</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center text-xs text-forest-900/40">
          <p>Deze advertentie wordt automatisch bijgewerkt zodra de status van een kitten verandert.</p>
        </div>
      </main>

      {/* Interesse-formulier */}
      {interestFor && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={() => setInterestFor(null)}>
          <div className="w-full max-w-md rounded-2xl bg-cream-50 p-6 shadow-lux" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-2xl text-forest-900">Interesse in {interestFor.name}</h3>
            <p className="mt-1 text-sm text-forest-600">Laat je gegevens achter. De cattery neemt zo snel mogelijk contact met je op.</p>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">Je naam *</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass-400 focus:ring-2 focus:ring-brass-200" placeholder="Voor- en achternaam" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">E-mail of telefoon</span>
                <input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} className="mt-1 w-full rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass-400 focus:ring-2 focus:ring-brass-200" placeholder="Zodat we contact kunnen opnemen" />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">Bericht (optioneel)</span>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={3} className="mt-1 w-full rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass-400 focus:ring-2 focus:ring-brass-200" placeholder="Vertel iets over jezelf…" />
              </label>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setInterestFor(null)} className="flex-1 rounded-xl border border-forest-900/15 bg-white px-4 py-3 text-sm font-semibold text-forest-800 transition hover:bg-forest-50">Annuleren</button>
              <button onClick={submitInterest} disabled={submitting} className="flex-1 rounded-xl bg-brass-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-brass-600 disabled:opacity-60">{submitting ? 'Versturen…' : 'Versturen'}</button>
            </div>
          </div>
        </div>
      )}

      <Lightbox src={zoom} onClose={() => setZoom(null)} />
    </div>
  );
}

function Item({ label, value }) {
  return (
    <div className="rounded-lg bg-cream-50 px-3 py-2">
      <dt className="text-[10px] font-bold uppercase tracking-wide text-forest-600/60">{label}</dt>
      <dd className="truncate text-forest-900">{value}</dd>
    </div>
  );
}
