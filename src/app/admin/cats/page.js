'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { SearchBar, ViewToggle, SegmentedTabs, EmptyState } from '@/components/admin/AppKit';
import { AnimalRow, AnimalTile, StatusChip } from '@/components/admin/AnimalCard';
import { cap, sexLabel } from '@/lib/species';

const isMale = (g) => /kater|reu|doffer|ram|mann|\bmale\b|\bm\b/i.test(g || '');
const isFemale = (g) => /poes|teef|duivin|pop|voedster|vrouw|female|\bf\b/i.test(g || '');
const isGone = (k) => ['verkocht', 'overleden'].includes((k.status || '').trim().toLowerCase());

export default function AnimalsHome() {
  const { kittens = [], litters = [], species, terms } = useStore();

  const [q, setQ] = useState('');
  const [view, setView] = useState('list');
  const [tab, setTab] = useState('aanwezig');

  const litterName = (id) => litters.find((l) => l.id === id)?.name;

  // Zoeken op alles wat een fokker uit zijn hoofd kent.
  const match = (k) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return [k.name, k.color, k.pattern, k.ems_code, k.chip_number, k.registration_no, litterName(k.litter_id)]
      .filter(Boolean).some((v) => String(v).toLowerCase().includes(s));
  };

  const present = kittens.filter((k) => !isGone(k) && match(k));
  const gone = kittens.filter((k) => isGone(k) && match(k));
  const shown = tab === 'aanwezig' ? present : gone;

  // Binnen "aanwezig" groeperen we zoals een fokker denkt: jongen, moeders, vaders.
  const groups = tab === 'aanwezig'
    ? [
        { key: 'young', title: cap(terms.youngPlural), items: shown.filter((k) => !k.is_own_breeding_cat && k.litter_id) },
        { key: 'loose', title: 'Losse ' + terms.animalPlural, items: shown.filter((k) => !k.is_own_breeding_cat && !k.litter_id) },
        { key: 'dams', title: cap(terms.femalePlural), items: shown.filter((k) => k.is_own_breeding_cat && isFemale(k.gender)) },
        { key: 'sires', title: cap(terms.malePlural), items: shown.filter((k) => k.is_own_breeding_cat && isMale(k.gender)) },
        { key: 'other', title: 'Overige fokdieren', items: shown.filter((k) => k.is_own_breeding_cat && !isFemale(k.gender) && !isMale(k.gender)) },
      ].filter((g) => g.items.length)
    : [{ key: 'gone', title: 'Vertrokken', items: shown }];

  const subtitleFor = (k) => {
    const nest = litterName(k.litter_id);
    return [sexLabel(k.gender, species), k.color, nest ? `Nestje: ${nest}` : null].filter(Boolean).join(' · ');
  };

  return (
    <div className="">
      {/* Zoeken staat bovenaan — dat is waar de meeste mensen beginnen. */}
      <div className="mb-4">
        <SearchBar value={q} onChange={setQ} placeholder={`Zoek een ${terms.animal}… (naam, kleur, chip)`} />
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <ViewToggle view={view} onChange={setView} />
        <Link
          href="/admin/litters"
          className="shrink-0 rounded-full bg-forest-900/[0.04] px-4 py-2.5 text-sm font-semibold text-forest-600 transition hover:bg-forest-900/[0.07]"
        >
          {cap(terms.litterPlural)}
        </Link>
      </div>

      <div className="mb-6">
        <SegmentedTabs
          value={tab}
          onChange={setTab}
          options={[
            { key: 'aanwezig', label: 'Aanwezig', count: present.length },
            { key: 'vertrokken', label: 'Vertrokken', count: gone.length },
          ]}
        />
      </div>

      {/* Toevoegen: altijd bereikbaar, nooit verstopt. */}
      <Link
        href="/admin/litters/new-cat"
        className="mb-6 flex items-center gap-4 rounded-2xl border-2 border-dashed border-brass-300 bg-brass-50/40 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brass-400 hover:bg-brass-50"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brass-400 text-forest-950">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </span>
        <span className="font-display text-lg font-semibold text-forest-900">{cap(terms.animal)} toevoegen</span>
      </Link>

      {q.trim() && (
        <p className="mb-4 text-sm text-forest-500">
          {shown.length} {shown.length === 1 ? 'resultaat' : 'resultaten'} voor “{q}”
        </p>
      )}

      {shown.length === 0 ? (
        <EmptyState
          icon={<svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>}
          title={q.trim() ? 'Niets gevonden' : `Nog geen ${terms.animalPlural}`}
          desc={q.trim()
            ? 'Probeer een andere naam of een deel van het chipnummer.'
            : `Voeg je eerste ${terms.animal} toe, dan bouw je het dossier daarna rustig verder uit.`}
        />
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.key}>
              <div className="mb-3 flex items-baseline gap-2 px-1">
                <h2 className="font-display text-xl text-forest-900">{g.title}</h2>
                <span className="text-sm text-forest-400">{g.items.length}</span>
              </div>
              {view === 'tiles' ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {g.items.map((k) => <AnimalTile key={k.id} animal={k} species={species} subtitle={subtitleFor(k)} />)}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {g.items.map((k) => (
                    <AnimalRow
                      key={k.id}
                      animal={k}
                      species={species}
                      subtitle={subtitleFor(k)}
                      badge={<StatusChip status={k.status} />}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
