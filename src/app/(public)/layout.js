'use client';
import PublicNav from '@/components/PublicNav';
import { useLanguage } from '@/context/LanguageContext';

export default function PublicLayout({ children }) {
  const { t, mounted } = useLanguage();

  return (
    <div className="relative z-10">
      <PublicNav />
      <main>{children}</main>
      <footer id="contact" className="mt-24 bg-ink text-cream-100/80">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-3">
          <div>
            <p className="font-display text-3xl font-light text-cream-100">Wendy's Dream</p>
            <p className="mt-3 max-w-xs text-sm text-cream-100/60 leading-relaxed font-light">
              {mounted ? t('footer_desc') : 'Een exclusieve en warme oase voor de majestueuze Maine Coon.'}
            </p>
          </div>
          <div className="text-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-300">{mounted ? t('nav_contact') : 'Contact'}</p>
            <p className="font-light">info@wendysdream.nl</p>
            <p className="font-light">+31 6 45070868</p>
            <p className="mt-2 text-cream-100/50 font-light mb-4">{mounted ? t('footer_hours_label') : 'Ibiza & Nederland · Op afspraak'}</p>
            
            <div className="flex flex-col gap-2 mt-4 max-w-[200px]">
              <a
                href="https://wa.me/31645070868"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-emerald-600/90 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-emerald-600 shadow-soft"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.022-.079-.085-.153-.13-.21s-.11-.088-.23-.153c-.12-.066-.707-.35-0.817-.39-.11-.04-.19-.06-.27.06-.08.12-.31.39-.38.47-.07.08-.14.09-.26.03-.12-.06-.506-.187-.963-.596-.356-.317-.597-.71-.667-.83-.07-.12-.007-.185.053-.245.054-.054.12-.139.18-.208.058-.069.079-.119.119-.198.04-.079.02-.149-.01-.21-.03-.062-.27-.65-.37-.89-.098-.24-.2-.2-.27-.208-.067-.008-.143-.01-.22-.01-.079 0-.208.03-.317.149-.11.12-.417.408-.417.997 0 .59.428 1.159.488 1.239.06.079.843 1.287 2.041 1.802.285.123.507.196.68.252.286.09.547.078.753.047.23-.035.707-.29 0.807-.57.1-.28.1-.52.07-.57-.03-.05-.1-.08-.22-.143zM12 2C6.477 2 2 6.477 2 12c0 1.91.536 3.693 1.465 5.215L2.05 21.95l4.896-1.285C8.384 21.503 10.134 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.634 0-3.17-.436-4.507-1.198l-.323-.184-2.894.76.773-2.82-.202-.322C4.092 14.913 3.6 13.507 3.6 12c0-4.632 3.768-8.4 8.4-8.4s8.4 3.768 8.4 8.4-3.768 8.4-8.4 8.4z"/>
                </svg>
                WhatsApp
              </a>
              <a
                href="tel:+31645070868"
                className="flex items-center justify-center gap-2 rounded-full border border-cream-100/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-cream-100 transition hover:bg-cream-100/10 shadow-soft"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Bellen
              </a>
            </div>
          </div>
          <div className="text-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-terracotta-300">{mounted ? t('footer_care_title') : 'Gezondheid & Zorg'}</p>
            <p className="font-light">{mounted ? t('footer_care_text') : 'Al onze ouderdieren zijn uitvoerig getest.'}</p>
            <p className="mt-2 text-cream-100/50 font-light">{mounted ? t('footer_care_sub') : 'Grootgebracht in liefdevolle kring.'}</p>
          </div>
        </div>
        <div className="border-t border-cream-100/10 py-6 text-center text-xs text-cream-100/40 font-light">
          © {new Date().getFullYear()} {mounted ? t('footer_copyright') : 'Wendy\'s Dream'}
        </div>
      </footer>
    </div>
  );
}
