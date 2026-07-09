'use client';
import { useState, useEffect, use } from 'react';
import { PawMark } from '@/components/ui';
import { treatmentIcon, urgency, formatDate } from '@/lib/treatments';
import Lightbox from '@/components/Lightbox';

const norm = (s) => (s || '').toLowerCase();
const sexLabel = (g) => {
  const v = norm(g);
  if (/kater|mann|\bmale\b|\bm\b/.test(v)) return 'Kater';
  if (/poes|vrouw|female|\bf\b/.test(v)) return 'Poes';
  return g || 'Onbekend';
};
const roleLabel = (c) => (c.is_own_breeding_cat ? `Fok${sexLabel(c.gender).toLowerCase()}` : 'Kitten');
const STATUS_META = {
  beschikbaar: { label: 'Beschikbaar', cls: 'bg-emerald-500/90 text-white' },
  gereserveerd: { label: 'Gereserveerd', cls: 'bg-amber-500/90 text-white' },
  verkocht: { label: 'Verkocht', cls: 'bg-red-500/90 text-white' },
  houden: { label: 'Niet te koop', cls: 'bg-stone-500/90 text-white' },
};

export default function CatShowcasePage({ params }) {
  const { token } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/public/cat?token=${encodeURIComponent(token)}`);
        if (!res.ok) { setError(true); setLoading(false); return; }
        setData(await res.json());
      } catch { setError(true); }
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-cream-50 text-forest-700">Wordt geladen…</div>;
  if (error || !data) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-50">
        <div className="max-w-md px-6 text-center">
          <PawMark className="mx-auto mb-4 h-10 w-10 text-brass-400" />
          <h1 className="mb-3 font-display text-3xl text-forest-950">Niet gevonden</h1>
          <p className="text-forest-700">Deze link is niet geldig of verlopen.</p>
        </div>
      </div>
    );
  }

  const { cat, tenant } = data;
  const meta = STATUS_META[norm(cat.status)] || STATUS_META.beschikbaar;

  return (
    <div className="min-h-screen bg-cream-50 text-ink">
      <div className="sticky top-0 z-40 border-b border-ink/5 bg-cream-50/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 font-display text-lg text-forest-950"><PawMark className="h-5 w-5 text-brass-500" /> {tenant.name}</span>
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.25em] text-forest-600/70 sm:block">Maine Coon Cattery</span>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {cat.cover_image && (
          <>
            <img src={cat.cover_image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/55 to-ink/85" />
          </>
        )}
        <div className={`relative mx-auto max-w-3xl px-6 py-24 text-center md:py-32 ${cat.cover_image ? 'text-cream-50' : 'text-forest-950'}`}>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.35em] ${cat.cover_image ? 'text-brass-200' : 'text-brass-600'}`}>{roleLabel(cat)} · {sexLabel(cat.gender)}</p>
          <h1 className="mt-4 font-display text-5xl font-light leading-tight md:text-7xl">{cat.name}</h1>
          <p className={`mt-4 text-base md:text-lg ${cat.cover_image ? 'text-cream-100/85' : 'text-forest-700'}`}>{[cat.color, cat.pattern].filter(Boolean).join(' ') || 'Maine Coon'}</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <span className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide shadow ${meta.cls}`}>{meta.label}</span>
            {cat.price != null && (
              <span className="rounded-full bg-brass-500 px-4 py-1.5 text-sm font-bold text-white shadow">€ {cat.price}{cat.nationality ? ` (${cat.nationality})` : ''}</span>
            )}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-14">
        {/* Ouders — bovenaan, boven de gegevens */}
        {(cat.sire_image_url || cat.dam_image_url) && (
          <section className="mb-10">
            <h2 className="mb-6 text-center font-display text-2xl text-forest-950">De ouders</h2>
            <div className="mx-auto grid max-w-xl grid-cols-2 gap-6">
              {[{ img: cat.sire_image_url, name: cat.sire_name, label: 'Vader' }, { img: cat.dam_image_url, name: cat.dam_name, label: 'Moeder' }].map((p) => (
                <div key={p.label} className="text-center">
                  <div className="group relative mx-auto aspect-square overflow-hidden rounded-[1.5rem] border border-ink/5 bg-forest-50 shadow-lux">
                    {p.img ? <img src={p.img} alt={p.label} onClick={() => setZoom(p.img)} className="h-full w-full cursor-zoom-in object-cover transition duration-700 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center"><PawMark className="h-8 w-8 text-forest-200" /></div>}
                  </div>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-brass-600">{p.label}</p>
                  <p className="font-display text-lg text-forest-900">{p.name || '—'}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Kerngegevens */}
        <section className="rounded-[2rem] border border-ink/5 bg-white p-7 shadow-lux md:p-9">
          <h2 className="mb-5 font-display text-2xl text-forest-950">Gegevens</h2>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {cat.date_of_birth && <Stat label="Geboren" value={new Date(cat.date_of_birth).toLocaleDateString('nl-NL')} />}
            <Stat label="Geslacht" value={sexLabel(cat.gender)} />
            {cat.litter_name && <Stat label="Nestje" value={cat.litter_name} />}
            {cat.ems_code && <Stat label="EMS-code" value={cat.ems_code} />}
            {cat.registration_no && <Stat label="Stamboom" value={cat.registration_no} />}
            <Stat label="Chip" value={cat.chip_number ? 'Aanwezig ✓' : 'Volgt'} />
            <Stat label="Inentingen" value={`${cat.vaccCount} gedaan`} />
            <Stat label="Paspoort" value={cat.hasPassport ? 'Aanwezig ✓' : 'Volgt'} />
            {cat.weights?.length > 0 && <Stat label="Laatste weging" value={`${cat.weights[cat.weights.length - 1].grams} g`} />}
          </dl>
        </section>

        {/* Galerij */}
        {cat.gallery?.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-6 text-center font-display text-2xl text-forest-950">Galerij</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {cat.gallery.map((src, i) => (
                <div key={i} className="group aspect-square overflow-hidden rounded-2xl border border-ink/5 shadow-soft">
                  <img src={src} alt="" onClick={() => setZoom(src)} className="h-full w-full cursor-zoom-in object-cover transition duration-500 group-hover:scale-105" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Zorg */}
        {(cat.upcoming?.length > 0 || cat.careDone?.length > 0) && (
          <section className="mt-10 grid gap-6 md:grid-cols-2">
            {cat.upcoming?.length > 0 && (
              <div className="rounded-[1.5rem] border border-ink/5 bg-white p-6 shadow-soft">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-800">Aankomende zorg</h3>
                <div className="space-y-2">
                  {cat.upcoming.map((t, i) => {
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
            {cat.careDone?.length > 0 && (
              <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-6 shadow-soft">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-forest-800">Gedane zorg</h3>
                <div className="space-y-2">
                  {cat.careDone.map((t, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 text-sm text-forest-700">
                      <span>{treatmentIcon(t.type)} {t.type}{t.date ? ` · ${formatDate(t.date)}` : ''}</span>
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">✓</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Kwaliteitsbelofte — licht, met pikzwarte tekst */}
        <section className="mt-12 rounded-[2rem] border border-ink/10 bg-white px-8 py-11 shadow-lux md:px-12">
          <h2 className="text-center font-display text-2xl text-forest-950">Onze belofte</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { i: '🧬', t: 'Gezonde bloedlijnen', d: 'Getest op o.a. HCM & PKD' },
              { i: '📜', t: 'Stamboom & paspoort', d: 'Officieel geregistreerd' },
              { i: '❤️', t: 'Liefdevol grootgebracht', d: 'Huiselijke socialisatie' },
              { i: '🤝', t: 'Levenslange begeleiding', d: 'Ook na de adoptie' },
            ].map((x) => (
              <div key={x.t} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cream-100 text-3xl shadow-sm ring-1 ring-ink/5">{x.i}</div>
                <p className="mt-4 font-display text-lg text-forest-900">{x.t}</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.15em] text-brass-600">{x.d}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="py-10 text-center text-xs text-forest-900/40">🐾 {tenant.name} · Maine Coon Cattery</p>
      </main>

      <Lightbox src={zoom} onClose={() => setZoom(null)} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-cream-50 px-3 py-2.5">
      <dt className="text-[9px] font-bold uppercase tracking-wide text-forest-600/60">{label}</dt>
      <dd className="truncate text-sm font-medium text-forest-900">{value}</dd>
    </div>
  );
}
