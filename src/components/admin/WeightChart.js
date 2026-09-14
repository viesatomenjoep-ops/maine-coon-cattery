'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { kleurVoor, MOEDER_KLEUR } from '@/lib/weights';

// Boven de kilo lees je kilo's makkelijker dan vier cijfers grammen.
const toon = (g) => (g >= 1000 ? `${(g / 1000).toFixed(2).replace('.', ',')} kg` : `${g} g`);

// Eigen tooltip, zodat de dieren op naam en op gewicht gesorteerd staan —
// dan lees je in één oogopslag wie voorloopt en wie achterblijft.
function Tip({ active, payload, label, kittens }) {
  if (!active || !payload?.length) return null;
  const regels = payload
    .filter((p) => p.value != null)
    .sort((a, b) => b.value - a.value);
  return (
    <div className="rounded-xl border border-forest-900/10 bg-white p-3 shadow-[0_8px_24px_-8px_rgba(28,20,15,0.25)]">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-forest-500">{label}</p>
      <div className="space-y-1">
        {regels.map((p) => {
          const k = kittens.find((x) => x.id === p.dataKey);
          return (
            <div key={p.dataKey} className="flex items-center gap-2.5 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
              <span className="min-w-0 flex-1 truncate text-forest-800">
                {k?.name || '—'}{k?.isMoeder && <span className="text-forest-400"> · moeder</span>}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-forest-950">{toon(p.value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function WeightChart({ data, kittens, verborgen = [], onToggle }) {
  if (!data?.length) return null;
  const heeftMoeder = kittens.some((k) => k.isMoeder && !verborgen.includes(k.id));
  // Bij veel meetmomenten liggen de stippen zo dicht op elkaar dat ze de lijn
  // helemaal bedekken. Dan alleen de curve tonen; hoveren geeft nog steeds een
  // stip met het exacte gewicht.
  const stippen = data.length <= 14;

  return (
    <div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, bottom: 5, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(36,64,46,0.1)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#5a6b5e' }}
              axisLine={{ stroke: 'rgba(36,64,46,0.15)' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="jong"
              tick={{ fontSize: 11, fill: '#5a6b5e' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}g`}
              width={56}
            />
            {/* Tweede as voor de moeder: zij weegt kilo's, anders wordt de
                grafiek van de jongen een vlakke streep onderin. */}
            <YAxis
              yAxisId="moeder"
              orientation="right"
              hide={!heeftMoeder}
              tick={{ fontSize: 11, fill: MOEDER_KLEUR }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)} kg`}
              width={56}
            />
            <Tooltip content={<Tip kittens={kittens} />} />
            {kittens.map((k, i) => {
              if (verborgen.includes(k.id)) return null;
              const kleur = k.kleur || kleurVoor(i);
              return (
                <Line
                  key={k.id}
                  type="monotone"
                  dataKey={k.id}
                  name={k.name}
                  stroke={kleur}
                  // De moeder weegt kilo's waar de jongen grammen wegen; haar lijn
                  // krijgt daarom een eigen as aan de rechterkant.
                  yAxisId={k.isMoeder ? 'moeder' : 'jong'}
                  strokeWidth={k.isMoeder ? 3 : 2.5}
                  strokeDasharray={k.isMoeder ? '6 3' : undefined}
                  dot={stippen ? { r: 3.5, fill: kleur, strokeWidth: 0 } : false}
                  activeDot={{ r: 6 }}
                  // Geen intro-animatie: die blijft hangen als het scherm op de
                  // achtergrond staat, en dan zie je een lege grafiek.
                  isAnimationActive={false}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Eigen legenda: klik een dier aan of uit om de grafiek rustiger te maken */}
      <div className="mt-4 flex flex-wrap gap-2">
        {kittens.map((k, i) => {
          const uit = verborgen.includes(k.id);
          return (
            <button
              key={k.id}
              type="button"
              onClick={() => onToggle?.(k.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                uit ? 'border-transparent bg-forest-900/5 text-forest-400' : 'border-forest-900/12 bg-white text-forest-800'
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: uit ? '#c9d2cb' : (k.kleur || kleurVoor(i)) }}
              />
              {k.name}{k.isMoeder && <span className="text-forest-400">· moeder</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
