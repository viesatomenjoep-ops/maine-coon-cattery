'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Logo, PawMark } from './ui';

export default function PublicNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const links = [
    { href: '/#ras', label: 'Het Ras' },
    { href: '/#verhaal', label: 'Ons Verhaal' },
    { href: '/#nieuws', label: 'Live Updates' },
    { href: '/#contact', label: 'Contact & Oase' },
  ];

  return (
    <header className="relative z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-12">
        <Logo />

        {/* Right side controls */}
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="hidden sm:inline-flex rounded-full border border-terracotta-500/20 bg-cream-50/50 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-terracotta-800 shadow-soft transition hover:bg-terracotta-50 hover:border-terracotta-500/40 hover:shadow-glow"
          >
            Private Access
          </Link>

          {/* Minimalist Hamburger Button */}
          <button
            onClick={toggleMenu}
            aria-label="Toggle Menu"
            className="group relative z-50 flex h-10 w-10 flex-col items-center justify-center rounded-full border border-terracotta-900/10 bg-cream-50/60 shadow-soft transition hover:border-terracotta-500/40 hover:bg-cream-100"
          >
            <span
              className={`h-0.5 w-5 bg-terracotta-800 transition-all duration-300 ease-out ${
                isOpen ? 'translate-y-1 rotate-45' : '-translate-y-0.5'
              }`}
            />
            <span
              className={`mt-1 h-0.5 w-5 bg-terracotta-800 transition-all duration-300 ease-out ${
                isOpen ? '-translate-y-0.5 -rotate-45' : 'translate-y-0.5'
              }`}
            />
          </button>
        </div>
      </nav>

      {/* Fullscreen Overlay Menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-cream-100/98 backdrop-blur-xl transition-all duration-700 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
      >
        {/* Decorative elements for Ibiza Vibe */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-sand-200/20 blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-terracotta-200/20 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />

        <div className="flex-grow flex items-center justify-center px-6">
          <div className="text-center max-w-lg">
            <span className="inline-flex justify-center mb-6 animate-fade-in text-terracotta-500">
              <PawMark className="h-8 w-8" />
            </span>
            <ul className="space-y-6">
              {links.map((link, idx) => (
                <li
                  key={link.label}
                  className="overflow-hidden"
                  style={{ transitionDelay: `${idx * 100}ms` }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="group relative inline-block font-display text-4xl md:text-5xl font-light text-ink transition hover:text-terracotta-600"
                  >
                    <span className="relative z-10">{link.label}</span>
                    <span className="absolute bottom-1 left-0 h-0.5 w-0 bg-terracotta-300 transition-all duration-300 group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-12">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="inline-flex rounded-full bg-terracotta-500 px-8 py-3.5 text-sm font-semibold text-cream-50 shadow-lux transition hover:bg-terracotta-600 hover:shadow-glow"
              >
                Inloggen Private Access
              </Link>
            </div>
          </div>
        </div>

        {/* Footer info inside menu */}
        <div className="w-full text-center py-8 px-6 border-t border-terracotta-900/5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-terracotta-800/60 font-medium">
            Wendy's Dream · Exclusieve Maine Coon Oase
          </p>
        </div>
      </div>
    </header>
  );
}
