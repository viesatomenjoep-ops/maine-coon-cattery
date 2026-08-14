'use client';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Icon } from '@/components/admin';

export default function AdminDashboard() {
  const { user } = useStore();

  return (
    <>
      <PageHead label="Welkom terug" title="Startscherm">
        <div className="flex flex-wrap gap-2">
          <a href="/" target="_blank" rel="noreferrer" title="Opent apart, je blijft in het beheer"
            className="inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-forest-800 shadow-sm transition hover:border-brass-400 hover:bg-forest-50">
            <Icon name="layout" className="h-4 w-4" /> Ga naar website
          </a>
          <Link href="/admin/settings" title="Website-editor, back-up & voorkeuren"
            className="inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-forest-800 shadow-sm transition hover:border-brass-400 hover:bg-forest-50">
            <Icon name="settings" className="h-4 w-4" /> Instellingen
          </Link>
        </div>
      </PageHead>

      <Link href="/admin/cats" className="group flex max-w-3xl items-center gap-5 rounded-2xl border border-brass-300 bg-brass-50/60 p-6 shadow-sm transition hover:border-brass-400 hover:shadow-md">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-brass-700 shadow-sm">
          <Icon name="cat" className="h-8 w-8" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl text-forest-900">Katten &amp; Dossiers</h2>
          <p className="mt-1 text-sm text-forest-700">Start hier: dossier per kat, met alles erop en eraan — medisch, stamboom, verkoop en media in één.</p>
        </div>
        <Icon name="arrow" className="hidden h-5 w-5 shrink-0 text-brass-500 transition group-hover:translate-x-1 sm:block" />
      </Link>
    </>
  );
}
