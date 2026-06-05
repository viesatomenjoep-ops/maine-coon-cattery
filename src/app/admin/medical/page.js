'use client';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Select, Btn } from '@/components/admin';

const TYPES = ['Vaccinatie', 'Ontworming', 'Gezondheidscheck'];

export default function MedicalPage() {
  const { litters, kittens, addMedical } = useStore();
  const [litterId, setLitterId] = useState(litters[0]?.id || '');
  const [selected, setSelected] = useState([]);
  const [entry, setEntry] = useState({ type: TYPES[0], date: '', note: '' });
  const [done, setDone] = useState(false);

  const inLitter = kittens.filter((k) => k.litter_id === litterId);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const all = () => setSelected(inLitter.map((k) => k.id));
  const none = () => setSelected([]);

  const apply = () => {
    if (!entry.date || selected.length === 0) return;
    selected.forEach((id) => addMedical(id, { ...entry }));
    setDone(true);
    setSelected([]);
    setTimeout(() => setDone(false), 2200);
  };

  return (
    <>
      <PageHead label="Gezondheid" title="Medisch Dashboard">
        {done && <span className="rounded-full bg-forest-100 px-4 py-2 text-sm text-forest-700">✓ Toegevoegd aan dossiers</span>}
      </PageHead>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <h2 className="mb-4 font-display text-xl text-forest-900">Groepsbehandeling registreren</h2>
          <div className="grid gap-4">
            <Field label="Nestje"><Select value={litterId} onChange={(e)=>{setLitterId(e.target.value); setSelected([]);}}>{litters.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</Select></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Type"><Select value={entry.type} onChange={(e)=>setEntry({...entry, type:e.target.value})}>{TYPES.map(t=><option key={t}>{t}</option>)}</Select></Field>
              <Field label="Datum"><Input type="date" value={entry.date} onChange={(e)=>setEntry({...entry, date:e.target.value})} /></Field>
            </div>
            <Field label="Notitie"><Input value={entry.note} onChange={(e)=>setEntry({...entry, note:e.target.value})} placeholder="Bijv. Tweede enting (Nobivac)" /></Field>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Toepassen op kittens</span>
                <span className="text-xs"><button onClick={all} className="text-brass-600 hover:underline">Alle</button> · <button onClick={none} className="text-forest-600 hover:underline">Geen</button></span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {inLitter.map((k) => (
                  <button key={k.id} onClick={()=>toggle(k.id)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${selected.includes(k.id) ? 'border-brass-400 bg-brass-50 text-forest-900' : 'border-forest-900/15 text-forest-700 hover:bg-forest-100'}`}>
                    <span className={`mr-2 inline-block h-3 w-3 rounded-sm border ${selected.includes(k.id)?'bg-brass-400 border-brass-400':'border-forest-900/30'}`} />
                    {k.name}
                  </button>
                ))}
                {inLitter.length === 0 && <p className="text-sm text-forest-600/60">Nog geen kittens in dit nest.</p>}
              </div>
            </div>

            <Btn variant="brass" onClick={apply}>Registreren ({selected.length})</Btn>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-xl text-forest-900">Medische historie per kitten</h2>
          <div className="space-y-4">
            {inLitter.map((k) => (
              <div key={k.id} className="rounded-xl border border-forest-900/8 p-4">
                <p className="font-medium text-forest-900">{k.name}</p>
                {k.medical.length === 0 ? (
                  <p className="mt-1 text-xs text-forest-600/60">Nog geen registraties.</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {k.medical.map((m, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-forest-700">
                        <span className="rounded-full bg-forest-100 px-2 py-0.5 font-medium">{m.type}</span>
                        <span className="text-forest-600/70">{m.date}</span>
                        <span>· {m.note}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
