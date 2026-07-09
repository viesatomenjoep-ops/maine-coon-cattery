'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { PawMark, SectionLabel } from '@/components/ui';

// Openbare, volledig content-gestuurde cattery-website. Nieuwe catteries starten
// blanco; via de website-editor (dezelfde structuur als Willem) vullen ze foto's
// en teksten aan, die hier direct verschijnen.
export default function CatterySitePage({ params }) {
  const { token: slug } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/public/site?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) { setError(true); setLoading(false); return; }
        setData(await res.json());
      } catch { setError(true); }
      setLoading(false);
    }
    load();
  }, [slug]);

  const c = data?.content || {};
  const slides = Array.isArray(c.hero_slides) ? c.hero_slides : [];
  const heroHidden = c.hero_hidden || slides.length === 0;
  const stages = Array.isArray(c.timeline_stages) ? c.timeline_stages : [];
  const timelineHidden = c.timeline_hidden || stages.length === 0;
  const introHidden = c.intro_hidden || (!c.intro_title && !c.intro_text);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (loading) return <div className="grid min-h-screen place-items-center bg-cream-50 text-forest-700">De website wordt geladen…</div>;
  if (error || !data) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-50">
        <div className="max-w-md px-6 text-center">
          <PawMark className="mx-auto mb-4 h-10 w-10 text-terracotta-400" />
          <h1 className="mb-3 font-display text-3xl text-ink">Cattery niet gevonden</h1>
          <p className="text-ink/70">Deze website bestaat niet of is verplaatst.</p>
        </div>
      </div>
    );
  }

  const tenant = data.tenant;
  const safe = slides.length ? current % slides.length : 0;
  const slide = slides[safe] || {};
  const anyHeroImage = slides.some((s) => s.image);
  const isBlank = heroHidden && introHidden && timelineHidden;

  return (
    <div className="min-h-screen overflow-x-hidden bg-cream-50">
      <header className="flex items-center justify-between border-b border-ink/10 bg-white/80 px-6 py-5 backdrop-blur">
        <span className="font-display text-xl font-semibold text-ink">{tenant.name}</span>
        <Link href="/login" className="rounded-full bg-terracotta-500 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-cream-50 transition hover:bg-terracotta-600">Inloggen</Link>
      </header>

      {/* Blanco-staat voor een nieuwe cattery */}
      {isBlank && (
        <section className="mx-auto max-w-2xl px-6 py-32 text-center">
          <PawMark className="mx-auto mb-6 h-12 w-12 text-terracotta-300" />
          <h1 className="font-display text-4xl font-light text-ink md:text-5xl">Welkom bij {tenant.name}</h1>
          <p className="mt-4 text-ink/70">Deze cattery bouwt haar website nog op. Kom binnenkort terug voor onze nestjes en kittens.</p>
        </section>
      )}

      {/* 1. HERO */}
      {!heroHidden && (
        <section className={`relative mx-auto max-w-7xl grid items-center gap-12 px-6 pt-10 pb-20 md:py-24 ${anyHeroImage ? 'md:grid-cols-[1.1fr_0.9fr]' : 'md:grid-cols-1 text-center'}`}>
          <div className={`space-y-6 ${anyHeroImage ? '' : 'mx-auto max-w-2xl'}`}>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-600">{slide.subtitle || tenant.name}</span>
            <h1 className="whitespace-pre-line font-display text-4xl font-light leading-[1.15] text-ink md:text-6xl">{slide.title || ''}</h1>
            <p className={`whitespace-pre-line font-light leading-relaxed text-ink/80 md:text-lg ${anyHeroImage ? 'max-w-md' : 'mx-auto max-w-xl'}`}>{slide.text || ''}</p>
            {slides.length > 1 && (
              <div className={`flex gap-2.5 pt-6 ${anyHeroImage ? '' : 'justify-center'}`}>
                {slides.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrent(idx)} aria-label={`Dia ${idx + 1}`} className={`h-2 rounded-full transition-all duration-300 ${idx === safe ? 'w-8 bg-terracotta-500' : 'w-2.5 bg-terracotta-300'}`} />
                ))}
              </div>
            )}
          </div>
          {anyHeroImage && (
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-cream-200 shadow-lux">
              {slides.map((s, idx) => (
                s.image ? (
                  <img key={idx} src={s.image} alt={s.title || ''} className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${idx === safe ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} />
                ) : null
              ))}
            </div>
          )}
        </section>
      )}

      {/* 2. INTRO */}
      {!introHidden && (
        <section className="relative mx-4 my-12 rounded-[3rem] bg-sand-100/50 px-6 py-20 md:mx-8 md:py-28">
          <div className="mx-auto max-w-5xl text-center">
            {c.intro_label && <SectionLabel>{c.intro_label}</SectionLabel>}
            <h2 className="mt-6 whitespace-pre-line font-display text-4xl font-light text-ink md:text-5xl">{c.intro_title || ''}</h2>
            <p className="mt-8 mx-auto max-w-3xl whitespace-pre-line text-base font-light leading-relaxed text-ink/80 md:text-lg">{c.intro_text || ''}</p>
            {c.intro_tested && (
              <div className="mt-12 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-terracotta-600">
                <PawMark className="h-5 w-5" /><span>{c.intro_tested}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. TIJDLIJN */}
      {!timelineHidden && (
        <section className="relative mx-4 my-12 rounded-[3rem] bg-beige-100/50 px-6 py-20 md:mx-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              {c.timeline_label && <SectionLabel>{c.timeline_label}</SectionLabel>}
              <h2 className="mt-4 font-display text-4xl font-light text-ink md:text-5xl">{c.timeline_title || ''}</h2>
              <p className="mt-4 whitespace-pre-line text-sm font-light leading-relaxed text-ink/75 md:text-base">{c.timeline_desc || ''}</p>
            </div>
            <div className="space-y-16">
              {stages.map((stage, idx) => {
                const hasImage = !!stage.image;
                return (
                  <div key={idx} className={`flex flex-col items-center gap-10 ${hasImage ? (idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row') : ''}`}>
                    {hasImage && (
                      <div className="w-full md:w-1/2">
                        <div className="relative overflow-hidden rounded-[2rem] border border-terracotta-900/5 bg-cream-50 shadow-soft">
                          <img src={stage.image} alt={stage.title || ''} className="aspect-[4/3] w-full object-cover" />
                          {stage.age && <div className="absolute left-4 top-4 rounded-full bg-cream-50/90 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-terracotta-700 backdrop-blur-sm">{stage.age}</div>}
                        </div>
                      </div>
                    )}
                    <div className={`w-full space-y-4 px-4 ${hasImage ? 'md:w-1/2' : 'text-center md:mx-auto md:max-w-3xl'}`}>
                      {stage.stage && <span className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta-500">{stage.stage}{!hasImage && stage.age ? ` · ${stage.age}` : ''}</span>}
                      <h3 className="font-display text-3xl font-light text-ink">{stage.title || ''}</h3>
                      <p className="whitespace-pre-line text-sm font-light leading-relaxed text-ink/80 md:text-base">{stage.desc || ''}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. CTA */}
      {(c.portal_cta_title || c.portal_cta_desc) && (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="relative overflow-hidden rounded-[3rem] bg-ink px-8 py-16 text-center shadow-lux md:px-16 md:py-24">
            <div className="relative z-10 mx-auto max-w-2xl">
              <span className="mb-6 inline-flex justify-center text-terracotta-400"><PawMark className="h-8 w-8" /></span>
              <h2 className="font-display text-4xl font-light leading-tight text-cream-50 md:text-5xl">{c.portal_cta_title || ''}</h2>
              <p className="mt-6 whitespace-pre-line text-sm font-light leading-relaxed text-cream-100/70 md:text-base">{c.portal_cta_desc || ''}</p>
              <div className="mt-10">
                <Link href="/login" className="rounded-full bg-terracotta-500 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-cream-50 transition hover:bg-terracotta-600">Inloggen</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="border-t border-ink/10 py-8 text-center text-xs text-ink/40">© {tenant.name}</footer>
    </div>
  );
}
