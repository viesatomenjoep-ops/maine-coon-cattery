'use client';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card } from '@/components/admin';
import { StatusPill } from '@/components/ui';

export default function AdminDashboard() {
  const { kittens, litters, news } = useStore();
  const available = kittens.filter((k) => k.status === 'Beschikbaar').length;
  const reserved = kittens.filter((k) => k.status === 'Gereserveerd').length;
  const sold = kittens.filter((k) => k.status === 'Verkocht').length;
  const published = kittens.filter((k) => k.published).length;

  const stats = [
    { label: 'Actieve nestjes', value: litters.filter((l) => !l.expected).length, sub: `${litters.filter((l)=>l.expected).length} verwacht` },
    { label: 'Beschikbaar', value: available, sub: 'live in portaal' },
    { label: 'Gereserveerd', value: reserved, sub: 'in proces' },
    { label: 'Gepubliceerd', value: published, sub: 'advertenties' },
  ];

  return (
    <>
      <PageHead label="Overzicht" title="Welkom terug" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-xs uppercase tracking-wide text-forest-600/60">{s.label}</p>
            <p className="mt-2 font-display text-4xl text-forest-950">{s.value}</p>
            <p className="mt-1 text-xs text-forest-600/70">{s.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl text-forest-900">Kittens</h2>
            <Link href="/admin/litters" className="text-sm text-brass-600 hover:underline">Beheren →</Link>
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
                <p className="text-xs text-forest-600/70">{new Date(n.published_at).toLocaleDateString('nl-NL')} · {n.tag}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
