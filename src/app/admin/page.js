'use client';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card } from '@/components/admin';
import { StatusPill } from '@/components/ui';

export default function AdminDashboard() {
  const { user } = useStore();

  const tiles = [
    { href: '/admin/cats', label: 'Katten & Dossiers', icon: '🐈', desc: 'Dossiers beheren + nieuw nestje / kitten aanmaken' },
    { href: '/admin/news', label: 'Nieuws & Updates', icon: '📝', desc: 'Plaats nieuwe berichten' },
    { href: '/admin/medical', label: 'Medisch Dashboard', icon: '🩺', desc: 'Vaccinaties & gezondheid' },
    { href: '/admin/sales', label: 'Verkoop & Portaal', icon: '💰', desc: 'Prijzen en beschikbaarheid' },
    { href: '/admin/customers', label: 'Klantenbestand', icon: '👥', desc: 'Beheer alle kopers' },
    { href: '/admin/media', label: 'Foto- & Videogalerij', icon: '📸', desc: 'Beheer alle media' },
    { href: '/admin/settings', label: 'Instellingen', icon: '⚙️', desc: 'Website-editor, back-up & voorkeuren' },
  ];

  return (
    <>
      <PageHead label="Welkom terug" title="Startscherm">
        <a href="/" target="_blank" rel="noreferrer" title="Opent apart, je blijft in het beheer"
          className="inline-flex items-center gap-2 rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm font-semibold text-forest-800 shadow-sm transition hover:border-brass-400 hover:bg-forest-50">
          <span className="text-lg leading-none">🌍</span> Ga naar website
        </a>
      </PageHead>
      <p className="mb-8 text-forest-700 text-lg">
        Kies een van de onderstaande categorieën om direct naar het juiste onderdeel te gaan.
      </p>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-6xl">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="block group">
            <Card className="h-full flex flex-col items-center justify-center text-center p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-brass-400 hover:shadow-md cursor-pointer">
              <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-3xl transition group-hover:bg-brass-100">{t.icon}</span>
              <h2 className="font-display leading-tight text-forest-900 transition-colors group-hover:text-brass-700 text-xl">{t.label}</h2>
              <p className="mt-1.5 text-forest-600 text-xs">{t.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
