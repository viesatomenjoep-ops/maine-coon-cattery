'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { dueSoon, urgency, treatmentIcon, formatDate } from '@/lib/treatments';

const SEEN_KEY = 'wd_treatment_notified';

// Toont een banner + browser-notificatie voor behandelingen die te laat zijn
// of binnen 7 dagen vallen. Werkt zodra het admin-portaal geopend is.
export default function TreatmentReminders() {
  const { kittens } = useStore();
  const [dismissed, setDismissed] = useState(false);
  const items = dueSoon(kittens); // te laat of binnen 7 dagen

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (items.length === 0) return;

    const fire = () => {
      let seen = {};
      try { seen = JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); } catch {}
      const todayKey = new Date().toISOString().slice(0, 10);
      let changed = false;
      for (const it of items) {
        // Eén melding per behandeling per dag (geen spam bij elke refresh).
        const key = `${it.medId || it.catId + it.due}-${todayKey}`;
        if (seen[key]) continue;
        const u = urgency(it.due);
        try {
          new Notification(`🐾 ${it.type} — ${it.catName}`, {
            body: u?.key === 'overdue'
              ? `Let op: ${it.type.toLowerCase()} is ${u.label.toLowerCase()}.`
              : `${it.type} nodig ${(u?.label || '').toLowerCase()} (${formatDate(it.due)}).`,
          });
        } catch {}
        seen[key] = true;
        changed = true;
      }
      if (changed) { try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch {} }
    };

    if (Notification.permission === 'granted') fire();
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((p) => { if (p === 'granted') fire(); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  if (items.length === 0 || dismissed) return null;

  const overdue = items.filter((i) => i.days < 0).length;
  const today = items.filter((i) => i.days === 0).length;

  return (
    <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔔</span>
          <div>
            <p className="font-semibold text-amber-900">Behandelingen die aandacht nodig hebben</p>
            <p className="text-sm text-amber-800/80">
              {overdue > 0 && <>{overdue} te laat · </>}
              {today > 0 && <>{today} vandaag · </>}
              {items.length} binnen 7 dagen.
            </p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="shrink-0 rounded-lg px-2 py-1 text-sm text-amber-800 hover:bg-amber-100">Verberg</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.slice(0, 6).map((it, i) => {
          const u = urgency(it.due);
          return (
            <Link key={it.medId || i} href={`/admin/cats/${it.catId}`} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${u?.cls}`}>
              <span>{treatmentIcon(it.type)}</span>{it.catName}: {it.type} · {u?.label}
            </Link>
          );
        })}
        {items.length > 6 && (
          <Link href="/admin/medical" className="inline-flex items-center rounded-full bg-amber-200 px-3 py-1 text-xs font-semibold text-amber-900">+{items.length - 6} meer</Link>
        )}
      </div>
    </div>
  );
}
