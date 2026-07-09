'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo, PawMark } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';

const LAST_EMAIL_KEY = 'wd_last_email';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { t, mounted } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notRobot, setNotRobot] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  // Onthoud het laatst gebruikte e-mailadres, zodat inloggen sneller gaat
  // (werkt samen met de wachtwoordkluis / Face ID van je telefoon).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_EMAIL_KEY);
      if (saved) setEmail(saved);
    } catch {}
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!notRobot) {
      setError('Bevestig eerst dat je geen robot bent.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.ok) {
      try {
        if (remember) localStorage.setItem(LAST_EMAIL_KEY, email.trim());
        else localStorage.removeItem(LAST_EMAIL_KEY);
      } catch {}
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

          <form onSubmit={submit} className="mt-8 space-y-4" method="post" autoComplete="on">
            <div>
              <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wide text-terracotta-800">
                {mounted ? t('login_email') : 'E-mailadres'}
              </label>
              <input
                id="login-email"
                name="username"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-terracotta-900/10 bg-cream-50 px-4 py-3 text-base outline-none transition focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-200"
                placeholder="naam@voorbeeld.nl"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wide text-terracotta-800">
                {mounted ? t('login_password') : 'Wachtwoord'}
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-terracotta-900/10 bg-cream-50 px-4 py-3 text-base outline-none transition focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-200"
                placeholder="••••••••"
              />
            </div>

            {/* Gratis verificatie: "Ik ben geen robot" */}
            <button
              type="button"
              onClick={() => setNotRobot((v) => !v)}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                notRobot ? 'border-green-500 bg-green-50' : 'border-terracotta-900/15 bg-cream-50 hover:bg-terracotta-50'
              }`}
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition ${
                notRobot ? 'border-green-600 bg-green-600 text-white' : 'border-terracotta-900/30 bg-white'
              }`}>
                {notRobot && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-4 w-4"><path d="M20 6 9 17l-5-5" /></svg>
                )}
              </span>
              <span className="text-sm font-medium text-ink">I am not a human ✓ <span className="text-ink/50 font-normal">(ik ben geen robot)</span></span>
            </button>

            {/* Onthoud mij */}
            <label className="flex items-center gap-2 text-sm text-ink/80 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-terracotta-900/30 accent-terracotta-500"
              />
              Onthoud mijn gegevens op dit apparaat
            </label>

            {error && <p className="text-sm text-red-700 font-semibold text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-terracotta-500 py-3.5 text-base font-semibold text-cream-50 transition hover:bg-terracotta-600 shadow-soft hover:shadow-glow disabled:opacity-60"
            >
              {loading ? 'Bezig met inloggen…' : (mounted ? t('login_btn') : 'Inloggen')}
            </button>

            <p className="text-center text-[11px] text-ink/50 leading-relaxed">
              Tip: sla je wachtwoord op in je telefoon. De volgende keer log je in met Face ID / Touch ID.
            </p>

            {/* Snel invullen van bekende beheerdersaccounts */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => fill('tomjo118735@gmail.com', '@Tb118739')}
                className="w-full rounded-xl bg-cream-50 border border-terracotta-900/10 py-2.5 text-sm font-medium text-terracotta-800 transition hover:bg-terracotta-100"
              >
                Vul admin-gegevens (Tomjo) in
              </button>
              <button
                type="button"
                onClick={() => fill('mazzel37@icloud.com', 'Maincoonmazzel2211')}
                className="w-full rounded-xl bg-cream-50 border border-terracotta-900/10 py-2.5 text-sm font-medium text-terracotta-800 transition hover:bg-terracotta-100"
              >
                Vul admin-gegevens (Mazzel) in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
