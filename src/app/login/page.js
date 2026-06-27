'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo, PawMark } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { t, mounted } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.ok) {
      router.push(res.role === 'admin' ? '/admin' : '/portal');
    } else {
      setError(res.error);
    }
  };

  const fill = (em, pw) => {
    setEmail(em);
    setPassword(pw);
    setError('');
  };

  return (
    <div className="relative z-10 grid min-h-screen md:grid-cols-2">
      {/* visual side */}
      <div className="relative hidden overflow-hidden bg-ink md:block">
        <div className="absolute inset-0 bg-gradient-to-br from-terracotta-800 via-terracotta-900 to-ink" />
        <div className="absolute inset-0 bg-grain opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo light />
          <div>
            <PawMark className="h-9 w-9 text-terracotta-300" />
            <h2 className="mt-5 max-w-sm font-display text-4xl text-cream-100 font-light leading-tight">
              {mounted ? t('login_welcome') : "Welkom terug bij Wendy's Dream"}
            </h2>
            <p className="mt-4 max-w-xs text-cream-100/60 font-light leading-relaxed">
              {mounted ? t('login_welcome_desc') : 'Log in om de beschikbare kittens, dossiers en stamboominformatie te bekijken.'}
            </p>
          </div>
        </div>
      </div>

      {/* form side */}
      <div className="flex items-center justify-center px-6 py-16 bg-cream-100">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-6"><Logo /></div>
          <h1 className="mt-8 font-display text-3xl text-ink font-light">
            {mounted ? t('login_title') : 'Exclusieve Toegang'}
          </h1>
          <p className="mt-2 text-sm text-ink/75 font-light">
            {mounted ? t('login_desc') : 'Voer uw inloggegevens in.'}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-terracotta-800">
                {mounted ? t('login_username') : 'Gebruikersnaam'}
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-terracotta-900/10 bg-cream-50 px-4 py-3 text-base outline-none transition focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-200"
                placeholder="Vul uw gebruikersnaam in"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-terracotta-800">
                {mounted ? t('login_password') : 'Wachtwoord'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-terracotta-900/10 bg-cream-50 px-4 py-3 text-base outline-none transition focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-200"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-700 font-semibold">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-terracotta-500 py-3.5 text-base font-semibold text-cream-50 transition hover:bg-terracotta-600 shadow-soft hover:shadow-glow"
            >
              {mounted ? t('login_btn') : 'Inloggen'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
