'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHead } from '@/components/admin';
import LitterEditor from '@/components/admin/LitterEditor';
import { useStore } from '@/context/StoreContext';
import { cap } from '@/lib/species';

export default function NewLitterPage() {
  const router = useRouter();
  const { terms } = useStore();

  return (
    <div className="pb-28 lg:pb-0">
      <Link href="/admin/litters" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-600 transition hover:text-forest-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
        {`Terug naar ${terms.litterPlural}`}
      </Link>
      <PageHead label="Fokkerij" title={`Nieuw ${terms.litter}`} />
      <LitterEditor initialLitterId={null} onClose={() => router.push('/admin/litters')} />
    </div>
  );
}
