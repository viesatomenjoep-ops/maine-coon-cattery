'use client';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Btn } from '@/components/admin';
import { StatusPill } from '@/components/ui';

export default function CatsAdmin() {
  const { kittens } = useStore();

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

      <h2 className="mb-4 font-display text-xl text-forest-900">Katten &amp; dossiers</h2>
      <Card className="bg-transparent border-none p-0 shadow-none">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
          {kittens.map((k) => (
            <div key={k.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border border-forest-900/15 bg-white p-6 shadow-soft transition hover:border-brass-400 hover:shadow-md">
              <div className="min-w-0">
                <p className="font-display text-2xl font-semibold text-forest-950 truncate">{k.name}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-forest-500 mt-1 truncate">{k.sex}</p>
              </div>
              <Link href={`/admin/cats/${k.id}`} className="shrink-0 w-full sm:w-auto">
                <Btn variant="brass" className="w-full sm:w-auto whitespace-nowrap px-5 py-3 text-sm shadow-sm">
                  Beheer Dossier →
                </Btn>
              </Link>
            </div>
          ))}
        </div>
        {kittens.length === 0 && (
          <div className="rounded-2xl border border-forest-900/10 bg-white py-12 text-center text-forest-600">
            Geen katten gevonden in de database.
          </div>
        )}
      </Card>
    </>
  );
}
