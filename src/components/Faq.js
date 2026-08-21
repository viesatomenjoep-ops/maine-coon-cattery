'use client';
import { useState } from 'react';

// Eén vraag met een soepel uitschuivend antwoord.
function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className={`rounded-2xl border transition-colors duration-300 ${open ? 'border-mainbreed-300 bg-white' : 'border-mainbreed-900/8 bg-white/70 hover:border-mainbreed-200'}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-display text-lg leading-snug text-ink">{q}</span>
        <span className={`mt-1 shrink-0 text-mainbreed-500 transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </span>
      </button>
      {/* Uitschuiven via grid-rows, zodat het werkt zonder vaste hoogte. */}
      <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm leading-relaxed text-ink/65">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faq({ items }) {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <FaqItem
          key={item.q}
          q={item.q}
          a={item.a}
          open={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
        />
      ))}
    </div>
  );
}
