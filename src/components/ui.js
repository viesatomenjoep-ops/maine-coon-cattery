'use client';
import Link from 'next/link';

export function Logo({ light = false }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-3">
      <span className={`grid h-10 w-10 place-items-center rounded-full border ${light ? 'border-cream-100/40' : 'border-forest-900/20'}`}>
        <PawMark className={light ? 'text-cream-100' : 'text-forest-800'} />
      </span>
      <span className="leading-none">
        <span className={`block font-display text-xl tracking-tight ${light ? 'text-cream-100' : 'text-forest-900'}`}>Maelduin</span>
        <span className={`block text-[10px] uppercase tracking-[0.32em] ${light ? 'text-cream-100/70' : 'text-brass-600'}`}>Maine Coon Cattery</span>
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
    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-brass-600">
      <span className="h-px w-8 bg-brass-400/60" />
      {children}
    </span>
  );
}

// Placeholder for future Cloudinary/AI-generated imagery.
// Renders a tasteful textured block so the prototype is presentable without assets.
export function ImageSlot({ label = 'AI-afbeelding', ratio = 'aspect-[4/5]', className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${ratio} ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-forest-200 via-cream-200 to-brass-200" />
      <div className="absolute inset-0 bg-grain opacity-60" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="flex flex-col items-center gap-2 text-forest-700/70">
          <PawMark className="h-7 w-7" />
          <span className="text-[10px] uppercase tracking-[0.28em]">{label}</span>
        </span>
      </div>
    </div>
  );
}
