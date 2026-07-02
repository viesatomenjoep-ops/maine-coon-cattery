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
