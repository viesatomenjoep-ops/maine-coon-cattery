'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import MainbreedLogo from '@/components/MainbreedLogo';

const SPECIES = [
  { value: 'katten', label: 'Katten', hint: 'Cattery', icon: <><circle cx="12" cy="14" r="6" /><path d="M7 9 5 4l4 4" /><path d="M17 9l2-5-4 4" /><path d="M9.5 15h.01M14.5 15h.01" /></> },
  { value: 'honden', label: 'Honden', hint: 'Kennel', icon: <><path d="M10 5.2 8 3v4" /><path d="M14 5.2 16 3v4" /><path d="M6 9a6 6 0 0 1 12 0v4a6 6 0 0 1-12 0Z" /><path d="M10 12h.01M14 12h.01M12 15v1" /></> },
  { value: 'vogels', label: 'Vogels', hint: 'Volière', icon: <><path d="M16 7h.01" /><path d="M3.4 18a10 10 0 0 0 8.6-4 8 8 0 0 0 8-8 3 3 0 0 0-6 0 8 8 0 0 0-8 8v6" /><path d="m9 14 6 6" /></> },
  { value: 'duiven', label: 'Duiven', hint: 'Duivenhok', icon: <><path d="M20 6c-1 4-4 6-8 6s-6 3-6 7" /><path d="M20 6a3 3 0 0 0-5-2" /><path d="M17 5h.01" /><path d="M6 19h8" /></> },
  { value: 'knaagdieren', label: 'Knaagdieren', hint: 'Konijnen, cavia\'s', icon: <><circle cx="12" cy="15" r="5" /><path d="M8 8c0-3 1-5 2-5s2 2 2 4" /><path d="M16 8c0-3-1-5-2-5" /><path d="M10 15h.01M14 15h.01" /></> },
  { value: 'anders', label: 'Iets anders', hint: 'Paarden, reptielen…', icon: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></> },
];

const STEPS = ['Je fokkerij', 'Wat je fokt', 'Over jou', 'Adres', 'Klaar'];

function Icon({ children, className = 'h-6 w-6' }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>;
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-mainbreed-700">{label}</span>
      {hint && <span className="mt-0.5 block text-xs font-normal normal-case tracking-normal text-ink/45">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const inputCls = 'w-full rounded-xl border border-mainbreed-900/10 bg-white px-4 py-3 text-base outline-none transition focus:border-mainbreed-400 focus:ring-2 focus:ring-mainbreed-200';

export default function WelkomPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    catteryName: '', species: '', breed: '', animalCount: '', littersPerYear: '',
    contactName: '', phone: '', street: '', zipcode: '', city: '', country: 'Nederland',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session?.user) { router.replace('/login'); return; }

      const full = session.user.user_metadata?.full_name || session.user.user_metadata?.name || '';
      if (full) setForm((f) => ({ ...f, contactName: full }));

      const { data: profile } = await supabase
        .from('profiles').select('tenant_id').eq('user_id', session.user.id).maybeSingle();
      if (cancelled) return;
      if (profile?.tenant_id) { router.replace('/admin'); return; }
      setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [router]);

  // Per stap bepalen of je verder mag. Alleen het echt noodzakelijke is verplicht.
  const canContinue = () => {
    if (step === 0) return form.catteryName.trim().length >= 2;
    if (step === 1) return Boolean(form.species);
    if (step === 2) return form.contactName.trim().length >= 2;
    return true;
  };

  const finish = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await fetch('/api/onboarding/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Aanmaken is niet gelukt.'); setSaving(false); return; }
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

  const speciesLabel = SPECIES.find((s) => s.value === form.species)?.label || '—';

  return (
    <div className="min-h-screen bg-cream-50 px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Link href="/" className="inline-block text-[1.3rem]"><MainbreedLogo /></Link>

        {/* Voortgang */}
        <div className="mt-10 flex items-center gap-1.5">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-1.5">
              <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-mainbreed-500' : 'bg-mainbreed-900/10'}`} />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink/40">
          Stap {step + 1} van {STEPS.length} — {STEPS[step]}
        </p>

        <div className="mt-6 rounded-3xl border border-mainbreed-900/8 bg-white p-8 shadow-soft">
          {/* Stap 1 — naam */}
          {step === 0 && (
            <div className="animate-fade-up">
              <h1 className="font-display text-3xl leading-tight text-ink">Hoe heet je fokkerij?</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                Deze naam komt op je eigen pagina en in het portaal van je kopers te staan. Je kunt hem later aanpassen.
              </p>
              <div className="mt-6">
                <Field label="Naam van je fokkerij">
                  <input autoFocus value={form.catteryName} onChange={(e) => set('catteryName', e.target.value)} placeholder="Bijv. Wendy's Dream" className={inputCls} />
                </Field>
              </div>
            </div>
          )}

          {/* Stap 2 — diersoort */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h1 className="font-display text-3xl leading-tight text-ink">Wat fok je?</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                Zo stemmen we de woorden in je beheer af — bij honden praten we over pups, bij katten over kittens.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {SPECIES.map((s) => {
                  const active = form.species === s.value;
                  return (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => set('species', s.value)}
                      className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 ${
                        active ? 'border-2 border-mainbreed-500 bg-mainbreed-50' : 'border-mainbreed-900/10 bg-white hover:border-mainbreed-300'
                      }`}
                    >
                      <span className={`transition-colors ${active ? 'text-mainbreed-600' : 'text-ink/40'}`}><Icon>{s.icon}</Icon></span>
                      <span className="text-sm font-semibold text-ink">{s.label}</span>
                      <span className="text-xs text-ink/45">{s.hint}</span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Ras" hint="Optioneel">
                  <input value={form.breed} onChange={(e) => set('breed', e.target.value)} placeholder="Bijv. Maine Coon" className={inputCls} />
                </Field>
                <Field label="Aantal dieren" hint="Optioneel">
                  <input value={form.animalCount} onChange={(e) => set('animalCount', e.target.value)} placeholder="Bijv. 8" className={inputCls} />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Nestjes per jaar" hint="Optioneel — helpt ons het juiste pakket te adviseren">
                  <input value={form.littersPerYear} onChange={(e) => set('littersPerYear', e.target.value)} placeholder="Bijv. 2" className={inputCls} />
                </Field>
              </div>
            </div>
          )}

          {/* Stap 3 — contact */}
          {step === 2 && (
            <div className="animate-fade-up">
              <h1 className="font-display text-3xl leading-tight text-ink">Met wie hebben we te maken?</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                We gebruiken dit alleen om contact met je op te nemen. Kopers zien deze gegevens niet, tenzij je dat zelf instelt.
              </p>
              <div className="mt-6 grid gap-4">
                <Field label="Je naam">
                  <input autoFocus value={form.contactName} onChange={(e) => set('contactName', e.target.value)} placeholder="Voor- en achternaam" className={inputCls} />
                </Field>
                <Field label="Telefoonnummer" hint="Optioneel">
                  <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="06 12345678" className={inputCls} />
                </Field>
              </div>
            </div>
          )}

          {/* Stap 4 — adres */}
          {step === 3 && (
            <div className="animate-fade-up">
              <h1 className="font-display text-3xl leading-tight text-ink">Waar zit je fokkerij?</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                Handig voor je papieren en voor kopers die willen weten waar ze naartoe komen. Allemaal optioneel.
              </p>
              <div className="mt-6 grid gap-4">
                <Field label="Straat en huisnummer" hint="Optioneel">
                  <input autoFocus value={form.street} onChange={(e) => set('street', e.target.value)} className={inputCls} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Postcode" hint="Optioneel">
                    <input value={form.zipcode} onChange={(e) => set('zipcode', e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Plaats" hint="Optioneel">
                    <input value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <Field label="Land">
                  <select value={form.country} onChange={(e) => set('country', e.target.value)} className={inputCls}>
                    <option>Nederland</option>
                    <option>België</option>
                    <option>Duitsland</option>
                    <option>Anders</option>
                  </select>
                </Field>
              </div>
            </div>
          )}

          {/* Stap 5 — samenvatting */}
          {step === 4 && (
            <div className="animate-fade-up">
              <h1 className="font-display text-3xl leading-tight text-ink">Klopt dit zo?</h1>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">
                Daarna staat je omgeving klaar en kun je meteen je eerste dier toevoegen.
              </p>
              <dl className="mt-6 divide-y divide-mainbreed-900/8 rounded-2xl border border-mainbreed-900/8 bg-cream-50/60 px-5">
                {[
                  ['Fokkerij', form.catteryName],
                  ['Diersoort', speciesLabel],
                  ['Ras', form.breed],
                  ['Aantal dieren', form.animalCount],
                  ['Nestjes per jaar', form.littersPerYear],
                  ['Naam', form.contactName],
                  ['Telefoon', form.phone],
                  ['Adres', [form.street, [form.zipcode, form.city].filter(Boolean).join(' '), form.country].filter(Boolean).join(', ')],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                    <dt className="text-ink/50">{k}</dt>
                    <dd className="font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {error && <p className="mt-5 text-sm font-semibold text-red-700">{error}</p>}

          {/* Navigatie */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-mainbreed-900/8 pt-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className={`rounded-full border border-mainbreed-500/20 px-5 py-2.5 text-sm font-semibold text-mainbreed-800 transition hover:bg-mainbreed-50 ${step === 0 ? 'invisible' : ''}`}
            >
              ← Vorige
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canContinue()}
                className="rounded-full bg-mainbreed-500 px-7 py-2.5 text-sm font-semibold text-cream-50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-mainbreed-600 disabled:translate-y-0 disabled:opacity-40"
              >
                Volgende →
              </button>
            ) : (
              <button
                type="button"
                onClick={finish}
                disabled={saving}
                className="rounded-full bg-mainbreed-500 px-7 py-2.5 text-sm font-semibold text-cream-50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-mainbreed-600 disabled:opacity-60"
              >
                {saving ? 'Bezig…' : 'Fokkerij aanmaken'}
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-ink/50">
          Werk je al met Mainbreed via iemand anders? Mail dan{' '}
          <a href="mailto:hallo@mainbreed.com" className="font-semibold text-mainbreed-600 hover:underline">hallo@mainbreed.com</a>,
          dan koppelen we je aan de juiste fokkerij.
        </p>
      </div>
    </div>
  );
}
