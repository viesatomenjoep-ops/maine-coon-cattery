'use client';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { Card, Btn } from '@/components/admin';
import LitterEditor from '@/components/admin/LitterEditor';

const LITTER_STATUSES = {
  verwacht: 'Verwacht',
  geboren: 'Geboren',
  beschikbaar: 'Beschikbaar',
  gereserveerd: 'Gereserveerd',
  afgerond: 'Afgerond',
};
const KITTEN_STATUSES = {
  beschikbaar: 'Beschikbaar',
  gereserveerd: 'Gereserveerd',
  verkocht: 'Verkocht',
  houden: 'Houden',
};
const norm = (s) => (s || '').toString().toLowerCase();

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-forest-900/10 bg-white/70 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-forest-600/70">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-forest-900">{value}</p>
    </div>
  );
}

export default function LitterDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { litters = [], kittens = [] } = useStore();

  const lit = litters.find((l) => l.id === id);
  const nestKittens = kittens.filter((k) => k.litter_id === id && !k.is_own_breeding_cat);

  if (litters.length === 0) {
    return <p className="text-forest-700">Nestje laden…</p>;
  }

  if (!lit) {
    return (
      <div className="space-y-4">
        <p className="text-forest-700">Dit nestje bestaat niet (meer).</p>
        <Link href="/admin/litters" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">← Terug naar nestjes-overzicht</Link>
      </div>
    );
  }

  const statusLabel = LITTER_STATUSES[norm(lit.status)] || lit.status;
  const available = nestKittens.filter((k) => norm(k.status) === 'beschikbaar').length;

  return (
    <div className="pb-16">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/admin/litters" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">← Alle nestjes</Link>
      </div>

      {/* Mooi overzicht bovenaan */}
      <Card className="mb-8 overflow-hidden p-0">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center">
          {lit.cover_image_url ? (
            <img src={lit.cover_image_url} alt={lit.name} className="h-40 w-full shrink-0 rounded-2xl object-cover shadow md:h-40 md:w-56" />
          ) : (
            <div className="flex h-40 w-full shrink-0 items-center justify-center rounded-2xl border border-dashed border-forest-900/20 bg-forest-50 text-forest-300 md:w-56">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-10 w-10"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>
            </div>
          )}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl text-forest-950">{lit.name}</h1>
              {statusLabel && <span className="rounded-full bg-brass-100 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-brass-700">{statusLabel}</span>}
            </div>
            <p className="mt-2 text-sm text-forest-700">
              {lit.sire_name || 'Onbekende vader'} x {lit.dam_name || 'Onbekende moeder'}
              <span className="mx-2 opacity-50">|</span>
              {lit.date_of_birth ? new Date(lit.date_of_birth).toLocaleDateString('nl-NL') : 'Datum onbekend'}
            </p>
            {lit.description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-forest-700/90">{lit.description}</p>}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Ras" value={lit.breed || 'Maine Coon (MCO)'} />
              <Stat label="Aantal kittens" value={nestKittens.length} />
              <Stat label="Beschikbaar" value={available} />
              <Stat label="Geboortedatum" value={lit.date_of_birth ? new Date(lit.date_of_birth).toLocaleDateString('nl-NL') : '—'} />
            </div>
          </div>
        </div>

        {/* Kittens in dit nestje met snelle toegang tot dossiers */}
        <div className="border-t border-forest-900/10 p-6">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-forest-700">Kittens in dit nestje</h2>
          {nestKittens.length === 0 ? (
            <p className="text-sm italic text-forest-600">Nog geen kittens gekoppeld. Voeg ze hieronder toe in de editor.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {nestKittens.map((k) => (
                <Link
                  key={k.id}
                  href={`/admin/cats/${k.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-forest-900/10 bg-white p-3 transition hover:border-brass-400/60 hover:shadow-md"
                >
                  {k.cover_image ? (
                    <img src={k.cover_image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="h-12 w-12 shrink-0 rounded-lg border border-forest-100 bg-forest-50" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-forest-900">{k.name || 'Naamloos'}</p>
                    <p className="truncate text-xs text-forest-600">
                      {[k.gender || k.sex, k.color, k.pattern].filter(Boolean).join(' · ') || 'Geen details'}
                    </p>
                    <span className="mt-1 inline-block text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                      {KITTEN_STATUSES[norm(k.status)] || k.status || '—'} · Open dossier →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Volledige editor om alles aan te passen */}
      <LitterEditor initialLitterId={id} onClose={() => router.push('/admin/litters')} />
    </div>
  );
}
