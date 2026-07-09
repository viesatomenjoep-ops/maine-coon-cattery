'use client';
import { useEffect } from 'react';

// Fullscreen fotoweergave (lightbox). Werkt op mobiel en alle browsers/devices.
// Klik of tik buiten de foto, op de kruis-knop, of druk op Esc om te sluiten.
export default function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    if (!src) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <button
        onClick={onClose}
        aria-label="Sluiten"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-3xl leading-none text-white transition hover:bg-white/30"
      >
        ×
      </button>
      <img
        src={src}
        alt={alt || ''}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] max-w-[96vw] select-none rounded-lg object-contain shadow-2xl"
      />
    </div>
  );
}
