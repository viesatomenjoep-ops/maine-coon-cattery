'use client';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Input, Select, Btn } from '@/components/admin';
import { StatusPill, ImageSlot } from '@/components/ui';

const STATUSES = ['Beschikbaar', 'Gereserveerd', 'Verkocht'];
const eur = (n) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);

export default function SalesPage() {
  const { kittens, updateKitten } = useStore();

  return (
    <>
      <PageHead label="Verkoop" title="Advertentie & Sales Beheer" />
      <p className="-mt-4 mb-8 max-w-2xl text-sm text-forest-700/70">
        Publiceer kittens als advertentie in de Private Access omgeving, stel de prijs in en
        werk de status bij. Wijzigingen zijn direct zichtbaar voor ingelogde klanten.
      </p>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {kittens.map((k) => (
          <Card key={k.id} className="flex flex-col">
            <div className="relative">
              <ImageSlot label={k.name} ratio="aspect-[4/3]" className="!rounded-xl" />
              <div className="absolute left-3 top-3"><StatusPill status={k.status} /></div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className="font-display text-xl text-forest-900">{k.name}</h3>
              <span className="text-sm text-forest-600/70">{k.sex} · {k.color}</span>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Prijs (EUR)</span>
                <Input type="number" value={k.price} onChange={(e)=>updateKitten(k.id,{price:Number(e.target.value)})} className="mt-1" />
              </label>
              <label className="block">
                <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Status</span>
                <Select value={k.status} onChange={(e)=>updateKitten(k.id,{status:e.target.value})} className="mt-1">
                  {STATUSES.map(s=><option key={s}>{s}</option>)}
                </Select>
              </label>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-forest-900/8 pt-4">
              <span className="text-sm text-forest-600/70">{k.published ? 'Live in portaal' : 'Niet gepubliceerd'}</span>
              <Btn
                variant={k.published ? 'ghost' : 'brass'}
                onClick={()=>updateKitten(k.id,{published:!k.published})}
              >
                {k.published ? 'Offline halen' : 'Publiceren'}
              </Btn>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
