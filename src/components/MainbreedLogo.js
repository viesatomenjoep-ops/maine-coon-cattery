// Het Mainbreed-beeldmerk: een pootafdruk, nagetekend als SVG zodat hij
// haarscherp blijft op elk formaat. De kleur volgt de tekstkleur (currentColor),
// zodat dezelfde poot ook op een donkere achtergrond kan staan.
export function PawLogo({ className = 'h-8 w-8' }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor" aria-hidden>
      {/* Grote voetzool */}
      <path d="M50 47c12 0 24 12.5 24 25 0 10.5-11 15.5-24 15.5S26 82.5 26 72c0-12.5 12-25 24-25Z" />
      {/* Twee middelste tenen */}
      <ellipse cx="39" cy="31" rx="8.6" ry="13.4" transform="rotate(-8 39 31)" />
      <ellipse cx="61" cy="31" rx="8.6" ry="13.4" transform="rotate(8 61 31)" />
      {/* Twee buitenste tenen */}
      <ellipse cx="19.5" cy="50" rx="8" ry="10.6" transform="rotate(-32 19.5 50)" />
      <ellipse cx="80.5" cy="50" rx="8" ry="10.6" transform="rotate(32 80.5 50)" />
    </svg>
  );
}

// Volledig logo: poot in een crème cirkel, met het woordmerk ernaast.
export default function MainbreedLogo({ className = '', light = false, showWord = true }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span
        className={`flex aspect-square h-[1.6em] shrink-0 items-center justify-center rounded-full ${
          light ? 'bg-cream-100/10 text-mainbreed-300' : 'bg-mainbreed-circle text-mainbreed-500'
        }`}
      >
        <PawLogo className="h-[62%] w-[62%]" />
      </span>
      {showWord && (
        <span className={`font-brand text-[1.15em] font-bold lowercase leading-none tracking-tight ${light ? 'text-cream-100' : 'text-mainbreed-500'}`}>
          mainbreed
        </span>
      )}
    </span>
  );
}
