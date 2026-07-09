'use client';
import { useState, useEffect, useRef } from 'react';

// Typemachine-effect: typt de tekst letter voor letter zodra hij in beeld komt.
export default function Typewriter({ text = '', speed = 14, className = '' }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  // Start pas wanneer het element zichtbaar wordt (mooie binnenkomst).
  useEffect(() => {
    if (!ref.current || started) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || !text) return;
    if (count >= text.length) return;
    const t = setTimeout(() => setCount((c) => Math.min(c + 2, text.length)), speed);
    return () => clearTimeout(t);
  }, [started, count, text, speed]);

  const done = count >= (text?.length || 0);
  return (
    <span ref={ref} className={className} style={{ whiteSpace: 'pre-line' }}>
      {started ? text.slice(0, count) : ''}
      {!done && <span className="animate-pulse text-brass-400">▍</span>}
    </span>
  );
}
