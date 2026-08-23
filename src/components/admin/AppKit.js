'use client';
import { useState } from 'react';

// Kleine bouwstenen in app-stijl: groot, rond en met veel ruimte om te tikken.
// Overal hetzelfde, zodat het geheel rustig aanvoelt.

export function SearchBar({ value, onChange, placeholder = 'Zoeken…' }) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-transparent bg-forest-900/[0.04] py-3.5 pl-5 pr-12 text-base text-forest-900 outline-none transition placeholder:text-forest-400 focus:border-brass-300 focus:bg-white"
      />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-forest-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      </span>
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Zoekopdracht wissen"
          className="absolute right-11 top-1/2 -translate-y-1/2 text-forest-400 transition hover:text-forest-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      )}
    </div>
  );
}

// Twee-standen schakelaar (Tegels / Lijst).
export function ViewToggle({ view, onChange }) {
  const opts = [
    { key: 'tiles', label: 'Tegels', icon: <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></> },
    { key: 'list', label: 'Lijst', icon: <><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></> },
  ];
  return (
    <div className="flex gap-2">
      {opts.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
            view === o.key ? 'bg-brass-400 text-forest-950 shadow-sm' : 'bg-forest-900/[0.04] text-forest-600 hover:bg-forest-900/[0.07]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{o.icon}</svg>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Rij met filterknoppen, zoals "Aanwezig / Vertrokken".
export function SegmentedTabs({ options, value, onChange, className = '' }) {
  return (
    <div className={`flex gap-1.5 overflow-x-auto rounded-2xl bg-forest-900/[0.04] p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
            value === o.key ? 'bg-brass-400 text-forest-950 shadow-sm' : 'bg-white text-forest-600 hover:bg-forest-50'
          }`}
        >
          {o.label}
          {o.count != null && <span className={`ml-1.5 text-xs ${value === o.key ? 'text-forest-950/60' : 'text-forest-400'}`}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

// Donkere sectiebalk die een blok inleidt, en die je kunt open- en dichtklappen.
export function SectionCard({ title, subtitle, defaultOpen = true, children, right }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="mb-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-2xl bg-forest-800 px-6 py-5 text-left transition hover:bg-forest-900"
      >
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl text-cream-50">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-cream-100/60">{subtitle}</p>}
        </div>
        {right}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 text-cream-100/70 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'mt-3 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}

// Grote, duidelijke actieknop onderaan een formulier.
export function PrimaryButton({ children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      className={`w-full rounded-2xl bg-[#F4796B] py-4 text-base font-bold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ef6959] disabled:translate-y-0 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

// Invoerveld met label erboven, in de zachte app-stijl.
export function AppField({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="ml-1 text-sm font-medium text-forest-800">
        {label}{required && <span className="ml-0.5 text-[#F4796B]">*</span>}
      </span>
      {hint && <span className="ml-1 mt-0.5 block text-xs text-forest-500">{hint}</span>}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const appInput = 'w-full rounded-2xl border border-transparent bg-forest-900/[0.04] px-5 py-3.5 text-base text-forest-900 outline-none transition placeholder:text-forest-400 focus:border-brass-300 focus:bg-white';

export function AppInput(p) {
  return <input {...p} className={`${appInput} ${p.className || ''}`} />;
}
export function AppSelect(p) {
  return <select {...p} className={`${appInput} appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23678' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[right_1.25rem_center] bg-no-repeat pr-12 ${p.className || ''}`} />;
}
export function AppTextarea(p) {
  return <textarea {...p} className={`${appInput} min-h-[110px] ${p.className || ''}`} />;
}

// Lege staat met een uitnodiging in plaats van een kale mededeling.
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-forest-900/12 bg-white/60 px-6 py-12 text-center">
      {icon && <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-300">{icon}</div>}
      <p className="font-display text-xl text-forest-900">{title}</p>
      {desc && <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-forest-600">{desc}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
