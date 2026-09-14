'use client';
import Link from 'next/link';
import { sexLabel } from '@/lib/species';

const STATUS_META = {
  beschikbaar: { label: 'Beschikbaar', cls: 'bg-emerald-100 text-emerald-700' },
  gereserveerd: { label: 'Gereserveerd', cls: 'bg-amber-100 text-amber-700' },
  verkocht: { label: 'Verkocht', cls: 'bg-stone-200 text-stone-600' },
  houden: { label: 'Houden', cls: 'bg-sky-100 text-sky-700' },
  'eigen fok': { label: 'Eigen fok', cls: 'bg-violet-100 text-violet-700' },
  overleden: { label: 'Overleden', cls: 'bg-stone-300 text-stone-700' },
};

export function StatusChip({ status }) {
  const m = STATUS_META[(status || '').toLowerCase()] || STATUS_META.beschikbaar;
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${m.cls}`}>
      {m.label}
    </span>
  );
}

function Placeholder({ className = '' }) {
  return (
    <div className={`flex items-center justify-center bg-[#dfe6ee] ${className}`}>
      <svg viewBox="0 0 64 64" className="h-1/2 w-1/2 text-white" fill="currentColor" aria-hidden>
        <path d="M14 26 10 10l14 10a30 30 0 0 1 16 0l14-10-4 16a24 24 0 0 1 4 13c0 11-9 17-22 17S10 50 10 39a24 24 0 0 1 4-13Z" />
      </svg>
    </div>
  );
}

// Eén dier als rij in de lijst.
export function AnimalRow({ animal, species, subtitle, badge }) {
  return (
    <Link
      href={`/admin/cats/${animal.id}`}
      className="group flex items-center gap-4 rounded-2xl bg-white p-3 shadow-[0_1px_3px_rgba(28,20,15,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_-6px_rgba(28,20,15,0.18)]"
    >
      {animal.cover_image
        ? <img src={animal.cover_image} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" />
        : <Placeholder className="h-16 w-16 shrink-0 rounded-2xl" />}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg font-semibold text-forest-950">{animal.name || 'Naamloos'}</p>
        <p className="truncate text-sm text-forest-500">
          {subtitle || [sexLabel(animal.gender, species), animal.color].filter(Boolean).join(' · ')}
        </p>
        {badge && <div className="mt-1.5">{badge}</div>}
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-forest-300 transition-transform duration-300 group-hover:translate-x-0.5">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </Link>
  );
}

// Eén dier als tegel, voor het rasteroverzicht.
export function AnimalTile({ animal, species, subtitle }) {
  return (
    <Link
      href={`/admin/cats/${animal.id}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-[0_1px_3px_rgba(28,20,15,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_28px_-8px_rgba(28,20,15,0.2)]"
    >
      {animal.cover_image
        ? <img src={animal.cover_image} alt="" className="aspect-square w-full object-cover" />
        : <Placeholder className="aspect-square w-full" />}
      <div className="p-3">
        <p className="truncate font-display text-base font-semibold text-forest-950">{animal.name || 'Naamloos'}</p>
        <p className="truncate text-xs text-forest-500">
          {subtitle || [sexLabel(animal.gender, species), animal.color].filter(Boolean).join(' · ')}
        </p>
      </div>
    </Link>
  );
}
