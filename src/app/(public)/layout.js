import PublicNav from '@/components/PublicNav';

export default function PublicLayout({ children }) {
  return (
    <div className="relative z-10">
      <PublicNav />
      <main>{children}</main>
      <footer id="contact" className="mt-24 bg-ink text-cream-100/80">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-3">
          <div>
            <p className="font-display text-3xl font-light text-cream-100">Wendy's Dream</p>
            <p className="mt-3 max-w-xs text-sm text-cream-100/60 leading-relaxed font-light">
              Een exclusieve en warme oase voor de majestueuze Maine Coon. 
              Waar liefde, rust en gezondheid samenkomen om dromen te realiseren.
            </p>
          </div>
          <div className="text-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-300">Contact</p>
            <p className="font-light">dromen@wendysdream.nl</p>
            <p className="font-light">+31 6 87 65 43 21</p>
            <p className="mt-2 text-cream-100/50 font-light">Ibiza & Nederland · Op afspraak</p>
          </div>
          <div className="text-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-300">Gezondheid & Zorg</p>
            <p className="font-light">Al onze ouderdieren zijn uitvoerig getest en vrij bevonden van HCM, SMA en PKDef.</p>
            <p className="mt-2 text-cream-100/50 font-light">Grootgebracht in een liefdevolle, huiselijke kring.</p>
          </div>
        </div>
        <div className="border-t border-cream-100/10 py-6 text-center text-xs text-cream-100/40 font-light">
          © {new Date().getFullYear()} Wendy's Dream · Premium Cattery Brochure
        </div>
      </footer>
    </div>
  );
}
