'use client';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Icon } from '@/components/admin';

export default function AdminDashboard() {
  const { user } = useStore();

  const tools = [
    { href: '/admin/news', label: 'Nieuws & Updates', icon: 'edit', desc: 'Plaats nieuwe berichten' },
    { href: '/admin/medical', label: 'Medisch Dashboard', icon: 'health', desc: 'Overzicht & agenda voor de hele cattery' },
    { href: '/admin/sales', label: 'Verkoop & Portaal', icon: 'tag', desc: 'Overzicht van alle advertenties tegelijk' },
    { href: '/admin/customers', label: 'Klantenbestand', icon: 'customer', desc: 'Beheer alle kopers' },
    { href: '/admin/media', label: 'Foto- & Videogalerij', icon: 'image', desc: 'Beheer alle media' },
    { href: '/admin/settings', label: 'Instellingen', icon: 'settings', desc: 'Website-editor, back-up & voorkeuren' },
  ];

  return (
    <>
      <PageHead label="Welkom terug" title="Startscherm">
        <a href="/" target="_blank" rel="noreferrer" title="Opent apart, je blijft in het beheer"
          className="inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-forest-800 shadow-sm transition hover:border-brass-400 hover:bg-forest-50">
          <Icon name="layout" className="h-4 w-4" /> Ga naar website
        </a>
      </PageHead>

      <Link href="/admin/cats" className="group mb-8 flex max-w-3xl items-center gap-5 rounded-2xl border border-brass-300 bg-brass-50/60 p-6 shadow-sm transition hover:border-brass-400 hover:shadow-md">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-brass-700 shadow-sm">
          <Icon name="cat" className="h-8 w-8" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl text-forest-900">Katten &amp; Dossiers</h2>
          <p className="mt-1 text-sm text-forest-700">Start hier: dossier per kat, met alles erop en eraan — medisch, stamboom, verkoop en media in één.</p>
        </div>
        <Icon name="arrow" className="hidden h-5 w-5 shrink-0 text-brass-500 transition group-hover:translate-x-1 sm:block" />
      </Link>

      <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-forest-500">Overzichten &amp; tools</p>
      <div className="grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.label} href={t.href} className="group flex flex-col gap-3 rounded-xl border border-forest-900/10 bg-white p-4 transition hover:border-forest-900/20 hover:shadow-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-600 transition group-hover:bg-forest-100 group-hover:text-forest-800">
              <Icon name={t.icon} className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base text-forest-900">{t.label}</h2>
              <p className="mt-0.5 text-xs leading-snug text-forest-600">{t.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
