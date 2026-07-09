'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Select, Btn } from '@/components/admin';
import { TREATMENT_TYPES as TYPES, treatmentIcon, urgency, formatDate, collectUpcoming } from '@/lib/treatments';

const isMale = (g) => /kater|mann|\bmale\b|\bm\b/i.test(g || '');
const isFemale = (g) => /poes|vrouw|female|\bf\b/i.test(g || '');
const groupOf = (k) => (!k.is_own_breeding_cat ? 'kittens' : isMale(k.gender) ? 'katers' : isFemale(k.gender) ? 'poezen' : 'overige');

export default function MedicalPage() {
  const { litters, kittens, addMedical, deleteMedical } = useStore();
  const [litterId, setLitterId] = useState('');
  const [selected, setSelected] = useState([]);
  const [entry, setEntry] = useState({ type: TYPES[0], date: '', due: '', note: '' });
  const [done, setDone] = useState(false);

  // Losse behandeling voor één willekeurige kat (kitten/kater/poes).
  const [single, setSingle] = useState({ catId: '', type: TYPES[0], date: '', due: '', note: '' });

  useEffect(() => {
    if (!litterId && litters.length > 0) setLitterId(litters[0].id);
  }, [litters, litterId]);

  const inLitter = kittens.filter((k) => k.litter_id === litterId);
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const all = () => setSelected(inLitter.map((k) => k.id));
  const none = () => setSelected([]);

  const apply = () => {
    if (!entry.date && !entry.due) return alert('Vul een uitvoerdatum of een vervolgdatum in.');
    if (selected.length === 0) return alert('Selecteer minimaal één kitten.');
    selected.forEach((id) => addMedical(id, { ...entry }));
    setDone(true);
    setSelected([]);
    setEntry({ type: TYPES[0], date: '', due: '', note: '' });
    alert('Behandeling toegevoegd aan de geselecteerde dossiers.');
    setTimeout(() => setDone(false), 2200);
  };

  const applySingle = async () => {
    if (!single.catId) return alert('Selecteer eerst een kat.');
    if (!single.date && !single.due) return alert('Vul een uitvoerdatum of een vervolgdatum in.');
    const res = await addMedical(single.catId, { type: single.type, date: single.date, due: single.due, note: single.note });
    if (res?.error) return alert('Opslaan mislukt: ' + (res.error.message || ''));
    setSingle({ catId: '', type: TYPES[0], date: '', due: '', note: '' });
    alert('Behandeling opgeslagen.');
  };

  // Behandelagenda: alle geplande behandelingen over alle katten.
  const agenda = collectUpcoming(kittens);

  // Groepeer katten voor de losse-keuzelijst.
  const groups = [
    { key: 'kittens', label: 'Kittens' },
    { key: 'katers', label: 'Katers' },
    { key: 'poezen', label: 'Poezen' },
    { key: 'overige', label: 'Overige' },
  ];

  return (
    <>
      <PageHead label="Gezondheid" title="Medisch Dashboard">
        {done && <span className="rounded-full bg-forest-100 px-4 py-2 text-sm text-forest-700">✓ Toegevoegd aan dossiers</span>}
      </PageHead>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---- 1. Groepsbehandeling ---- */}
        <Card>
          <h2 className="mb-1 font-display text-xl text-forest-900">1. Groepsbehandeling registreren</h2>
          <p className="mb-4 text-sm text-forest-600">Voor meerdere kittens uit één nestje tegelijk.</p>
          <div className="grid gap-4">
            <Field label="Nestje"><Select value={litterId} onChange={(e) => { setLitterId(e.target.value); setSelected([]); }}>{litters.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</Select></Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Type"><Select value={entry.type} onChange={(e) => setEntry({ ...entry, type: e.target.value })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
              <Field label="Uitgevoerd op"><Input type="date" value={entry.date} onChange={(e) => setEntry({ ...entry, date: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Volgende keer nodig op (herinnering)"><Input type="date" value={entry.due} onChange={(e) => setEntry({ ...entry, due: e.target.value })} /></Field>
              <Field label="Notitie"><Input value={entry.note} onChange={(e) => setEntry({ ...entry, note: e.target.value })} placeholder="Bijv. Tweede enting (Nobivac)" /></Field>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Toepassen op kittens</span>
                <span className="text-xs"><button onClick={all} className="text-brass-600 hover:underline">Alle</button> · <button onClick={none} className="text-forest-600 hover:underline">Geen</button></span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {inLitter.map((k) => (
                  <button key={k.id} onClick={() => toggle(k.id)} className={`rounded-xl border px-3 py-2 text-left text-sm transition ${selected.includes(k.id) ? 'border-brass-400 bg-brass-50 text-forest-900' : 'border-forest-900/15 text-forest-700 hover:bg-forest-100'}`}>
                    <span className={`mr-2 inline-block h-3 w-3 rounded-sm border ${selected.includes(k.id) ? 'bg-brass-400 border-brass-400' : 'border-forest-900/30'}`} />
                    <span className="truncate">{k.name}</span>
                  </button>
                ))}
                {inLitter.length === 0 && <p className="text-sm text-forest-600/60">Nog geen kittens in dit nest.</p>}
              </div>
            </div>

            <Btn variant="brass" onClick={apply}>Registreren ({selected.length})</Btn>
          </div>
        </Card>

        {/* ---- 2. Losse behandeling per kat ---- */}
        <Card>
          <h2 className="mb-1 font-display text-xl text-forest-900">2. Losse behandeling per kat</h2>
          <p className="mb-4 text-sm text-forest-600">Voor één specifieke kat — elke kitten, kater of poes.</p>
          <div className="grid gap-4">
            <Field label="Welke kat?">
              <Select value={single.catId} onChange={(e) => setSingle({ ...single, catId: e.target.value })}>
                <option value="">Selecteer een kat…</option>
                {groups.map((g) => {
                  const list = kittens.filter((k) => groupOf(k) === g.key);
                  if (list.length === 0) return null;
                  return (
                    <optgroup key={g.key} label={g.label}>
                      {list.map((k) => <option key={k.id} value={k.id}>{k.name}{k.color ? ` (${k.color})` : ''}</option>)}
                    </optgroup>
                  );
                })}
              </Select>
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Type"><Select value={single.type} onChange={(e) => setSingle({ ...single, type: e.target.value })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
              <Field label="Uitgevoerd op"><Input type="date" value={single.date} onChange={(e) => setSingle({ ...single, date: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Volgende keer nodig op (herinnering)"><Input type="date" value={single.due} onChange={(e) => setSingle({ ...single, due: e.target.value })} /></Field>
              <Field label="Notitie"><Input value={single.note} onChange={(e) => setSingle({ ...single, note: e.target.value })} placeholder="Bijv. Ontworming Milbemax" /></Field>
            </div>
            <Btn variant="brass" onClick={applySingle}>Behandeling opslaan</Btn>
          </div>
        </Card>
      </div>

      {/* ---- 3. Behandelagenda (alle katten) ---- */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-forest-900">Behandelagenda</h2>
          <span className="rounded-full bg-forest-900/5 px-3 py-1 text-xs font-semibold text-forest-600">{agenda.length} gepland</span>
        </div>
        {agenda.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-forest-900/20 bg-white/60 py-10 text-center text-forest-600">Nog geen geplande behandelingen. Vul hierboven een "volgende keer nodig op"-datum in.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agenda.map((a, i) => {
              const u = urgency(a.due);
              return (
                <Link key={a.medId || i} href={`/admin/cats/${a.catId}`} className={`flex items-center gap-3 rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md ${u?.key === 'overdue' || u?.key === 'today' ? 'border-red-200' : 'border-forest-900/10'}`}>
                  <span className="text-2xl">{treatmentIcon(a.type)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-forest-900">{a.catName}</p>
                    <p className="truncate text-xs text-forest-600">{a.type}{a.note ? ` · ${a.note}` : ''}</p>
                    <p className="mt-1 text-xs text-forest-500">{formatDate(a.due)}</p>
                  </div>
                  {u && <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${u.cls}`}>{u.label}</span>}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ---- 4. Historie per kat (huidig nestje) ---- */}
      <div className="mt-10">
        <h2 className="mb-4 font-display text-2xl text-forest-900">Historie — nestje {litters.find((l) => l.id === litterId)?.name || ''}</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {inLitter.map((k) => (
            <div key={k.id} className="rounded-2xl border border-forest-900/10 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-display text-lg font-semibold text-forest-950">{k.name}</p>
                <Link href={`/admin/cats/${k.id}`} className="rounded-lg bg-forest-50 px-2 py-1 text-xs font-medium text-forest-600/70 hover:text-brass-600">Bekijk dossier →</Link>
              </div>
              {(!k.medical || k.medical.length === 0) ? (
                <p className="text-xs italic text-forest-600/60">Nog geen medische historie.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {k.medical.map((m, i) => (
                    <div key={m.id || i} className="flex items-center justify-between gap-1.5 rounded-lg border border-forest-900/5 bg-cream-50 px-3 py-2 text-xs text-forest-800">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="text-sm">{treatmentIcon(m.type)}</span>
                        <span suppressHydrationWarning className="min-w-[64px] font-medium">{m.date ? new Date(m.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) : '—'}</span>
                        <span className="truncate text-forest-600">{m.type}{m.note ? `: ${m.note}` : ''}{m.due ? ` · volgende: ${formatDate(m.due)}` : ''}</span>
                      </div>
                      <button onClick={() => { if (confirm('Weet je zeker dat je deze notitie wilt verwijderen?')) deleteMedical(k.id, i); }} className="ml-2 shrink-0 text-red-500 hover:text-red-700">Verwijder</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
