'use client';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Select, Btn } from '@/components/admin';
import { StatusPill } from '@/components/ui';

const SEXES = ['Reu', 'Poes'];
const PATTERNS = ['Classic Tabby', 'Mackerel', 'Solid', 'Smoke', 'Bicolor'];
const STATUSES = ['Beschikbaar', 'Gereserveerd', 'Verkocht'];

export default function LittersPage() {
  const { litters, kittens, parents, addLitter, addKitten, updateKitten, deleteKitten } = useStore();
  const dams = parents.filter((p) => p.role.includes('Moeder'));
  const sires = parents.filter((p) => p.role.includes('Vader'));

  const [litter, setLitter] = useState({ name: '', sire_id: sires[0]?.id, dam_id: dams[0]?.id, born: '' });
  const [kit, setKit] = useState({ litter_id: litters[0]?.id, name: '', sex: 'Reu', color: '', pattern: PATTERNS[0], status: 'Beschikbaar' });

  const saveLitter = () => {
    if (!litter.name.trim()) return;
    addLitter({ ...litter });
    setLitter({ name: '', sire_id: sires[0]?.id, dam_id: dams[0]?.id, born: '' });
  };
  const saveKitten = () => {
    if (!kit.name.trim() || !kit.litter_id) return;
    addKitten({ ...kit });
    setKit({ ...kit, name: '', color: '' });
  };

  return (
    <>
      <PageHead label="Fokkerij" title="Nestjes & Kittens" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* New litter */}
        <Card>
          <h2 className="mb-4 font-display text-xl text-forest-900">Nieuw nestje aanmaken</h2>
          <div className="grid gap-4">
            <Field label="Naam nestje"><Input value={litter.name} onChange={(e)=>setLitter({...litter, name:e.target.value})} placeholder="Bijv. Noorderlicht" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Vader (Sire)"><Select value={litter.sire_id} onChange={(e)=>setLitter({...litter, sire_id:e.target.value})}>{sires.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
              <Field label="Moeder (Dam)"><Select value={litter.dam_id} onChange={(e)=>setLitter({...litter, dam_id:e.target.value})}>{dams.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select></Field>
            </div>
            <Field label="Geboortedatum"><Input type="date" value={litter.born} onChange={(e)=>setLitter({...litter, born:e.target.value})} /></Field>
            <Btn variant="brass" onClick={saveLitter}>Nestje toevoegen</Btn>
          </div>
        </Card>

        {/* New kitten */}
        <Card>
          <h2 className="mb-4 font-display text-xl text-forest-900">Kitten toevoegen</h2>
          <div className="grid gap-4">
            <Field label="Nestje"><Select value={kit.litter_id} onChange={(e)=>setKit({...kit, litter_id:e.target.value})}>{litters.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</Select></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Naam"><Input value={kit.name} onChange={(e)=>setKit({...kit, name:e.target.value})} placeholder="Bijv. Orion" /></Field>
              <Field label="Geslacht"><Select value={kit.sex} onChange={(e)=>setKit({...kit, sex:e.target.value})}>{SEXES.map(s=><option key={s}>{s}</option>)}</Select></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Kleurslag"><Input value={kit.color} onChange={(e)=>setKit({...kit, color:e.target.value})} placeholder="Bijv. Brown Tabby" /></Field>
              <Field label="Patroon"><Select value={kit.pattern} onChange={(e)=>setKit({...kit, pattern:e.target.value})}>{PATTERNS.map(p=><option key={p}>{p}</option>)}</Select></Field>
            </div>
            <Field label="Status"><Select value={kit.status} onChange={(e)=>setKit({...kit, status:e.target.value})}>{STATUSES.map(s=><option key={s}>{s}</option>)}</Select></Field>
            <Btn variant="brass" onClick={saveKitten}>Kitten toevoegen</Btn>
          </div>
        </Card>
      </div>

      {/* Existing kittens table */}
      <Card className="mt-6">
        <h2 className="mb-4 font-display text-xl text-forest-900">Alle kittens ({kittens.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-900/10 text-left text-xs uppercase tracking-wide text-forest-600/60">
                <th className="py-3 pr-4">Naam</th><th className="pr-4">Geslacht</th><th className="pr-4">Kleur</th>
                <th className="pr-4">Nest</th><th className="pr-4">Status</th><th className="pr-4">Acties</th>
              </tr>
            </thead>
            <tbody>
              {kittens.map((k) => (
                <tr key={k.id} className="border-b border-forest-900/8">
                  <td className="py-3 pr-4 font-medium text-forest-900">{k.name}</td>
                  <td className="pr-4 text-forest-700">{k.sex}</td>
                  <td className="pr-4 text-forest-700">{k.color}</td>
                  <td className="pr-4 text-forest-700">{litters.find(l=>l.id===k.litter_id)?.name || '—'}</td>
                  <td className="pr-4">
                    <Select value={k.status} onChange={(e)=>updateKitten(k.id,{status:e.target.value})} className="!py-1.5 !text-xs">
                      {STATUSES.map(s=><option key={s}>{s}</option>)}
                    </Select>
                  </td>
                  <td className="pr-4"><button onClick={()=>deleteKitten(k.id)} className="text-xs text-red-600 hover:underline">Verwijder</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
