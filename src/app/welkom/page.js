'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MainbreedLogo from '@/components/MainbreedLogo';

// Laatste stap van het registreren: de fokker geeft zijn fokkerij een naam,
// waarna zijn eigen omgeving wordt aangemaakt.
export default function WelkomPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session?.user) { router.replace('/login'); return; }

      const full = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
      setFirstName(full.split(' ')[0] || '');

      // Al gekoppeld? Dan hoort deze pagina niet meer bij hem.
      const { data: profile } = await supabase
        .from('profiles').select('tenant_id').eq('user_id', session.user.id).maybeSingle();
      if (cancelled) return;
      if (profile?.tenant_id) { router.replace('/admin'); return; }
      setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [router]);

  const submit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) { setError('Vul de naam van je fokkerij in.'); return; }
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/onboarding/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catteryName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Aanmaken is niet gelukt.'); setSaving(false); return; }
      // Sessie verversen zodat de nieuwe rol meteen meekomt.
      await supabase.auth.refreshSession();
      window.location.href = '/admin';
    } catch {
      setError('Er ging iets mis. Probeer het opnieuw.');
      setSaving(false);
    }
  };

  if (checking) {
    return <div className="grid min-h-screen place-items-center bg-cream-50 text-ink/60">Een moment…</div>;
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream-50 px-6 py-16">
      <div className="w-full max-w-md">
        <MainbreedLogo className="text-[1.4rem]" />

        <h1 className="mt-8 font-display text-4xl leading-tight text-ink">
          {firstName ? `Welkom, ${firstName}.` : 'Welkom.'}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink/70">
          Nog één ding: hoe heet je fokkerij? Die naam komt op je eigen pagina te staan.
          Je kunt hem later altijd aanpassen.
        </p>

        <form onSubmit={submit} className="mt-8">
          <label htmlFor="cattery-name" className="text-xs font-semibold uppercase tracking-wide text-mainbreed-700">
            Naam van je fokkerij
          </label>
          <input
            id="cattery-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            placeholder="Bijv. Wendy's Dream"
            className="mt-1.5 w-full rounded-xl border border-mainbreed-900/10 bg-white px-4 py-3 text-base outline-none transition focus:border-mainbreed-400 focus:ring-2 focus:ring-mainbreed-200"
          />

          {error && <p className="mt-3 text-sm font-semibold text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 w-full rounded-xl bg-mainbreed-500 py-3.5 text-base font-semibold text-cream-50 shadow-soft transition hover:bg-mainbreed-600 disabled:opacity-60"
          >
            {saving ? 'Bezig…' : 'Aan de slag'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-ink/50">
          Fok je al met Mainbreed via iemand anders? Neem dan contact op via{' '}
          <a href="mailto:hallo@mainbreed.com" className="font-semibold text-mainbreed-600 hover:underline">hallo@mainbreed.com</a>,
          dan koppelen we je aan de juiste fokkerij.
        </p>
      </div>
    </div>
  );
}
