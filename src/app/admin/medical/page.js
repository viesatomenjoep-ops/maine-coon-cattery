'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Select, Btn } from '@/components/admin';

const TYPES = ['Vaccinatie', 'Ontworming', 'Gezondheidscheck'];

export default function MedicalPage() {
  const { litters, kittens, addMedical, deleteMedical } = useStore();
  const [litterId, setLitterId] = useState('');
  const [selected, setSelected] = useState([]);
  const [entry, setEntry] = useState({ type: TYPES[0], date: '', note: '' });
  const [done, setDone] = useState(false);
  const [singleEntry, setSingleEntry] = useState({}); // { catId: { type, date, note } }

  // Zorg dat we het eerste nestje selecteren als litters binnenkomen
  useEffect(() => {
    if (!litterId && litters.length > 0) {
      setLitterId(litters[0].id);
    }
  }, [litters, litterId]);

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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Type"><Select value={entry.type} onChange={(e)=>setEntry({...entry, type:e.target.value})}>{TYPES.map(t=><option key={t}>{t}</option>)}</Select></Field>
              <Field label="Datum"><Input type="date" value={entry.date} onChange={(e)=>setEntry({...entry, date:e.target.value})} /></Field>
            </div>
            <Field label="Notitie"><Input value={entry.note} onChange={(e)=>setEntry({...entry, note:e.target.value})} placeholder="Bijv. Tweede enting (Nobivac)" /></Field>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Toepassen op kittens</span>
                <span className="text-xs"><button onClick={all} className="text-brass-600 hover:underline">Alle</button> · <button onClick={none} className="text-forest-600 hover:underline">Geen</button></span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {inLitter.map((k) => (
                  <button key={k.id} onClick={()=>toggle(k.id)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${selected.includes(k.id) ? 'border-brass-400 bg-brass-50 text-forest-900' : 'border-forest-900/15 text-forest-700 hover:bg-forest-100'}`}>
                    <span className={`mr-2 inline-block h-3 w-3 rounded-sm border ${selected.includes(k.id)?'bg-brass-400 border-brass-400':'border-forest-900/30'}`} />
                    <span className="truncate">{k.name}</span>
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
          <div className="space-y-3">
            {inLitter.map((k) => (
              <Link key={k.id} href={`/admin/cats/${k.id}`} className="block group">
                <div className="rounded-2xl border border-forest-900/10 bg-white p-4 transition duration-300 hover:border-brass-400 hover:shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-display text-lg font-semibold text-forest-950 group-hover:text-brass-600 transition">{k.name}</p>
                    <span className="text-xs font-medium text-forest-600/70 bg-forest-50 px-2 py-1 rounded-lg">Bekijk dossier →</span>
                  </div>
                  
                  {k.medical.length === 0 ? (
                    <p className="text-xs text-forest-600/60 italic">Nog geen medische historie.</p>
                  ) : (
                    <div className="flex flex-col gap-2 mt-2">
                      {k.medical.map((m, i) => {
                        const icon = m.type === 'Vaccinatie' ? '💉' : m.type === 'Ontworming' ? '💊' : '🩺';
                        return (
                          <div key={i} className="flex items-center justify-between gap-1.5 rounded-lg border border-forest-900/5 bg-cream-50 px-3 py-2 text-xs text-forest-800">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{icon}</span>
                              <span suppressHydrationWarning className="font-medium min-w-[70px]">{new Date(m.date).toLocaleDateString('nl-NL', { day:'numeric', month:'short' })}</span>
                              <span className="text-forest-600">{m.type}: {m.note}</span>
                            </div>
                            <button onClick={(e) => { e.preventDefault(); deleteMedical(k.id, i); }} className="text-red-500 hover:text-red-700 ml-2">Verwijder</button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-4 border-t border-forest-900/10 pt-3 flex flex-col gap-2">
                    <p className="text-xs font-semibold text-forest-700 uppercase">Snelle Notitie Toevoegen</p>
                    <div className="flex gap-2 text-xs">
                      <Select 
                        className="!text-xs !py-1 flex-1" 
                        value={singleEntry[k.id]?.type || TYPES[0]} 
                        onChange={(e)=>setSingleEntry(s=>({ ...s, [k.id]: { ...s[k.id], type: e.target.value } }))}
                      >
                        {TYPES.map(t=><option key={t}>{t}</option>)}
                      </Select>
                      <Input 
                        type="date" 
                        className="!text-xs !py-1 flex-1" 
                        value={singleEntry[k.id]?.date || ''} 
                        onChange={(e)=>setSingleEntry(s=>({ ...s, [k.id]: { ...s[k.id], date: e.target.value } }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Notitie (bijv. Check-up)" 
                        className="!text-xs !py-1 flex-[2]" 
                        value={singleEntry[k.id]?.note || ''} 
                        onChange={(e)=>setSingleEntry(s=>({ ...s, [k.id]: { ...s[k.id], note: e.target.value } }))}
                      />
                      <Btn 
                        variant="brass" 
                        className="!text-xs !py-1 flex-1 whitespace-nowrap"
                        onClick={(e) => {
                          e.preventDefault();
                          const se = singleEntry[k.id] || {};
                          if (!se.date) return alert('Vul een datum in');
                          addMedical(k.id, { type: se.type || TYPES[0], date: se.date, note: se.note || '' });
                          setSingleEntry(s => ({ ...s, [k.id]: { type: TYPES[0], date: '', note: '' } }));
                        }}
                      >
                        Opslaan
                      </Btn>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
