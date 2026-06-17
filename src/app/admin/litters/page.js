'use client';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Select, Combobox, Btn } from '@/components/admin';

const SEXES = ['Kater', 'Poes'];
const PATTERNS = [
  'Classic Tabby', 'Mackerel Tabby', 'Spotted Tabby', 'Ticked Tabby',
  'Solid (Effen)', 'Smoke', 'Shaded', 'Shell/Chinchilla',
  'Bicolor', 'Harlequin', 'Van', 'Tortie (Schildpad)', 'Torbie'
];
const COLORS = [
  'Black (Zwart)', 'Blue (Blauw)', 'Red (Rood)', 'Cream (Crème)',
  'White (Wit)', 'Black Tortie', 'Blue Tortie'
];
const STATUSES = ['Beschikbaar', 'Gereserveerd', 'Verkocht', 'Evaluatie'];

export default function LittersPage() {
  const { litters, kittens, parents, addLitter, deleteLitter, addKitten, updateKitten, deleteKitten } = useStore();
  
  // Zorg dat we altijd bestaande kattennamen kunnen suggereren
  const damNames = Array.from(new Set([...parents.filter(p => p.gender === 'Poes').map(d => d.name), ...kittens.filter(k => k.gender === 'Poes').map(k => k.name)]));
  const sireNames = Array.from(new Set([...parents.filter(p => p.gender === 'Kater').map(d => d.name), ...kittens.filter(k => k.gender === 'Kater').map(k => k.name)]));

  const [litter, setLitter] = useState({ name: '', sire_name: '', dam_name: '', born: '' });
  const [kit, setKit] = useState({ litter_id: litters[0]?.id || '', name: '', sex: 'Kater', color: '', pattern: '', status: 'Beschikbaar' });

  const saveLitter = () => {
    if (!litter.name.trim()) return;
    addLitter({ ...litter });
    setLitter({ name: '', sire_name: '', dam_name: '', born: '' });
  };
  
  const saveKitten = () => {
    if (!kit.name.trim() || !kit.litter_id) return;
    addKitten({ ...kit, gender: kit.sex });
    setKit({ ...kit, name: '', color: '', pattern: '' });
  };

  return (
    <>
      <PageHead label="Fokkerij" title="Nestjes & Kittens" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* New litter */}
        <Card className="flex flex-col">
          <h2 className="mb-4 font-display text-xl text-forest-900">Nieuw nestje aanmaken</h2>
          <div className="grid gap-4 flex-1">
            <Field label="Naam nestje"><Input value={litter.name} onChange={(e)=>setLitter({...litter, name:e.target.value})} placeholder="Bijv. Noorderlicht" /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Vader (Sire)">
                <Combobox id="siresList" options={sireNames} value={litter.sire_name} onChange={(e)=>setLitter({...litter, sire_name:e.target.value})} placeholder="Kies of typ" />
              </Field>
              <Field label="Moeder (Dam)">
                <Combobox id="damsList" options={damNames} value={litter.dam_name} onChange={(e)=>setLitter({...litter, dam_name:e.target.value})} placeholder="Kies of typ" />
              </Field>
            </div>
            <Field label="Geboortedatum"><Input type="date" value={litter.born} onChange={(e)=>setLitter({...litter, born:e.target.value})} /></Field>
          </div>
          <Btn variant="brass" onClick={saveLitter} className="mt-6">Nestje toevoegen</Btn>
        </Card>

        {/* New kitten */}
        <Card className="flex flex-col">
          <h2 className="mb-4 font-display text-xl text-forest-900">Kitten toevoegen</h2>
          <div className="grid gap-4 flex-1">
            <Field label="Nestje">
              <Select value={kit.litter_id} onChange={(e)=>setKit({...kit, litter_id:e.target.value})}>
                <option value="">Selecteer nestje...</option>
                {litters.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Naam"><Input value={kit.name} onChange={(e)=>setKit({...kit, name:e.target.value})} placeholder="Bijv. Orion" /></Field>
              <Field label="Geslacht"><Select value={kit.sex} onChange={(e)=>setKit({...kit, sex:e.target.value})}>{SEXES.map(s=><option key={s} value={s}>{s}</option>)}</Select></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Kleurslag (Color)">
                <Combobox id="colorsList" options={COLORS} value={kit.color} onChange={(e)=>setKit({...kit, color:e.target.value})} placeholder="Bijv. Black Solid" />
              </Field>
              <Field label="Patroon (Pattern)">
                <Combobox id="patternsList" options={PATTERNS} value={kit.pattern} onChange={(e)=>setKit({...kit, pattern:e.target.value})} placeholder="Bijv. Classic Tabby" />
              </Field>
            </div>
            <Field label="Status"><Select value={kit.status} onChange={(e)=>setKit({...kit, status:e.target.value})}>{STATUSES.map(s=><option key={s} value={s}>{s}</option>)}</Select></Field>
          </div>
          <Btn variant="brass" onClick={saveKitten} className="mt-6">Kitten toevoegen</Btn>
        </Card>
      </div>

      {/* Litters & Kittens Tree */}
      <div className="mt-12 space-y-8">
        <h2 className="font-display text-2xl text-forest-900">Overzicht Fokbestand</h2>
        
        {litters.length === 0 && <p className="text-forest-700">Geen nestjes gevonden. Voeg er bovenaan eentje toe.</p>}

        {litters.map(litter => {
          const nestKittens = kittens.filter(k => k.litter_id === litter.id);
          return (
            <Card key={litter.id} className="overflow-hidden p-0">
              <div className="bg-forest-900/5 p-5 flex flex-wrap items-center justify-between gap-4 border-b border-forest-900/10">
                <div>
                  <h3 className="font-display text-xl text-forest-950">{litter.name}</h3>
                  <p className="text-sm text-forest-700 mt-1">
                    {litter.sire_name || 'Onbekende vader'} x {litter.dam_name || 'Onbekende moeder'} 
                    <span className="mx-2 opacity-50">|</span> 
                    {litter.date_of_birth ? new Date(litter.date_of_birth).toLocaleDateString('nl-NL') : 'Datum onbekend'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Btn variant="ghost" onClick={()=>deleteLitter(litter.id)} className="!text-red-600 hover:!bg-red-50 !py-1.5 !px-3 !text-xs">Nestje verwijderen</Btn>
                </div>
              </div>
              
              <div className="p-0">
                {nestKittens.length === 0 ? (
                  <p className="p-5 text-sm text-forest-600 italic">Nog geen kittens in dit nestje.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white border-b border-forest-900/5 text-left text-xs uppercase tracking-wide text-forest-600/60">
                          <th className="py-3 pl-5 pr-4">Kitten Naam</th>
                          <th className="pr-4">Geslacht</th>
                          <th className="pr-4">Vacht (Kleur & Patroon)</th>
                          <th className="pr-4">Status</th>
                          <th className="pr-5 text-right">Acties</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {nestKittens.map((k) => (
                          <tr key={k.id} className="border-b border-forest-900/5 last:border-none hover:bg-forest-50/50 transition">
                            <td className="py-3 pl-5 pr-4 font-semibold text-forest-900">{k.name}</td>
                            <td className="pr-4 text-forest-700">{k.gender || k.sex}</td>
                            <td className="pr-4 text-forest-700">{[k.color, k.pattern].filter(Boolean).join(' ') || 'Onbekend'}</td>
                            <td className="pr-4">
                              <Select value={k.status} onChange={(e)=>updateKitten(k.id,{status:e.target.value})} className="!py-1 !text-xs !bg-transparent !border-none !px-0 cursor-pointer text-brass-700 font-medium">
                                {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                              </Select>
                            </td>
                            <td className="pr-5 text-right">
                              <button onClick={()=>deleteKitten(k.id)} className="text-xs text-red-500 hover:text-red-700 underline transition">Verwijder</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
