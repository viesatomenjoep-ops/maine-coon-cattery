'use client';
import Link from 'next/link';
import { kittens, getLitter } from '@/data/mock';
import { StatusPill, SectionLabel, ImageSlot } from '@/components/ui';

const eur = (n) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

export default function PortalPage() {
  const listed = kittens.filter((k) => k.published);

  return (
    <>
      <SectionLabel>Private Access</SectionLabel>
      <h1 className="mt-4 font-display text-4xl text-forest-950 md:text-5xl">Beschikbare kittens</h1>
      <p className="mt-3 max-w-xl text-forest-800/70">
        Deze advertentieruimte is uitsluitend zichtbaar voor goedgekeurde kopers. Klik op een
        kitten voor het volledige dossier met gewichtscurve, medische historie en stamboom.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listed.map((k) => {
          const litter = getLitter(k.litter_id);
          return (
            <Link key={k.id} href={`/portal/kitten/${k.id}`} className="lift group block overflow-hidden rounded-3xl border border-forest-900/10 bg-cream-50 shadow-soft">
              <div className="relative">
                <ImageSlot label={`${k.name}`} ratio="aspect-[4/3]" className="rounded-none" />
                <div className="absolute left-4 top-4"><StatusPill status={k.status} /></div>
              </div>
              <div className="p-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-2xl text-forest-900">{k.name}</h3>
                  <span className="font-display text-lg text-brass-700">{eur(k.price)}</span>
                </div>
                <p className="mt-1 text-sm text-forest-700/70">{k.sex} · {k.color}</p>
                <p className="mt-3 text-xs uppercase tracking-wide text-forest-600/60">Nest: {litter?.name}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brass-600 transition group-hover:gap-2">
                  Bekijk dossier <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
