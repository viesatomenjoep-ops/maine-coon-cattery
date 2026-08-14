'use client';
import { forwardRef } from 'react';

const ICON_PATHS = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></>,
  cat: <><circle cx="12" cy="14" r="6"/><path d="M7 9 5 4l4 4"/><path d="M17 9l2-5-4 4"/><path d="M9.5 15h.01M14.5 15h.01"/></>,
  health: <path d="M19 14c1.5-1.5 3-3.4 3-5.5A3.5 3.5 0 0 0 12 5 3.5 3.5 0 0 0 2 8.5C2 12 5 14.5 12 21c2.5-2.3 4.5-4.2 6-6.5Z"/>,
  tag: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6Z"/><circle cx="7.5" cy="7.5" r="1.2"/></>,
  customer: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></>,
  layout: <><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></>,
  settings: <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>,
  arrow: <path d="M5 12h14M13 6l6 6-6 6"/>,
};

export function Icon({ name, className = 'h-5 w-5' }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>{ICON_PATHS[name]}</svg>;
}

export function PageHead({ label, title, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        {label && <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brass-600">{label}</span>}
        <h1 className="mt-1 font-display text-4xl text-forest-900">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export const Card = forwardRef(function Card({ children, className = '' }, ref) {
  return <div ref={ref} className={`rounded-2xl border border-forest-900/10 bg-white p-6 shadow-[0_1px_2px_rgba(25,68,91,0.06)] ${className}`}>{children}</div>;
});

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-forest-800">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const base = 'w-full rounded-lg border border-forest-900/15 bg-white px-4 py-3 text-sm text-forest-900 outline-none transition placeholder:text-forest-400 focus:border-brass-500 focus:ring-2 focus:ring-brass-200';
export const Input = (p) => <input {...p} className={`${base} ${p.className || ''}`} />;
export const Select = (p) => <select {...p} className={`${base} ${p.className || ''}`} />;
export const Textarea = (p) => <textarea {...p} className={`${base} ${p.className || ''}`} />;

export const Combobox = ({ options, id, ...p }) => (
  <>
    <input {...p} list={id} className={`${base} ${p.className || ''}`} />
    <datalist id={id}>
      {options.map((opt, i) => <option key={i} value={opt} />)}
    </datalist>
  </>
);

export function Btn({ children, variant = 'solid', ...p }) {
  const styles = {
    solid: 'bg-forest-800 text-white shadow-sm hover:bg-forest-900',
    brass: 'bg-brass-500 text-white shadow-sm hover:bg-brass-600',
    outline: 'border border-brass-500 text-brass-700 hover:bg-brass-50',
    ghost: 'border border-forest-900/15 bg-white text-forest-800 hover:bg-forest-50',
    danger: 'border border-red-300 text-red-700 hover:bg-red-50',
  };
  return (
    <button {...p} className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition ${styles[variant] || styles.solid} ${p.className || ''}`}>
      {children}
    </button>
  );
}

// Stap-voor-stap formulier-omhulsel (aanmaken van 1 kat/nestje tegelijk, net als een app).
export function Stepper({ steps, current, onBack, onNext, onFinish, canNext = true, finishing = false, finishLabel = 'Opslaan', children }) {
  const isLast = current === steps.length - 1;
  return (
    <div>
      <div className="mb-5 flex items-center">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${i < current ? 'bg-emerald-500 text-white' : i === current ? 'bg-brass-500 text-white' : 'bg-forest-100 text-forest-400'}`}>
              {i < current ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`mx-1 h-0.5 flex-1 transition ${i < current ? 'bg-emerald-400' : 'bg-forest-100'}`} />}
          </div>
        ))}
      </div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-forest-500">Stap {current + 1} van {steps.length} — {steps[current]}</p>
      <div>{children}</div>
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-forest-900/10 pt-5">
        <Btn variant="ghost" onClick={onBack} className={current === 0 ? 'invisible' : ''}>&larr; Vorige</Btn>
        {isLast ? (
          <Btn variant="brass" onClick={onFinish} disabled={!canNext || finishing}>{finishing ? 'Opslaan…' : finishLabel}</Btn>
        ) : (
          <Btn variant="brass" onClick={onNext} disabled={!canNext}>Volgende &rarr;</Btn>
        )}
      </div>
    </div>
  );
}
