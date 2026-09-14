'use client';
import Link from 'next/link';

// Paginakop met icoon, titel en acties rechts — overal in het beheer gelijk.
export function PageHeader({ icon, title, subtitle, actions }) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        {icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest-800 text-cream-50">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">{icon}</svg>
          </span>
        )}
        <div className="min-w-0">
          <h1 className="font-display text-3xl leading-tight text-forest-950 md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-forest-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// De hoofdactie van een pagina: donkergroen, duidelijk, altijd rechtsboven.
export function PrimaryAction({ href, onClick, children }) {
  const cls = 'inline-flex items-center justify-center gap-2 rounded-xl bg-forest-800 px-6 py-3 text-sm font-semibold text-cream-50 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-900';
  const inner = (
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      {children}
    </>
  );
  return href
    ? <Link href={href} className={cls}>{inner}</Link>
    : <button onClick={onClick} className={cls}>{inner}</button>;
}

// Ronde hulpknop naast de hoofdactie (bijv. exporteren).
export function IconAction({ href, onClick, title, icon }) {
  const cls = 'flex h-11 w-11 items-center justify-center rounded-xl border border-forest-900/10 bg-white text-forest-600 transition hover:border-forest-900/20 hover:text-forest-900';
  const inner = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">{icon}</svg>;
  return href
    ? <Link href={href} title={title} aria-label={title} className={cls}>{inner}</Link>
    : <button onClick={onClick} title={title} aria-label={title} className={cls}>{inner}</button>;
}

// Groot, uitnodigend leegscherm: waarom dit scherm bestaat + één duidelijke stap.
export function EmptyHero({ icon, title, desc, action }) {
  return (
    <div className="rounded-3xl border border-forest-900/8 bg-white px-6 py-16 text-center">
      {icon && (
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-forest-50 text-forest-700">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">{icon}</svg>
        </div>
      )}
      <h2 className="mx-auto max-w-lg font-display text-3xl leading-tight text-forest-950">{title}</h2>
      {desc && <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-forest-600">{desc}</p>}
      {action && <div className="mt-8 flex justify-center">{action}</div>}
    </div>
  );
}

// Uitleg in drie stappen, voor wie het scherm voor het eerst ziet.
export function HowItWorks({ label, steps, footer }) {
  return (
    <section className="mt-6 rounded-3xl bg-forest-900/[0.03] p-6 md:p-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-brass-600 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M9 18h6M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z" /></svg>
          </span>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-forest-600">{label}</span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="rounded-2xl border border-forest-900/8 bg-white p-5">
            <div className="mb-3 flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">{s.icon}</svg>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-forest-400">Stap {i + 1}</span>
            </div>
            <h3 className="font-display text-xl text-forest-950">{s.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-forest-600">{s.desc}</p>
          </div>
        ))}
      </div>

      {footer && <div className="mt-5 text-center">{footer}</div>}
    </section>
  );
}
