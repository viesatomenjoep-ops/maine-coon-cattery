'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SectionLabel, PawMark } from '@/components/ui';

// Hero slides data
const heroSlides = [
  {
    image: '/images/litter_terrace.png',
    title: 'Een oase van rust & pure liefde',
    subtitle: 'Wendy\'s Dream',
    text: 'Bij ons groeien majestueuze zachte reuzen op in een ontspannen Ibiza-sfeer, omringd door warmte en professionele zorg.',
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

// Chronological timeline showcasing the growth of a Maine Coon from newborn to adult
const growthStages = [
  {
    image: '/images/mother_kittens.png',
    stage: 'Fase 1: Geboorte & Nestwarmte',
    age: 'Week 0 - 2',
    title: 'De eerste zachte zonnestralen',
    desc: 'De kittens worden in alle rust geboren in onze werpkist. De eerste twee weken zijn ze volledig afhankelijk van de moeder. Warmte, rust en moedermelk vormen de basis voor hun immuniteit en groei.',
  },
  {
    image: '/images/kitten_sleepy.png',
    stage: 'Fase 2: Oogjes Open & Dromen',
    age: 'Week 2 - 4',
    title: 'Slaperige ontdekkers',
    desc: 'Rond de tiende dag gaan de oogjes langzaam open. Ze beginnen hun nestgenootjes en directe omgeving waar te nemen. Tussen het drinken door slapen ze diep en dromen ze van hun eerste stapjes in de oase.',
  },
  {
    image: '/images/kitten_playful.png',
    stage: 'Fase 3: Spel & Socialisatie',
    age: 'Week 4 - 8',
    title: 'De speelse wereld van wol',
    desc: 'Spelenderwijs ontdekken ze de wereld. Ze leren rennen, klimmen en stoeien met elkaar. Dit is een cruciale fase waarin we ze intensief socialiseren met geluiden, mensen en zacht speelgoed.',
  },
  {
    image: '/images/kitten_curious.png',
    stage: 'Fase 4: Karakter & Alertheid',
    age: 'Week 8 - 12',
    title: 'De nieuwsgierige blik',
    desc: 'Met grote, sprekende ogen observeren ze alles. Het karakter vormt zich nu snel: ze worden aanhankelijk, volgen je door het huis en tonen hun typische, zachtaardige Maine Coon temperament.',
  },
  {
    image: '/images/litter_terrace.png',
    stage: 'Fase 5: De Spaanse Bries',
    age: 'Week 12 - 16',
    title: 'Samen op avontuur',
    desc: 'Rond 12-16 weken zijn de kittens klaar om (volledig gevaccineerd en gechipt) de buitenwereld te ontdekken. Ze genieten van de frisse lucht op ons beveiligde Ibiza-terras en zijn klaar voor hun nieuwe gouden mandje.',
  },
  {
    image: '/images/junior_garden.png',
    stage: 'Fase 6: De Junior Leeftijd',
    age: 'Maand 4 - 8',
    title: 'Verkennen in het groen',
    desc: 'Als jonge pubers schieten ze door de tuin. Hun lichaam wordt langer, de poten groter en de kenmerkende pluisjes op de oren (lynx tips) beginnen echt op te vallen. Ze barsten van de energie.',
  },
  {
    image: '/images/junior_window.png',
    stage: 'Fase 7: Rust & Observatie',
    age: 'Maand 8 - 12',
    title: 'Blik op de horizon',
    desc: 'De snelle babygroei vlakt wat af. Ze worden rustiger en nemen vaak een vaste plek in voor het raam om de vogels te observeren. Hun vacht begint dichter te worden en de kraag krijgt meer volume.',
  },
  {
    image: '/images/adult_regal.png',
    stage: 'Fase 8: De Zachte Reus',
    age: 'Jaar 1 - 2',
    title: 'Majestueuze uitstraling',
    desc: 'Rond hun eerste verjaardag begint de Maine Coon zijn volwassen spierkracht en gewicht te ontwikkelen. De mannetjes krijgen een brede borstkas en een indrukwekkende, leeuw-achtige kraag.',
  },
  {
    image: '/images/adult_fluffy.png',
    stage: 'Fase 9: Vacht in Volle Glorie',
    age: 'Jaar 2 - 3',
    title: 'De weelderige sleepstaart',
    desc: 'De vacht is nu volledig ontwikkeld. De staart is net zo lang als het lichaam en wappert als een weelderige pluim. Ze hebben hun volledige winterjas ontwikkeld die hen beschermt tegen weer en wind.',
  },
  {
    image: '/images/adult_smoke.png',
    stage: 'Fase 10: Volwassen Wijsheid',
    age: 'Jaar 3 - 5',
    title: 'Een blik van pure harmonie',
    desc: 'Pas rond de leeftijd van 4 tot 5 jaar is een Maine Coon volledig uitgegroeid. Ze stralen een koninklijke rust en intense wijsheid uit, en blijven hun leven lang de aanhankelijke metgezel van hun eigenaar.',
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState('oorsprong');

  // Autoplay hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* 1. HERO SLIDER */}
      <section className="relative w-full h-[85vh] min-h-[550px] md:h-[90vh] bg-cream-200 overflow-hidden">
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Parallax background feeling */}
            <div className="absolute inset-0 bg-ink/15 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-[6000ms] ease-out"
              style={{
                transform: idx === currentSlide ? 'scale(1)' : 'scale(1.05)',
              }}
            />
            
            {/* Hero Text Card inside large margins */}
            <div className="absolute inset-0 z-20 flex items-center justify-start px-6 md:px-20 max-w-7xl mx-auto">
              <div className="max-w-xl bg-cream-50/90 backdrop-blur-md p-8 md:p-12 rounded-[2rem] border border-cream-100/40 shadow-lux animate-fade-up">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-600">
                  {slide.subtitle}
                </span>
                <h1 className="mt-4 font-display text-4xl md:text-5xl lg:text-6xl font-light text-ink leading-tight">
                  {slide.title}
                </h1>
                <p className="mt-4 text-sm md:text-base text-ink/85 leading-relaxed font-light">
                  {slide.text}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/login"
                    className="rounded-full bg-terracotta-500 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-cream-50 shadow-soft transition hover:bg-terracotta-600 hover:shadow-glow"
                  >
                    Bekijk Beschikbare Kittens
                  </Link>
                  <a
                    href="#geschiedenis"
                    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-terracotta-800 transition hover:text-terracotta-500 py-3"
                  >
                    Ontdek het Ras <span aria-hidden>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Slider Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex gap-3">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Ga naar dia ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                idx === currentSlide ? 'w-8 bg-terracotta-500' : 'w-2.5 bg-cream-50/60'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 2. OVER WENDY'S DREAM (Ibiza Oase) */}
      <section className="relative py-20 px-6 md:py-28 bg-cream-100">
        <div className="mx-auto max-w-5xl text-center">
          <SectionLabel>Wendy's Dream</SectionLabel>
          <h2 className="mt-6 font-display text-4xl md:text-5xl lg:text-6xl font-light text-ink">
            Thuiskomen in een wereld van <span className="italic text-terracotta-500">pure liefde</span>
          </h2>
          <p className="mt-8 mx-auto max-w-3xl text-base md:text-lg font-light leading-relaxed text-ink/80">
            Wendy's Dream is ontstaan uit een diepgewortelde passie voor de majestueuze Maine Coon. 
            Onze cattery combineert de ontspannen, zonnige rust van Ibiza met uiterst professionele en 
            liefdevolle zorg. Wij geloven dat een gezonde en gelukkige kat begint bij een stressvrije omgeving. 
            Onze zachte reuzen groeien op in een harmonieuze oase waar ze alle ruimte krijgen om hun speelse 
            en aanhankelijke karakter te ontplooien.
          </p>
          <div className="mt-12 inline-flex items-center gap-2 text-sm font-semibold tracking-wider text-terracotta-600 uppercase">
            <PawMark className="h-5 w-5" />
            <span>Ouders getest op HCM · SMA · PKDef</span>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIEVE MAGAZINE SECTIE (Geschiedenis & Kenmerken) */}
      <section id="geschiedenis" className="relative py-20 px-6 bg-cream-50/50 border-y border-terracotta-900/5">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] items-center">
            
            {/* Left Column: Asymmetric Image Spread */}
            <div className="relative space-y-6 animate-fade-in">
              <div className="relative rounded-[2.5rem] overflow-hidden aspect-[4/5] shadow-lux">
                <img
                  src="/images/litter_terrace.png"
                  alt="Maine Coon kittens op Ibiza"
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
              <SectionLabel>Ontdek het ras</SectionLabel>
              <h2 className="mt-4 font-display text-3xl md:text-4xl lg:text-5xl font-light text-ink leading-tight">
                De mystiek achter de <span className="italic text-terracotta-500">Zachte Reus</span>
              </h2>

              {/* Tabs Navigation */}
              <div className="mt-8 flex border-b border-terracotta-900/10 gap-6">
                {[
                  { id: 'oorsprong', label: 'Oorsprong' },
                  { id: 'karakter', label: 'Karakter' },
                  { id: 'uiterlijk', label: 'Uiterlijk & Verzorging' },
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
                    <h3 className="font-display text-2xl text-ink font-light">Van de koude wouden van Maine</h3>
                    <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                      De Maine Coon is een van de oudste natuurlijke kattenrassen van Noord-Amerika. 
                      Er gaan talloze legendes rond over hun herkomst: van romantische verhalen over de 
                      langharige katten van de Franse koningin Marie Antoinette die per schip naar Maine vluchtten, 
                      tot mythes over een kruising tussen een kat en een wasbeer (raccoon, vandaar 'Coon').
                    </p>
                    <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                      In werkelijkheid is het ras ontstaan uit een natuurlijke selectie. Kortharige huiskatten, 
                      meegenomen door vroege kolonisten, kruisten zich met langharige zeemanskatten (zoals de 
                      Noorse Boskat). Alleen de sterkste katten met een dikke, waterafstotende vacht en grote, 
                      brede poten overleefden de barre winters van New England. Zo ontstond de robuuste, 
                      majestueuze Maine Coon.
                    </p>
                  </div>
                )}

                {activeTab === 'karakter' && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="font-display text-2xl text-ink font-light">De zachtaardige clown</h3>
                    <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                      Ondanks hun imposante, wilde uiterlijk staan Maine Coons bekend om hun uiterst zachte, 
                      vriendelijke en tolerante karakter. Ze worden niet voor niets "gentle giants" genoemd. 
                      Ze zijn enorm sociaal, hechten zich sterk aan hun menselijke gezin en kunnen uitstekend 
                      opschieten met kinderen en andere huisdieren.
                    </p>
                    <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                      Een ander uniek kenmerk is hun speelsheid, die ze tot op hoge leeftijd behouden, en hun 
                      charmante stemgeluid. In plaats van luid miauwen, communiceren ze met een schattig, 
                      zacht getjilp of gekwetter. Ze houden van water en apporteren speelgoed alsof het honden zijn.
                    </p>
                  </div>
                )}

                {activeTab === 'uiterlijk' && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="font-display text-2xl text-ink font-light">Robuust, weelderig en gezond</h3>
                    <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                      De fysieke kenmerken van de Maine Coon zijn iconisch: grote tufted oren met lynxpluimpjes, 
                      een stevige vierkante snuit, een massief gespierd lichaam en een weelderige sleepstaart die 
                      om het lichaam kan worden gevouwen voor warmte. Hun vacht is halflang, dicht en klit nauwelijks.
                    </p>
                    <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                      <strong>Verzorging:</strong> Wekelijks borstelen is meestal voldoende om de vacht glanzend 
                      en klitvrij te houden. 
                    </p>
                    <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                      <strong>Gezondheid:</strong> Omdat we uitsluitend fokken met geteste ouderdieren, 
                      garanderen we dat onze kittens vrij zijn van erfelijke aandoeningen zoals hypertrofische 
                      cardiomyopathie (HCM), spinale musculaire atrofie (SMA) en pyruvaatkinase deficiëntie (PKDef).
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. VISUELE TIMELINE / PORTFOLIO (Van Kitten tot Reus) */}
      <section id="verhaal" className="relative py-20 px-6 md:py-28 bg-cream-100">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionLabel>Fotodagboek & Groeicyclus</SectionLabel>
            <h2 className="mt-4 font-display text-4xl md:text-5xl font-light text-ink">
              Van Kitten tot <span className="italic text-terracotta-500">Majestueuze Reus</span>
            </h2>
            <p className="mt-4 text-sm md:text-base font-light text-ink/75 leading-relaxed">
              Volg de fascinerende ontwikkeling van onze Maine Coons. Deze chronologische fotoreeks helpt u 
              begrijpen hoe een kitten uitgroeit tot een volwaardige, indrukwekkende zachte reus. 
              Perfect voor potentiële kopers om het groeiproces te bestuderen.
            </p>
          </div>

          {/* Timeline Layout */}
          <div className="space-y-16">
            {growthStages.map((stage, idx) => (
              <div
                key={idx}
                className={`flex flex-col md:flex-row gap-10 items-center ${
                  idx % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Image Frame with Magazine aesthetic */}
                <div className="w-full md:w-1/2">
                  <div className="group relative overflow-hidden rounded-[2rem] shadow-soft bg-cream-50 border border-terracotta-900/5 transition duration-500 hover:shadow-lux">
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 z-10" />
                    <img
                      src={stage.image}
                      alt={stage.title}
                      className="w-full aspect-[4/3] object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 z-20 bg-cream-50/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-terracotta-700">
                      {stage.age}
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <div className="w-full md:w-1/2 space-y-4 px-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta-500">
                    {stage.stage}
                  </span>
                  <h3 className="font-display text-3xl font-light text-ink">
                    {stage.title}
                  </h3>
                  <p className="text-sm md:text-base font-light leading-relaxed text-ink/80">
                    {stage.desc}
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta-600 uppercase tracking-wider">
                      <span className="h-1.5 w-1.5 rounded-full bg-terracotta-500" />
                      Wendy's Dream Standaard
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA PRIVATE ACCESS */}
      <section className="mx-auto py-20 px-6 max-w-7xl">
        <div className="relative overflow-hidden rounded-[3rem] bg-ink px-8 py-16 text-center shadow-lux md:px-16 md:py-24">
          <div className="absolute inset-0 bg-grain opacity-20" />
          {/* Ambient backgrounds */}
          <div className="absolute -left-32 -bottom-32 h-96 w-96 rounded-full bg-terracotta-500/10 blur-3xl" />
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sand-500/10 blur-3xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-flex justify-center text-terracotta-400 mb-6">
              <PawMark className="h-8 w-8" />
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-light text-cream-50 leading-tight">
              Krijg toegang tot ons digitaal nest-portaal
            </h2>
            <p className="mt-6 text-sm md:text-base text-cream-100/70 font-light leading-relaxed">
              Bent u geïnteresseerd in een van onze kittens? Inloggen op de beveiligde 
              **Private Access** omgeving geeft u direct inzage in de actuele beschikbaarheid, 
              stambomen, weegcurves en medische dossiers. Neem contact met ons op om een 
              account aan te vragen.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="rounded-full bg-terracotta-500 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-cream-50 shadow-soft transition hover:bg-terracotta-600 hover:shadow-glow"
              >
                Inloggen Private Access
              </Link>
              <a
                href="#contact"
                className="rounded-full border border-cream-100/30 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-cream-100 transition hover:bg-cream-100/10"
              >
                Contact Opnemen
              </a>
            </div>
            <p className="mt-4 text-xs text-cream-100/40">
              Uitsluitend voor goedgekeurde liefhebbers en toekomstige eigenaren.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
