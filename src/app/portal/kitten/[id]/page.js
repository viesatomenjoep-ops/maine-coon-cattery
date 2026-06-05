'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getKitten, getLitter, getParent } from '@/data/mock';
import { StatusPill, SectionLabel } from '@/components/ui';
import WeightCurve from '@/components/WeightCurve';
import { useLanguage } from '@/context/LanguageContext';

const eur = (n) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);

const fmt = (iso) =>
  new Date(iso).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

function GeneRow({ label, value }) {
  const ok = value?.toLowerCase().includes('negatief');
  return (
    <div className="flex items-center justify-between border-b border-terracotta-900/10 py-2.5 last:border-0">
      <span className="text-sm text-ink">{label}</span>
      <span className={`pill ${ok ? 'pill-available' : 'pill-reserved'}`}>{value}</span>
    </div>
  );
}

export default function KittenDossier() {
  const { id } = useParams();
  const k = getKitten(id);
  const { t, mounted } = useLanguage();

  if (!k) {
    return (
      <p className="text-ink p-8">
        {mounted ? t('dossier_not_found') : 'Kitten niet gevonden.'}{' '}
        <Link href="/portal" className="text-terracotta-600 underline">
          Terug
        </Link>
      </p>
    );
  }

  const litter = getLitter(k.litter_id);
  const sire = getParent(litter?.sire_id);
  const dam = getParent(litter?.dam_id);

  const PHASES = ['Beschikbaar', 'Gereserveerd', 'Verkocht'];
  const phaseIdx = PHASES.indexOf(k.status);

  // Gallery images mapping
  const primaryImage = `/images/kitten_${k.name.toLowerCase()}.png`;
  const thumbnails = [
    '/images/kitten_playful.png',
    '/images/kitten_sleepy.png',
    '/images/kitten_curious.png',
  ];

  return (
    <div className="w-full">
      <Link
        href="/portal"
        className="text-sm font-semibold text-terracotta-600 transition hover:text-terracotta-500"
      >
        {mounted ? t('dossier_back') : '← Alle kittens'}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        {/* gallery + identity */}
        <div>
          <div className="overflow-hidden rounded-[2rem] shadow-lux border border-terracotta-900/10 bg-cream-50 aspect-square">
            <img
              src={primaryImage}
              alt={k.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {thumbnails.map((imgSrc, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl shadow-soft border border-terracotta-900/5 bg-cream-50 aspect-square cursor-pointer hover:border-terracotta-500/40 transition"
              >
                <img
                  src={imgSrc}
                  alt={`Detail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <StatusPill status={k.status} />
            <span className="text-xs uppercase tracking-wider font-semibold text-terracotta-500">
              {mounted ? t('portal_litter') : 'Nest'} {litter?.name}
            </span>
          </div>
          <h1 className="mt-4 font-display text-5xl text-ink font-light">{k.name}</h1>
          <p className="mt-2 text-lg text-ink/75 font-light">
            {k.sex} · {k.color} · {k.pattern}
          </p>
          <p className="mt-6 font-display text-3xl font-semibold text-terracotta-600">
            {eur(k.price)}
          </p>

          {/* purchase phase tracker */}
          <div className="mt-8">
            <SectionLabel>{mounted ? t('dossier_process') : 'Aankoopproces'}</SectionLabel>
            <div className="mt-4 flex items-center gap-2">
              {PHASES.map((p, i) => (
                <div key={p} className="flex flex-1 flex-col items-center">
                  <div
                    className={`h-2 w-full rounded-full ${
                      i <= phaseIdx ? 'bg-terracotta-500' : 'bg-terracotta-900/10'
                    }`}
                  />
                  <span
                    className={`mt-2 text-xs font-semibold ${
                      i === phaseIdx ? 'text-terracotta-600' : 'text-ink/40'
                    }`}
                  >
                    {p}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-[2rem] border border-terracotta-900/10 bg-cream-50 p-6 shadow-soft">
            <div>
              <dt className="text-xs uppercase tracking-wider font-semibold text-terracotta-500">
                {mounted ? t('dossier_born') : 'Geboortedatum'}
              </dt>
              <dd className="mt-1 text-ink font-light">{fmt(k.born)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider font-semibold text-terracotta-500">
                {mounted ? t('dossier_chip') : 'Chipnummer'}
              </dt>
              <dd className="mt-1 font-mono text-sm text-ink font-light">{k.chip}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider font-semibold text-terracotta-500">
                {mounted ? t('dossier_sex') : 'Geslacht'}
              </dt>
              <dd className="mt-1 text-ink font-light">{k.sex}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider font-semibold text-terracotta-500">
                {mounted ? t('dossier_color') : 'Kleurslag'}
              </dt>
              <dd className="mt-1 text-ink font-light">{k.color}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* weight curve */}
      <section className="mt-16">
        <SectionLabel>{mounted ? t('dossier_growth') : 'Groei sinds de geboorte'}</SectionLabel>
        <h2 className="mt-4 font-display text-3xl text-ink font-light">
          {mounted ? t('dossier_growth') : 'Groei sinds de geboorte'}
        </h2>
        <div className="mt-6 rounded-[2rem] border border-terracotta-900/10 bg-cream-50 p-6 shadow-soft">
          <WeightCurve weights={k.weights} />
        </div>
      </section>

      {/* medical + pedigree */}
      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        <section>
          <SectionLabel>{mounted ? t('dossier_medical') : 'Medisch dossier'}</SectionLabel>
          <h2 className="mt-4 font-display text-3xl text-ink font-light">
            {mounted ? t('dossier_health') : 'Gezondheid'}
          </h2>
          <div className="mt-6 space-y-3">
            {k.medical.map((m, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-[2rem] border border-terracotta-900/10 bg-cream-50 p-5 shadow-soft"
              >
                <span className="mt-0.5 rounded-full bg-terracotta-100 px-3 py-1 text-xs font-semibold text-terracotta-800 uppercase">
                  {m.type}
                </span>
                <div>
                  <p className="text-base text-ink font-light leading-relaxed">{m.note}</p>
                  <p className="text-xs text-ink/50 mt-1 font-light">{fmt(m.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <SectionLabel>{mounted ? t('dossier_pedigree') : 'Stamboom & genetica'}</SectionLabel>
          <h2 className="mt-4 font-display text-3xl text-ink font-light">
            {mounted ? t('dossier_ancestry') : 'Afstamming'}
          </h2>
          <div className="mt-6 space-y-4">
            {[sire, dam].filter(Boolean).map((par) => (
              <div
                key={par.id}
                className="rounded-[2rem] border border-terracotta-900/10 bg-cream-50 p-6 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-2xl text-ink font-light">{par.name}</p>
                    <p className="text-xs text-terracotta-650 font-semibold uppercase mt-1 tracking-wider">
                      {par.role} · {par.color} · {par.titles}
                    </p>
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
