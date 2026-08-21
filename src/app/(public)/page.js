'use client';
import { useState } from 'react';
import Link from 'next/link';
import MainbreedLogo from '@/components/MainbreedLogo';
import Reveal from '@/components/Reveal';
import Faq from '@/components/Faq';

// Diersoorten waarvoor Mainbreed bedoeld is. Katten werkt vandaag, de rest
// volgt — dat staat er eerlijk bij zodat niemand zich misleid voelt.
const SPECIES = [
  { label: 'Katten', hint: 'Beschikbaar', live: true, icon: <><circle cx="12" cy="14" r="6" /><path d="M7 9 5 4l4 4" /><path d="M17 9l2-5-4 4" /><path d="M9.5 15h.01M14.5 15h.01" /></> },
  { label: 'Honden', hint: 'In aanbouw', icon: <><path d="M10 5.2 8 3v4" /><path d="M14 5.2 16 3v4" /><path d="M6 9a6 6 0 0 1 12 0v4a6 6 0 0 1-12 0Z" /><path d="M10 12h.01M14 12h.01M12 15v1" /></> },
  { label: 'Vogels', hint: 'In aanbouw', icon: <><path d="M16 7h.01" /><path d="M3.4 18a10 10 0 0 0 8.6-4 8 8 0 0 0 8-8 3 3 0 0 0-6 0 8 8 0 0 0-8 8v6" /><path d="m9 14 6 6" /></> },
  { label: 'Duiven', hint: 'In aanbouw', icon: <><path d="M20 6c-1 4-4 6-8 6s-6 3-6 7" /><path d="M20 6a3 3 0 0 0-5-2" /><path d="M17 5h.01" /><path d="M6 19h8" /></> },
  { label: 'Knaagdieren', hint: 'In aanbouw', icon: <><circle cx="12" cy="15" r="5" /><path d="M8 8c0-3 1-5 2-5s2 2 2 4" /><path d="M16 8c0-3-1-5-2-5" /><path d="M10 15h.01M14 15h.01" /></> },
  { label: 'Paarden', hint: 'In aanbouw', icon: <><path d="M5 20c0-5 3-8 7-8h4l3-4-2-3-4 2H8a5 5 0 0 0-5 5v8" /><path d="M14 8h.01" /></> },
];

const WHY = [
  {
    title: 'Alles bij het dier, niet in mappen',
    desc: 'De meeste fokkers werken met een schrift, een map met papieren en foto\'s op de telefoon. Bij Mainbreed hangt alles aan het dier zelf. Zoek op naam of chipnummer en je hebt het complete verhaal, ook jaren later.',
  },
  {
    title: 'Je vergeet geen enting meer',
    desc: 'Ontworming, entingen en controles plan je per dier in. Je krijgt vanzelf te zien wat er aankomt, zodat je nooit voor verrassingen staat vlak voordat een dier naar zijn nieuwe huis gaat.',
  },
  {
    title: 'Kopers die zelf kunnen kijken',
    desc: 'Elke koper krijgt een eigen link naar het dossier van zijn dier: foto\'s, groei, papieren. Dat scheelt je een hoop appjes, en het geeft mensen vertrouwen in waar hun dier vandaan komt.',
  },
  {
    title: 'Gemaakt met een echte fokker',
    desc: 'Mainbreed is niet vanachter een bureau bedacht. Het is stap voor stap gebouwd samen met een Maine Coon-cattery die er dagelijks mee werkt. Wat niet werkte in de praktijk, is eruit gegaan.',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Is Mainbreed alleen voor kattenfokkers?',
    a: 'Op dit moment is alles ingericht en getest voor catteries, omdat we samen met een Maine Coon-fokker zijn begonnen. De software zelf kent geen verschil tussen een kitten en een pup: het gaat om dieren, nestjes, ouderdieren en papieren. Hondenkennels, vogel- en duivenfokkers kunnen er straks net zo goed mee werken. Meld je gerust nu al aan, dan bouwen we jouw diersoort met voorrang uit.',
  },
  {
    q: 'Ik fok honden. Wat mis ik nu nog?',
    a: 'Functioneel kun je vandaag al alles vastleggen: nestjes met teef en dekreu, pups, gezondheidscontroles, kopers en papieren. Wat nog niet klopt, zijn een paar woorden in het scherm — er staat nu "kitten" waar "pup" hoort te staan, en "cattery" waar "kennel" hoort. Dat passen we per fokker aan zodra je je aanmeldt.',
  },
  {
    q: 'Wat als ik meerdere rassen of diersoorten fok?',
    a: 'Dat kan gewoon. Je legt per dier vast om welk ras het gaat, en je kunt zoveel nestjes en ouderdieren toevoegen als je wilt. Er is geen limiet op het aantal dieren, ook niet in het instappakket.',
  },
  {
    q: 'Moet ik verstand van computers hebben?',
    a: 'Nee. Als je kunt appen, kun je met Mainbreed werken. Je voegt een dier toe via een paar schermen die je stap voor stap door de gegevens leiden, en foto\'s maak je gewoon met de camera van je telefoon. Wij zetten je omgeving op en helpen je op weg.',
  },
  {
    q: 'Wat gebeurt er met mijn gegevens?',
    a: 'Je gegevens zijn van jou. Ze staan op beveiligde servers binnen Europa, en niemand anders kan bij je dossiers. Je bepaalt zelf per foto en per document of een koper het mag zien. Wil je stoppen, dan krijg je alles mee in een export.',
  },
  {
    q: 'Kan ik mijn bestaande administratie overzetten?',
    a: 'Ja. Heb je al een lijst in Excel, of mappen vol met papieren en scans? Stuur ze op, dan zetten we de basis voor je klaar zodat je niet alles opnieuw hoeft in te tikken. Bij het instappakket doen we dat eenmalig kosteloos.',
  },
  {
    q: 'Krijg ik echt een eigen website?',
    a: 'Ja, elke fokker krijgt een eigen pagina op mainbreed.com, bijvoorbeeld mainbreed.com/jouwfokkerij. Daarop staan je nestjes en beschikbare dieren, en die houdt zichzelf bij zodra jij iets in het beheer aanpast. Wendy\'s Dream is daar een levend voorbeeld van.',
  },
  {
    q: 'Wat kost het en zit ik ergens aan vast?',
    a: 'Je betaalt per maand en je kunt maandelijks opzeggen. De exacte bedragen maken we binnenkort bekend; wat er in elk pakket zit zie je hierboven al. Meld je nu aan, dan hoor je het als eerste en denk je mee over de prijs.',
  },
];

const FEATURES = [
  {
    title: 'Eén dossier per dier',
    desc: 'Paspoort, chip, stamboom, gewicht en foto\'s bij elkaar. Zoek op naam of chipnummer en je hebt alles.',
    icon: <><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2Z" /><path d="M13 2v6h6" /></>,
  },
  {
    title: 'Nestjes en ouderdieren',
    desc: 'Leg een nestje vast met vader en moeder erbij. Kittens toevoegen kost een paar tikken, de afstamming loopt vanzelf mee.',
    icon: <><path d="M3 10.5 12 4l9 6.5" /><path d="M5 9.5V20h14V9.5" /><path d="M9 20v-5a3 3 0 0 1 6 0v5" /></>,
  },
  {
    title: 'Gezondheid en planning',
    desc: 'Plan ontworming, entingen en controles per dier. Je ziet in één blik wat er deze week nog moet gebeuren.',
    icon: <path d="M19 14c1.5-1.5 3-3.4 3-5.5A3.5 3.5 0 0 0 12 5 3.5 3.5 0 0 0 2 8.5C2 12 5 14.5 12 21c2.5-2.3 4.5-4.2 6-6.5Z" />,
  },
  {
    title: 'Verkoop en koperportaal',
    desc: 'Houd prijs en status bij, en geef elke koper een eigen link naar het dossier van zijn dier.',
    icon: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6Z" /><circle cx="7.5" cy="7.5" r="1.2" /></>,
  },
  {
    title: 'Klanten bij het dier',
    desc: 'Contactgegevens staan bij het dier zelf. Jij bepaalt per foto en document wat een koper te zien krijgt.',
    icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  },
  {
    title: 'Je eigen pagina',
    desc: 'Elke fokker krijgt een eigen pagina om mee naar buiten te treden. Hieronder zie je hoe die van Wendy\'s Dream eruitziet.',
    icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></>,
  },
];

const PRICE_TIERS = [
  {
    name: 'Starter',
    price: 'Prijs volgt',
    sub: 'per maand',
    desc: 'Voor wie net begint, met een of twee nestjes per jaar.',
    features: ['Eén beheerder', 'Onbeperkt aantal dieren', 'Je eigen pagina', 'Hulp via e-mail'],
  },
  {
    name: 'Compleet',
    price: 'Prijs volgt',
    sub: 'per maand',
    desc: 'Voor actieve fokkers die het hele jaar door nestjes hebben. Dit pakket gebruikt Wendy\'s Dream.',
    features: ['Alles uit Starter', 'Eigen portaal per koper', 'Gezondheidsplanning met herinneringen', 'Hulp met voorrang'],
    featured: true,
  },
  {
    name: 'Vereniging',
    price: 'Op aanvraag',
    sub: 'meerdere fokkers',
    desc: 'Voor verenigingen en fokgroepen met meerdere aangesloten fokkers.',
    features: ['Alles uit Compleet', 'Meerdere fokkers onder één dak', 'Gezamenlijk overzicht', 'Persoonlijke begeleiding'],
  },
];

function Icon({ children, className = 'h-6 w-6' }) {
  return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>;
}

export default function MainbreedHome() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream-50 text-ink">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-mainbreed-900/5 bg-cream-50/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
          <Link href="/" className="text-[1.35rem]">
            <MainbreedLogo />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink/70 md:flex">
            <a href="#waarom" className="transition hover:text-ink">Waarom</a>
            <a href="#features" className="transition hover:text-ink">Functies</a>
            <a href="#voorbeeld" className="transition hover:text-ink">Voorbeeld</a>
            <a href="#prijzen" className="transition hover:text-ink">Prijzen</a>
            <a href="#vragen" className="transition hover:text-ink">Vragen</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="rounded-full border border-mainbreed-500/20 bg-white px-5 py-2.5 text-sm font-semibold text-mainbreed-800 shadow-soft transition-all duration-300 hover:border-mainbreed-500/40 hover:bg-mainbreed-50">Inloggen</Link>
            <Link href="/login" className="rounded-full bg-mainbreed-500 px-5 py-2.5 text-sm font-semibold text-cream-50 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-mainbreed-600">Gratis beginnen</Link>
          </div>
          <button onClick={() => setMenuOpen((v) => !v)} className="rounded-xl border border-mainbreed-900/10 p-2.5 md:hidden" aria-label="Menu">
            <Icon className="h-5 w-5">{menuOpen ? <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></> : <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>}</Icon>
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-mainbreed-900/5 bg-cream-50 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-4 text-sm font-medium">
              <a href="#waarom" onClick={() => setMenuOpen(false)}>Waarom</a>
              <a href="#features" onClick={() => setMenuOpen(false)}>Functies</a>
              <a href="#voorbeeld" onClick={() => setMenuOpen(false)}>Voorbeeld</a>
              <a href="#prijzen" onClick={() => setMenuOpen(false)}>Prijzen</a>
              <a href="#vragen" onClick={() => setMenuOpen(false)}>Vragen</a>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="font-semibold text-mainbreed-700">Inloggen</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-16 md:px-12 md:pb-28 md:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal as="span" className="inline-flex items-center gap-2 rounded-full border border-mainbreed-500/20 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-mainbreed-700 shadow-soft">
            Nu beschikbaar voor Maine Coon-catteries
          </Reveal>
          <Reveal as="h1" delay={80} className="mt-6 font-display text-4xl leading-[1.1] text-ink md:text-6xl">
            Alles over je dieren,<br className="hidden md:block" /> op één rustige plek.
          </Reveal>
          <Reveal as="p" delay={160} className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink/70 md:text-lg">
            Nestjes, dossiers, gezondheid en verkoop — je regelt het allemaal vanuit één dier.
            Geen losse mappen en schriftjes meer. Vandaag gebouwd voor Maine Coon-catteries,
            en klaar om mee te groeien naar elk ras.
          </Reveal>
          <Reveal delay={240} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-mainbreed-500 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-cream-50 shadow-lux transition-all duration-300 hover:-translate-y-0.5 hover:bg-mainbreed-600 hover:shadow-glow">
              Gratis beginnen
            </Link>
            <Link href="/wendysdream" className="group inline-flex items-center justify-center gap-2 rounded-full border border-mainbreed-500/20 bg-white px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-mainbreed-800 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-mainbreed-500/40 hover:bg-mainbreed-50">
              Bekijk een voorbeeld
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Voor welke fokkers */}
      <section className="border-y border-mainbreed-900/5 bg-white/60 px-6 py-16 md:px-12 md:py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-mainbreed-600">Voor wie</span>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">Voor iedereen die fokt met zorg</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/60">
              Een nestje is een nestje, of het nu kittens, pups of jonge duiven zijn. Je legt ouderdieren vast,
              houdt gezondheid bij en begeleidt kopers. Mainbreed is daarop gebouwd — we beginnen bij katten
              en breiden per diersoort uit.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {SPECIES.map((s, i) => (
              <Reveal key={s.label} delay={i * 70} className="h-full">
                <div className={`group flex h-full flex-col items-center gap-2 rounded-2xl border p-5 text-center transition-all duration-500 hover:-translate-y-1.5 ${s.live ? 'border-mainbreed-400 bg-white shadow-soft' : 'border-mainbreed-900/8 bg-white/60 hover:border-mainbreed-200'}`}>
                  <span className={`transition-all duration-500 group-hover:scale-110 ${s.live ? 'text-mainbreed-500' : 'text-ink/30'}`}>
                    <Icon className="h-7 w-7">{s.icon}</Icon>
                  </span>
                  <span className="text-sm font-semibold text-ink">{s.label}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${s.live ? 'text-mainbreed-600' : 'text-ink/35'}`}>{s.hint}</span>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200} className="mt-8 text-center">
            <p className="text-xs leading-relaxed text-ink/50">
              Fok je iets wat er niet bij staat? Laat het weten — we bouwen op volgorde van wie zich meldt.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Waarom Mainbreed */}
      <section id="waarom" className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-mainbreed-600">Waarom Mainbreed</span>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">Waarom fokkers overstappen</h2>
          </Reveal>
          <div className="mt-14 grid gap-x-10 gap-y-10 md:grid-cols-2">
            {WHY.map((w, i) => (
              <Reveal key={w.title} delay={i * 100}>
                <div className="flex gap-5">
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mainbreed-500 font-display text-base text-cream-50">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl leading-snug text-ink">{w.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/60">{w.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-mainbreed-600">Functies</span>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">Wat Mainbreed voor je regelt</h2>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div className="group h-full rounded-3xl border border-mainbreed-900/8 bg-white p-7 shadow-soft transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:border-mainbreed-300/60 hover:shadow-lux">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mainbreed-50 text-mainbreed-700 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-mainbreed-500 group-hover:text-cream-50">
                    <Icon>{f.icon}</Icon>
                  </span>
                  <h3 className="mt-5 font-display text-xl text-ink transition-colors duration-300 group-hover:text-mainbreed-700">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Voorbeeld */}
      <section id="voorbeeld" className="px-6 py-20 md:px-12 md:py-28">
        <Reveal className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-ink px-8 py-14 text-center shadow-lux md:px-16 md:py-20">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-mainbreed-300">Voorbeeld</span>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl text-cream-100 md:text-4xl">
            Zo ziet het eruit bij een echte fokker
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-cream-100/60">
            Wendy's Dream fokt Maine Coons en doet alles in Mainbreed: van nestje tot verkoop,
            inclusief het portaal waar kopers hun kitten volgen.
          </p>
          <Link href="/wendysdream" className="group mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-mainbreed-500 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-cream-50 shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:bg-mainbreed-600">
            Bekijk Wendy's Dream
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </Reveal>
      </section>

      {/* Prijzen */}
      <section id="prijzen" className="border-t border-mainbreed-900/5 bg-white/60 px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-mainbreed-600">Pakketten</span>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">Eén bedrag per maand</h2>
            <p className="mt-3 text-sm text-ink/60">
              De tarieven maken we binnenkort bekend. Hieronder zie je alvast wat er in elk pakket zit.
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PRICE_TIERS.map((tier, i) => (
              <Reveal key={tier.name} delay={i * 110} className="h-full">
                <div
                  className={`flex h-full flex-col rounded-3xl border p-8 shadow-soft transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-lux ${tier.featured ? 'border-2 border-mainbreed-500 bg-white shadow-lux lg:-translate-y-3 lg:hover:-translate-y-5' : 'border-mainbreed-900/8 bg-white hover:border-mainbreed-300/60'}`}
                >
                  {/* Vaste hoogte, zodat alle kaarten op dezelfde regel beginnen — ook zonder badge. */}
                  <div className="mb-4 h-6">
                    {tier.featured && (
                      <span className="inline-flex items-center rounded-full bg-mainbreed-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cream-50">
                        Meest gekozen
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-2xl leading-none text-ink">{tier.name}</h3>

                  <div className="mt-5">
                    <p className="font-display text-3xl leading-none text-ink">{tier.price}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-ink/40">{tier.sub}</p>
                  </div>

                  <p className="mt-5 min-h-[5.5rem] text-sm leading-relaxed text-ink/60">{tier.desc}</p>

                  <ul className="flex-1 space-y-3 border-t border-mainbreed-900/8 pt-6 text-sm text-ink/70">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <Icon className="mt-1 h-4 w-4 shrink-0 text-mainbreed-500"><path d="M20 6 9 17l-5-5" /></Icon>
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="mailto:hallo@mainbreed.com?subject=Interesse%20in%20Mainbreed"
                    className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider transition-all duration-300 hover:-translate-y-0.5 ${tier.featured ? 'bg-mainbreed-500 text-cream-50 hover:bg-mainbreed-600' : 'border border-mainbreed-500/20 text-mainbreed-800 hover:bg-mainbreed-50'}`}
                  >
                    Neem contact op
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Veelgestelde vragen */}
      <section id="vragen" className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-3xl">
          <Reveal className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-mainbreed-600">Vragen</span>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">Veelgestelde vragen</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink/60">
              Staat je vraag er niet bij? Mail gerust naar{' '}
              <a href="mailto:hallo@mainbreed.com" className="font-semibold text-mainbreed-600 hover:underline">hallo@mainbreed.com</a> —
              je krijgt altijd antwoord van een mens.
            </p>
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <Faq items={FAQ_ITEMS} />
          </Reveal>
        </div>
      </section>

      {/* Slot-oproep */}
      <section className="px-6 pb-24 md:px-12">
        <Reveal className="mx-auto max-w-4xl rounded-[2.5rem] border border-mainbreed-300/50 bg-gradient-to-b from-mainbreed-50 to-cream-50 px-8 py-14 text-center shadow-soft md:px-16">
          <h2 className="mx-auto max-w-xl font-display text-3xl leading-tight text-ink md:text-4xl">
            Begin vandaag met één dier
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ink/65">
            Je hoeft niet meteen je hele administratie over te zetten. Voeg één dier toe, kijk hoe het voelt,
            en bouw het rustig verder uit. Aanmelden kost een minuut met je Google-account.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-mainbreed-500 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-cream-50 shadow-lux transition-all duration-300 hover:-translate-y-0.5 hover:bg-mainbreed-600 hover:shadow-glow">
              Gratis beginnen
            </Link>
            <a href="mailto:hallo@mainbreed.com?subject=Vraag%20over%20Mainbreed" className="inline-flex items-center justify-center rounded-full border border-mainbreed-500/25 bg-white px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-mainbreed-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-mainbreed-50">
              Stel een vraag
            </a>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-cream-100/80">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-3 md:px-12">
          <div>
            <MainbreedLogo light className="text-[1.3rem]" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream-100/60">
              Beheerplatform voor hoogwaardige dierenfokkers. Vandaag Maine Coon-catteries, morgen alle rassen.
            </p>
          </div>
          <div className="text-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-mainbreed-300">Contact</p>
            <a href="mailto:hallo@mainbreed.com" className="text-cream-100/70 transition hover:text-cream-100">hallo@mainbreed.com</a>
          </div>
          <div className="text-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-mainbreed-300">Voorbeeld</p>
            <Link href="/wendysdream" className="text-cream-100/70 transition hover:text-cream-100">Wendy's Dream cattery →</Link>
          </div>
        </div>
        <div className="border-t border-cream-100/10 py-6 text-center text-xs font-light text-cream-100/40">
          © {new Date().getFullYear()} Mainbreed
        </div>
      </footer>
    </div>
  );
}
