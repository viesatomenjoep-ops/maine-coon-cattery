import Link from 'next/link';
import { SectionLabel, ImageSlot, PawMark } from '@/components/ui';
import { newsPosts } from '@/data/mock';

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });

const breedTraits = [
  { title: 'Karakter', text: 'Zachtaardig, sociaal en aanhankelijk. De Maine Coon staat bekend als de "zachte reus" — speels maar nooit opdringerig.' },
  { title: 'Grootte', text: 'Een van de grootste kattenrassen. Reuen bereiken 7–9 kg, met een imposant lichaam en weelderige staart.' },
  { title: 'Verzorging', text: 'De halflange vacht klit nauwelijks. Wekelijks borstelen en goede voeding houden de coon in topconditie.' },
];

export default function HomePage() {
  const recent = [...newsPosts]
    .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    .slice(0, 20);

  return (
    <>
      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-6 pb-12 pt-10 md:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-up">
            <SectionLabel>Erkende Maine Coon Cattery</SectionLabel>
            <h1 className="mt-6 font-display text-5xl leading-[1.02] tracking-tight text-forest-950 md:text-7xl">
              Majestueuze
              <span className="block italic text-brass-600">zachte reuzen</span>
              met liefde grootgebracht.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-forest-800/80">
              Bij Maelduin fokken we gezonde, getypeerde Maine Coons. Volg onze nestjes
              live en krijg via Private Access exclusieve toegang tot beschikbare kittens.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/login" className="rounded-full bg-forest-800 px-7 py-3.5 text-sm font-medium text-cream-100 shadow-lux transition hover:bg-forest-900">
                Bekijk beschikbare kittens
              </Link>
              <a href="#ras" className="inline-flex items-center gap-2 text-sm font-medium text-forest-800 transition hover:text-brass-600">
                Meer over het ras
                <span aria-hidden>→</span>
              </a>
            </div>
          </div>

          <div className="relative animate-fade-in">
            <ImageSlot label="Hero · Maine Coon" ratio="aspect-[4/5]" className="shadow-lux" />
            <div className="absolute -bottom-6 -left-6 hidden w-44 rotate-[-4deg] sm:block">
              <ImageSlot label="Kitten" ratio="aspect-square" className="shadow-soft ring-4 ring-cream-50" />
            </div>
            <div className="absolute -right-4 -top-4 rounded-2xl bg-cream-50 px-4 py-3 shadow-soft">
              <p className="text-xs text-forest-700/70">Ouders getest</p>
              <p className="font-display text-lg text-forest-900">HCM · SMA · PKDef</p>
            </div>
          </div>
        </div>
      </section>

      {/* OVER HET RAS */}
      <section id="ras" className="mx-auto mt-16 max-w-7xl px-6">
        <div className="hairline pt-16">
          <SectionLabel>Over het ras</SectionLabel>
          <h2 className="mt-5 max-w-2xl font-display text-4xl tracking-tight text-forest-950 md:text-5xl">
            Wat de Maine Coon zo bijzonder maakt
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {breedTraits.map((t, i) => (
              <div key={t.title} className="lift rounded-3xl border border-forest-900/10 bg-cream-50 p-8 shadow-soft" style={{ animationDelay: `${i * 90}ms` }}>
                <PawMark className="h-6 w-6 text-brass-500" />
                <h3 className="mt-5 font-display text-2xl text-forest-900">{t.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-forest-800/75">{t.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NIEUWS LIVE FEED */}
      <section id="nieuws" className="mx-auto mt-24 max-w-7xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <SectionLabel>Live vanuit de cattery</SectionLabel>
            <h2 className="mt-5 font-display text-4xl tracking-tight text-forest-950 md:text-5xl">
              Laatste updates
            </h2>
          </div>
          <span className="hidden items-center gap-2 text-xs uppercase tracking-[0.2em] text-forest-600 md:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-forest-600" />
            </span>
            Realtime uit CMS
          </span>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recent.map((post, i) => (
            <article key={post.id} className="lift overflow-hidden rounded-3xl border border-forest-900/10 bg-cream-50 shadow-soft" style={{ animationDelay: `${i * 60}ms` }}>
              <ImageSlot label={post.tag} ratio="aspect-[16/10]" className="rounded-none" />
              <div className="p-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full bg-forest-100 px-2.5 py-1 font-medium text-forest-700">{post.tag}</span>
                  <time className="text-forest-600/70">{fmtDate(post.published_at)}</time>
                </div>
                <h3 className="mt-4 font-display text-xl text-forest-900">{post.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-forest-800/70 line-clamp-3">{post.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA PRIVATE ACCESS */}
      <section className="mx-auto mt-24 max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-forest-900 px-8 py-16 text-center shadow-lux md:px-16 md:py-20">
          <div className="absolute inset-0 bg-grain opacity-40" />
          <div className="relative">
            <PawMark className="mx-auto h-8 w-8 text-brass-300" />
            <h2 className="mx-auto mt-6 max-w-2xl font-display text-4xl text-cream-100 md:text-5xl">
              Toegang voor goedgekeurde kopers
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-cream-100/70">
              Beschikbare kittens, prijzen, medische dossiers en stamboominformatie zijn
              uitsluitend zichtbaar in de beveiligde Private Access omgeving.
            </p>
            <Link href="/login" className="mt-8 inline-flex rounded-full bg-brass-400 px-8 py-3.5 text-sm font-semibold text-forest-950 transition hover:bg-brass-300">
              Inloggen op Private Access
            </Link>
            <p className="mt-4 text-xs text-cream-100/40">Nog geen account? Neem contact op met de cattery.</p>
          </div>
        </div>
      </section>
    </>
  );
}
