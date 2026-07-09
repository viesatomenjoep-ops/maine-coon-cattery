'use client';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import LitterEditor from '@/components/admin/LitterEditor';

export default function LitterDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { litters = [] } = useStore();

  const lit = litters.find((l) => l.id === id);

  if (litters.length === 0) {
    return <p className="text-forest-700">Nestje laden…</p>;
  }

  if (!lit) {
    return (
      <div className="space-y-4">
        <p className="text-forest-700">Dit nestje bestaat niet (meer).</p>
        <Link href="/admin/litters" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">← Terug naar nestjes-overzicht</Link>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/admin/litters" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">← Alle nestjes</Link>
      </div>

      <LitterEditor initialLitterId={id} onClose={() => router.push('/admin/litters')} />
    </div>
  );
}
