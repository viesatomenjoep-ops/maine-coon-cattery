'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { cap } from '@/lib/species';
import { SectionCard } from '@/components/admin/AppKit';

function Row({ href, icon, title, desc, external }) {
  const inner = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">{icon}</svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-forest-900">{title}</span>
        {desc && <span className="block text-xs text-forest-500">{desc}</span>}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-forest-300"><path d="m9 18 6-6-6-6" /></svg>
    </>
  );
  const cls = 'flex items-center gap-4 rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(28,20,15,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_20px_-6px_rgba(28,20,15,0.15)]';
  return external
    ? <a href={href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
    : <Link href={href} className={cls}>{inner}</Link>;
}

export default function ProfielPage() {
  const { user, logout } = useAuth();
  const { currentTenant, terms, kittens = [], litters = [], customers = [] } = useStore();

  const name = user?.user_metadata?.name || user?.user_metadata?.full_name || 'Beheerder';
  const slug = currentTenant?.slug;

  return (
    <div className="">
      {/* Wie ben je en welke fokkerij beheer je */}
      <div className="mb-6 rounded-3xl bg-white p-6 text-center shadow-[0_1px_3px_rgba(28,20,15,0.06)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-forest-50 font-display text-3xl text-forest-700">
          {(currentTenant?.name || name).charAt(0).toUpperCase()}
        </div>
        <h1 className="mt-4 font-display text-2xl text-forest-950">{currentTenant?.name || 'Mijn fokkerij'}</h1>
        <p className="mt-1 text-sm text-forest-500">{name}{user?.email ? ` · ${user.email}` : ''}</p>

        {slug && (
          <Link href={`/${slug}`} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-forest-50 px-4 py-2 text-sm font-semibold text-forest-700 transition hover:bg-forest-100">
            Bekijk mijn pagina
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
          </Link>
        )}

        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-forest-900/8 pt-5">
          {[
            { n: kittens.length, l: cap(terms.animalPlural) },
            { n: litters.length, l: cap(terms.litterPlural) },
            { n: customers.length, l: 'Klanten' },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-display text-2xl text-forest-950">{s.n}</p>
              <p className="text-xs text-forest-500">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <SectionCard title="Beheer" subtitle="Alles rond je fokkerij">
        <div className="space-y-2.5">
          <Row href="/admin/customers" title="Klanten" desc="Kopers en contactgegevens"
            icon={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /></>} />
          <Row href="/admin/sales" title="Verkoop & advertenties" desc="Prijzen, status en publiceren"
            icon={<><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6Z" /><circle cx="7.5" cy="7.5" r="1.2" /></>} />
          <Row href="/admin/news" title="Nieuws" desc="Berichten op je pagina"
            icon={<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></>} />
          <Row href="/admin/media" title="Bestanden & foto's" desc="Alle media op één plek"
            icon={<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></>} />
        </div>
      </SectionCard>

      <SectionCard title="Instellingen" defaultOpen={false}>
        <div className="space-y-2.5">
          <Row href="/admin/settings" title="Website & voorkeuren" desc="Teksten, back-up en instellingen"
            icon={<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></>} />
          <Row href="/" external title="Ga naar de website" desc="mainbreed.com"
            icon={<><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z" /></>} />
        </div>
      </SectionCard>

      <button
        onClick={async () => { await logout(); window.location.href = '/'; }}
        className="mt-4 w-full rounded-2xl border border-red-200 bg-white py-4 text-base font-semibold text-red-600 transition hover:bg-red-50"
      >
        Uitloggen
      </button>
    </div>
  );
}
