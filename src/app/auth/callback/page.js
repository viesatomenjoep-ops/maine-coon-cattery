'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Landingspagina na het inloggen met Google. Supabase heeft de sessie op dit
// moment al gezet; wij bepalen alleen nog waar deze gebruiker thuishoort.
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!session?.user) {
        setError('We konden je niet inloggen. Probeer het opnieuw.');
        return;
      }

      // Rol bepalen: eerst uit de user-metadata, anders uit het profiel.
      let role = session.user.user_metadata?.role;
      if (!role) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
        role = profile?.role;
      }

      if (cancelled) return;
      router.replace(role === 'admin' ? '/admin' : '/portal');
    })();

    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="relative z-10 grid min-h-screen place-items-center bg-cream-100 px-6 text-center">
      {error ? (
        <div>
          <p className="font-display text-2xl text-ink">Inloggen mislukt</p>
          <p className="mt-2 text-sm text-ink/70">{error}</p>
          <a href="/login" className="mt-6 inline-flex rounded-xl bg-terracotta-500 px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-terracotta-600">
            Terug naar inloggen
          </a>
        </div>
      ) : (
        <p className="text-ink/70">Even geduld, je wordt ingelogd…</p>
      )}
    </div>
  );
}
