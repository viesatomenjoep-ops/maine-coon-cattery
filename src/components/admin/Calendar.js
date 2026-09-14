'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { EVENT_TYPES, DAY_NAMES, MONTH_NAMES, monthGrid, weekGrid, toKey, isSameDay } from '@/lib/agenda';

// Eén gebeurtenis als streepje in een dagvakje.
function EventPill({ ev, onPick }) {
  const meta = EVENT_TYPES[ev.type] || EVENT_TYPES.eigen;
  return (
    <button
      onClick={() => onPick(ev)}
      title={`${ev.title}${ev.subtitle ? ` — ${ev.subtitle}` : ''}`}
      className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-left transition hover:bg-forest-900/5"
    >
      <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
      <span className="truncate text-[13px] leading-tight text-forest-800">{ev.title}</span>
    </button>
  );
}

export default function Calendar({ events, view, cursor, onPick, today = new Date() }) {
  // Gebeurtenissen per dag, zodat opzoeken snel gaat.
  const byDay = useMemo(() => {
    const map = {};
    for (const e of events) (map[e.date] ||= []).push(e);
    return map;
  }, [events]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  if (view === 'dag') {
    const key = toKey(cursor);
    const list = byDay[key] || [];
    return (
      <div className="overflow-hidden rounded-2xl border border-forest-900/10 bg-white">
        <div className="border-b border-forest-900/10 bg-forest-50/60 px-5 py-3">
          <p className="font-display text-xl text-forest-950">
            {DAY_NAMES[(cursor.getDay() + 6) % 7]} {cursor.getDate()} {MONTH_NAMES[month]}
          </p>
        </div>
        <div className="p-5">
          {list.length === 0 ? (
            <p className="text-sm text-forest-500">Niets gepland op deze dag.</p>
          ) : (
            <div className="space-y-2">
              {list.map((ev) => {
                const meta = EVENT_TYPES[ev.type] || EVENT_TYPES.eigen;
                return (
                  <button
                    key={ev.id}
                    onClick={() => onPick(ev)}
                    className="flex w-full items-center gap-3 rounded-xl border border-forest-900/10 bg-white p-3 text-left transition hover:border-forest-900/20"
                  >
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-forest-900">{ev.title}</span>
                      {ev.subtitle && <span className="block truncate text-sm text-forest-500">{ev.subtitle}</span>}
                    </span>
                    <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${meta.chip}`}>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const days = view === 'week' ? weekGrid(cursor) : monthGrid(year, month);

  return (
    <div className="overflow-hidden rounded-2xl border border-forest-900/10 bg-white">
      {/* Dagkoppen */}
      <div className="grid grid-cols-7 border-b border-forest-900/10 bg-forest-50/60">
        {DAY_NAMES.map((d) => (
          <div key={d} className="px-2 py-2.5 text-center text-xs font-bold uppercase tracking-wider text-forest-600">
            {d}
          </div>
        ))}
      </div>

      {/* Dagvakjes */}
      <div className={`grid grid-cols-7 ${view === 'week' ? '' : 'grid-rows-[repeat(auto-fill,minmax(0,1fr))]'}`}>
        {days.map((d) => {
          const key = toKey(d);
          const list = byDay[key] || [];
          const inMonth = view === 'week' || d.getMonth() === month;
          const isToday = isSameDay(d, today);
          return (
            <div
              key={key}
              className={`border-b border-r border-forest-900/8 p-1.5 ${view === 'week' ? 'min-h-[14rem]' : 'min-h-[7rem]'} ${inMonth ? 'bg-white' : 'bg-forest-50/30'}`}
            >
              <div className="mb-1 flex justify-end px-1">
                <span
                  className={`flex h-6 min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-sm font-semibold ${
                    isToday ? 'bg-forest-800 text-cream-50' : inMonth ? 'text-forest-700' : 'text-forest-300'
                  }`}
                >
                  {d.getDate()}
                </span>
              </div>
              <div className="space-y-0.5">
                {list.slice(0, view === 'week' ? 12 : 3).map((ev) => (
                  <EventPill key={ev.id} ev={ev} onPick={onPick} />
                ))}
                {list.length > (view === 'week' ? 12 : 3) && (
                  <p className="px-1.5 text-[12px] font-medium text-forest-500">
                    +{list.length - (view === 'week' ? 12 : 3)} meer
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
