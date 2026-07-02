'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';
import { Logo, PawMark } from '@/components/ui';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'grid' },
  { href: '/admin/news', label: 'Nieuws Editor', icon: 'edit' },
  { href: '/admin/cats', label: 'Kattenbeheer', icon: 'cat' },
  { href: '/admin/litters', label: 'Nestjes Overzicht', icon: 'cat' },
  { href: '/admin/medical', label: 'Medisch Dashboard', icon: 'health' },
  { href: '/admin/sales', label: 'Advertentie & Sales', icon: 'tag' },
  { href: '/admin/customers', label: 'Klantenbestand', icon: 'customer' },
  { href: '/admin/content', label: 'Website Editor', icon: 'layout' },
  { href: '/admin/settings', label: 'Instellingen', icon: 'settings' },
  { href: '/admin/media', label: 'Media Sync', icon: 'image' },
];

function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>,
    cat: <><path d="M12 5 8 3v4"/><path d="M12 5l4-2v4"/><path d="M5 9c0 5 3 11 7 11s7-6 7-11a7 7 0 0 0-14 0Z"/></>,
    health: <path d="M19 14c1.5-1.5 3-3.4 3-5.5A3.5 3.5 0 0 0 12 5 3.5 3.5 0 0 0 2 8.5C2 12 5 14.5 12 21c2.5-2.3 4.5-4.2 6-6.5Z"/>,
    tag: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6Z"/><circle cx="7.5" cy="7.5" r="1.2"/></>,
    customer: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></>,
    layout: <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></>,
    settings: <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name]}</svg>;
}

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
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
          <div className="relative p-6 pt-8 pb-4 text-center">
            {/* Mobiele sluit knop */}
            <button 
              onClick={() => setOpen(false)} 
              className="absolute left-6 top-8 flex items-center gap-2 rounded-xl bg-forest-100 px-4 py-2 text-sm font-semibold text-forest-900 lg:hidden"
            >
              ← Ga terug
            </button>

            <Link href="/" className="inline-block transition hover:opacity-80 lg:mt-0 mt-12">
              <img src="/logo.png" alt="Wendy's Dream Logo" className="mx-auto h-16 w-auto object-contain" />
              <span className="mt-3 block font-display text-2xl font-semibold tracking-tight text-forest-950">Wendy's Dream</span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.2em] text-forest-600">Maine Coon Cattery</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-2 px-6 lg:px-4 lg:space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-4 rounded-xl px-4 py-4 lg:py-3 text-base lg:text-sm transition ${active ? 'bg-brass-400 text-forest-950 font-medium' : 'text-forest-900 hover:bg-forest-50 hover:text-forest-950'}`}>
                  <Icon name={item.icon} className="h-6 w-6 lg:h-5 lg:w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-forest-900/10 p-6 lg:p-4">
            <p className="px-2 text-sm lg:text-xs text-forest-600">{user.user_metadata?.name || 'Beheerder'}</p>
            <button onClick={() => { logout(); router.push('/'); }} className="mt-2 w-full rounded-xl px-4 py-3 lg:py-2.5 text-left text-base lg:text-sm text-forest-900 transition hover:bg-forest-50">
              Uitloggen
            </button>
          </div>
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
        <div className="p-4 sm:p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
