'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHead, Icon } from '@/components/admin';

function TypeCard({ icon, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start gap-3 rounded-2xl border border-forest-900/10 bg-white/70 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-brass-400/60 hover:shadow-lg"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 transition group-hover:bg-brass-100 group-hover:text-brass-700">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <div>
        <p className="font-display text-lg text-forest-900">{title}</p>
        <p className="text-sm text-forest-600">{desc}</p>
      </div>
    </button>
  );
}

export default function NewCatPickerPage() {
  const router = useRouter();

  return (
    <>
      <Link href="/admin/litters" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-600 transition hover:text-forest-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
        Terug naar nestjes
      </Link>
      <PageHead label="Fokkerij" title="Kat toevoegen" />
      <p className="mb-6 text-sm text-forest-600">Wat wil je toevoegen?</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <TypeCard icon="cat" title="Nieuwe kitten" desc="Een kitten uit een van je nestjes." onClick={() => router.push('/admin/litters/new-kitten')} />
        <TypeCard icon="health" title="Fokpoes" desc="Een moederdier, niet gekoppeld aan een nestje." onClick={() => router.push('/admin/litters/new-breeder?gender=female')} />
        <TypeCard icon="health" title="Fokkater" desc="Een vaderdier, niet gekoppeld aan een nestje." onClick={() => router.push('/admin/litters/new-breeder?gender=male')} />
        <TypeCard icon="customer" title="Bestaande kat" desc="Een kat die je elders al had, handmatig invoeren." onClick={() => router.push('/admin/cats/new')} />
      </div>
    </>
  );
}
