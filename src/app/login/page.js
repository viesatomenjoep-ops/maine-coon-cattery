'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo, PawMark } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';

const LAST_EMAIL_KEY = 'wd_last_email';
const LAST_PW_KEY = 'wd_last_pw';

export default function LoginPage() {
  const { login, signUp, loginWithGoogle, loginWithApple } = useAuth();
  const router = useRouter();
  const { t, mounted } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notRobot, setNotRobot] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  // Los van Google/Apple: hier kun je ook met alleen een e-mailadres een
  // nieuw account aanmaken, in plaats van inloggen op een bestaand account.
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [signupDone, setSignupDone] = useState(false);

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

  const handleApple = async () => {
    setError('');
    setAppleLoading(true);
    const res = await loginWithApple();
    if (!res.ok) {
      setAppleLoading(false);
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
    if (mode === 'signup' && password.length < 6) {
      setError('Kies een wachtwoord van minimaal 6 tekens.');
      return;
    }

    setLoading(true);

    if (mode === 'signup') {
      const res = await signUp(email, password);
      setLoading(false);
      if (!res.ok) { setError(res.error); return; }
      if (res.needsConfirmation) { setSignupDone(true); return; }
      // Bevestiging staat uit in dit project: er is meteen een sessie, ga door naar de wizard.
      router.push('/welkom');
      return;
    }

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
            {mode === 'signup' ? 'Account aanmaken' : (mounted ? t('login_title') : 'Exclusieve Toegang')}
          </h1>
          <p className="mt-2 text-sm text-ink/75 font-light">
            {mode === 'signup' ? 'Los van Google of Apple — met alleen je e-mailadres.' : (mounted ? t('login_desc') : 'Voer uw inloggegevens in.')}
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

          {/* Inloggen met Apple */}
          <button
            type="button"
            onClick={handleApple}
            disabled={appleLoading}
            className="mt-3 flex w-full items-center justify-center gap-3 rounded-xl bg-black py-3.5 text-base font-semibold text-white shadow-soft transition hover:bg-ink disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 384 512" fill="currentColor" aria-hidden>
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
            {appleLoading ? 'Bezig…' : 'Doorgaan met Apple'}
          </button>

          <p className="mt-2 text-center text-xs text-ink/50">
            Nog geen account? Hiermee maak je er meteen een aan.
          </p>

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-terracotta-900/10" />
            <span className="text-xs uppercase tracking-wider text-ink/40">of met e-mail</span>
            <span className="h-px flex-1 bg-terracotta-900/10" />
          </div>

          {signupDone ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <p className="font-semibold text-emerald-900">Check je inbox</p>
              <p className="mt-1.5 text-sm leading-relaxed text-emerald-800/80">
                We hebben een bevestigingslink gestuurd naar <b>{email}</b>. Klik daarop om je account te activeren —
                daarna kun je meteen je fokkerij aanmaken.
              </p>
              <button
                type="button"
                onClick={() => { setSignupDone(false); setMode('login'); }}
                className="mt-4 text-sm font-semibold text-emerald-700 hover:underline"
              >
                Terug naar inloggen
              </button>
            </div>
          ) : (
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
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-terracotta-900/10 bg-cream-50 px-4 py-3 text-base outline-none transition focus:border-terracotta-400 focus:ring-2 focus:ring-terracotta-200"
                placeholder="••••••••"
              />
              {mode === 'signup' && <p className="mt-1 text-xs text-ink/45">Minimaal 6 tekens.</p>}
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

            {/* Onthoud mij — alleen relevant bij inloggen op een bestaand account */}
            {mode === 'login' && (
              <label className="flex items-center gap-2 text-sm text-ink/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-terracotta-900/30 accent-terracotta-500"
                />
                Onthoud mijn gegevens op dit apparaat
              </label>
            )}

            {error && <p className="text-sm text-red-700 font-semibold text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-terracotta-500 py-3.5 text-base font-semibold text-cream-50 transition hover:bg-terracotta-600 shadow-soft hover:shadow-glow disabled:opacity-60"
            >
              {mode === 'signup'
                ? (loading ? 'Account aanmaken…' : 'Account aanmaken')
                : (loading ? 'Bezig met inloggen…' : (mounted ? t('login_btn') : 'Inloggen'))}
            </button>

            {mode === 'login' ? (
              <p className="text-center text-[11px] text-ink/50 leading-relaxed">
                Tip: laat "Onthoud mijn gegevens" aan staan, dan zijn je e-mail en wachtwoord de volgende keer al ingevuld. Sla je wachtwoord ook op in je telefoon voor Face ID / Touch ID.
              </p>
            ) : (
              <p className="text-center text-[11px] text-ink/50 leading-relaxed">
                Door een account aan te maken ga je akkoord met de verwerking van je gegevens om je fokkerij-omgeving te beheren.
              </p>
            )}

            <button
              type="button"
              onClick={() => { setMode((m) => (m === 'login' ? 'signup' : 'login')); setError(''); }}
              className="w-full text-center text-sm font-semibold text-terracotta-600 hover:underline"
            >
              {mode === 'login' ? 'Nog geen account? Registreer met e-mail →' : '← Heb je al een account? Inloggen'}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
