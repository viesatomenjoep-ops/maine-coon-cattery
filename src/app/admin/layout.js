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
  { href: '/admin/media', label: 'Media Sync', icon: 'image' },
];

function Icon({ name, className = 'h-5 w-5' }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>,
    cat: <><path d="M12 5 8 3v4"/><path d="M12 5l4-2v4"/><path d="M5 9c0 5 3 11 7 11s7-6 7-11a7 7 0 0 0-14 0Z"/></>,
    health: <path d="M19 14c1.5-1.5 3-3.4 3-5.5A3.5 3.5 0 0 0 12 5 3.5 3.5 0 0 0 2 8.5C2 12 5 14.5 12 21c2.5-2.3 4.5-4.2 6-6.5Z"/>,
    tag: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6Z"/><circle cx="7.5" cy="7.5" r="1.2"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></>,
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
    else if (user.role !== 'admin') router.replace('/portal');
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return <div className="relative z-10 grid min-h-screen place-items-center text-forest-700">Toegang controleren…</div>;
  }

  return (
    <StoreProvider>
    <div className="relative z-10 min-h-screen bg-cream-100 lg:grid lg:grid-cols-[260px_1fr]">
      {/* sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[260px] transform border-r border-forest-900/10 bg-white transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="p-6"><Logo /></div>
          <nav className="flex-1 space-y-1 px-4">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${active ? 'bg-brass-400 text-forest-950 font-medium' : 'text-forest-900 hover:bg-forest-50 hover:text-forest-950'}`}>
                  <Icon name={item.icon} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-forest-900/10 p-4">
            <p className="px-2 text-xs text-forest-600">{user.name}</p>
            <button onClick={() => { logout(); router.push('/'); }} className="mt-2 w-full rounded-xl px-4 py-2.5 text-left text-sm text-forest-900 transition hover:bg-forest-50">
              Uitloggen
            </button>
          </div>
        </div>
      </aside>

      {/* content */}
      <div className="min-h-screen">
        <header className="flex items-center justify-between border-b border-forest-900/10 bg-cream-50 px-6 py-4 lg:hidden">
          <button onClick={() => setOpen(!open)} className="rounded-lg border border-forest-900/15 p-2"><PawMark className="h-5 w-5 text-forest-800" /></button>
          <Logo />
        </header>
        <div className="p-6 md:p-10">{children}</div>
      </div>
    </div>
    </StoreProvider>
  );
}
