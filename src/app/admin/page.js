'use client';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card } from '@/components/admin';
import { StatusPill } from '@/components/ui';

export default function AdminDashboard() {
  const { user } = useStore();

  const tiles = [
    { href: '/admin/cats', label: 'Katten & Dossiers', icon: '🐈', desc: 'Dossiers beheren + nieuw nestje / kitten aanmaken', big: true },
    { href: '/admin/news', label: 'Nieuws & Updates', icon: '📝', desc: 'Plaats nieuwe berichten' },
    { href: '/admin/medical', label: 'Medisch Dashboard', icon: '🩺', desc: 'Vaccinaties & gezondheid' },
    { href: '/admin/sales', label: 'Verkoop & Portaal', icon: '💰', desc: 'Prijzen en beschikbaarheid' },
    { href: '/admin/customers', label: 'Klantenbestand', icon: '👥', desc: 'Beheer alle kopers' },
    { href: '/admin/media', label: 'Foto- & Videogalerij', icon: '📸', desc: 'Beheer alle media' },
    { href: '/admin/settings', label: 'Instellingen', icon: '⚙️', desc: 'Website-editor, back-up & voorkeuren' },
  ];

  return (
    <>
      <PageHead label="Welkom terug" title="Startscherm" />
      <p className="mb-8 text-forest-700 text-lg">
        Kies een van de onderstaande categorieën om direct naar het juiste onderdeel te gaan.
      </p>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 max-w-6xl">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className={`block group ${t.big ? 'col-span-2 sm:row-span-2' : ''}`}>
            <Card className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-5 transition-all duration-300 hover:scale-[1.02] hover:border-brass-400 hover:shadow-xl hover:bg-white bg-cream-50/50 cursor-pointer">
              <span className={`mb-2 transition-transform group-hover:scale-110 duration-300 drop-shadow-sm ${t.big ? 'text-5xl sm:text-6xl' : 'text-3xl sm:text-4xl'}`}>{t.icon}</span>
              <h2 className={`font-display font-bold leading-tight text-forest-950 transition-colors group-hover:text-brass-600 ${t.big ? 'text-lg sm:text-2xl' : 'text-[1rem] sm:text-lg'}`}>{t.label}</h2>
              <p className={`mt-1.5 text-forest-600/80 font-medium ${t.big ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'}`}>{t.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
