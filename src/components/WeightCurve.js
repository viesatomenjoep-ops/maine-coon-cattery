'use client';

// Lightweight inline SVG growth chart — no external deps.
export default function WeightCurve({ weights }) {
  if (!weights || weights.length === 0) return null;

  const w = 520, h = 200, pad = 32;
  const maxG = Math.max(...weights.map((d) => d.g));
  const maxWk = Math.max(...weights.map((d) => d.week));
  const x = (wk) => pad + (wk / maxWk) * (w - pad * 2);
  const y = (g) => h - pad - (g / maxG) * (h - pad * 2);

  const line = weights.map((d, i) => `${i ? 'L' : 'M'} ${x(d.week)} ${y(d.g)}`).join(' ');
  const area = `${line} L ${x(maxWk)} ${h - pad} L ${x(0)} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      <defs>
        <linearGradient id="wc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c4863a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#c4863a" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={pad} x2={w - pad} y1={h - pad - f * (h - pad * 2)} y2={h - pad - f * (h - pad * 2)} stroke="#243228" strokeOpacity="0.08" />
      ))}
      <path d={area} fill="url(#wc)" />
      <path d={line} fill="none" stroke="#ad6c2f" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {weights.map((d) => (
        <g key={d.week}>
          <circle cx={x(d.week)} cy={y(d.g)} r="3.5" fill="#fff" stroke="#ad6c2f" strokeWidth="2" />
          <text x={x(d.week)} y={h - pad + 16} textAnchor="middle" className="fill-forest-700" fontSize="10">w{d.week}</text>
        </g>
      ))}
      <text x={pad} y={pad - 12} className="fill-forest-600" fontSize="10">{maxG} g</text>
    </svg>
  );
}
