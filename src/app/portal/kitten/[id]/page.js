'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { StatusPill, SectionLabel } from '@/components/ui';
import WeightCurve from '@/components/WeightCurve';
import { useLanguage } from '@/context/LanguageContext';

const eur = (n) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n || 0);

const fmt = (iso) => {
  if (!iso) return 'Onbekend';
  return new Date(iso).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

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
  const [k, setK] = useState(null);
  const [litter, setLitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, mounted } = useLanguage();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/public/kitten?id=${encodeURIComponent(id)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.cat) setK(json.cat);
          if (json.litter) setLitter(json.litter);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-ink/50">Laden...</div>;
  }

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

  const sire = { name: litter?.sire_name, role: 'Vader', color: 'Onbekend', titles: '', hcm: 'Negatief', sma: 'Negatief', pkdef: 'Negatief' };
  const dam = { name: litter?.dam_name, role: 'Moeder', color: 'Onbekend', titles: '', hcm: 'Negatief', sma: 'Negatief', pkdef: 'Negatief' };

  const PHASES = ['beschikbaar', 'gereserveerd', 'verkocht', 'evaluatie'];
  const phaseIdx = PHASES.indexOf(k.status?.toLowerCase() || 'beschikbaar');

  // Gallery images mapping
  const primaryImage = k.cover_image || `/images/kitten_${k.name.toLowerCase()}.png`;
  const thumbnails = [];

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
            {k.gender} · {k.color} · {k.pattern}
          </p>
          <p className="mt-6 font-display text-3xl font-semibold text-terracotta-600">
            {eur(k.price_nl)}
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
              <dd className="mt-1 text-ink font-light">{k.gender}</dd>
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
          <WeightCurve weights={k.weights || []} />
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
            {(k.medical || []).map((m, i) => (
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
            {(!k.medical || k.medical.length === 0) && <p className="text-sm text-ink/50 italic">Nog geen medische gegevens ingevoerd.</p>}
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
