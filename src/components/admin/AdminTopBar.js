'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { collectUpcoming, urgency } from '@/lib/treatments';
import { cap } from '@/lib/species';

// Bovenbalk van het beheer: overal zoeken, zien wat er speelt, en wie je bent.
// Alleen op desktop — op mobiel doet de onderbalk dit werk.
export default function AdminTopBar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { kittens = [], litters = [], customers = [], currentTenant, terms } = useStore();
  const [q, setQ] = useState('');
  const [openMenu, setOpenMenu] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);

  // Klik naast de zoekresultaten of naast het menu sluit dat deel weer.
  useEffect(() => {
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setQ('');
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Sneltoets ⌘K / Ctrl+K zet de cursor meteen in het zoekveld.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('admin-search')?.focus();
      }
      if (e.key === 'Escape') { setQ(''); setOpenMenu(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Eén zoekveld voor alles waar een fokker naar zoekt.
  const term = q.trim().toLowerCase();
  const results = !term ? [] : [
    ...kittens
      .filter((k) => [k.name, k.color, k.chip_number, k.registration_no, k.ems_code]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(term)))
      .slice(0, 5)
      .map((k) => ({ id: k.id, label: k.name || 'Naamloos', hint: cap(terms.animal), href: `/admin/cats/${k.id}` })),
    ...litters
      .filter((l) => (l.name || '').toLowerCase().includes(term))
      .slice(0, 3)
      .map((l) => ({ id: l.id, label: l.name, hint: cap(terms.litter), href: `/admin/litters/${l.id}` })),
    ...customers
      .filter((c) => [c.name, c.email].filter(Boolean).some((v) => String(v).toLowerCase().includes(term)))
      .slice(0, 3)
      .map((c) => ({ id: c.id, label: c.name, hint: 'Klant', href: `/admin/customers/${c.id}` })),
  ];

  // Hoeveel behandelingen vragen nu aandacht?
  const agenda = collectUpcoming(kittens);
  const urgent = agenda.filter((a) => {
    const u = urgency(a.due);
    return u?.key === 'overdue' || u?.key === 'today' || u?.key === 'soon';
  }).length;

  const name = user?.user_metadata?.name || user?.user_metadata?.full_name || 'Beheerder';
  const go = (href) => { setQ(''); router.push(href); };

  return (
    <header className="sticky top-0 z-30 hidden border-b border-forest-900/10 bg-cream-100/90 backdrop-blur lg:block">
      <div className="flex items-center gap-4 px-8 py-3">
        {/* Zoeken over alles heen */}
        <div ref={searchRef} className="relative min-w-0 flex-1 max-w-xl">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          </span>
          <input
            id="admin-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`Zoek een ${terms.animal}, ${terms.litter} of klant…`}
            className="w-full rounded-full border border-transparent bg-white py-2.5 pl-11 pr-16 text-sm text-forest-900 shadow-[0_1px_2px_rgba(28,20,15,0.05)] outline-none transition placeholder:text-forest-400 focus:border-brass-300"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-forest-900/10 bg-forest-50 px-2 py-0.5 text-[11px] font-semibold text-forest-500">⌘K</kbd>

          {term && (
            <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-[0_12px_40px_-12px_rgba(28,20,15,0.25)]">
              {results.length === 0 ? (
                <p className="px-5 py-4 text-sm text-forest-500">Niets gevonden voor “{q}”.</p>
              ) : (
                results.map((r) => (
                  <button
                    key={`${r.hint}-${r.id}`}
                    onClick={() => go(r.href)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition hover:bg-forest-50"
                  >
                    <span className="truncate text-sm font-semibold text-forest-900">{r.label}</span>
                    <span className="shrink-0 rounded-full bg-forest-900/5 px-2.5 py-0.5 text-[11px] font-semibold text-forest-500">{r.hint}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          {/* Agenda */}
          <Link
            href="/admin/medical"
            title="Behandelagenda"
            className="flex h-10 w-10 items-center justify-center rounded-full text-forest-500 transition hover:bg-white hover:text-forest-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          </Link>

          {/* Meldingen: wat vraagt nu aandacht */}
          <Link
            href="/admin/medical"
            title={urgent ? `${urgent} behandeling(en) vragen aandacht` : 'Geen openstaande behandelingen'}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-forest-500 transition hover:bg-white hover:text-forest-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
            {urgent > 0 && (
              <span className="absolute right-1 top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[#c0553f] px-1 text-[11px] font-bold text-white">
                {urgent > 9 ? '9+' : urgent}
              </span>
            )}
          </Link>

          {/* Wie ben je / welke fokkerij */}
          <div className="relative ml-1.5" ref={menuRef}>
            <button
              onClick={() => setOpenMenu((v) => !v)}
              className="flex items-center gap-3 rounded-full border border-forest-900/10 bg-white py-1.5 pl-1.5 pr-3 transition hover:border-forest-900/20"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-800 font-display text-base text-cream-50">
                {(currentTenant?.name || name).charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-left leading-tight xl:block">
                <span className="block max-w-[10rem] truncate text-sm font-semibold text-forest-900">{name}</span>
                <span className="block max-w-[10rem] truncate text-xs text-forest-500">{currentTenant?.name || 'Mijn fokkerij'}</span>
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={`shrink-0 text-forest-400 transition-transform ${openMenu ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6" /></svg>
            </button>

            {openMenu && (
              <div className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-[0_12px_40px_-12px_rgba(28,20,15,0.25)]">
                <div className="border-b border-forest-900/8 px-5 py-4">
                  <p className="truncate font-semibold text-forest-900">{currentTenant?.name || 'Mijn fokkerij'}</p>
                  <p className="truncate text-xs text-forest-500">{user?.email}</p>
                </div>
                <Link href="/admin/profiel" onClick={() => setOpenMenu(false)} className="block px-5 py-3 text-sm font-medium text-forest-700 transition hover:bg-forest-50">Mijn profiel</Link>
                <Link href="/admin/settings" onClick={() => setOpenMenu(false)} className="block px-5 py-3 text-sm font-medium text-forest-700 transition hover:bg-forest-50">Instellingen</Link>
                {currentTenant?.slug && (
                  <a href={`/${currentTenant.slug}`} target="_blank" rel="noreferrer" className="block px-5 py-3 text-sm font-medium text-forest-700 transition hover:bg-forest-50">Bekijk mijn pagina ↗</a>
                )}
                <button
                  onClick={async () => { await logout(); window.location.href = '/'; }}
                  className="block w-full border-t border-forest-900/8 px-5 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Uitloggen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
