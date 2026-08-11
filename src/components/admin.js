'use client';
import { forwardRef } from 'react';

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
