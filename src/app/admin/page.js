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
    { label: 'Actieve nestjes', value: litters.filter((l) => !l.expected).length, sub: `${litters.filter((l)=>l.expected).length} verwacht`, href: '/admin/litters' },
    { label: 'Beschikbaar', value: available, sub: 'live in portaal', href: '/admin/cats' },
    { label: 'Gereserveerd', value: reserved, sub: 'in proces', href: '/admin/cats' },
    { label: 'Gepubliceerd', value: published, sub: 'advertenties', href: '/admin/sales' },
  ];

  return (
    <>
      <PageHead label="Overzicht" title="Welkom terug" />

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
