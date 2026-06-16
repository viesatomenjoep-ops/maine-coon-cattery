'use client';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Btn } from '@/components/admin';
import { StatusPill } from '@/components/ui';

export default function CatsAdmin() {
  const { kittens } = useStore();

  return (
    <>
      <PageHead label="Database" title="Kattenbeheer">
        <Link href="/admin/cats/new">
          <Btn variant="solid">+ Nieuwe Kat</Btn>
        </Link>
      </PageHead>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-forest-900/10 text-xs uppercase tracking-wide text-forest-700">
              <tr>
                <th className="pb-3 pl-2 font-medium">Naam</th>
                <th className="pb-3 font-medium">Geslacht</th>
                <th className="pb-3 font-medium">Kleur</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Actie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-900/10">
              {kittens.map((k) => (
                <tr key={k.id} className="transition hover:bg-forest-900/5">
                  <td className="py-3 pl-2 font-medium text-forest-900">{k.name}</td>
                  <td className="py-3 text-forest-600">{k.sex}</td>
                  <td className="py-3 text-forest-600">{k.color}</td>
                  <td className="py-3">
                    <StatusPill status={k.status} />
                  </td>
                  <td className="py-3 text-right">
                    <Link href={`/admin/cats/${k.id}`} className="text-brass-600 hover:text-brass-700 hover:underline">
                      Beheer Dossier →
                    </Link>
                  </td>
                </tr>
              ))}
              {kittens.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-forest-500">
                    Geen katten gevonden in de database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
