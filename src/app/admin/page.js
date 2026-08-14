'use client';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Icon } from '@/components/admin';

export default function AdminDashboard() {
  const { user } = useStore();

  return (
    <>
      <PageHead label="Welkom terug" title="Startscherm" />

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
