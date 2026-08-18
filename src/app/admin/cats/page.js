'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Icon } from '@/components/admin';

const isMale = (g) => /kater|mann|\bmale\b|\bm\b/i.test(g || '');
const isFemale = (g) => /poes|vrouw|female|\bf\b/i.test(g || '');
const sexLabel = (g) => (isMale(g) ? 'Kater' : isFemale(g) ? 'Poes' : (g || 'Onbekend'));
const vachtLabel = (k) => [k.color, k.pattern].filter(Boolean).join(' ') || 'Maine Coon';
const isDeparted = (k) => (k.status || '').trim().toLowerCase() === 'verkocht';

function Badge({ children, cls }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

function CatCard({ k, badge, subtitle }) {
  return (
    <div className="group relative flex flex-col gap-3 rounded-2xl border border-forest-900/15 bg-white p-4 shadow-soft transition hover:border-brass-400 hover:shadow-md sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <Link href={`/admin/cats/${k.id}`} className="absolute inset-0 z-10" aria-label={`Beheer dossier van ${k.name}`} />
      <div className="flex min-w-0 items-center gap-4">
        {k.cover_image ? (
          <img src={k.cover_image} alt={k.name} className="relative z-0 h-16 w-16 shrink-0 rounded-xl object-cover shadow-sm border border-forest-900/10" />
        ) : (
          <div className="relative z-0 flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-forest-900/10 bg-forest-50 text-forest-300">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>
          </div>
        )}
        <div className="relative z-0 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-xl font-semibold text-forest-950 truncate">{k.name}</p>
            {badge}
          </div>
          <p className="mt-1 text-sm text-forest-600 truncate">{subtitle}</p>
        </div>
      </div>
      <div className="relative z-20 flex shrink-0 items-center gap-2 sm:ml-auto">
        {k.secret_token_nl && (
          <button
            onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(`${window.location.origin}/kat/${k.secret_token_nl}`); alert(`Showcase-link van ${k.name} gekopieerd! Deel hem gerust.`); }}
            className="rounded-xl border border-forest-900/15 bg-white px-3 py-2 text-xs font-semibold text-forest-700 transition hover:bg-forest-50"
            title="Kopieer de publieke advertentie/showcase-link"
          >
            Deel
          </button>
        )}
        <Link href={`/admin/cats/${k.id}`} className="inline-flex items-center whitespace-nowrap rounded-xl bg-brass-400 px-4 py-2.5 text-sm font-medium text-forest-950 shadow-sm transition hover:bg-brass-300">Beheer dossier →</Link>
      </div>
    </div>
  );
}

function CatGroup({ title, hint, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-forest-900/10 bg-white px-4 py-3 text-left transition hover:border-brass-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 text-forest-400 transition-transform ${open ? 'rotate-90' : ''}`}><path d="m9 18 6-6-6-6" /></svg>
        <h2 className="font-display text-xl text-forest-900">{title}</h2>
        <span className="rounded-full bg-forest-900/5 px-2.5 py-0.5 text-xs font-semibold text-forest-600">{count}</span>
        {hint && <span className="hidden text-sm text-forest-500 sm:inline">{hint}</span>}
      </button>
      {open && <div className="mt-3 space-y-3">{children}</div>}
    </section>
  );
}

export default function CatsAdmin() {
  const { kittens, litters = [] } = useStore();

  const [q, setQ] = useState('');
  const litterName = (id) => litters.find((l) => l.id === id)?.name;
  const litterParents = (id) => {
    const l = litters.find((x) => x.id === id);
    return l ? `${l.sire_name || 'onbekend'} × ${l.dam_name || 'onbekend'}` : null;
  };
  // Zoeken op naam, kleur, EMS/chip of nestje.
  const match = (k) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return [k.name, k.color, k.pattern, k.ems_code, k.chip_number, k.registration_no, litterName(k.litter_id)]
      .filter(Boolean).some((v) => String(v).toLowerCase().includes(s));
  };

  const breedingFemales = kittens.filter((k) => k.is_own_breeding_cat && isFemale(k.gender) && !isDeparted(k) && match(k));
  const breedingMales = kittens.filter((k) => k.is_own_breeding_cat && isMale(k.gender) && !isDeparted(k) && match(k));
  const breedingOther = kittens.filter((k) => k.is_own_breeding_cat && !isFemale(k.gender) && !isMale(k.gender) && !isDeparted(k) && match(k));
  const litterKittens = kittens.filter((k) => !k.is_own_breeding_cat && k.litter_id && !isDeparted(k) && match(k));
  const looseCats = kittens.filter((k) => !k.is_own_breeding_cat && !k.litter_id && !isDeparted(k) && match(k));
  const departedCats = kittens.filter((k) => isDeparted(k) && match(k));
  const totalMatches = breedingFemales.length + breedingMales.length + breedingOther.length + litterKittens.length + looseCats.length + departedCats.length;

  return (
    <>
      <PageHead label="Database" title="Kattenbeheer" />

      {/* Zoeken */}
      <div className="relative mb-2 max-w-md">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-forest-400">🔍</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Zoek een kitten of kat… (naam, kleur, chip, nestje)"
          className="w-full rounded-xl border border-forest-900/15 bg-white py-2.5 pl-10 pr-9 text-sm outline-none focus:border-brass-400 focus:ring-2 focus:ring-brass-200"
        />
        {q && (
          <button onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-400 hover:text-forest-700" aria-label="Wissen">✕</button>
        )}
      </div>
      {q.trim() && <p className="mb-10 text-sm text-forest-600">{totalMatches} resultaat{totalMatches === 1 ? '' : 'en'} voor “{q}”.</p>}

      {!q.trim() && (
      <>
      <div className="mb-10 mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl text-forest-900">Nestjes &amp; kittens</h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/litters/new" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              Nieuw nestje
            </Link>
            <Link href="/admin/litters/new-cat" className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              Kat aanmaken
            </Link>
          </div>
        </div>
        <Link
          href="/admin/litters"
          className="group flex items-center gap-4 rounded-3xl border border-forest-900/10 bg-white/70 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-brass-400/60 hover:shadow-lg"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 transition group-hover:bg-brass-100 group-hover:text-brass-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h10" /></svg>
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg text-forest-900">Nestjes overzicht</p>
            <p className="text-sm text-forest-600">Alle nestjes &amp; kittens beheren</p>
          </div>
        </Link>
      </div>

      <div className="mb-2 flex items-baseline gap-2">
        <h2 className="font-display text-2xl text-forest-900">Katten &amp; dossiers</h2>
      </div>
      <p className="mb-6 text-sm text-forest-600">Overzichtelijk gesorteerd: eerst de kittens, daarna je fokdieren (moeders en vaders). Klik op een kaart om het volledige dossier te openen.</p>
      </>
      )}

      {kittens.length === 0 ? (
        <div className="rounded-2xl border border-forest-900/10 bg-white py-12 text-center text-forest-600">
          Geen katten gevonden in de database.
        </div>
      ) : totalMatches === 0 ? (
        <div className="rounded-2xl border border-dashed border-forest-900/20 bg-white/60 py-12 text-center text-forest-600">
          Geen katten gevonden voor “{q}”. Probeer een andere zoekterm.
        </div>
      ) : (
        <>
          {litterKittens.length > 0 && (
            <CatGroup title="Kittens" hint="horen bij een nestje" count={litterKittens.length} defaultOpen={Boolean(q.trim())}>
              {litterKittens.map((k) => {
                const nest = litterName(k.litter_id);
                const parents = litterParents(k.litter_id);
                return (
                  <CatCard
                    key={k.id}
                    k={k}
                    badge={<Badge cls="bg-emerald-100 text-emerald-700">Kitten · {sexLabel(k.gender)}</Badge>}
                    subtitle={nest ? `Nestje: ${nest}${parents ? ` (${parents})` : ''}` : `${sexLabel(k.gender)} · nog geen nestje gekoppeld`}
                  />
                );
              })}
            </CatGroup>
          )}

          {looseCats.length > 0 && (
            <CatGroup title="Losse katten" hint="niet gekoppeld aan een nestje" count={looseCats.length} defaultOpen={Boolean(q.trim())}>
              {looseCats.map((k) => (
                <CatCard key={k.id} k={k} badge={<Badge cls="bg-sky-100 text-sky-700">Losse kat · {sexLabel(k.gender)}</Badge>} subtitle={`${sexLabel(k.gender)} · ${vachtLabel(k)}`} />
              ))}
            </CatGroup>
          )}

          {breedingFemales.length > 0 && (
            <CatGroup title="Fokpoezen" hint="de moeders" count={breedingFemales.length} defaultOpen={Boolean(q.trim())}>
              {breedingFemales.map((k) => (
                <CatCard key={k.id} k={k} badge={<Badge cls="bg-rose-100 text-rose-700">Fokpoes · moeder</Badge>} subtitle={`Poes · ${vachtLabel(k)}`} />
              ))}
            </CatGroup>
          )}

          {breedingMales.length > 0 && (
            <CatGroup title="Fokkaters" hint="de vaders" count={breedingMales.length} defaultOpen={Boolean(q.trim())}>
              {breedingMales.map((k) => (
                <CatCard key={k.id} k={k} badge={<Badge cls="bg-sky-100 text-sky-700">Fokkater · vader</Badge>} subtitle={`Kater · ${vachtLabel(k)}`} />
              ))}
            </CatGroup>
          )}

          {breedingOther.length > 0 && (
            <CatGroup title="Overige fokdieren" count={breedingOther.length} defaultOpen={Boolean(q.trim())}>
              {breedingOther.map((k) => (
                <CatCard key={k.id} k={k} badge={<Badge cls="bg-stone-100 text-stone-700">Fokdier</Badge>} subtitle={`${sexLabel(k.gender)} · ${vachtLabel(k)}`} />
              ))}
            </CatGroup>
          )}

          {departedCats.length > 0 && (
            <CatGroup title="Vertrokken / verkochte katten" hint="niet meer in de cattery — dossier, foto's en nestjegegevens blijven bewaard" count={departedCats.length} defaultOpen={Boolean(q.trim())}>
              {departedCats.map((k) => {
                const nest = litterName(k.litter_id);
                const parents = litterParents(k.litter_id);
                return (
                  <CatCard
                    key={k.id}
                    k={k}
                    badge={<Badge cls="bg-stone-200 text-stone-600">Verkocht · {sexLabel(k.gender)}</Badge>}
                    subtitle={nest ? `Nestje: ${nest}${parents ? ` (${parents})` : ''}` : `${sexLabel(k.gender)} · ${vachtLabel(k)}`}
                  />
                );
              })}
            </CatGroup>
          )}
        </>
      )}
    </>
  );
}
