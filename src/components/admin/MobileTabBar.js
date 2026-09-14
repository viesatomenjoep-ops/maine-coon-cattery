'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Zwevende onderbalk op mobiel, zoals in een echte app. Drie plekken waar een
// fokker heen wil: zijn dieren, de gezondheidscheck, en zijn eigen profiel.
const TABS = [
  {
    href: '/admin/cats',
    label: 'Dieren',
    // Actief zodra je ergens in de dieren-, nestjes- of verkoopschermen zit.
    match: (p) => p.startsWith('/admin/cats') || p.startsWith('/admin/litters') || p.startsWith('/admin/sales'),
    icon: <><path d="M3 10.5 12 4l9 6.5" /><path d="M5 9.5V20h14V9.5" /><path d="M9 20v-5a3 3 0 0 1 6 0v5" /></>,
  },
  {
    href: '/admin/agenda',
    label: 'Agenda',
    match: (p) => p.startsWith('/admin/agenda'),
    icon: <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  },
  {
    href: '/admin/medical',
    label: 'Gezondheid',
    match: (p) => p.startsWith('/admin/medical'),
    icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M12 11v5M9.5 13.5h5" /></>,
  },
  {
    href: '/admin/profiel',
    label: 'Profiel',
    match: (p) => p.startsWith('/admin/profiel') || p.startsWith('/admin/settings') || p.startsWith('/admin/customers') || p.startsWith('/admin/news') || p.startsWith('/admin/media') || p.startsWith('/admin/documenten'),
    icon: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" /></>,
  },
];

export default function MobileTabBar() {
  const pathname = usePathname() || '';

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
      <div className="mx-auto flex max-w-md items-center justify-around rounded-full border border-forest-900/8 bg-white/95 p-1.5 shadow-[0_8px_30px_-8px_rgba(28,20,15,0.25)] backdrop-blur">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all duration-300 ${
                active ? 'bg-forest-50 text-forest-800' : 'text-forest-400 hover:text-forest-700'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0">
                {tab.icon}
              </svg>
              {active && <span className="truncate">{tab.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
