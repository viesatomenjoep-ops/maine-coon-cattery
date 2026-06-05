'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/ui';

export default function PortalLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  if (!user) {
    return <div className="relative z-10 grid min-h-screen place-items-center text-forest-700">Doorverwijzen…</div>;
  }

  return (
    <div className="relative z-10 min-h-screen">
      <header className="sticky top-0 z-30 border-b border-forest-900/10 bg-cream-100/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-forest-700/70 sm:block">{user.name}</span>
            {user.role === 'admin' && (
              <Link href="/admin" className="text-sm font-medium text-brass-600 hover:underline">Admin</Link>
            )}
            <button onClick={() => { logout(); router.push('/'); }} className="rounded-full border border-forest-900/15 px-4 py-2 text-sm text-forest-800 transition hover:bg-forest-800 hover:text-cream-100">
              Uitloggen
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
    </div>
  );
}
