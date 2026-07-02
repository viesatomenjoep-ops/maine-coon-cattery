'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo, PawMark } from './ui';
import { useLanguage } from '@/context/LanguageContext';

export default function PublicNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { language, setLanguage, t, mounted } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const isScrolled = scrollY > 50;

  const links = [
    { href: '/#ras', label: t('nav_ras') },
    { href: '/#verhaal', label: t('nav_verhaal') },
    { href: '/#nieuws', label: t('nav_nieuws') },
    { href: '/#contact', label: t('nav_contact') },
  ];

  const languages = [
    { code: 'nl', label: 'NL' },
    { code: 'en', label: 'EN' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-sand-50/95 backdrop-blur-md border-b border-terracotta-900/5 transition-all duration-300">
      <nav className={`mx-auto relative flex max-w-7xl items-center justify-between px-4 transition-all duration-300 py-2 ${isScrolled ? 'md:py-4' : 'md:py-6'} md:px-12`}>
        <Logo />

        {/* Right side controls */}
        <div className={`absolute right-6 top-1/2 -translate-y-1/2 md:relative md:right-0 md:top-auto md:translate-y-0 flex items-center gap-6 transition-all duration-300`}>
          {/* Desktop Language Selector */}
          {mounted && (
            <div className="hidden md:flex items-center gap-3 border border-terracotta-900/10 rounded-full px-4 py-1.5 bg-cream-50/50 shadow-soft">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`text-xs font-semibold tracking-wider transition-colors ${
                    language === lang.code ? 'text-terracotta-600' : 'text-ink/50 hover:text-ink'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}

          <Link
            href="/login"
            className="hidden sm:inline-flex rounded-full border border-terracotta-500/20 bg-cream-50/50 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-terracotta-800 shadow-soft transition hover:bg-terracotta-50 hover:border-terracotta-500/40 hover:shadow-glow"
          >
            {t('nav_access')}
          </Link>

          {/* Minimalist Hamburger Button */}
          <button
            onClick={toggleMenu}
            aria-label="Toggle Menu"
            className="group relative z-[60] flex h-16 w-16 flex-col items-center justify-center gap-2 rounded-full bg-cream-50 shadow-soft transition-all hover:bg-cream-100 hover:shadow-glow md:h-16 md:w-16"
          >
            <span
              className={`h-0.5 w-6 bg-terracotta-800 transition-all duration-300 ${
                isOpen ? 'translate-y-2.5 rotate-45' : '-translate-y-0.5'
              }`}
            />
            <span
              className={`h-0.5 w-5 bg-terracotta-800 transition-all duration-300 ${
                isOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-terracotta-800 transition-all duration-300 ${
                isOpen ? '-translate-y-2.5 -rotate-45' : 'translate-y-0.5'
              }`}
            />
          </button>
        </div>
      </nav>
      </header>

      {/* Fullscreen Overlay Menu */}
      <div
        className={`fixed inset-0 z-40 flex flex-col justify-between bg-sand-50 transition-all duration-700 ease-in-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
      >
        {/* Decorative elements for Ibiza Vibe */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-sand-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-terracotta-200/20 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />

        {/* Flex layout to perfectly center the links between the header and language selector */}
        <div className="relative z-10 flex flex-col h-full w-full overflow-y-auto">
          {/* Spacer to push content exactly below the large mobile header */}
          <div className="h-[140px] md:h-[120px] shrink-0" />

          {/* Navigation Links - Centered in remaining space */}
          <div className="flex-grow flex flex-col items-center justify-center px-6">
            <div className="text-center w-full max-w-2xl">
              <ul className="space-y-4 md:space-y-6">
                {links.map((link, idx) => (
                  <li
                    key={link.label}
                    className="overflow-hidden"
                    style={{ transitionDelay: `${idx * 100}ms` }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="group relative inline-block font-display text-2xl md:text-4xl font-light text-ink transition hover:text-terracotta-600"
                    >
                      <span className="relative z-10">{link.label}</span>
                      <span className="absolute bottom-1 left-0 h-[2px] w-0 bg-terracotta-300 transition-all duration-300 group-hover:w-full" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-10">
              <a
                href="/login"
                onClick={() => setIsOpen(false)}
                className="inline-flex rounded-full bg-terracotta-500 px-8 py-3.5 text-xs font-semibold uppercase tracking-wider text-cream-50 shadow-lux transition hover:bg-terracotta-600 hover:shadow-glow"
              >
                {t('nav_login_btn')}
              </a>
            </div>
          </div>
        </div>

        {/* Footer info inside menu */}
        <div className="w-full text-center py-8 px-6 border-t border-terracotta-900/5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-terracotta-800/60 font-medium">
            {t('nav_footer_title')}
          </p>
        </div>
      </div>
    </>
  );
}
