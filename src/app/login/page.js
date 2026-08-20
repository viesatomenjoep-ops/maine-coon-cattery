'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo, PawMark } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';

const LAST_EMAIL_KEY = 'wd_last_email';
const LAST_PW_KEY = 'wd_last_pw';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const { t, mounted } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notRobot, setNotRobot] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogle = async () => {
    setError('');
    setGoogleLoading(true);
    const res = await loginWithGoogle();
    // Bij succes navigeert de browser weg naar Google; alleen bij een fout komen we hier terug.
    if (!res.ok) {
      setGoogleLoading(false);
      setError(res.error);
    }
  };

  // Onthoud het laatst gebruikte e-mailadres én wachtwoord op dit apparaat,
  // zodat inloggen de volgende keer vanzelf gaat (werkt ook samen met de
  // wachtwoordkluis / Face ID van je telefoon).
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(LAST_EMAIL_KEY);
      if (savedEmail) setEmail(savedEmail);
      const savedPw = localStorage.getItem(LAST_PW_KEY);
      if (savedPw) setPassword(savedPw);
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
        if (remember) {
          localStorage.setItem(LAST_EMAIL_KEY, email.trim());
          localStorage.setItem(LAST_PW_KEY, password);
        } else {
          localStorage.removeItem(LAST_EMAIL_KEY);
          localStorage.removeItem(LAST_PW_KEY);
        }
      } catch {}
      router.push(res.role === 'admin' ? '/admin' : '/portal');
    } else {
      setError(res.error);
    }
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

          {/* Inloggen met Google — het makkelijkst voor nieuwe klanten */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-terracotta-900/15 bg-white py-3.5 text-base font-semibold text-ink shadow-soft transition hover:bg-cream-50 disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.63h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.55Z" />
              <path fill="#34A853" d="M12 23.5c3.1 0 5.71-1.03 7.62-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.9 1.1-3 0-5.54-2.02-6.45-4.74H1.7v2.98A11.5 11.5 0 0 0 12 23.5Z" />
              <path fill="#FBBC05" d="M5.55 14.18a6.9 6.9 0 0 1 0-4.36V6.84H1.7a11.5 11.5 0 0 0 0 10.32l3.85-2.98Z" />
              <path fill="#EA4335" d="M12 5.02c1.69 0 3.2.58 4.4 1.72l3.3-3.3C17.7 1.58 15.1.5 12 .5A11.5 11.5 0 0 0 1.7 6.84l3.85 2.98C6.46 7.1 9 5.02 12 5.02Z" />
            </svg>
            {googleLoading ? 'Bezig…' : 'Doorgaan met Google'}
          </button>
          <p className="mt-2 text-center text-xs text-ink/50">
            Nog geen account? Hiermee maak je er meteen een aan.
          </p>

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-terracotta-900/10" />
            <span className="text-xs uppercase tracking-wider text-ink/40">of met e-mail</span>
            <span className="h-px flex-1 bg-terracotta-900/10" />
          </div>

          <form onSubmit={submit} className="space-y-4" method="post" autoComplete="on">
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
              Tip: laat "Onthoud mijn gegevens" aan staan, dan zijn je e-mail en wachtwoord de volgende keer al ingevuld. Sla je wachtwoord ook op in je telefoon voor Face ID / Touch ID.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
