'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useStore } from '@/context/StoreContext';
import { PawMark, SectionLabel } from '@/components/ui';

// Standard fallback data
const fallbackSlides = [
  {
    image: '/images/litter_terrace.png',
    title: 'Een oase van rust & pure liefde',
    subtitle: 'Wendy\'s Dream',
    text: '',
  },
  {
    image: '/images/kittens_basket.png',
    title: 'Gezondheid en harmonie voorop',
    subtitle: 'Exclusieve Nestjes',
    text: 'Al onze kittens worden geboren en gesocialiseerd in een huiselijke oase, met een sterke focus op karakter en vitaliteit.',
  },
  {
    image: '/images/adult_regal.png',
    title: 'Majestueuze genen en stamboom',
    subtitle: 'Gecertificeerde Cattery',
    text: 'Onze ouderdieren zijn volledig getest op HCM, SMA en PKDef. Wij fokken uitsluitend met liefde en volgens de hoogste normen.',
  },
];

const growthImages = [
  '/images/mother_kittens.png',
  '/images/kitten_sleepy.png',
  '/images/kitten_playful.png',
  '/images/kitten_curious.png',
  '/images/litter_terrace.png',
  '/images/junior_garden.png',
  '/images/junior_window.png',
  '/images/adult_regal.png',
  '/images/adult_fluffy.png',
  '/images/adult_smoke.png',
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('oorsprong');
  const { t, mounted } = useLanguage();
  const { siteContent } = useStore();

  // Hero-dia's: als de beheerder ze in de editor heeft aangepast, gebruiken we die
  // exact (inclusief bewust verwijderde foto's). Anders de standaard-dia's.
  const hasCmsSlides = Array.isArray(siteContent?.hero_slides);
  const slides = hasCmsSlides
    ? siteContent.hero_slides
    : (mounted ? t('hero_slides').map((s, i) => ({ ...s, image: fallbackSlides[i]?.image })) : fallbackSlides);
  const heroHidden = siteContent?.hero_hidden || slides.length === 0;

  // Autoplay hero slider
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const safeIndex = slides.length ? currentSlide % slides.length : 0;
  const currentSlideData = slides[safeIndex] || slides[0] || {};

  // Tijdlijn-fases: bij CMS-content gebruiken we het beeld exact zoals ingesteld
  // (leeg = bewust geen foto). Zonder CMS vallen we terug op de standaard-foto's.
  const hasCmsStages = Array.isArray(siteContent?.timeline_stages);
  const stages = hasCmsStages
    ? siteContent.timeline_stages
    : (mounted ? t('timeline_stages').map((s, idx) => ({ ...s, image: growthImages[idx] || '/images/litter_terrace.png' })) : []);
  const introHidden = siteContent?.intro_hidden || false;
  const timelineHidden = siteContent?.timeline_hidden || stages.length === 0;

  const tCMS = (key) => {
    if (siteContent && siteContent[key]) return siteContent[key];
    return mounted ? t(key) : '';
  };

  return (
    <div className="overflow-x-hidden">
      {/* 1. HERO SLIDER - Split Grid magazine layout (Images 100% visible, no overlay block) */}
      {!heroHidden && (() => {
        const anyHeroImage = slides.some((s) => s.image);
        return (
        <section className={`relative mx-auto max-w-7xl px-6 pt-10 pb-20 md:py-24 grid gap-12 items-center ${anyHeroImage ? 'md:grid-cols-[1.1fr_0.9fr]' : 'md:grid-cols-1 text-center'}`}>
          <div className={`animate-fade-up space-y-6 ${anyHeroImage ? '' : 'mx-auto max-w-2xl'}`}>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-600">
              {currentSlideData.subtitle || tCMS('logo_subtext') || 'Maine Coon Cattery'}
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-light text-ink leading-[1.15] whitespace-pre-line">
              {currentSlideData.title}
            </h1>
            <p className={`text-sm md:text-lg text-ink/80 font-light leading-relaxed whitespace-pre-line ${anyHeroImage ? 'max-w-md' : 'max-w-xl mx-auto'}`}>
              {currentSlideData.text}
            </p>
            <div className={`pt-4 flex flex-wrap gap-4 ${anyHeroImage ? '' : 'justify-center'}`}>
              <Link
                href="/login"
                className="rounded-full bg-terracotta-500 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-cream-50 shadow-soft transition hover:bg-terracotta-600 hover:shadow-glow"
              >
                {mounted ? t('hero_available_btn') : 'Bekijk Beschikbare Kittens'}
              </Link>
              <a
                href="#geschiedenis"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-800 transition hover:text-terracotta-500 py-3.5"
              >
                {mounted ? t('hero_discover_btn') : 'Ontdek het Ras'} <span aria-hidden>→</span>
              </a>
            </div>

            {/* Dots below the text for pagination */}
            {slides.length > 1 && (
              <div className={`flex gap-2.5 pt-6 ${anyHeroImage ? '' : 'justify-center'}`}>
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    aria-label={`Dia ${idx + 1}`}
                    className={`h-2 transition-all duration-300 rounded-full ${
                      idx === safeIndex ? 'w-8 bg-terracotta-500' : 'w-2.5 bg-terracotta-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right side: slider image (alleen tonen als er dia's met foto zijn) */}
          {anyHeroImage && (
            <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-lux bg-cream-200 md:-translate-y-8 lg:-translate-y-12 xl:-translate-y-16">
              {slides.map((slide, idx) => (
                slide.image ? (
                  <img
                    key={idx}
                    src={slide.image}
                    alt={slide.title || ''}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out transform ${
                      idx === safeIndex ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-105 z-0'
                    }`}
                  />
                ) : (
                  <div
                    key={idx}
                    className={`absolute inset-0 w-full h-full bg-gradient-to-br from-sand-200 via-cream-200 to-terracotta-100 transition-opacity duration-1000 ${
                      idx === safeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  />
                )
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/10 to-transparent z-20 pointer-events-none" />
            </div>
          )}
        </section>
        );
      })()}

      {/* 2. OVER WENDY'S DREAM (Ibiza Oase) */}
      {!introHidden && (
      <section className="relative py-20 px-6 md:py-28 bg-sand-100/50 mx-4 md:mx-8 rounded-[3rem] my-12">
        <div className="mx-auto max-w-5xl text-center">
          <SectionLabel>{tCMS('intro_label') || "Wendy's Dream"}</SectionLabel>
          <h2 className="mt-6 font-display text-4xl md:text-5xl lg:text-6xl font-light text-ink whitespace-pre-line">
            {tCMS('intro_title') || 'Thuiskomen in een wereld van pure liefde'}
          </h2>
          <p className="mt-8 mx-auto max-w-3xl text-base md:text-lg font-light leading-relaxed text-ink/80 whitespace-pre-line">
            {tCMS('intro_text') || 'Wendy\'s Dream is ontstaan uit een diepgewortelde passie voor de majestueuze Maine Coon.'}
          </p>
          <div className="mt-12 inline-flex items-center gap-2 text-sm font-semibold tracking-wider text-terracotta-600 uppercase">
            <PawMark className="h-5 w-5" />
            <span>{tCMS('intro_tested') || 'Ouders getest op HCM · SMA · PKDef'}</span>
          </div>
        </div>
      </section>
      )}

      {/* 3. INTERACTIEVE MAGAZINE SECTIE (Geschiedenis & Kenmerken) */}
      <section id="geschiedenis" className="relative py-20 px-6 bg-terracotta-50/60 rounded-[3rem] mx-4 md:mx-8 my-12 border border-terracotta-900/5 shadow-soft">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] items-center">
            
            {/* Left Column: Asymmetric Image Spread */}
            <div className="relative space-y-6 animate-fade-in">
              <div className="relative rounded-[2.5rem] overflow-hidden aspect-square md:aspect-[4/5] shadow-lux">
                <img
                  src="/images/litter_terrace.png"
                  alt="Maine Coon kittens"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-6 hidden sm:block w-48 aspect-square rounded-[2rem] overflow-hidden border-4 border-cream-50 shadow-soft">
                <img
                  src="/images/kitten_curious.png"
                  alt="Silver tabby Maine coon kitten"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right Column: Tabbed Magazine Article */}
            <div className="flex flex-col justify-center">
              <SectionLabel>{mounted ? t('breed_label') : 'Ontdek het ras'}</SectionLabel>
              <h2 className="mt-4 font-display text-3xl md:text-4xl lg:text-5xl font-light text-ink leading-tight">
                {mounted ? t('breed_title') : 'De mystiek achter de Zachte Reus'}
              </h2>

              {/* Tabs Navigation */}
              <div className="mt-8 flex flex-wrap border-b border-terracotta-900/10 gap-x-4 md:gap-x-6 gap-y-4">
                {[
                  { id: 'oorsprong', label: mounted ? t('breed_tab_oorsprong') : 'Oorsprong' },
                  { id: 'karakter', label: mounted ? t('breed_tab_karakter') : 'Karakter' },
                  { id: 'uiterlijk', label: mounted ? t('breed_tab_uiterlijk') : 'Uiterlijk & Verzorging' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-4 text-xs font-semibold uppercase tracking-wider transition-all relative ${
                      activeTab === tab.id ? 'text-terracotta-600' : 'text-ink/65 hover:text-ink'
                    }`}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-terracotta-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tabs Content */}
              <div className="mt-8 min-h-[250px] transition-all duration-500">
                {activeTab === 'oorsprong' && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="font-display text-2xl text-ink font-light">
                      {mounted ? t('breed_origins_title') : 'Van de koude wouden van Maine'}
                    </h3>
                    <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                      {mounted ? t('breed_origins_p1') : '...'}
                    </p>
                    <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                      {mounted ? t('breed_origins_p2') : '...'}
                    </p>
                  </div>
                )}

                {activeTab === 'karakter' && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="font-display text-2xl text-ink font-light">
                      {mounted ? t('breed_character_title') : 'De zachtaardige clown'}
                    </h3>
                    <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                      {mounted ? t('breed_character_p1') : '...'}
                    </p>
                    <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                      {mounted ? t('breed_character_p2') : '...'}
                    </p>
                  </div>
                )}

                {activeTab === 'uiterlijk' && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="font-display text-2xl text-ink font-light">
                      {mounted ? t('breed_appearance_title') : 'Robuust, weelderig en gezond'}
                    </h3>
                    <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                      {mounted ? t('breed_appearance_p1') : '...'}
                    </p>
                    <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                      {mounted ? t('breed_appearance_p2') : '...'}
                    </p>
                    <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                      {mounted ? t('breed_appearance_p3') : '...'}
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. VISUELE TIMELINE / PORTFOLIO (Van Kitten tot Reus) */}
      {!timelineHidden && (
      <section id="verhaal" className="relative py-20 px-6 md:py-28 bg-beige-100/50 mx-4 md:mx-8 rounded-[3rem] my-12">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionLabel>{tCMS('timeline_label') || 'Fotodagboek & Groeicyclus'}</SectionLabel>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-light text-ink">
              {tCMS('timeline_title') || 'Van Kitten tot Majestueuze Reus'}
            </h2>
            <p className="mt-4 text-sm md:text-base font-light text-ink/75 leading-relaxed whitespace-pre-line">
              {tCMS('timeline_desc') || 'Volg de fascinerende ontwikkeling van onze Maine Coons.'}
            </p>
          </div>

          {/* Timeline Layout */}
          <div className="space-y-16">
            {stages.map((stage, idx) => {
              const hasImage = !!stage.image;
              return (
              <div
                key={idx}
                className={`flex flex-col gap-10 items-center ${
                  hasImage ? (idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row') : ''
                }`}
              >
                {/* Image Frame with Magazine aesthetic (alleen als er een foto is) */}
                {hasImage && (
                  <div className="w-full md:w-1/2">
                    <div className="group relative overflow-hidden rounded-[2rem] shadow-soft bg-cream-50 border border-terracotta-900/5 transition duration-500 hover:shadow-lux">
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 z-10" />
                      <img
                        src={stage.image}
                        alt={stage.title}
                        className="w-full aspect-[4/3] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      {stage.age && (
                        <div className="absolute top-4 left-4 z-20 bg-cream-50/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-terracotta-700">
                          {stage.age}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Text Content */}
                <div className={`w-full space-y-4 px-4 ${hasImage ? 'md:w-1/2' : 'md:max-w-3xl md:mx-auto text-center'}`}>
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta-500">
                    {stage.stage}{!hasImage && stage.age ? ` · ${stage.age}` : ''}
                  </span>
                  <h3 className="font-display text-3xl font-light text-ink">
                    {stage.title}
                  </h3>
                  <p className="text-sm md:text-base font-light leading-relaxed text-ink/80 whitespace-pre-line">
                    {stage.desc}
                  </p>
                  <div className={`pt-2 ${hasImage ? '' : 'flex justify-center'}`}>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta-600 uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-terracotta-500" />
                      {mounted ? t('timeline_standard') : 'Wendy\'s Dream Standaard'}
                    </span>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* 5. CTA PORTAL ACCESS */}
      <section id="contact" className="mx-auto py-20 px-6 max-w-7xl">
        <div className="relative overflow-hidden rounded-[3rem] bg-ink px-8 py-16 text-center shadow-lux md:px-16 md:py-24">
          <div className="absolute inset-0 bg-grain opacity-20" />
          <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-terracotta-500/10 blur-3xl" />
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sand-500/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex justify-center text-terracotta-400 mb-6">
              <PawMark className="h-8 w-8" />
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-light text-cream-50 leading-tight">
              {tCMS('portal_cta_title') || 'Krijg toegang tot ons digitaal nest-portaal'}
            </h2>
            <p className="mt-6 text-sm md:text-base text-cream-100/70 font-light leading-relaxed whitespace-pre-line">
              {tCMS('portal_cta_desc') || 'Bent u geïnteresseerd in een van onze kittens?'}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="rounded-full bg-terracotta-500 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-cream-50 shadow-soft transition hover:bg-terracotta-600 hover:shadow-glow"
              >
                {mounted ? t('portal_cta_login') : 'Inloggen Exclusieve Toegang'}
              </Link>
              <a
                href="https://wa.me/31645070868?text=Hallo%20Willem%2C%20ik%20heb%20interesse%20in%20een%20Maine%20Coon%20kitten%20van%20Wendy's%20Dream."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-cream-100/30 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-cream-100 transition hover:bg-cream-100/10"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {mounted ? t('portal_cta_contact') : 'Contact Opnemen'}
              </a>
            </div>
            <p className="mt-4 text-xs text-cream-100/40">
              {mounted ? t('portal_cta_sub') : 'Uitsluitend voor goedgekeurde liefhebbers.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
