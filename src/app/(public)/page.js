'use client';
import { useState } from 'react';
import Link from 'next/link';
import MainbreedLogo from '@/components/MainbreedLogo';

const FEATURES = [
  {
    title: 'Eén dossier per dier',
    desc: 'Paspoort, chip, stamboom, gezondheid, gewicht, verkoop en media — alles van één kat of hond op één plek, doorzoekbaar op naam of chipnummer.',
    icon: <><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2Z" /><path d="M13 2v6h6" /></>,
  },
  {
    title: 'Nestjes & fokdieren',
    desc: 'Registreer nestjes met vader en moeder, voeg kittens of pups toe met een paar tikken en houd de hele afstamming overzichtelijk.',
    icon: <><path d="M3 10.5 12 4l9 6.5" /><path d="M5 9.5V20h14V9.5" /><path d="M9 20v-5a3 3 0 0 1 6 0v5" /></>,
  },
  {
    title: 'Gezondheid & agenda',
    desc: 'Ontwormingen, entingen en controles inplannen per dier, met een overzicht van wat er deze maand nog moet gebeuren.',
    icon: <path d="M19 14c1.5-1.5 3-3.4 3-5.5A3.5 3.5 0 0 0 12 5 3.5 3.5 0 0 0 2 8.5C2 12 5 14.5 12 21c2.5-2.3 4.5-4.2 6-6.5Z" />,
  },
  {
    title: 'Verkoop & klantenportaal',
    desc: 'Prijzen, status en beschikbaarheid bijhouden, en elke koper een eigen, veilige link geven naar het dossier van zijn kitten of pup.',
    icon: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6Z" /><circle cx="7.5" cy="7.5" r="1.2" /></>,
  },
  {
    title: "Klanten & advertenties",
    desc: 'Klantgegevens rechtstreeks vanuit het dossier beheren, en zelf bepalen wat er wel of niet zichtbaar is op de publieke advertentie.',
    icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  },
  {
    title: 'Eigen website',
    desc: 'Elke fokker krijgt een eigen, mooie voorpagina om mee naar buiten te treden — net als deze van Wendy\'s Dream hieronder.',
    icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></>,
  },
];

const PRICE_TIERS = [
  { name: 'Starter', price: '—', sub: 'per maand · prijs volgt', desc: 'Voor kleinere hobbyfokkers die net beginnen met één of twee nestjes per jaar.', features: ['1 fokker-account', 'Onbeperkt aantal dieren', 'Eigen website', 'E-mailondersteuning'] },
  { name: 'Cattery', price: '—', sub: 'per maand · prijs volgt', desc: 'Voor actieve catteries en kennels — het pakket waarmee Wendy\'s Dream nu werkt.', features: ['Alles uit Starter', 'Klantenportaal per koper', 'Medische agenda & herinneringen', 'Prioriteit-ondersteuning'], featured: true },
  { name: 'Fokvereniging', price: 'Op aanvraag', sub: 'meerdere fokkers', desc: 'Voor verenigingen of grotere fokgroepen met meerdere aangesloten catteries.', features: ['Alles uit Cattery', 'Meerdere gekoppelde fokkers', 'Gezamenlijk overzicht', 'Persoonlijke onboarding'] },
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
            <a href="#features" className="transition hover:text-ink">Functies</a>
            <a href="#voorbeeld" className="transition hover:text-ink">Voorbeeld</a>
            <a href="#prijzen" className="transition hover:text-ink">Prijzen</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link href="/login" className="rounded-full border border-mainbreed-500/20 bg-white px-5 py-2.5 text-sm font-semibold text-mainbreed-800 shadow-soft transition hover:border-mainbreed-500/40 hover:bg-mainbreed-50">Inloggen</Link>
            <a href="#prijzen" className="rounded-full bg-mainbreed-500 px-5 py-2.5 text-sm font-semibold text-cream-50 shadow-soft transition hover:bg-mainbreed-600">Aan de slag</a>
          </div>
          <button onClick={() => setMenuOpen((v) => !v)} className="rounded-xl border border-mainbreed-900/10 p-2.5 md:hidden" aria-label="Menu">
            <Icon className="h-5 w-5">{menuOpen ? <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></> : <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>}</Icon>
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-mainbreed-900/5 bg-cream-50 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-4 text-sm font-medium">
              <a href="#features" onClick={() => setMenuOpen(false)}>Functies</a>
              <a href="#voorbeeld" onClick={() => setMenuOpen(false)}>Voorbeeld</a>
              <a href="#prijzen" onClick={() => setMenuOpen(false)}>Prijzen</a>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="font-semibold text-mainbreed-700">Inloggen</Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-16 md:px-12 md:pb-28 md:pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-mainbreed-500/20 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-mainbreed-700 shadow-soft">
            Nu beschikbaar voor Maine Coon-catteries
          </span>
          <h1 className="mt-6 font-display text-4xl leading-[1.1] text-ink md:text-6xl">
            Alles voor jouw fokkerij,<br className="hidden md:block" /> op één rustige plek.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink/70 md:text-lg">
            Mainbreed is het beheerplatform voor hoogwaardige dierenfokkers: nestjes, dossiers, gezondheid,
            verkoop en een eigen klantenportaal — allemaal op één plek. Vandaag gebouwd en getest voor
            Maine Coon-catteries, morgen voor elk ras en elke fokker.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#prijzen" className="inline-flex items-center justify-center rounded-full bg-mainbreed-500 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-cream-50 shadow-lux transition hover:bg-mainbreed-600 hover:shadow-glow">
              Bekijk de prijzen
            </a>
            <Link href="/wendysdream" className="inline-flex items-center justify-center gap-2 rounded-full border border-mainbreed-500/20 bg-white px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-mainbreed-800 shadow-soft transition hover:border-mainbreed-500/40 hover:bg-mainbreed-50">
              Bekijk een live voorbeeld →
            </Link>
          </div>
        </div>
      </section>

      {/* Voor wie */}
      <section className="border-y border-mainbreed-900/5 bg-white/60 px-6 py-12 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm leading-relaxed text-ink/60">
            <strong className="text-ink">Op dit moment</strong> is Mainbreed ingericht voor Maine Coon-catteries.
            Het platform is van de grond af gebouwd om straks net zo goed te werken voor hondenkennels en
            fokkers van andere rassen — dat bouwen we de komende tijd verder uit.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-mainbreed-600">Functies</span>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">Wat Mainbreed voor je regelt</h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-3xl border border-mainbreed-900/8 bg-white p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-lux">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mainbreed-50 text-mainbreed-700">
                  <Icon>{f.icon}</Icon>
                </span>
                <h3 className="mt-5 font-display text-xl text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Voorbeeld */}
      <section id="voorbeeld" className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-ink px-8 py-14 text-center shadow-lux md:px-16 md:py-20">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-mainbreed-300">Live voorbeeld</span>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl text-cream-100 md:text-4xl">
            Zo ziet Mainbreed eruit voor een echte cattery
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-cream-100/60">
            Wendy's Dream is een Maine Coon-cattery die vandaag al volledig op Mainbreed draait —
            van nestje tot verkoop tot klantenportaal.
          </p>
          <Link href="/wendysdream" className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-mainbreed-500 px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-cream-50 shadow-glow transition hover:bg-mainbreed-600">
            Bekijk Wendy's Dream →
          </Link>
        </div>
      </section>

      {/* Prijzen */}
      <section id="prijzen" className="border-t border-mainbreed-900/5 bg-white/60 px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-mainbreed-600">Prijzen</span>
            <h2 className="mt-3 font-display text-3xl text-ink md:text-4xl">Eenvoudig, per maand</h2>
            <p className="mt-3 text-sm text-ink/60">
              De definitieve tarieven maken we binnenkort bekend — hieronder alvast de indeling.
            </p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {PRICE_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`flex flex-col rounded-3xl border p-8 shadow-soft ${tier.featured ? 'border-2 border-mainbreed-500 bg-white shadow-lux' : 'border-mainbreed-900/8 bg-white'}`}
              >
                {tier.featured && (
                  <span className="mb-4 inline-flex w-fit items-center rounded-full bg-mainbreed-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cream-50">Meest gekozen</span>
                )}
                <h3 className="font-display text-2xl text-ink">{tier.name}</h3>
                <p className="mt-4 font-display text-4xl text-ink">{tier.price}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-ink/40">{tier.sub}</p>
                <p className="mt-4 text-sm leading-relaxed text-ink/60">{tier.desc}</p>
                <ul className="mt-6 flex-1 space-y-3 text-sm text-ink/70">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-mainbreed-500"><path d="M20 6 9 17l-5-5" /></Icon>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:hallo@mainbreed.com"
                  className={`mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-wider transition ${tier.featured ? 'bg-mainbreed-500 text-cream-50 hover:bg-mainbreed-600' : 'border border-mainbreed-500/20 text-mainbreed-800 hover:bg-mainbreed-50'}`}
                >
                  Interesse doorgeven
                </a>
              </div>
            ))}
          </div>
        </div>
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
