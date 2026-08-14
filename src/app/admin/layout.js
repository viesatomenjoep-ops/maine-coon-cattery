'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StoreProvider, useStore } from '@/context/StoreContext';
import { Logo, PawMark } from '@/components/ui';
import { Icon } from '@/components/admin';
import TreatmentReminders from '@/components/admin/TreatmentReminders';

const NAV = [
  { href: '/admin', label: 'Startscherm', icon: 'grid' },
  { href: '/admin/cats', label: 'Katten & Dossiers', icon: 'cat' },
  { href: '/admin/overview', label: 'Cattery Overzicht', icon: 'layout' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const { currentTenant, isSuperadmin } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) router.replace('/login');
    else if (user.user_metadata?.role !== 'admin') router.replace('/portal');
  }, [user, router]);

  if (!user || user.user_metadata?.role !== 'admin') {
    return <div className="relative z-10 grid min-h-screen place-items-center text-forest-700">Toegang controleren…</div>;
  }

  return (
    <div className="relative z-10 min-h-screen overflow-x-hidden bg-cream-100 lg:grid lg:grid-cols-[260px_1fr]">
      {/* sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-full transform border-r border-forest-900/10 bg-white transition-transform lg:static lg:w-[260px] lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="relative p-6 pt-6 pb-3 text-center">
            {/* Mobiele sluit knop */}
            <button 
              onClick={() => setOpen(false)} 
              className="absolute left-6 top-8 flex items-center gap-2 rounded-xl bg-forest-100 px-4 py-2 text-sm font-semibold text-forest-900 lg:hidden"
            >
              ← Ga terug
            </button>

            <Link href="/admin" className="inline-block transition hover:opacity-80 lg:mt-0 mt-12">
              <img src="/logo.png" alt="Cattery Logo" className="mx-auto h-16 w-auto object-contain" />
              <span className="mt-3 block font-display text-2xl font-semibold tracking-tight text-forest-950">{currentTenant?.name || "Wendy's Dream"}</span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-forest-600">Maine Coon Cattery</span>
            </Link>
          </div>
          {/* Gebruiker + uitloggen — bovenaan, makkelijk bereikbaar */}
          <div className="px-6 pb-3 lg:px-4">
            <div className="flex items-center justify-between gap-2 rounded-xl border border-forest-900/10 bg-forest-50/60 px-3 py-2">
              <span className="min-w-0 truncate text-xs font-medium text-forest-800">{user.user_metadata?.name || 'Beheerder'}</span>
              <button onClick={async () => { await logout(); window.location.href = '/'; }} className="shrink-0 rounded-lg border border-forest-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-forest-700 transition hover:bg-forest-100">Uitloggen</button>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-6 lg:px-4">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-4 rounded-lg px-4 py-4 lg:py-3 text-base lg:text-sm font-medium transition ${active ? 'bg-forest-700 text-white shadow-sm' : 'text-forest-800 hover:bg-forest-50 hover:text-forest-950'}`}>
                  <Icon name={item.icon} className="h-6 w-6 lg:h-5 lg:w-5" />
                  {item.label}
                </Link>
              );
            })}
            {isSuperadmin && (
              <Link href="/superadmin" onClick={() => setOpen(false)}
                className="flex items-center gap-4 rounded-xl bg-ink px-4 py-4 lg:py-3 text-base lg:text-sm font-medium text-cream-50 transition hover:bg-ink/90">
                <Icon name="customer" className="h-6 w-6 lg:h-5 lg:w-5" />
                Superadmin
              </Link>
            )}
          </nav>

          <div className="border-t border-forest-900/10 px-6 py-3 lg:px-4">
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs font-medium text-forest-500">
              <a href="/" target="_blank" rel="noreferrer" className="hover:text-forest-800">Website</a>
              <Link href="/admin/settings" onClick={() => setOpen(false)} className="hover:text-forest-800">Instellingen</Link>
            </div>
          </div>

          {currentTenant?.name && (
            <div className="border-t border-forest-900/10 px-6 py-3 lg:px-4">
              <p className="text-xs font-semibold text-forest-700">🏡 {currentTenant.name}</p>
            </div>
          )}
        </div>
      </aside>

      {/* content */}
      <div className="min-h-screen">
        <header className="relative flex items-center justify-between border-b border-forest-900/10 bg-white px-4 py-4 lg:hidden">
          <button onClick={() => setOpen(!open)} className="relative z-10 rounded-xl border border-forest-900/15 p-2.5 transition hover:bg-forest-50">
            <PawMark className="h-8 w-8 text-forest-800" />
          </button>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-1">
            <img src="/logo.png" alt="Wendy's Dream" className="h-8 w-auto object-contain" />
            <span className="mt-1 block font-display text-xl font-semibold leading-none text-forest-950">Wendy's Dream</span>
            <span className="mt-0.5 block text-[7px] font-bold uppercase tracking-[0.2em] text-forest-600">Maine Coon Cattery</span>
          </div>
          
          <div className="w-[58px]" />
        </header>
        <div className="p-4 sm:p-6 md:p-10">
          <TreatmentReminders />
          {children}
        </div>
      </div>
    </div>
  );
}
