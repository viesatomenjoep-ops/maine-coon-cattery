'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Card } from '@/components/admin';
import { PageHeader, PrimaryAction, EmptyHero, HowItWorks } from '@/components/admin/PageShell';
import { cap } from '@/lib/species';

const LITTER_STATUSES = [
  { value: 'verwacht', label: 'Verwacht' },
  { value: 'geboren', label: 'Geboren' },
  { value: 'beschikbaar', label: 'Beschikbaar' },
  { value: 'gereserveerd', label: 'Gereserveerd' },
  { value: 'afgerond', label: 'Afgerond' },
];
const norm = (s) => (s || '').toLowerCase();

export default function LittersPage() {
  const { litters = [], kittens = [], deleteLitter, terms } = useStore();
  const router = useRouter();

  // Oude links met querystrings blijven werken door door te sturen naar de nieuwe, aparte pagina's.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const create = params.get('create');
    const edit = params.get('edit');
    if (edit) { router.replace(`/admin/litters/${edit}`); return; }
    if (create === 'kitten') { router.replace('/admin/litters/new-cat'); return; }
    if (create === 'litter') { router.replace('/admin/litters/new'); return; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <Link href="/admin/cats" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-600 transition hover:text-forest-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
        {`Terug naar ${terms.animalPlural} & dossiers`}
      </Link>

      <PageHeader
        icon={<><path d="M3 10.5 12 4l9 6.5" /><path d="M5 9.5V20h14V9.5" /><path d="M9 20v-5a3 3 0 0 1 6 0v5" /></>}
        title={cap(terms.litterPlural)}
        subtitle={litters.length ? `${litters.length} in je ${terms.facility}` : null}
        actions={<PrimaryAction href="/admin/litters/new">{`Nieuw ${terms.litter}`}</PrimaryAction>}
      />

      {litters.length === 0 ? (
        <>
          <EmptyHero
            icon={<><path d="M3 10.5 12 4l9 6.5" /><path d="M5 9.5V20h14V9.5" /><path d="M9 20v-5a3 3 0 0 1 6 0v5" /></>}
            title={`Een ${terms.litter} houdt alles bij elkaar`}
            desc={`Zet de ouders, de geboortedatum en alle ${terms.youngPlural} onder één ${terms.litter}. Daarna deel je er met één link een complete aankondiging van met geïnteresseerden.`}
            action={<PrimaryAction href="/admin/litters/new">{`Maak je eerste ${terms.litter}`}</PrimaryAction>}
          />

          <HowItWorks
            label={`Zo werken ${terms.litterPlural}`}
            steps={[
              {
                title: 'Kies de ouders',
                desc: `Selecteer de ${terms.male} en de ${terms.female} uit je eigen dieren, of vul alleen hun naam in.`,
                icon: <><circle cx="9" cy="7" r="4" /><circle cx="17" cy="7" r="3" /><path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" /></>,
              },
              {
                title: `Voeg de ${terms.youngPlural} toe`,
                desc: `Elk ${terms.young} krijgt een eigen dossier met gewicht, kleur, chipnummer en foto's.`,
                icon: <><path d="M12 5v14M5 12h14" /></>,
              },
              {
                title: 'Deel de aankondiging',
                desc: 'Eén link met ouderfoto\'s, je eigen verhaal en wat er beschikbaar is — klaar voor WhatsApp.',
                icon: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" /></>,
              },
            ]}
            footer={
              <Link href="/admin/cats" className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest-600 transition hover:text-forest-900">
                {`Eerst je ${terms.animalPlural} invoeren`}
                <span aria-hidden>→</span>
              </Link>
            }
          />
        </>
      ) : (
      /* Overzicht — compacte kaarten, alles verder zit achter "Open" */
      <div className="space-y-4">
        {litters.map((lit) => {
          const nestKittenCount = kittens.filter((k) => k.litter_id === lit.id && !k.is_own_breeding_cat).length;
          const statusLabel = LITTER_STATUSES.find((s) => s.value === norm(lit.status))?.label;
          return (
            <Card key={lit.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-4">
                  {lit.cover_image_url ? (
                    <img src={lit.cover_image_url} alt={lit.name} className="h-16 w-16 shrink-0 rounded-xl object-cover shadow" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-forest-100 bg-forest-50 text-forest-300">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="flex flex-wrap items-center gap-2 font-display text-xl text-forest-950">
                      {lit.name}
                      {statusLabel && <span className="rounded-full bg-brass-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-brass-700">{statusLabel}</span>}
                    </h3>
                    <p className="mt-1 text-sm text-forest-700">
                      {lit.sire_name || 'Onbekende vader'} x {lit.dam_name || 'Onbekende moeder'}
                      <span className="mx-2 opacity-50">|</span>
                      {lit.date_of_birth ? new Date(lit.date_of_birth).toLocaleDateString('nl-NL') : 'Datum onbekend'}
                      <span className="mx-2 opacity-50">|</span>
                      {nestKittenCount} {nestKittenCount === 1 ? terms.young : terms.youngPlural}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { if (confirm('Weet je zeker dat je dit nestje wilt verwijderen?')) deleteLitter(lit.id); }}
                  title="Nestje verwijderen"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link href={`/admin/litters/${lit.id}`} className="inline-flex items-center justify-center rounded-lg bg-brass-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brass-600 sm:w-auto">{`Open ${terms.litter} →`}</Link>
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-forest-900/10 bg-white p-1 sm:w-56">
                  <button
                    onClick={() => {
                      if (!lit.share_token) return alert('De deel-link wordt actief zodra de database-update (share_token) is toegepast.');
                      navigator.clipboard.writeText(`${window.location.origin}/nestje/${lit.share_token}`);
                      alert(`Advertentielink van dit ${terms.litter} gekopieerd! Deel hem gerust via WhatsApp.`);
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-forest-700 transition hover:bg-forest-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
                    Delen
                  </button>
                  <Link href={`/admin/litters/new-kitten?litter=${lit.id}`} className="flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-forest-700 transition hover:bg-forest-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12 5v14M5 12h14"/></svg>
                    {cap(terms.young)}
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}
