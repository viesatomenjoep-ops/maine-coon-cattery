'use client';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card } from '@/components/admin';
import { StatusPill } from '@/components/ui';

export default function AdminDashboard() {
  const { user } = useStore();

  const tiles = [
    { href: '/admin/news', label: 'Nieuws & Updates', icon: '📝', desc: 'Plaats nieuwe berichten' },
    { href: '/admin/cats', label: 'Katten & Dossiers', icon: '🐈', desc: 'Bekijk of bewerk katten' },
    { href: '/admin/litters', label: 'Nestjes Overzicht', icon: '🐾', desc: 'Beheer alle nestjes' },
    { href: '/admin/medical', label: 'Medisch Dashboard', icon: '🩺', desc: 'Vaccinaties & gezondheid' },
    { href: '/admin/sales', label: 'Verkoop & Portaal', icon: '💰', desc: 'Prijzen en beschikbaarheid' },
    { href: '/admin/customers', label: 'Klantenbestand', icon: '👥', desc: 'Beheer alle kopers' },
    { href: '/admin/content', label: 'Website Editor', icon: '🌍', desc: 'Pas teksten op de site aan' },
    { href: '/admin/media', label: 'Foto- & Videogalerij', icon: '📸', desc: 'Beheer alle media' },
    { href: '/admin/settings', label: 'Instellingen', icon: '⚙️', desc: 'Systeemvoorkeuren' },
  ];

  return (
    <>
      <PageHead label="Welkom terug" title="Startscherm" />
      <p className="mb-8 text-forest-700 text-lg">
        Kies een van de onderstaande categorieën om direct naar het juiste onderdeel te gaan.
      </p>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className="block group">
            <Card className="h-full flex flex-col items-center justify-center text-center p-8 sm:p-10 transition-all duration-300 hover:scale-[1.02] hover:border-brass-400 hover:shadow-xl hover:bg-white bg-cream-50/50 cursor-pointer">
              <span className="text-5xl sm:text-6xl mb-4 transition-transform group-hover:scale-110 duration-300 drop-shadow-sm">{t.icon}</span>
              <h2 className="font-display text-2xl font-bold text-forest-950 transition-colors group-hover:text-brass-600">{t.label}</h2>
              <p className="mt-2 text-sm text-forest-600/80 font-medium">{t.desc}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
