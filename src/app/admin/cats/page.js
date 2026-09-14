'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { SearchBar, ViewToggle, SegmentedTabs, EmptyState } from '@/components/admin/AppKit';
import { AnimalRow, AnimalTile, StatusChip } from '@/components/admin/AnimalCard';
import { PageHeader, PrimaryAction, IconAction, EmptyHero, HowItWorks } from '@/components/admin/PageShell';
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
    return [sexLabel(k.gender, species), k.color, nest ? `${cap(terms.litter)}: ${nest}` : null].filter(Boolean).join(' · ');
  };

  // Nog helemaal niets in de fokkerij: leg dan eerst uit waar dit scherm voor is.
  const isBrandNew = kittens.length === 0;

  return (
    <div>
      <PageHeader
        icon={<><circle cx="12" cy="14" r="6" /><path d="M7 9 5 4l4 4" /><path d="M17 9l2-5-4 4" /><path d="M9.5 15h.01M14.5 15h.01" /></>}
        title={cap(terms.animalPlural)}
        subtitle={isBrandNew ? null : `${kittens.length} in je ${terms.facility}`}
        actions={
          <>
            <IconAction
              href="/admin/backup"
              title="Back-up & export"
              icon={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" /></>}
            />
            <PrimaryAction href="/admin/litters/new-cat">{`${cap(terms.animal)} toevoegen`}</PrimaryAction>
          </>
        }
      />

      {isBrandNew ? (
        <>
          <EmptyHero
            icon={<><circle cx="12" cy="14" r="6" /><path d="M7 9 5 4l4 4" /><path d="M17 9l2-5-4 4" /><path d="M9.5 15h.01M14.5 15h.01" /></>}
            title={`Je ${terms.animalPlural} zijn de basis van alles`}
            desc={`Voeg elk ${terms.animal} één keer toe. Daarna gebruik je dat dossier voor je ${terms.litterPlural}, de stamboom, de gezondheidsplanning en wat je kopers te zien krijgen.`}
            action={<PrimaryAction href="/admin/litters/new-cat">{`Voeg je eerste ${terms.animal} toe`}</PrimaryAction>}
          />

          <HowItWorks
            label={`Zo werken ${terms.animalPlural}`}
            steps={[
              {
                title: 'Maak een dossier',
                desc: `Naam, foto's, geboortedatum, chipnummer en stamboomnummer — alles wat bij dit ${terms.animal} hoort.`,
                icon: <><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2Z" /><path d="M13 2v6h6" /></>,
              },
              {
                title: 'Houd gezondheid bij',
                desc: 'Ontworming, entingen en controles plan je per dier in. Je ziet vanzelf wat eraan komt.',
                icon: <path d="M19 14c1.5-1.5 3-3.4 3-5.5A3.5 3.5 0 0 0 12 5 3.5 3.5 0 0 0 2 8.5C2 12 5 14.5 12 21c2.5-2.3 4.5-4.2 6-6.5Z" />,
              },
              {
                title: `Bouw ${terms.litterPlural} en stambomen`,
                desc: `Gebruik ze als vader of moeder van een ${terms.litter}; de afstamming vult zichzelf dan aan.`,
                icon: <><circle cx="12" cy="5" r="2.5" /><circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M12 7.5v4M12 11.5 6.5 16.5M12 11.5l5.5 5" /></>,
              },
            ]}
            footer={
              <Link href="/admin/litters" className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-600 transition hover:text-forest-900">
                {`Of begin bij je ${terms.litterPlural}`}
                <span aria-hidden>→</span>
              </Link>
            }
          />
        </>
      ) : (
        <>
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

          {q.trim() && (
            <p className="mb-4 text-sm text-forest-500">
              {shown.length} {shown.length === 1 ? 'resultaat' : 'resultaten'} voor “{q}”
            </p>
          )}

          {shown.length === 0 ? (
            <EmptyState
              icon={<svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>}
              title={q.trim() ? 'Niets gevonden' : `Niets onder “${tab === 'aanwezig' ? 'Aanwezig' : 'Vertrokken'}”`}
              desc={q.trim()
                ? 'Probeer een andere naam of een deel van het chipnummer.'
                : `Zodra je hier ${terms.animalPlural} onder hebt staan, verschijnen ze in deze lijst.`}
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
        </>
      )}
    </div>
  );
}
