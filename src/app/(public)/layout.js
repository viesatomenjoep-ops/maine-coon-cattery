import PublicNav from '@/components/PublicNav';

export default function PublicLayout({ children }) {
  return (
    <div className="relative z-10">
      <PublicNav />
      <main>{children}</main>
      <footer id="contact" className="mt-24 bg-forest-950 text-cream-100/80">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl text-cream-100">Maelduin</p>
            <p className="mt-3 max-w-xs text-sm text-cream-100/60">
              Een kleinschalige cattery, toegewijd aan gezonde, getypeerde Maine Coons
              met een uitstekend karakter.
            </p>
          </div>
          <div className="text-sm">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-brass-300">Contact</p>
            <p>info@maelduin.nl</p>
            <p>+31 6 12 34 56 78</p>
            <p className="mt-2 text-cream-100/50">Op afspraak · Nederland</p>
          </div>
          <div className="text-sm">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-brass-300">Registratie</p>
            <p>Aangesloten bij erkende stamboomvereniging</p>
            <p className="mt-2 text-cream-100/50">Ouders getest op HCM · SMA · PKDef</p>
          </div>
        </div>
        <div className="border-t border-cream-100/10 py-6 text-center text-xs text-cream-100/40">
          © {new Date().getFullYear()} Cattery Maelduin · Prototype voor Viesa Automations
        </div>
      </footer>
    </div>
  );
}
