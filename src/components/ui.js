'use client';
import Link from 'next/link';

export function Logo({ light = false }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <span className={`grid h-10 w-10 place-items-center rounded-full border ${light ? 'border-cream-100/30' : 'border-terracotta-900/10'} transition group-hover:border-terracotta-500`}>
        <PawMark className={light ? 'text-cream-100' : 'text-terracotta-600'} />
      </span>
      <span className="leading-none">
        <span className={`block font-display text-2xl font-light tracking-tight ${light ? 'text-cream-100' : 'text-ink'}`}>Wendy's Dream</span>
        <span className={`block text-[9px] uppercase tracking-[0.35em] ${light ? 'text-cream-100/60' : 'text-terracotta-500'}`}>Maine Coon Cattery</span>
      </span>
    </Link>
  );
}

export function PawMark({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 ${className}`} fill="currentColor" aria-hidden>
      <ellipse cx="12" cy="16" rx="5" ry="4.2" />
      <circle cx="6.2" cy="10.5" r="1.9" />
      <circle cx="10" cy="8" r="1.9" />
      <circle cx="14" cy="8" r="1.9" />
      <circle cx="17.8" cy="10.5" r="1.9" />
    </svg>
  );
}

export function StatusPill({ status }) {
  const map = {
    Beschikbaar: 'pill-available',
    Gereserveerd: 'pill-reserved',
    Verkocht: 'pill-sold',
  };
  return (
    <span className={`pill ${map[status] || 'pill-available'}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

export function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.35em] text-terracotta-600">
      <span className="h-px w-8 bg-terracotta-400/40" />
      {children}
    </span>
  );
}

// Placeholder for future Cloudinary/AI-generated imagery.
// Renders a tasteful textured block so the prototype is presentable without assets.
export function ImageSlot({ label = 'Afbeelding', ratio = 'aspect-[4/5]', className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] ${ratio} ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-sand-200/70 via-beige-200/50 to-terracotta-200/70" />
      <div className="absolute inset-0 bg-grain opacity-40" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="flex flex-col items-center gap-2 text-terracotta-900/60">
          <PawMark className="h-6 w-6 text-terracotta-500/70" />
          <span className="text-[9px] font-medium tracking-[0.3em] uppercase">{label}</span>
        </span>
      </div>
    </div>
  );
}
