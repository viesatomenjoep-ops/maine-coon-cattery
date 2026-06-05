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
    <div className="relative z-10 min-h-screen w-full overflow-x-hidden bg-cream-100">
      <header className="sticky top-0 z-30 border-b border-terracotta-900/10 bg-cream-100/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-ink/70 sm:block">{user.name}</span>
            {user.role === 'admin' && (
              <Link href="/admin" className="text-sm font-semibold text-terracotta-600 hover:underline">Admin</Link>
            )}
            <button onClick={() => { logout(); router.push('/'); }} className="rounded-full border border-terracotta-900/10 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-terracotta-800 transition hover:bg-terracotta-600 hover:text-cream-50 hover:border-terracotta-600 shadow-soft">
              Uitloggen
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
    </div>
  );
}
