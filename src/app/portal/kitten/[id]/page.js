'use client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getKitten, getLitter, getParent } from '@/data/mock';
import { StatusPill, SectionLabel, ImageSlot } from '@/components/ui';
import WeightCurve from '@/components/WeightCurve';

const eur = (n) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const fmt = (iso) => new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

const PHASES = ['Beschikbaar', 'Gereserveerd', 'Verkocht'];

function GeneRow({ label, value }) {
  const ok = value?.toLowerCase().includes('negatief');
  return (
    <div className="flex items-center justify-between border-b border-forest-900/8 py-2.5 last:border-0">
      <span className="text-sm text-forest-700">{label}</span>
      <span className={`pill ${ok ? 'pill-available' : 'pill-reserved'}`}>{value}</span>
    </div>
  );
}

export default function KittenDossier() {
  const { id } = useParams();
  const k = getKitten(id);
  if (!k) return <p className="text-forest-700">Kitten niet gevonden. <Link href="/portal" className="text-brass-600 underline">Terug</Link></p>;

  const litter = getLitter(k.litter_id);
  const sire = getParent(litter?.sire_id);
  const dam = getParent(litter?.dam_id);
  const phaseIdx = PHASES.indexOf(k.status);

  return (
    <div>
      <Link href="/portal" className="text-sm text-forest-600 transition hover:text-brass-600">← Alle kittens</Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        {/* gallery + identity */}
        <div>
          <ImageSlot label={k.name} ratio="aspect-square" className="shadow-lux" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            {['Profiel', 'Spelen', 'Vacht'].map((l) => (
              <ImageSlot key={l} label={l} ratio="aspect-square" className="shadow-soft" />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <StatusPill status={k.status} />
            <span className="text-xs uppercase tracking-wide text-forest-600/60">Nest {litter?.name}</span>
          </div>
          <h1 className="mt-4 font-display text-5xl text-forest-950">{k.name}</h1>
          <p className="mt-2 text-lg text-forest-700/80">{k.sex} · {k.color} · {k.pattern}</p>
          <p className="mt-6 font-display text-3xl text-brass-700">{eur(k.price)}</p>

          {/* purchase phase tracker */}
          <div className="mt-8">
            <SectionLabel>Aankoopproces</SectionLabel>
            <div className="mt-4 flex items-center gap-2">
              {PHASES.map((p, i) => (
                <div key={p} className="flex flex-1 flex-col items-center">
                  <div className={`h-2 w-full rounded-full ${i <= phaseIdx ? 'bg-brass-400' : 'bg-forest-900/10'}`} />
                  <span className={`mt-2 text-xs ${i === phaseIdx ? 'font-semibold text-brass-700' : 'text-forest-600/60'}`}>{p}</span>
                </div>
              ))}
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-forest-900/10 bg-cream-50 p-6">
            <div><dt className="text-xs uppercase tracking-wide text-forest-600/60">Geboortedatum</dt><dd className="mt-1 text-forest-900">{fmt(k.born)}</dd></div>
            <div><dt className="text-xs uppercase tracking-wide text-forest-600/60">Chipnummer</dt><dd className="mt-1 font-mono text-sm text-forest-900">{k.chip}</dd></div>
            <div><dt className="text-xs uppercase tracking-wide text-forest-600/60">Geslacht</dt><dd className="mt-1 text-forest-900">{k.sex}</dd></div>
            <div><dt className="text-xs uppercase tracking-wide text-forest-600/60">Kleurslag</dt><dd className="mt-1 text-forest-900">{k.color}</dd></div>
          </dl>
        </div>
      </div>

      {/* weight curve */}
      <section className="mt-16">
        <SectionLabel>Gewichtscurve</SectionLabel>
        <h2 className="mt-4 font-display text-3xl text-forest-950">Groei sinds de geboorte</h2>
        <div className="mt-6 rounded-3xl border border-forest-900/10 bg-cream-50 p-6 shadow-soft">
          <WeightCurve weights={k.weights} />
        </div>
      </section>

      {/* medical + pedigree */}
      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        <section>
          <SectionLabel>Medisch dossier</SectionLabel>
          <h2 className="mt-4 font-display text-3xl text-forest-950">Gezondheid</h2>
          <div className="mt-6 space-y-3">
            {k.medical.map((m, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl border border-forest-900/10 bg-cream-50 p-4">
                <span className="mt-0.5 rounded-full bg-forest-100 px-2.5 py-1 text-xs font-medium text-forest-700">{m.type}</span>
                <div>
                  <p className="text-sm text-forest-900">{m.note}</p>
                  <p className="text-xs text-forest-600/70">{fmt(m.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>Stamboom & genetica ouders</SectionLabel>
          <h2 className="mt-4 font-display text-3xl text-forest-950">Afstamming</h2>
          <div className="mt-6 space-y-4">
            {[sire, dam].filter(Boolean).map((par) => (
              <div key={par.id} className="rounded-2xl border border-forest-900/10 bg-cream-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-xl text-forest-900">{par.name}</p>
                    <p className="text-xs text-forest-600/70">{par.role} · {par.color} · {par.titles}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <GeneRow label="HCM (hartziekte)" value={par.hcm} />
                  <GeneRow label="SMA (spierziekte)" value={par.sma} />
                  <GeneRow label="PKDef (bloed)" value={par.pkdef} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
