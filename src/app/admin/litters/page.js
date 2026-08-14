'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card } from '@/components/admin';

const LITTER_STATUSES = [
  { value: 'verwacht', label: 'Verwacht' },
  { value: 'geboren', label: 'Geboren' },
  { value: 'beschikbaar', label: 'Beschikbaar' },
  { value: 'gereserveerd', label: 'Gereserveerd' },
  { value: 'afgerond', label: 'Afgerond' },
];
const norm = (s) => (s || '').toLowerCase();

export default function LittersPage() {
  const { litters = [], kittens = [], deleteLitter } = useStore();
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
    <>
      <Link href="/admin/cats" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-600 transition hover:text-forest-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
        Terug naar katten &amp; dossiers
      </Link>
      <PageHead label="Fokkerij" title="Nestjes & Kittens" />

      <div className="mb-10">
        <h2 className="mb-4 font-display text-2xl text-forest-900">Nieuw aanmaken</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link
            href="/admin/litters/new"
            className="group flex flex-col items-start gap-4 rounded-3xl border border-forest-900/10 bg-white/70 p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-brass-400/60 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 transition group-hover:bg-brass-100 group-hover:text-brass-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 4l9 6.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5V20h14V9.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 20v-5a3 3 0 0 1 6 0v5" /></svg>
            </span>
            <div>
              <h2 className="font-display text-xl text-forest-900">Nieuw nestje</h2>
              <p className="mt-1 text-sm text-forest-600">Registreer een nieuw nestje met ouders, ras, status, documenten en kittens.</p>
            </div>
            <span className="mt-auto text-sm font-semibold text-brass-700">Openen →</span>
          </Link>

          <Link
            href="/admin/litters/new-cat"
            className="group flex flex-col items-start gap-4 rounded-3xl border border-forest-900/10 bg-white/70 p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-brass-400/60 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 transition group-hover:bg-brass-100 group-hover:text-brass-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c4.5 0 7-2.5 7-6 0-2-1-3.5-2.5-4.5C16 8 15 6 12 6S8 8 7.5 10.5C6 11.5 5 13 5 15c0 3.5 2.5 6 7 6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.5 5.5 8 8.5M17.5 5.5 16 8.5M9.5 14h.01M14.5 14h.01" /></svg>
            </span>
            <div>
              <h2 className="font-display text-xl text-forest-900">Nieuwe kitten</h2>
              <p className="mt-1 text-sm text-forest-600">Kitten, fokpoes, fokkater of bestaande kat toevoegen.</p>
            </div>
            <span className="mt-auto text-sm font-semibold text-brass-700">Openen →</span>
          </Link>
        </div>
      </div>

      {/* Nestjes overzicht — compacte kaarten, alles verder zit achter "Open nestje" */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-forest-900">Nestjes overzicht</h2>
          <Link href="/admin/litters/new" className="inline-flex items-center rounded-lg bg-forest-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-forest-900">+ Nieuw nestje</Link>
        </div>

        {litters.length === 0 && <p className="text-forest-700">Geen nestjes gevonden. Maak er bovenaan eentje aan.</p>}

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
                      {nestKittenCount} {nestKittenCount === 1 ? 'kitten' : 'kittens'}
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
                <Link href={`/admin/litters/${lit.id}`} className="inline-flex items-center justify-center rounded-lg bg-brass-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brass-600 sm:w-auto">Open nestje →</Link>
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-forest-900/10 bg-white p-1 sm:w-56">
                  <button
                    onClick={() => {
                      if (!lit.share_token) return alert('De deel-link wordt actief zodra de database-update (share_token) is toegepast.');
                      navigator.clipboard.writeText(`${window.location.origin}/nestje/${lit.share_token}`);
                      alert('Advertentielink van dit nestje gekopieerd! Deel hem gerust via WhatsApp.');
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-forest-700 transition hover:bg-forest-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
                    Delen
                  </button>
                  <Link href={`/admin/litters/new-kitten?litter=${lit.id}`} className="flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-sm font-medium text-forest-700 transition hover:bg-forest-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M12 5v14M5 12h14"/></svg>
                    Kitten
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
