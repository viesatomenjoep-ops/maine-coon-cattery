'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { StatusPill, SectionLabel } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';

const eur = (n) =>
  new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n || 0);

export default function PortalPage() {
  const { t, mounted } = useLanguage();
  const [listed, setListed] = useState([]);
  const [litters, setLitters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/public/browse');
        const json = await res.json();
        if (json.cats) setListed(json.cats);
        if (json.litters) setLitters(json.litters);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-ink/50">Laden...</div>;
  }

  return (
    <div className="w-full">
      <SectionLabel>{mounted ? t('nav_access') : 'Exclusieve Toegang'}</SectionLabel>
      <h1 className="mt-4 font-display text-4xl text-ink md:text-5xl font-light">
        {mounted ? t('portal_title') : 'Beschikbare kittens'}
      </h1>
      <p className="mt-3 max-w-xl text-ink/75 font-light leading-relaxed">
        {mounted ? t('portal_desc') : 'Deze advertentieruimte is uitsluitend zichtbaar voor goedgekeurde kopers.'}
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {listed.map((k) => {
          const litter = litters.find(l => l.id === k.litter_id);
          const imagePath = k.cover_image || `/images/kitten_${k.name.toLowerCase()}.png`;

          return (
            <Link
              key={k.id}
              href={`/portal/kitten/${k.id}`}
              className="lift group block overflow-hidden rounded-[2rem] border border-terracotta-900/10 bg-cream-50 shadow-soft hover:border-terracotta-500/30"
            >
              <div className="relative overflow-hidden aspect-[4/3] bg-cream-100">
                <img
                  src={imagePath}
                  alt={k.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="absolute inset-0 hidden flex-col items-center justify-center bg-gradient-to-tr from-sand-200/50 to-terracotta-200/50 text-terracotta-900/60 p-4">
                  <span className="text-xs uppercase tracking-widest">{k.name}</span>
                </div>
                <div className="absolute left-4 top-4">
                  <StatusPill status={k.status} />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-2xl text-ink font-light">{k.name}</h3>
                  <span className="font-display text-lg font-semibold text-terracotta-600">
                    {eur(k.price_nl)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink/70 font-light">
                  {k.gender || k.sex} · {k.color}
                </p>
                <p className="mt-3 text-xs uppercase tracking-wider text-terracotta-500 font-semibold">
                  {mounted ? t('portal_litter') : 'Nest'}: {litter?.name}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-terracotta-600 transition group-hover:gap-2">
                  {mounted ? t('portal_view') : 'Bekijk dossier'} <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
