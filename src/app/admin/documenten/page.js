'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHeader, EmptyHero } from '@/components/admin/PageShell';
import { SearchBar } from '@/components/admin/AppKit';
import { cap, sexLabel } from '@/lib/species';
import {
  buildAnimalPassport, buildHealthSummary, buildLitterRecord,
  buildHandoverPacket, buildCustomerList,
} from '@/lib/documents';

// Eén kaart per document. `pick` bepaalt wat je eerst moet kiezen:
// een dier, een nestje, of niets (dan gaat het over de hele fokkerij).
function DocCard({ doc, onStart, accent }) {
  return (
    <div className={`flex flex-col rounded-2xl border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(28,20,15,0.2)] ${accent.border}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent.bg} ${accent.text}`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">{doc.icon}</svg>
        </span>
        <span className="shrink-0 rounded-full border border-forest-900/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-forest-500">PDF</span>
      </div>
      <h3 className="font-display text-xl leading-snug text-forest-950">{doc.title}</h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-forest-600">{doc.desc}</p>
      <button
        onClick={() => onStart(doc)}
        className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-cream-50 transition ${accent.btn}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v8H6z" /></svg>
        Maak PDF
      </button>
    </div>
  );
}

function CategoryBar({ label, hint, accent }) {
  return (
    <div className={`mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border-l-4 px-4 py-2.5 ${accent.barBg} ${accent.barBorder}`}>
      <h2 className={`font-display text-xl ${accent.barText}`}>{label}</h2>
      <p className="text-sm text-forest-600">{hint}</p>
    </div>
  );
}

export default function DocumentenPage() {
  const { kittens = [], litters = [], customers = [], documents = [], species, terms, currentTenant } = useStore();
  const [active, setActive] = useState(null); // welk document wacht op een keuze
  const [q, setQ] = useState('');

  const fokkerij = currentTenant?.name || 'Mijn fokkerij';

  const ACCENTS = {
    dier:    { border: 'border-forest-900/10', bg: 'bg-forest-50', text: 'text-forest-700', btn: 'bg-forest-800 hover:bg-forest-900', barBg: 'bg-forest-50/70', barBorder: 'border-forest-700', barText: 'text-forest-900' },
    nest:    { border: 'border-forest-900/10', bg: 'bg-brass-50', text: 'text-brass-700', btn: 'bg-brass-500 hover:bg-brass-600', barBg: 'bg-brass-50/70', barBorder: 'border-brass-500', barText: 'text-brass-800' },
    fokkerij:{ border: 'border-forest-900/10', bg: 'bg-terracotta-50', text: 'text-terracotta-700', btn: 'bg-terracotta-500 hover:bg-terracotta-600', barBg: 'bg-terracotta-50/70', barBorder: 'border-terracotta-500', barText: 'text-terracotta-800' },
  };

  const litterOf = (cat) => litters.find((l) => l.id === cat.litter_id) || null;
  const customerOf = (cat) => customers.find((c) => c.id === cat.customer_id) || null;

  const DOCS = [
    {
      group: 'dier', pick: 'dier', key: 'paspoort',
      title: `${cap(terms.animal)}paspoort`,
      desc: `Alle kerngegevens van één ${terms.animal} op één blad: afstamming, chipnummer, kleur, gezondheid en gewicht.`,
      icon: <><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2Z" /><path d="M13 2v6h6" /></>,
      run: (cat) => buildAnimalPassport({ cat, litter: litterOf(cat), fokkerij, species }),
    },
    {
      group: 'dier', pick: 'dier', key: 'gezondheid',
      title: 'Gezondheidsoverzicht',
      desc: 'Wat er is gedaan en wat er nog gepland staat — ontworming, entingen en controles op een rij.',
      icon: <path d="M19 14c1.5-1.5 3-3.4 3-5.5A3.5 3.5 0 0 0 12 5 3.5 3.5 0 0 0 2 8.5C2 12 5 14.5 12 21c2.5-2.3 4.5-4.2 6-6.5Z" />,
      run: (cat) => buildHealthSummary({ cat, fokkerij, species }),
    },
    {
      group: 'dier', pick: 'dier', key: 'overdracht',
      title: 'Overdrachtsdocument',
      desc: 'Wat de koper meekrijgt bij het ophalen, inclusief zijn gegevens en een plek voor beide handtekeningen.',
      icon: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="m9 14 2 2 4-4" /></>,
      run: (cat) => buildHandoverPacket({ cat, litter: litterOf(cat), customer: customerOf(cat), fokkerij, species }),
    },
    {
      group: 'nest', pick: 'nest', key: 'nestoverzicht',
      title: `${cap(terms.litter)}overzicht`,
      desc: `Alle ${terms.youngPlural} van één ${terms.litter} met geslacht, kleur, chipnummer en status.`,
      icon: <><path d="M3 10.5 12 4l9 6.5" /><path d="M5 9.5V20h14V9.5" /><path d="M9 20v-5a3 3 0 0 1 6 0v5" /></>,
      run: (lit) => buildLitterRecord({ litter: lit, kittens: kittens.filter((k) => k.litter_id === lit.id && !k.is_own_breeding_cat), fokkerij, species }),
    },
    {
      group: 'fokkerij', pick: null, key: 'klanten',
      title: 'Klantenlijst',
      desc: 'Al je kopers met contactgegevens en welk dier aan wie gekoppeld is.',
      icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></>,
      run: () => buildCustomerList({ customers, kittens, fokkerij }),
    },
  ];

  const start = (doc) => {
    if (!doc.pick) { doc.run(); return; }
    setQ('');
    setActive(doc);
  };

  const choose = (record) => {
    try { active.run(record); } catch (e) { alert('PDF maken mislukt: ' + (e.message || e)); }
    setActive(null);
  };

  // Waaruit kies je, en wat is er te zien in de lijst?
  const options = !active ? [] : (active.pick === 'nest' ? litters : kittens)
    .filter((r) => !q.trim() || (r.name || '').toLowerCase().includes(q.trim().toLowerCase()));

  const hasNothing = kittens.length === 0 && litters.length === 0 && customers.length === 0;

  return (
    <div>
      <PageHeader
        icon={<><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v8H6z" /></>}
        title="Documenten"
        subtitle="Alles wat je kunt uitprinten of meegeven, gevuld met je eigen gegevens"
      />

      {hasNothing ? (
        <EmptyHero
          icon={<><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><path d="M6 14h12v8H6z" /></>}
          title="Nog niets om af te drukken"
          desc={`Zodra je ${terms.animalPlural} en ${terms.litterPlural} hebt ingevoerd, maak je hier met één klik paspoorten, gezondheidsoverzichten en overdrachtspapieren.`}
          action={
            <Link href="/admin/litters/new-cat" className="inline-flex items-center justify-center rounded-xl bg-forest-800 px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-forest-900">
              {`${cap(terms.animal)} toevoegen`}
            </Link>
          }
        />
      ) : (
        <>
          {/* Je eigen geüploade bestanden */}
          <Link
            href="/admin/media"
            className="mb-8 flex items-center gap-4 rounded-2xl border border-forest-900/10 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(28,20,15,0.18)]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="m21.4 11.1-9.2 9.2a5 5 0 0 1-7.1-7.1l9.2-9.2a3.3 3.3 0 1 1 4.7 4.7l-9.2 9.2a1.7 1.7 0 0 1-2.4-2.4l8.5-8.5" /></svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-xl text-forest-950">Je eigen bestanden</span>
              <span className="block text-sm text-forest-600">
                {documents.length > 0
                  ? `${documents.length} geüploade paspoorten, contracten en uitslagen`
                  : 'Paspoorten, contracten en uitslagen die je zelf hebt geüpload'}
              </span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-forest-600">Beheren →</span>
          </Link>

          {/* Per dier */}
          <section className="mb-8">
            <CategoryBar label={`Per ${terms.animal}`} hint={`Documenten over één ${terms.animal}.`} accent={ACCENTS.dier} />
            <div className="grid gap-3 md:grid-cols-3">
              {DOCS.filter((d) => d.group === 'dier').map((d) => (
                <DocCard key={d.key} doc={d} onStart={start} accent={ACCENTS.dier} />
              ))}
            </div>
          </section>

          {/* Per nestje */}
          <section className="mb-8">
            <CategoryBar label={`Per ${terms.litter}`} hint={`Documenten over een heel ${terms.litter}.`} accent={ACCENTS.nest} />
            <div className="grid gap-3 md:grid-cols-3">
              {DOCS.filter((d) => d.group === 'nest').map((d) => (
                <DocCard key={d.key} doc={d} onStart={start} accent={ACCENTS.nest} />
              ))}
            </div>
          </section>

          {/* Hele fokkerij */}
          <section className="mb-8">
            <CategoryBar label="Hele fokkerij" hint="Overzichten over je administratie." accent={ACCENTS.fokkerij} />
            <div className="grid gap-3 md:grid-cols-3">
              {DOCS.filter((d) => d.group === 'fokkerij').map((d) => (
                <DocCard key={d.key} doc={d} onStart={start} accent={ACCENTS.fokkerij} />
              ))}
              <Link
                href="/admin/backup"
                className="flex flex-col rounded-2xl border border-dashed border-forest-900/15 bg-white/60 p-5 transition hover:border-forest-900/25 hover:bg-white"
              >
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-600">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" /></svg>
                </span>
                <span className="font-display text-xl leading-snug text-forest-950">Back-up & export</span>
                <span className="mt-1.5 flex-1 text-sm leading-relaxed text-forest-600">
                  Alles uit je administratie als JSON of Excel-bestand, om zelf te bewaren.
                </span>
                <span className="mt-5 text-sm font-semibold text-forest-600">Naar back-up →</span>
              </Link>
            </div>
          </section>
        </>
      )}

      {/* Kiezen waarover het document gaat */}
      {active && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center" onClick={() => setActive(null)}>
          <div className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-lux" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-forest-900/10 p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-2xl leading-tight text-forest-950">{active.title}</h3>
                  <p className="mt-1 text-sm text-forest-500">
                    {active.pick === 'nest' ? `Kies een ${terms.litter}` : `Kies een ${terms.animal}`}
                  </p>
                </div>
                <button onClick={() => setActive(null)} aria-label="Sluiten" className="shrink-0 rounded-full p-1.5 text-forest-400 transition hover:bg-forest-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="mt-4">
                <SearchBar value={q} onChange={setQ} placeholder="Zoek op naam…" />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {options.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-forest-500">
                  {q.trim() ? 'Niets gevonden.' : 'Er is nog niets om uit te kiezen.'}
                </p>
              ) : (
                <div className="space-y-1.5">
                  {options.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => choose(r)}
                      className="flex w-full items-center gap-3 rounded-xl border border-forest-900/8 bg-white p-3 text-left transition hover:border-forest-900/20 hover:bg-forest-50/50"
                    >
                      {r.cover_image || r.cover_image_url ? (
                        <img src={r.cover_image || r.cover_image_url} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <span className="h-10 w-10 shrink-0 rounded-lg bg-forest-50" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-forest-900">{r.name || 'Naamloos'}</span>
                        <span className="block truncate text-xs text-forest-500">
                          {active.pick === 'nest'
                            ? [r.sire_name, r.dam_name].filter(Boolean).join(' × ') || '—'
                            : [sexLabel(r.gender, species), r.color].filter(Boolean).join(' · ') || '—'}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-semibold text-forest-500">PDF →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
