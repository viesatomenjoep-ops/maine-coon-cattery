'use client';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card } from '@/components/admin';
import { StatusPill } from '@/components/ui';
import { collectUpcoming, urgency, treatmentIcon, formatDate } from '@/lib/treatments';
import PushSetup from '@/components/admin/PushSetup';

export default function AdminDashboard() {
  const { kittens, litters, news, interests = [], updateInterest, deleteInterest, updateKitten } = useStore();
  const agenda = collectUpcoming(kittens).slice(0, 8);

  const newInterests = interests.filter((i) => (i.status || 'nieuw') === 'nieuw');
  const kittenName = (id) => kittens.find((k) => k.id === id)?.name || 'Onbekende kitten';
  const litterName = (id) => litters.find((l) => l.id === id)?.name;

  const reserve = async (it) => {
    await updateKitten(it.cat_id, { status: 'Gereserveerd', reserved_by: it.name });
    await updateInterest(it.id, { status: 'gereserveerd' });
    alert(`${kittenName(it.cat_id)} is op Gereserveerd gezet voor ${it.name}.`);
  };
  const available = kittens.filter((k) => k.status === 'Beschikbaar').length;
  const reserved = kittens.filter((k) => k.status === 'Gereserveerd').length;
  const sold = kittens.filter((k) => k.status === 'Verkocht').length;
  const published = kittens.filter((k) => k.published).length;

  const stats = [
    { label: 'Actieve nestjes', value: litters.filter((l) => !l.expected).length, sub: `${litters.filter((l)=>l.expected).length} verwacht`, href: '/admin/litters' },
    { label: 'Beschikbaar', value: available, sub: 'live in portaal', href: '/admin/cats' },
    { label: 'Gereserveerd', value: reserved, sub: 'in proces', href: '/admin/cats' },
    { label: 'Gepubliceerd', value: published, sub: 'advertenties', href: '/admin/sales' },
  ];

  return (
    <>
      <PageHead label="Overzicht" title="Welkom terug" />

      <PushSetup />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="block group">
            <Card className="h-full transition duration-300 hover:border-brass-400 hover:shadow-md group-hover:bg-white">
              <p className="text-xs uppercase tracking-wide text-forest-600/60 transition group-hover:text-forest-800">{s.label}</p>
              <p className="mt-2 font-display text-4xl text-forest-950 transition group-hover:text-brass-600">{s.value}</p>
              <p className="mt-1 text-xs text-forest-600/70">{s.sub}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Interesse-aanvragen vanaf de publieke advertentielinks */}
      {newInterests.length > 0 && (
        <div className="mt-8">
          <Card className="border-brass-300 bg-brass-50/40">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl text-forest-900">💬 Nieuwe interesse in kittens</h2>
              <span className="rounded-full bg-brass-200 px-3 py-1 text-xs font-semibold text-brass-800">{newInterests.length} nieuw</span>
            </div>
            <div className="space-y-3">
              {newInterests.map((it) => (
                <div key={it.id} className="flex flex-col gap-3 rounded-xl border border-forest-900/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold text-forest-900">
                      {it.name} wil <span className="text-brass-700">{kittenName(it.cat_id)}</span>
                      {litterName(it.litter_id) && <span className="text-forest-500"> · nestje {litterName(it.litter_id)}</span>}
                    </p>
                    <p className="text-xs text-forest-600">
                      {it.contact ? <>📞 {it.contact} · </> : null}
                      <span suppressHydrationWarning>{it.created_at ? new Date(it.created_at).toLocaleDateString('nl-NL') : ''}</span>
                    </p>
                    {it.message && <p className="mt-1 text-sm italic text-forest-700">“{it.message}”</p>}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => reserve(it)} className="inline-flex items-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600">Gereserveerd</button>
                    <button onClick={() => { if (confirm('Deze interesse-aanvraag verwijderen?')) deleteInterest(it.id); }} className="inline-flex items-center rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">Verwijder</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Behandelagenda: aankomende ontwormingen & inentingen */}
      <div className="mt-8">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-forest-900">🗓️ Behandelagenda</h2>
            <Link href="/admin/medical" className="text-sm text-brass-600 hover:underline">Medisch dashboard →</Link>
          </div>
          {agenda.length === 0 ? (
            <p className="text-sm text-forest-600/70">Geen geplande behandelingen. Plan een ontworming of inenting in het medisch dashboard.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {agenda.map((a, i) => {
                const u = urgency(a.due);
                return (
                  <Link key={a.medId || i} href={`/admin/cats/${a.catId}`} className={`flex items-center gap-3 rounded-xl border bg-white p-3 transition hover:shadow-md ${u?.key === 'overdue' || u?.key === 'today' ? 'border-red-200' : 'border-forest-900/10'}`}>
                    <span className="text-xl">{treatmentIcon(a.type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-forest-900">{a.catName}</p>
                      <p className="truncate text-[11px] text-forest-600">{a.type} · {formatDate(a.due)}</p>
                    </div>
                    {u && <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${u.cls}`}>{u.label}</span>}
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-forest-900">Kittens</h2>
            <Link href="/admin/cats" className="text-sm text-brass-600 hover:underline">Beheren →</Link>
          </div>
          <div className="space-y-2">
            {kittens.map((k) => (
              <div key={k.id} className="flex items-center justify-between rounded-xl border border-forest-900/8 px-4 py-3">
                <div>
                  <p className="font-medium text-forest-900">{k.name}</p>
                  <p className="text-xs text-forest-600/70">{k.sex} · {k.color}</p>
                </div>
                <StatusPill status={k.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-forest-900">Recente nieuwsberichten</h2>
            <Link href="/admin/news" className="text-sm text-brass-600 hover:underline">Editor →</Link>
          </div>
          <div className="space-y-3">
            {news.slice(0, 4).map((n) => (
              <div key={n.id} className="border-b border-forest-900/8 pb-3 last:border-0">
                <p className="text-sm font-medium text-forest-900">{n.title}</p>
                <p className="text-xs text-forest-600/70" suppressHydrationWarning>{new Date(n.published_at).toLocaleDateString('nl-NL')} · {n.tag}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
