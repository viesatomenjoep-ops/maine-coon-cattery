'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
  BREEDS, COLORS, NFO_ONLY, NUMERIC_GROUPS, PROVISIONAL,
  searchBreeds, parseEms, describeEms,
} from '@/lib/ems';

const inputCls = 'w-full rounded-lg border border-forest-900/15 bg-white px-4 py-3 text-sm text-forest-900 outline-none transition placeholder:text-forest-400 focus:border-brass-500 focus:ring-2 focus:ring-brass-200';

/**
 * Raskiezer op basis van het EMS-systeem. Je kunt de code typen (ABY) of de
 * naam (Abessijn) — beide leiden naar hetzelfde ras. De code is wat we
 * bewaren, want die is officieel leidend.
 */
export function BreedPicker({ value, onChange, placeholder = 'Typ een code of naam…' }) {
  const [zoek, setZoek] = useState('');
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    const klik = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', klik);
    return () => document.removeEventListener('mousedown', klik);
  }, []);

  const treffers = useMemo(() => searchBreeds(zoek).slice(0, 40), [zoek]);
  const gekozen = value ? (BREEDS[value.toUpperCase()] ? { code: value.toUpperCase(), name: BREEDS[value.toUpperCase()] } : null) : null;

  return (
    <div ref={box} className="relative">
      {gekozen ? (
        <div className="flex items-center gap-3 rounded-lg border border-forest-900/15 bg-white px-4 py-2.5">
          <span className="rounded-md bg-forest-800 px-2 py-0.5 font-mono text-xs font-bold text-cream-50">{gekozen.code}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-forest-900">{gekozen.name}</span>
          {PROVISIONAL.includes(gekozen.code) && (
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">voorlopig erkend</span>
          )}
          <button type="button" onClick={() => { onChange(''); setZoek(''); setOpen(true); }} className="shrink-0 text-xs font-semibold text-forest-500 hover:text-forest-800">
            wijzig
          </button>
        </div>
      ) : (
        <input
          value={zoek}
          onChange={(e) => { setZoek(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className={inputCls}
        />
      )}

      {open && !gekozen && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-forest-900/10 bg-white shadow-[0_12px_40px_-12px_rgba(28,20,15,0.25)]">
          {treffers.length === 0 ? (
            <p className="px-4 py-3 text-sm text-forest-500">Geen ras gevonden voor “{zoek}”.</p>
          ) : (
            treffers.map((b) => (
              <button
                key={b.code}
                type="button"
                onClick={() => { onChange(b.code); setOpen(false); setZoek(''); }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-forest-50"
              >
                <span className="w-12 shrink-0 font-mono text-xs font-bold text-forest-700">{b.code}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-forest-900">{b.name}</span>
                {PROVISIONAL.includes(b.code) && <span className="shrink-0 text-[11px] text-amber-700">voorlopig</span>}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/**
 * EMS-codeveld dat meteen laat zien wat je hebt getypt. "MCO n 22" wordt
 * onder het veld uitgeschreven als "Maine Coon · zwart · tabby blotched",
 * zodat je een typefout direct ziet.
 */
export function EmsCodeInput({ value, onChange, breedCode, placeholder = 'Bijv. MCO n 22' }) {
  const [help, setHelp] = useState(false);
  const p = useMemo(() => parseEms(value), [value]);
  const uitleg = useMemo(() => describeEms(value), [value]);

  return (
    <div>
      <div className="relative">
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputCls} font-mono`}
        />
        <button
          type="button"
          onClick={() => setHelp((v) => !v)}
          title="Toon alle codes"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-forest-400 transition hover:bg-forest-50 hover:text-forest-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" /></svg>
        </button>
      </div>

      {/* Wat staat er nu eigenlijk */}
      {value && (
        <div className="mt-2">
          {uitleg && (
            <div className="flex flex-wrap items-center gap-1.5">
              {p.breed && <span className="rounded-md bg-forest-100 px-2 py-0.5 text-xs font-semibold text-forest-800">{p.breed.name}</span>}
              {p.colors.map((c, i) => (
                <span key={`c${i}`} className="rounded-md bg-brass-100 px-2 py-0.5 text-xs text-brass-800">{c.label.split(' (')[0]}</span>
              ))}
              {p.numerics.map((n, i) => (
                <span key={`n${i}`} className="rounded-md bg-forest-50 px-2 py-0.5 text-xs text-forest-700">{n.label.split(' (')[0]}</span>
              ))}
            </div>
          )}
          {p.onbekend.length > 0 && (
            <p className="mt-1.5 text-xs text-amber-700">
              ⚠ Niet herkend: {p.onbekend.join(', ')} — controleer of dit klopt.
            </p>
          )}
        </div>
      )}

      {/* Naslag: alle codes onder handbereik */}
      {help && (
        <div className="mt-3 max-h-80 overflow-y-auto rounded-xl border border-forest-900/10 bg-forest-50/50 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-forest-600">Kleuren</p>
          <div className="mb-4 grid gap-x-4 gap-y-1 sm:grid-cols-2">
            {Object.entries(COLORS).map(([c, l]) => (
              <div key={c} className="flex gap-2 text-xs">
                <span className="w-6 shrink-0 font-mono font-bold text-forest-700">{c}</span>
                <span className="min-w-0 flex-1 text-forest-600">{l}</span>
              </div>
            ))}
          </div>

          {breedCode === 'NFO' && (
            <>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-forest-600">Alleen Noorse Boskat</p>
              <div className="mb-4 grid gap-x-4 gap-y-1 sm:grid-cols-2">
                {Object.entries(NFO_ONLY).map(([c, l]) => (
                  <div key={c} className="flex gap-2 text-xs">
                    <span className="w-6 shrink-0 font-mono font-bold text-forest-700">{c}</span>
                    <span className="min-w-0 flex-1 text-forest-600">{l}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {NUMERIC_GROUPS.map((g) => (
            <div key={g.key} className="mb-4 last:mb-0">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-forest-600">{g.label}</p>
              <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
                {Object.entries(g.codes).map(([c, l]) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChange(`${(value || '').trim()} ${c}`.trim())}
                    className="flex gap-2 rounded px-1 py-0.5 text-left text-xs transition hover:bg-white"
                  >
                    <span className="w-6 shrink-0 font-mono font-bold text-forest-700">{c}</span>
                    <span className="min-w-0 flex-1 text-forest-600">{l}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <p className="mt-2 text-xs text-forest-500">Klik op een cijfercode om hem achter je EMS-code te plakken.</p>
        </div>
      )}
    </div>
  );
}
