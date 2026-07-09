'use client';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Btn } from '@/components/admin';

const isMale = (g) => /kater|mann|\bmale\b|\bm\b/i.test(g || '');
const isFemale = (g) => /poes|vrouw|female|\bf\b/i.test(g || '');
const sexLabel = (g) => (isMale(g) ? 'Kater' : isFemale(g) ? 'Poes' : (g || 'Onbekend'));
const vachtLabel = (k) => [k.color, k.pattern].filter(Boolean).join(' ') || 'Maine Coon';

function Badge({ children, cls }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

function CatCard({ k, badge, subtitle }) {
  return (
    <div className="group relative flex items-center gap-4 rounded-2xl border border-forest-900/15 bg-white p-5 shadow-soft transition hover:border-brass-400 hover:shadow-md">
      <Link href={`/admin/cats/${k.id}`} className="absolute inset-0 z-10" aria-label={`Beheer dossier van ${k.name}`} />
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
      <span className="relative z-0 hidden shrink-0 items-center whitespace-nowrap rounded-xl bg-brass-400 px-4 py-2.5 text-sm font-medium text-forest-950 shadow-sm sm:inline-flex">Beheer dossier →</span>
    </div>
  );
}

function CatGroup({ title, hint, count, children }) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-baseline gap-3">
        <h2 className="font-display text-xl text-forest-900">{title}</h2>
        <span className="rounded-full bg-forest-900/5 px-2.5 py-0.5 text-xs font-semibold text-forest-600">{count}</span>
        {hint && <span className="text-sm text-forest-500">{hint}</span>}
      </div>
      <div className="grid gap-4 grid-cols-1 xl:grid-cols-2">{children}</div>
    </section>
  );
}

export default function CatsAdmin() {
  const { kittens, litters = [] } = useStore();

  const breedingFemales = kittens.filter((k) => k.is_own_breeding_cat && isFemale(k.gender));
  const breedingMales = kittens.filter((k) => k.is_own_breeding_cat && isMale(k.gender));
  const breedingOther = kittens.filter((k) => k.is_own_breeding_cat && !isFemale(k.gender) && !isMale(k.gender));
  const litterKittens = kittens.filter((k) => !k.is_own_breeding_cat);
  const litterName = (id) => litters.find((l) => l.id === id)?.name;
  const litterParents = (id) => {
    const l = litters.find((x) => x.id === id);
    return l ? `${l.sire_name || 'onbekend'} × ${l.dam_name || 'onbekend'}` : null;
  };

  return (
    <>
      <PageHead label="Database" title="Kattenbeheer">
        <Link href="/admin/cats/new">
          <Btn variant="solid">+ Nieuwe Kat</Btn>
        </Link>
      </PageHead>

      <div className="mb-10">
        <h2 className="mb-4 font-display text-xl text-forest-900">Nieuw nestje / kitten aanmaken</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/litters?create=litter"
            className="group flex items-center gap-4 rounded-3xl border border-forest-900/10 bg-white/70 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-brass-400/60 hover:shadow-lg"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 transition group-hover:bg-brass-100 group-hover:text-brass-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 4l9 6.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5V20h14V9.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 20v-5a3 3 0 0 1 6 0v5" /></svg>
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg text-forest-900">Nieuw nestje</p>
              <p className="text-sm text-forest-600">Nestje met ouders &amp; status</p>
            </div>
          </Link>

          <Link
            href="/admin/litters?create=kitten"
            className="group flex items-center gap-4 rounded-3xl border border-forest-900/10 bg-white/70 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-brass-400/60 hover:shadow-lg"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 transition group-hover:bg-brass-100 group-hover:text-brass-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c4.5 0 7-2.5 7-6 0-2-1-3.5-2.5-4.5C16 8 15 6 12 6S8 8 7.5 10.5C6 11.5 5 13 5 15c0 3.5 2.5 6 7 6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.5 5.5 8 8.5M17.5 5.5 16 8.5M9.5 14h.01M14.5 14h.01" /></svg>
            </span>
            <div className="min-w-0">
              <p className="font-display text-lg text-forest-900">Nieuwe kitten</p>
              <p className="text-sm text-forest-600">Kitten toevoegen aan een nestje</p>
            </div>
          </Link>

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
      </div>

      <div className="mb-2 flex items-baseline gap-2">
        <h2 className="font-display text-2xl text-forest-900">Katten &amp; dossiers</h2>
      </div>
      <p className="mb-6 text-sm text-forest-600">Overzichtelijk gesorteerd: eerst je fokdieren (de moeders en vaders), daarna de kittens per nestje. Klik op een kaart om het volledige dossier te openen.</p>

      {kittens.length === 0 ? (
        <div className="rounded-2xl border border-forest-900/10 bg-white py-12 text-center text-forest-600">
          Geen katten gevonden in de database.
        </div>
      ) : (
        <>
          {litterKittens.length > 0 && (
            <CatGroup title="Kittens" hint="horen bij een nestje" count={litterKittens.length}>
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

          {breedingFemales.length > 0 && (
            <CatGroup title="Fokpoezen" hint="de moeders" count={breedingFemales.length}>
              {breedingFemales.map((k) => (
                <CatCard key={k.id} k={k} badge={<Badge cls="bg-rose-100 text-rose-700">Fokpoes · moeder</Badge>} subtitle={`Poes · ${vachtLabel(k)}`} />
              ))}
            </CatGroup>
          )}

          {breedingMales.length > 0 && (
            <CatGroup title="Fokkaters" hint="de vaders" count={breedingMales.length}>
              {breedingMales.map((k) => (
                <CatCard key={k.id} k={k} badge={<Badge cls="bg-sky-100 text-sky-700">Fokkater · vader</Badge>} subtitle={`Kater · ${vachtLabel(k)}`} />
              ))}
            </CatGroup>
          )}

          {breedingOther.length > 0 && (
            <CatGroup title="Overige fokdieren" count={breedingOther.length}>
              {breedingOther.map((k) => (
                <CatCard key={k.id} k={k} badge={<Badge cls="bg-stone-100 text-stone-700">Fokdier</Badge>} subtitle={`${sexLabel(k.gender)} · ${vachtLabel(k)}`} />
              ))}
            </CatGroup>
          )}
        </>
      )}
    </>
  );
}
