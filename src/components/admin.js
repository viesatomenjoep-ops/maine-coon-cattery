'use client';
import { forwardRef } from 'react';

export function PageHead({ label, title, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="text-xs uppercase tracking-[0.28em] text-brass-600">{label}</span>
        <h1 className="mt-2 font-display text-4xl text-forest-950">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export const Card = forwardRef(function Card({ children, className = '' }, ref) {
  return <div ref={ref} className={`rounded-2xl border border-forest-900/10 bg-cream-50 p-6 shadow-soft ${className}`}>{children}</div>;
});

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-forest-700">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

const base = 'w-full rounded-xl border border-forest-900/15 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-brass-400 focus:ring-2 focus:ring-brass-200';
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
    solid: 'bg-forest-800 text-cream-100 hover:bg-forest-900',
    brass: 'bg-brass-400 text-forest-950 hover:bg-brass-300',
    ghost: 'border border-forest-900/15 text-forest-800 hover:bg-forest-100',
    danger: 'border border-red-300 text-red-700 hover:bg-red-50',
  };
  return (
    <button {...p} className={`rounded-xl px-5 py-2.5 text-sm font-medium transition ${styles[variant]} ${p.className || ''}`}>
      {children}
    </button>
  );
}
