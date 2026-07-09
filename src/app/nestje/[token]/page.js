'use client';
import { useState, useEffect, use } from 'react';
import { PawMark } from '@/components/ui';
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
  beschikbaar: { label: 'Beschikbaar', cls: 'bg-emerald-500/90 text-white' },
  gereserveerd: { label: 'Gereserveerd', cls: 'bg-amber-500/90 text-white' },
  verkocht: { label: 'Verkocht', cls: 'bg-red-500/90 text-white' },
  houden: { label: 'Niet te koop', cls: 'bg-stone-500/90 text-white' },
};

export default function LitterAdPage({ params }) {
  const { token } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [interestFor, setInterestFor] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sentFor, setSentFor] = useState([]);
  const [zoom, setZoom] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/public/litter?token=${encodeURIComponent(token)}`);
        if (!res.ok) { setError(true); setLoading(false); return; }
        setData(await res.json());
      } catch { setError(true); }
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
        body: JSON.stringify({ token, cat_id: interestFor.id, name: form.name.trim(), contact: form.contact.trim(), message: form.message.trim() }),
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
  const tenant = data.tenant || { name: 'Cattery' };
  const available = kittens.filter((k) => isAvailable(k.status));
  const isExpected = norm(litter.status) === 'verwacht' || kittens.length === 0;
  const gallery = Array.isArray(litter.ad_gallery) ? litter.ad_gallery : [];
  const heroImg = kittens.find((k) => k.cover_image)?.cover_image || litter.sire_image_url || litter.dam_image_url || null;

  return (
    <div className="min-h-screen bg-cream-50 text-ink">
      {/* Topbar */}
      <div className="sticky top-0 z-40 border-b border-ink/5 bg-cream-50/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 font-display text-lg text-forest-950">
            <PawMark className="h-5 w-5 text-brass-500" /> {tenant.name}
          </span>
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.25em] text-forest-600/70 sm:block">Maine Coon Cattery</span>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {heroImg && (
          <>
            <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/60 to-ink/85" />
          </>
        )}
        <div className={`relative mx-auto max-w-4xl px-6 py-24 text-center md:py-32 ${heroImg ? 'text-cream-50' : 'text-forest-950'}`}>
          <PawMark className={`mx-auto mb-6 h-10 w-10 ${heroImg ? 'text-brass-300' : 'text-brass-400'}`} />
          <p className={`text-[11px] font-semibold uppercase tracking-[0.35em] ${heroImg ? 'text-brass-200' : 'text-brass-600'}`}>{isExpected ? 'Verwacht nestje' : 'Exclusieve nestje-advertentie'}</p>
          <h1 className="mt-4 font-display text-5xl font-light leading-tight md:text-7xl">{litter.name}</h1>
          <p className={`mt-5 text-base md:text-lg ${heroImg ? 'text-cream-100/85' : 'text-forest-700'}`}>
            {litter.sire_name || 'Onbekende vader'} <span className="mx-1 opacity-60">×</span> {litter.dam_name || 'Onbekende moeder'}
            {litter.date_of_birth && <> · {isExpected ? 'verwacht' : 'geboren'} {new Date(litter.date_of_birth).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</>}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white shadow-lg ${isExpected ? 'bg-brass-500' : 'bg-emerald-500'}`}>
              {isExpected ? '🍼 Binnenkort verwacht' : `🐾 ${available.length} ${available.length === 1 ? 'kitten' : 'kittens'} beschikbaar`}
            </span>
            {isExpected && (
              <button onClick={() => setInterestFor({ id: null, name: litter.name })} className="inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-2.5 text-sm font-semibold text-forest-900 shadow-lg transition hover:bg-white">
                Blijf op de hoogte →
              </button>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6">
        {/* Verhaal / advertentietekst */}
        {litter.ad_text && (
          <section className="relative mx-auto -mt-2 max-w-3xl py-16 text-center md:py-20">
            <span className="font-display text-6xl leading-none text-brass-300">“</span>
            <p className="mt-2 whitespace-pre-line font-display text-xl font-light leading-relaxed text-forest-900 md:text-2xl">{litter.ad_text}</p>
            <div className="mx-auto mt-8 h-px w-24 bg-brass-300/60" />
          </section>
        )}

        {/* Sfeergalerij van (het verwachte) nestje */}
        {gallery.length > 0 && (
          <section className="pb-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {gallery.map((src, i) => (
                <div key={i} className="group aspect-square overflow-hidden rounded-2xl border border-ink/5 shadow-soft">
                  <img src={src} alt="" onClick={() => setZoom(src)} className="h-full w-full cursor-zoom-in object-cover transition duration-500 group-hover:scale-105" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Ouders */}
        {(litter.sire_image_url || litter.dam_image_url) && (
          <section className="pb-6">
            <h2 className="mb-8 text-center font-display text-3xl text-forest-950">De ouders</h2>
            <div className="mx-auto grid max-w-2xl grid-cols-2 gap-6">
              {[{ img: litter.sire_image_url, name: litter.sire_name, label: 'Vader' }, { img: litter.dam_image_url, name: litter.dam_name, label: 'Moeder' }].map((p) => (
                <div key={p.label} className="text-center">
                  <div className="group relative mx-auto aspect-square overflow-hidden rounded-[1.75rem] border border-ink/5 bg-forest-50 shadow-lux">
                    {p.img
                      ? <img src={p.img} alt={p.label} onClick={() => setZoom(p.img)} className="h-full w-full cursor-zoom-in object-cover transition duration-700 group-hover:scale-105" />
                      : <div className="flex h-full w-full items-center justify-center"><PawMark className="h-9 w-9 text-forest-200" /></div>}
                  </div>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-brass-600">{p.label}</p>
                  <p className="font-display text-lg text-forest-900">{p.name || '—'}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Kittens */}
        <section className="py-14">
          <h2 className="mb-2 text-center font-display text-4xl text-forest-950">{kittens.length === 0 ? 'De kittens komen eraan' : 'Onze kittens'}</h2>
          <p className="mb-12 text-center text-forest-600">{kittens.length === 0 ? 'Dit nestje wordt binnenkort verwacht. Laat je gegevens achter en je hoort als eerste wanneer de kittens er zijn.' : 'Elk kitten met liefde grootgebracht — bekijk de details en toon je interesse.'}</p>

          {kittens.length === 0 ? (
            <div className="mx-auto max-w-md rounded-[2rem] border border-brass-200 bg-white p-8 text-center shadow-lux">
              <div className="text-4xl">🍼</div>
              {litter.date_of_birth && <p className="mt-3 text-sm text-forest-600">Verwacht rond <b className="text-forest-900">{new Date(litter.date_of_birth).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</b></p>}
              <button onClick={() => setInterestFor({ id: null, name: litter.name })} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-brass-500 to-brass-600 px-5 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:from-brass-600 hover:to-brass-700">Blijf op de hoogte →</button>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              {kittens.map((k) => {
                const meta = STATUS_META[norm(k.status)] || STATUS_META.beschikbaar;
                const canReserve = isAvailable(k.status);
                const alreadySent = sentFor.includes(k.id);
                return (
                  <article key={k.id} className="group overflow-hidden rounded-[2rem] border border-ink/5 bg-white shadow-lux transition duration-500 hover:-translate-y-1">
                    {/* Foto met overlay */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {k.cover_image
                        ? <img src={k.cover_image} alt={k.name} onClick={() => setZoom(k.cover_image)} className="h-full w-full cursor-zoom-in object-cover transition duration-700 group-hover:scale-105" />
                        : <div className="flex h-full w-full items-center justify-center bg-forest-50"><PawMark className="h-10 w-10 text-forest-200" /></div>}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                      <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow ${meta.cls}`}>{meta.label}</span>
                      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-forest-800 backdrop-blur-sm">🐾 {tenant.name}</span>
                      <div className="pointer-events-none absolute bottom-4 left-5 right-5 flex items-end justify-between text-cream-50">
                        <div>
                          <h3 className="font-display text-3xl leading-tight">{k.name}</h3>
                          <p className="text-sm text-cream-100/90">{sexLabel(k.gender)} · {[k.color, k.pattern].filter(Boolean).join(' ') || 'Maine Coon'}</p>
                        </div>
                        {k.price_nl != null && (
                          <div className="rounded-xl bg-brass-500/95 px-3 py-1.5 text-right shadow">
                            <p className="text-[9px] font-bold uppercase tracking-wide text-white/80">Prijs</p>
                            <p className="font-display text-xl leading-none text-white">€ {k.price_nl}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Kerngegevens */}
                      <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {k.date_of_birth && <Stat label="Geboren" value={new Date(k.date_of_birth).toLocaleDateString('nl-NL')} />}
                        <Stat label="Geslacht" value={sexLabel(k.gender)} />
                        {k.ems_code && <Stat label="EMS-code" value={k.ems_code} />}
                        {k.registration_no && <Stat label="Stamboom" value={k.registration_no} />}
                        <Stat label="Chip" value={k.chip_number ? 'Aanwezig ✓' : 'Volgt'} />
                        <Stat label="Inentingen" value={`${k.vaccCount} gedaan`} />
                        <Stat label="Paspoort" value={k.hasPassport ? 'Aanwezig ✓' : 'Volgt'} />
                      </dl>

                      {k.upcoming && k.upcoming.length > 0 && (
                        <div className="mt-5 rounded-2xl border border-forest-900/8 bg-cream-50 p-4">
                          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-forest-700">Aankomende zorg</p>
                          <div className="space-y-2">
                            {k.upcoming.map((t, i) => {
                              const u = urgency(t.due);
                              return (
                                <div key={i} className="flex items-center justify-between gap-2 text-sm text-forest-700">
                                  <span>{treatmentIcon(t.type)} {t.type} · {formatDate(t.due)}</span>
                                  {u && <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${u.cls}`}>{u.label}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="mt-6">
                        {alreadySent ? (
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-center text-sm font-semibold text-emerald-800">✓ Je interesse is verstuurd! De cattery neemt contact op.</div>
                        ) : canReserve ? (
                          <button onClick={() => setInterestFor(k)} className="group/btn w-full rounded-2xl bg-gradient-to-r from-brass-500 to-brass-600 px-5 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:from-brass-600 hover:to-brass-700">
                            Ik ben geïnteresseerd in {k.name} <span className="ml-1 inline-block transition group-hover/btn:translate-x-1">→</span>
                          </button>
                        ) : (
                          <div className="rounded-2xl border border-forest-900/10 bg-forest-50 px-4 py-3.5 text-center text-sm text-forest-600">Deze kitten is niet meer beschikbaar.</div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Kwaliteitsbelofte */}
        <section className="mb-16 rounded-[2rem] bg-forest-950 px-8 py-12 text-cream-50 shadow-lux md:px-12">
          <h2 className="text-center font-display text-3xl font-light">Onze belofte aan jou</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { i: '🧬', t: 'Gezonde bloedlijnen', d: 'Ouders getest op o.a. HCM & PKD' },
              { i: '📜', t: 'Stamboom & paspoort', d: 'Officieel geregistreerd' },
              { i: '❤️', t: 'Liefdevol gesocialiseerd', d: 'Opgegroeid in huiselijke sfeer' },
              { i: '🤝', t: 'Levenslange begeleiding', d: 'Ook na de adoptie' },
            ].map((x) => (
              <div key={x.t} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl">{x.i}</div>
                <p className="mt-3 font-semibold">{x.t}</p>
                <p className="mt-1 text-sm text-cream-100/70">{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="pb-16 text-center text-xs text-forest-900/40">
          🐾 {tenant.name} · Maine Coon Cattery — deze advertentie wordt automatisch bijgewerkt zodra er iets verandert.
        </p>
      </main>

      {/* Interesse-formulier */}
      {interestFor && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm" onClick={() => setInterestFor(null)}>
          <div className="w-full max-w-md rounded-[1.75rem] bg-cream-50 p-7 shadow-lux" onClick={(e) => e.stopPropagation()}>
            <PawMark className="mb-3 h-8 w-8 text-brass-500" />
            <h3 className="font-display text-2xl text-forest-900">Interesse in {interestFor.name}</h3>
            <p className="mt-1 text-sm text-forest-600">Laat je gegevens achter — de cattery neemt zo snel mogelijk contact met je op.</p>
            <div className="mt-5 space-y-3">
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
            <div className="mt-6 flex gap-3">
              <button onClick={() => setInterestFor(null)} className="flex-1 rounded-xl border border-forest-900/15 bg-white px-4 py-3 text-sm font-semibold text-forest-800 transition hover:bg-forest-50">Annuleren</button>
              <button onClick={submitInterest} disabled={submitting} className="flex-1 rounded-xl bg-gradient-to-r from-brass-500 to-brass-600 px-4 py-3 text-sm font-bold text-white transition hover:from-brass-600 hover:to-brass-700 disabled:opacity-60">{submitting ? 'Versturen…' : 'Versturen'}</button>
            </div>
          </div>
        </div>
      )}

      <Lightbox src={zoom} onClose={() => setZoom(null)} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-cream-50 px-3 py-2">
      <dt className="text-[9px] font-bold uppercase tracking-wide text-forest-600/60">{label}</dt>
      <dd className="truncate text-sm font-medium text-forest-900">{value}</dd>
    </div>
  );
}
