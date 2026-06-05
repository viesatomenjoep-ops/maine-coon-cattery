'use client';
import Link from 'next/link';
import { Logo } from './ui';

export default function PublicNav() {
  return (
    <header className="relative z-20">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <div className="hidden items-center gap-8 text-sm text-forest-800 md:flex">
          <a href="#ras" className="transition hover:text-brass-600">Het Ras</a>
          <a href="#nieuws" className="transition hover:text-brass-600">Nieuws</a>
          <a href="#contact" className="transition hover:text-brass-600">Contact</a>
        </div>
        <Link
          href="/login"
          className="rounded-full bg-forest-800 px-5 py-2.5 text-sm font-medium text-cream-100 shadow-soft transition hover:bg-forest-900"
        >
          Private Access
        </Link>
      </nav>
    </header>
  );
}
