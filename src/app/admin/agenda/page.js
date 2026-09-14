'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/context/StoreContext';
import { PageHeader, PrimaryAction, EmptyHero } from '@/components/admin/PageShell';
import { Card, Field, Input, Select, Textarea, Btn } from '@/components/admin';
import Calendar from '@/components/admin/Calendar';
import { buildEvents, EVENT_TYPES, MONTH_NAMES, toKey } from '@/lib/agenda';
import { formatDate, urgency } from '@/lib/treatments';

const VIEWS = [
  { key: 'maand', label: 'Maand' },
  { key: 'week', label: 'Week' },
  { key: 'dag', label: 'Dag' },
];

export default function AgendaPage() {
  const { kittens = [], litters = [], species, terms, currentTenant } = useStore();

  const [view, setView] = useState('maand');
  const [cursor, setCursor] = useState(() => new Date());
  const [hidden, setHidden] = useState([]); // welke soorten zijn uitgevinkt
  const [picked, setPicked] = useState(null);

  // Eigen afspraken komen uit een aparte tabel. Bestaat die nog niet, dan
  // werkt de agenda gewoon door met alleen de afgeleide gebeurtenissen.
  const [customEvents, setCustomEvents] = useState([]);
  const [tableMissing, setTableMissing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', event_date: '', type: 'eigen', note: '' });
  const [saving, setSaving] = useState(false);

  const loadEvents = async () => {
    const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true });
    if (error) { setTableMissing(true); return; }
    setTableMissing(false);
    setCustomEvents(data || []);
  };

  useEffect(() => { loadEvents(); }, []);

  const allEvents = useMemo(
    () => buildEvents({ kittens, litters, customEvents, species, year: cursor.getFullYear() }),
    [kittens, litters, customEvents, species, cursor]
  );

  const events = allEvents.filter((e) => !hidden.includes(e.type));

  // Welke soorten komen daadwerkelijk voor? Alleen die tonen we als filter.
  const presentTypes = useMemo(() => {
    const set = new Set(allEvents.map((e) => e.type));
    return Object.keys(EVENT_TYPES).filter((t) => set.has(t));
  }, [allEvents]);

  const toggleType = (t) => setHidden((h) => (h.includes(t) ? h.filter((x) => x !== t) : [...h, t]));

  // De eerstvolgende vijf dingen, zodat je in één oogopslag ziet wat er speelt.
  const todayKey = toKey(new Date());
  const upcoming = events.filter((e) => e.date >= todayKey).slice(0, 5);

  const step = (dir) => {
    const d = new Date(cursor);
    if (view === 'maand') d.setMonth(d.getMonth() + dir);
    else if (view === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCursor(d);
  };

  const periodLabel =
    view === 'dag'
      ? `${cursor.getDate()} ${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`
      : `${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`;

  const saveEvent = async () => {
    if (!form.title.trim()) return alert('Geef de afspraak een naam.');
    if (!form.event_date) return alert('Kies een datum.');
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      event_date: form.event_date,
      type: form.type,
      note: form.note || null,
      tenant_id: currentTenant?.id || null,
    };
    const { error } = await supabase.from('events').insert([payload]);
    setSaving(false);
    if (error) return alert('Opslaan mislukt: ' + error.message);
    setForm({ title: '', event_date: '', type: 'eigen', note: '' });
    setShowForm(false);
    loadEvents();
  };

  const removeEvent = async (id) => {
    if (!confirm('Deze afspraak verwijderen?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) return alert('Verwijderen mislukt: ' + error.message);
    setPicked(null);
    loadEvents();
  };

  return (
    <div>
      <PageHeader
        icon={<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>}
        title="Agenda"
        subtitle={`Alles wat eraan komt in je ${terms.facility}`}
        actions={!tableMissing ? <PrimaryAction onClick={() => setShowForm((v) => !v)}>Afspraak toevoegen</PrimaryAction> : null}
      />

      {tableMissing && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-semibold text-amber-900">Eigen afspraken nog niet beschikbaar</p>
          <p className="mt-1 text-sm leading-relaxed text-amber-800/80">
            De agenda toont hieronder al je behandelingen, {terms.litterPlural} en verjaardagen. Om ook zelf
            afspraken te kunnen toevoegen, moet de database-update <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">20260914120000_events.sql</code> nog
            één keer in Supabase gedraaid worden.
          </p>
        </div>
      )}

      {showForm && !tableMissing && (
        <Card className="mb-6 max-w-2xl">
          <h2 className="mb-4 font-display text-xl text-forest-900">Nieuwe afspraak</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Wat staat er te gebeuren?">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Bijv. Dierenarts controle" autoFocus />
            </Field>
            <Field label="Datum">
              <Input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} />
            </Field>
            <Field label="Soort">
              <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(EVENT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Notitie (optioneel)">
              <Textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="min-h-[70px]" />
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Btn variant="brass" onClick={saveEvent} disabled={saving}>{saving ? 'Opslaan…' : 'Afspraak opslaan'}</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Annuleren</Btn>
          </div>
        </Card>
      )}

      {/* Wat komt er als eerste aan */}
      <Card className="mb-6">
        <h2 className="mb-4 font-display text-xl text-forest-900">Eerstvolgend</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-forest-500">Niets gepland. Alles is bij.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((ev) => {
              const meta = EVENT_TYPES[ev.type] || EVENT_TYPES.eigen;
              const u = urgency(ev.date);
              const Row = (
                <>
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dot}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-forest-900">{ev.title}</span>
                    <span className="block truncate text-sm text-forest-500">
                      {formatDate(ev.date)}{ev.subtitle ? ` · ${ev.subtitle}` : ''}
                    </span>
                  </span>
                  {u && <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${u.cls}`}>{u.label}</span>}
                </>
              );
              const cls = 'flex items-center gap-3 rounded-xl border border-forest-900/10 bg-white p-3 transition hover:border-forest-900/20';
              return ev.href
                ? <Link key={ev.id} href={ev.href} className={cls}>{Row}</Link>
                : <div key={ev.id} className={cls}>{Row}</div>;
            })}
          </div>
        )}
      </Card>

      {/* Filters per soort */}
      {presentTypes.length > 1 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-forest-900/10 bg-white p-4">
          <span className="mr-1 text-sm font-semibold text-forest-700">Toon:</span>
          {presentTypes.map((t) => {
            const meta = EVENT_TYPES[t];
            const on = !hidden.includes(t);
            return (
              <button
                key={t}
                onClick={() => toggleType(t)}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                  on ? 'border-forest-900/15 bg-white text-forest-800' : 'border-transparent bg-forest-900/5 text-forest-400 line-through'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${on ? meta.dot : 'bg-forest-300'}`} />
                {meta.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Navigatie door de tijd */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl capitalize text-forest-950">{periodLabel}</h2>
        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-xl border border-forest-900/10 bg-white">
            {VIEWS.map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`px-4 py-2 text-sm font-semibold transition ${
                  view === v.key ? 'bg-forest-800 text-cream-50' : 'text-forest-600 hover:bg-forest-50'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <div className="flex overflow-hidden rounded-xl border border-forest-900/10 bg-white">
            <button onClick={() => step(-1)} aria-label="Vorige" className="px-3 py-2 text-forest-600 transition hover:bg-forest-50">‹</button>
            <button onClick={() => setCursor(new Date())} className="border-x border-forest-900/10 px-4 py-2 text-sm font-semibold text-forest-700 transition hover:bg-forest-50">Vandaag</button>
            <button onClick={() => step(1)} aria-label="Volgende" className="px-3 py-2 text-forest-600 transition hover:bg-forest-50">›</button>
          </div>
        </div>
      </div>

      <Calendar events={events} view={view} cursor={cursor} onPick={setPicked} />

      {/* Wat betekent welke kleur */}
      <div className="mt-4 flex flex-wrap gap-4 px-1">
        {presentTypes.map((t) => (
          <span key={t} className="inline-flex items-center gap-2 text-sm text-forest-600">
            <span className={`h-2.5 w-2.5 rounded-full ${EVENT_TYPES[t].dot}`} />
            {EVENT_TYPES[t].label}
          </span>
        ))}
      </div>

      {/* Details van een aangeklikte gebeurtenis */}
      {picked && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center" onClick={() => setPicked(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-lux" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${(EVENT_TYPES[picked.type] || EVENT_TYPES.eigen).chip}`}>
                  {(EVENT_TYPES[picked.type] || EVENT_TYPES.eigen).label}
                </span>
                <h3 className="mt-2 font-display text-2xl leading-tight text-forest-950">{picked.title}</h3>
                <p className="mt-1 text-sm text-forest-500">{formatDate(picked.date)}</p>
                {picked.subtitle && <p className="mt-2 text-sm text-forest-700">{picked.subtitle}</p>}
              </div>
              <button onClick={() => setPicked(null)} aria-label="Sluiten" className="shrink-0 rounded-full p-1.5 text-forest-400 transition hover:bg-forest-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {picked.href && (
                <Link href={picked.href} className="inline-flex items-center rounded-xl bg-forest-800 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest-900">
                  Openen
                </Link>
              )}
              {!picked.readOnly && picked.rawId && (
                <button onClick={() => removeEvent(picked.rawId)} className="inline-flex items-center rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                  Verwijderen
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
