'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo, PawMark } from '@/components/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const res = login(email, password);
    if (res.ok) {
      router.push(res.role === 'admin' ? '/admin' : '/portal');
    } else {
      setError(res.error);
    }
  };

  const fill = (em, pw) => { setEmail(em); setPassword(pw); setError(''); };

  return (
    <div className="relative z-10 grid min-h-screen md:grid-cols-2">
      {/* visual side */}
      <div className="relative hidden overflow-hidden bg-forest-900 md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950" />
        <div className="absolute inset-0 bg-grain opacity-40" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo light />
          <div>
            <PawMark className="h-9 w-9 text-brass-300" />
            <h2 className="mt-5 max-w-sm font-display text-4xl text-cream-100">
              Welkom terug bij Maelduin
            </h2>
            <p className="mt-4 max-w-xs text-cream-100/60">
              Log in om de beschikbare kittens, dossiers en stamboominformatie te bekijken.
            </p>
          </div>
        </div>
      </div>

      {/* form side */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="md:hidden"><Logo /></div>
          <h1 className="mt-8 font-display text-3xl text-forest-950">Private Access</h1>
          <p className="mt-2 text-sm text-forest-700/70">Voer uw inloggegevens in.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-forest-700">E-mailadres</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-forest-900/15 bg-cream-50 px-4 py-3 text-sm outline-none transition focus:border-brass-400 focus:ring-2 focus:ring-brass-200"
                placeholder="naam@voorbeeld.nl"
              />
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-forest-700">Wachtwoord</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-forest-900/15 bg-cream-50 px-4 py-3 text-sm outline-none transition focus:border-brass-400 focus:ring-2 focus:ring-brass-200"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-forest-800 py-3.5 text-sm font-semibold text-cream-100 transition hover:bg-forest-900">
              Inloggen
            </button>
          </form>

          {/* demo helper — prototype only */}
          <div className="mt-8 rounded-xl border border-dashed border-brass-300 bg-brass-50 p-4 text-xs text-brass-900">
            <p className="font-semibold uppercase tracking-wide">Demo-toegang</p>
            <button onClick={() => fill('klant@voorbeeld.nl', 'kitten')} className="mt-2 block w-full rounded-lg bg-white/60 px-3 py-2 text-left transition hover:bg-white">
              <span className="font-medium">Klant</span> · klant@voorbeeld.nl / kitten
            </button>
            <button onClick={() => fill('admin@maelduin.nl', 'admin')} className="mt-2 block w-full rounded-lg bg-white/60 px-3 py-2 text-left transition hover:bg-white">
              <span className="font-medium">Admin</span> · admin@maelduin.nl / admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
