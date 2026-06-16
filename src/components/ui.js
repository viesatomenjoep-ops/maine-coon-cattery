'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Logo({ light = false }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isScrolled = scrollY > 50;
  // Smooth, playful wiggle effect based on scroll position
  const rotation = Math.sin(scrollY * 0.005) * 10;

  return (
    <Link href="/" className="group flex flex-row items-center justify-start transition-all duration-500 z-[60]">
      <img 
        src="/logo.png" 
        alt="Wendy's Dream Logo" 
        className={`w-auto object-contain transition-[height,opacity] duration-500 ease-out h-14 ${isScrolled ? 'md:h-12' : 'md:h-24'} ${light ? 'brightness-0 invert opacity-90' : 'opacity-90'}`} 
        style={{ transform: `rotate(${rotation}deg)` }}
      />
      <span 
        className={`flex flex-col justify-center overflow-hidden transition-[max-height,max-width,opacity,margin] duration-500 ease-out max-h-[150px] max-w-[300px] opacity-100 ml-2 md:ml-0 ${
          isScrolled 
            ? 'md:max-w-0 md:opacity-0 md:ml-0' 
            : 'md:max-w-[500px] md:opacity-100 md:ml-6'
        }`}
      >
        <span className={`block text-left whitespace-nowrap transition-transform duration-500 group-hover:scale-[1.02]`}>
          <span className={`block font-display text-xl md:text-5xl font-semibold tracking-tight ${light ? 'text-cream-100' : 'text-ink'}`}>Wendy's Dream</span>
          <span className={`block text-[8px] md:text-sm font-bold uppercase tracking-[0.25em] md:tracking-[0.35em] mt-0.5 md:mt-2 ${light ? 'text-cream-100/80' : 'text-terracotta-700'}`}>Maine Coon Cattery</span>
        </span>
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
