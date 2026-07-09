'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';

export default function SuperadminLayout({ children }) {
  const { user, logout } = useAuth();
  const { isSuperadmin } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.replace('/login');
  }, [user, router]);

  if (!user) {
    return <div className="grid min-h-screen place-items-center bg-cream-100 text-forest-700">Toegang controleren…</div>;
  }

  if (!isSuperadmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-100 px-6 text-center">
        <div>
          <h1 className="font-display text-3xl text-forest-950">Geen toegang</h1>
          <p className="mt-2 text-forest-700">Deze omgeving is uitsluitend voor de platform-superadmin.</p>
          <p className="mt-1 text-sm text-forest-500">Zie je dit onterecht? Dan is de database-update voor de superadmin-rol nog niet toegepast.</p>
          <Link href="/admin" className="mt-6 inline-block rounded-xl bg-forest-800 px-5 py-2.5 text-sm font-semibold text-white">Naar je eigen portaal</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="flex items-center justify-between border-b border-forest-900/10 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-ink px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-cream-50">Superadmin</span>
          <span className="font-display text-lg text-forest-950">Platformbeheer</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/admin" className="text-forest-600 hover:text-forest-900">Mijn portaal</Link>
          <button onClick={async () => { await logout(); window.location.href = '/'; }} className="text-forest-600 hover:text-forest-900">Uitloggen</button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
