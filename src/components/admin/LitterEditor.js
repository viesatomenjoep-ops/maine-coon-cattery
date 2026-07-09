'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Card, Field, Input, Select, Textarea, Combobox, Btn } from '@/components/admin';
import DocumentUploader, { DocumentList } from '@/components/admin/DocumentUploader';
import FilePicker from '@/components/admin/FilePicker';

const LITTER_STATUSES = [
  { value: 'verwacht', label: 'Verwacht' },
  { value: 'geboren', label: 'Geboren' },
  { value: 'beschikbaar', label: 'Beschikbaar' },
  { value: 'gereserveerd', label: 'Gereserveerd' },
  { value: 'afgerond', label: 'Afgerond' },
];
const KITTEN_STATUSES = [
  { value: 'beschikbaar', label: 'Beschikbaar' },
  { value: 'gereserveerd', label: 'Gereserveerd' },
  { value: 'verkocht', label: 'Verkocht' },
  { value: 'houden', label: 'Houden' },
];
const SEXES = ['Kater', 'Poes'];
const COLORS = [
  'Black (Zwart)', 'Blue (Blauw)', 'Red (Rood)', 'Cream (Crème)',
  'White (Wit)', 'Black Tortie', 'Blue Tortie',
];
const PATTERNS = [
  'Classic Tabby', 'Mackerel Tabby', 'Spotted Tabby', 'Ticked Tabby',
  'Solid (Effen)', 'Smoke', 'Shaded', 'Shell/Chinchilla',
  'Bicolor', 'Harlequin', 'Van', 'Tortie (Schildpad)', 'Torbie',
];

const EMPTY_LITTER = {
  name: '', breed: 'Maine Coon (MCO)', status: 'verwacht', expected_count: '',
  date_of_birth: '', description: '', cover_image_url: '',
  sire_id: '', sire_name: '', dam_id: '', dam_name: '',
};
const EMPTY_KIT = {
  name: '', sex: 'Kater', color: '', pattern: '', ems_code: '', registration_no: '',
  chip_no: '', birth_weight_g: '', reserved_by: '', status: 'beschikbaar',
  priceNL: 1250, priceBE: 1300, cover_image: '',
};
const EMPTY_BREEDER = {
  name: '', registration_no: '', breed: 'Maine Coon (MCO)', ems_code: '', color: '', pattern: '',
  date_of_birth: '', chip_number: '', breeder: '', sire_name: '', dam_name: '', notes: '',
};

async function uploadFile(file, folder) {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('folder', folder);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok || !data.url) throw new Error(data.error || 'Upload mislukt');
  return data;
}

function SectionTitle({ children, hint }) {
  return (
    <div className="mb-4 border-b border-forest-900/10 pb-2">
      <h3 className="font-display text-lg text-forest-900">{children}</h3>
      {hint && <p className="mt-1 text-xs text-forest-600">{hint}</p>}
    </div>
  );
}

function BreedingCatForm({ gender, onSaved, onCancel }) {
  const { addBreedingCat } = useStore();
  const [form, setForm] = useState({ ...EMPTY_BREEDER });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name.trim()) { alert('Vul een naam in voor het fokdier.'); return; }
    setSaving(true);
    const res = await addBreedingCat({ ...form, gender, is_own_breeding_cat: true });
    setSaving(false);
    if (res?.error) { alert('Fout bij opslaan fokdier: ' + res.error.message); return; }
    onSaved(res.data);
  };

  return (
    <div className="mt-3 rounded-2xl border border-brass-300/60 bg-brass-50/40 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brass-700">
        Nieuw {gender === 'male' ? 'vader (kater)' : 'moeder (poes)'} toevoegen
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Naam"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Bijv. Jona" /></Field>
        <Field label="Ras"><Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} /></Field>
        <Field label="Stamboomnummer"><Input value={form.registration_no} onChange={(e) => setForm({ ...form, registration_no: e.target.value })} /></Field>
        <Field label="EMS-code"><Input value={form.ems_code} onChange={(e) => setForm({ ...form, ems_code: e.target.value })} placeholder="Bijv. MCO n 22" /></Field>
        <Field label="Kleur"><Combobox id={`bc-color-${gender}`} options={COLORS} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field>
        <Field label="Patroon"><Combobox id={`bc-pattern-${gender}`} options={PATTERNS} value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })} /></Field>
        <Field label="Geboortedatum"><Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} /></Field>
        <Field label="Chipnummer"><Input value={form.chip_number} onChange={(e) => setForm({ ...form, chip_number: e.target.value })} /></Field>
        <Field label="Fokker"><Input value={form.breeder} onChange={(e) => setForm({ ...form, breeder: e.target.value })} /></Field>
        <Field label="Vader (opa)"><Input value={form.sire_name} onChange={(e) => setForm({ ...form, sire_name: e.target.value })} /></Field>
        <Field label="Moeder (oma)"><Input value={form.dam_name} onChange={(e) => setForm({ ...form, dam_name: e.target.value })} /></Field>
      </div>
      <Field label="Notities"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-[60px]" /></Field>
      <div className="mt-3 flex flex-wrap gap-3">
        <Btn variant="brass" onClick={save} disabled={saving}>{saving ? 'Opslaan…' : 'Fokdier opslaan'}</Btn>
        <Btn variant="ghost" onClick={onCancel}>Annuleren</Btn>
      </div>
    </div>
  );
}

function ParentSection({ role, litter, setLitter, options, parentCat, parentDocs, deleteDocument }) {
  const isSire = role === 'sire';
  const gender = isSire ? 'male' : 'female';
  const idKey = isSire ? 'sire_id' : 'dam_id';
  const nameKey = isSire ? 'sire_name' : 'dam_name';
  const title = isSire ? 'Vader (Sire)' : 'Moeder (Dam) — geboortemoeder';
  const [mode, setMode] = useState(litter[idKey] ? 'select' : (litter[nameKey] ? 'manual' : 'select'));

  const selectValue = mode === 'new' ? '__new__' : mode === 'manual' ? '__manual__' : (litter[idKey] || '');

  const onSelect = (val) => {
    if (val === '__new__') { setMode('new'); }
    else if (val === '__manual__') { setMode('manual'); setLitter((l) => ({ ...l, [idKey]: '' })); }
    else if (val === '') { setMode('select'); setLitter((l) => ({ ...l, [idKey]: '', [nameKey]: '' })); }
    else {
      setMode('select');
      const c = options.find((o) => o.id === val);
      setLitter((l) => ({ ...l, [idKey]: val, [nameKey]: c?.name || '' }));
    }
  };

  const onCreated = (cat) => {
    setLitter((l) => ({ ...l, [idKey]: cat.id, [nameKey]: cat.name }));
    setMode('select');
  };

  return (
    <Card className="bg-white/60">
      <SectionTitle hint={isSire ? 'De dekkater van dit nestje.' : 'De poes die dit nestje draagt en werpt.'}>{title}</SectionTitle>
      <Field label="Selecteer of voeg toe">
        <Select value={selectValue} onChange={(e) => onSelect(e.target.value)}>
          <option value="">Selecteer fokdier…</option>
          {options.map((c) => <option key={c.id} value={c.id}>{c.name}{c.ems_code ? ` (${c.ems_code})` : ''}</option>)}
          <option value="__new__">➕ Nieuw fokdier toevoegen…</option>
          <option value="__manual__">Alleen naam invoeren (handmatig)…</option>
        </Select>
      </Field>

      {mode === 'manual' && (
        <div className="mt-3">
          <Field label={isSire ? 'Naam vader (vrije tekst)' : 'Naam moeder (vrije tekst)'}>
            <Input value={litter[nameKey]} onChange={(e) => setLitter((l) => ({ ...l, [nameKey]: e.target.value }))} />
          </Field>
        </div>
      )}

      {mode === 'new' && (
        <BreedingCatForm gender={gender} onSaved={onCreated} onCancel={() => setMode('select')} />
      )}

      {parentCat && (
        <div className="mt-4 rounded-2xl border border-forest-900/10 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-display text-base text-forest-900">{parentCat.name}</p>
              <p className="text-xs text-forest-600">
                {[parentCat.ems_code, parentCat.color, parentCat.registration_no].filter(Boolean).join(' · ') || 'Geen extra gegevens'}
              </p>
            </div>
            <Link href={`/admin/cats/${parentCat.id}`} className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">Open dossier →</Link>
          </div>
          <div className="mt-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-forest-700">Papieren van {isSire ? 'de vader' : 'de moeder'}</p>
            <DocumentUploader catId={parentCat.id} folder={`cattery_documents/cat_${parentCat.id}`} />
            <div className="mt-3"><DocumentList documents={parentDocs} onDelete={deleteDocument} /></div>
          </div>
        </div>
      )}
    </Card>
  );
}

function KittenRow({ kitten, onSave, onDelete }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setDraft({
      name: kitten.name || '', sex: kitten.gender || kitten.sex || 'Kater',
      color: kitten.color || '', pattern: kitten.pattern || '',
      ems_code: kitten.ems_code || '', registration_no: kitten.registration_no || '',
      chip_no: kitten.chip_number || kitten.chip_no || '', birth_weight_g: kitten.birth_weight_g ?? '',
      reserved_by: kitten.reserved_by || '', status: (kitten.status || 'beschikbaar').toLowerCase(),
      priceNL: kitten.price_nl ?? '', priceBE: kitten.price_be ?? '',
    });
    setOpen(true);
  };

  const save = async () => {
    if (!draft.name.trim()) { alert('Vul een naam in voor het kitten.'); return; }
    setSaving(true);
    const res = await onSave(kitten.id, {
      name: draft.name, sex: draft.sex, color: draft.color, pattern: draft.pattern,
      ems_code: draft.ems_code, registration_no: draft.registration_no, chip_no: draft.chip_no,
      birth_weight_g: draft.birth_weight_g, reserved_by: draft.reserved_by, status: draft.status,
      priceNL: draft.priceNL === '' ? '' : Number(draft.priceNL),
      priceBE: draft.priceBE === '' ? '' : Number(draft.priceBE),
    });
    setSaving(false);
    if (res?.error) { alert('Fout bij opslaan kitten: ' + res.error.message); return; }
    setOpen(false);
  };

  return (
    <div className="rounded-2xl border border-forest-900/10 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3">
          {kitten.cover_image
            ? <img src={kitten.cover_image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
            : <div className="h-11 w-11 shrink-0 rounded-lg border border-forest-100 bg-forest-50" />}
          <div className="min-w-0">
            <p className="truncate font-semibold text-forest-900">{kitten.name || 'Naamloos'}</p>
            <p className="truncate text-xs text-forest-600">
              {[kitten.gender || kitten.sex, kitten.color, kitten.pattern].filter(Boolean).join(' · ') || 'Geen details'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brass-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-brass-700">
            {KITTEN_STATUSES.find((s) => s.value === (kitten.status || '').toLowerCase())?.label || kitten.status || '—'}
          </span>
          <Link href={`/admin/cats/${kitten.id}`} className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">Dossier →</Link>
          <Btn variant="ghost" onClick={() => (open ? setOpen(false) : startEdit())} className="!px-3 !py-1.5 !text-xs">{open ? 'Sluiten' : 'Bewerken'}</Btn>
          <Btn variant="danger" onClick={() => { if (confirm('Dit kitten verwijderen?')) onDelete(kitten.id); }} className="!px-3 !py-1.5 !text-xs">Verwijderen</Btn>
        </div>
      </div>

      {open && draft && (
        <div className="border-t border-forest-900/10 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Naam"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
            <Field label="Geslacht"><Select value={draft.sex} onChange={(e) => setDraft({ ...draft, sex: e.target.value })}>{SEXES.map((s) => <option key={s} value={s}>{s}</option>)}</Select></Field>
            <Field label="Status"><Select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>{KITTEN_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></Field>
            <Field label="Kleur"><Combobox id={`k-color-${kitten.id}`} options={COLORS} value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} /></Field>
            <Field label="Patroon"><Combobox id={`k-pattern-${kitten.id}`} options={PATTERNS} value={draft.pattern} onChange={(e) => setDraft({ ...draft, pattern: e.target.value })} /></Field>
            <Field label="EMS-code"><Input value={draft.ems_code} onChange={(e) => setDraft({ ...draft, ems_code: e.target.value })} /></Field>
            <Field label="Stamboomnummer"><Input value={draft.registration_no} onChange={(e) => setDraft({ ...draft, registration_no: e.target.value })} /></Field>
            <Field label="Chipnummer"><Input value={draft.chip_no} onChange={(e) => setDraft({ ...draft, chip_no: e.target.value })} /></Field>
            <Field label="Geboortegewicht (g)"><Input type="number" min="0" value={draft.birth_weight_g} onChange={(e) => setDraft({ ...draft, birth_weight_g: e.target.value })} /></Field>
            <Field label="Gereserveerd door"><Input value={draft.reserved_by} onChange={(e) => setDraft({ ...draft, reserved_by: e.target.value })} /></Field>
            <Field label="Prijs NL (€)"><Input type="number" value={draft.priceNL} onChange={(e) => setDraft({ ...draft, priceNL: e.target.value })} /></Field>
            <Field label="Prijs BE (€)"><Input type="number" value={draft.priceBE} onChange={(e) => setDraft({ ...draft, priceBE: e.target.value })} /></Field>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-forest-700">Papieren van dit kitten</p>
            <DocumentUploader catId={kitten.id} folder={`cattery_documents/cat_${kitten.id}`} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Btn variant="brass" onClick={save} disabled={saving}>{saving ? 'Opslaan…' : 'Wijzigingen opslaan'}</Btn>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Sluiten</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LitterEditor({ initialLitterId = null, onClose }) {
  const {
    litters = [], kittens = [], breedingCats = [], documents = [],
    addLitter, updateLitter, addKitten, updateKitten, deleteKitten, deleteDocument,
  } = useStore();

  const [litterId, setLitterId] = useState(initialLitterId);
  const [litter, setLitter] = useState(EMPTY_LITTER);
  const [savingLitter, setSavingLitter] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [savingCover, setSavingCover] = useState(false);
  const [kit, setKit] = useState({ ...EMPTY_KIT });
  const [savingKit, setSavingKit] = useState(false);
  const [kitCoverUploading, setKitCoverUploading] = useState(false);
  const [showKitForm, setShowKitForm] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current || !initialLitterId) return;
    const l = litters.find((x) => x.id === initialLitterId);
    if (l) {
      setLitter({
        name: l.name || '', breed: l.breed || 'Maine Coon (MCO)', status: l.status || 'verwacht',
        expected_count: l.expected_count ?? '', date_of_birth: l.date_of_birth || '', description: l.description || '',
        cover_image_url: l.cover_image_url || '', sire_id: l.sire_id || '', sire_name: l.sire_name || '',
        dam_id: l.dam_id || '', dam_name: l.dam_name || '',
      });
      hydrated.current = true;
    }
  }, [initialLitterId, litters]);

  const savedLitter = litterId ? litters.find((l) => l.id === litterId) : null;
  const isMaleGender = (g) => ['m', 'male', 'kater', 'mannelijk'].includes((g || '').toString().trim().toLowerCase());
  const sireOptions = breedingCats.filter((c) => isMaleGender(c.gender));
  const damOptions = breedingCats.filter((c) => !isMaleGender(c.gender));
  const nestKittens = litterId ? kittens.filter((k) => k.litter_id === litterId && !k.is_own_breeding_cat) : [];
  const litterDocs = litterId ? documents.filter((d) => d.litter_id === litterId) : [];
  const sireCat = litter.sire_id ? kittens.find((k) => k.id === litter.sire_id) : null;
  const damCat = litter.dam_id ? kittens.find((k) => k.id === litter.dam_id) : null;
  const sireDocs = sireCat ? documents.filter((d) => d.cat_id === sireCat.id) : [];
  const damDocs = damCat ? documents.filter((d) => d.cat_id === damCat.id) : [];

  const handleCover = async (file) => {
    if (!file) return;
    setCoverUploading(true);
    try {
      const data = await uploadFile(file, 'cattery_litters');
      setLitter((l) => ({ ...l, cover_image_url: data.url }));
    } catch (err) { alert('Uploaden mislukt: ' + err.message); }
    setCoverUploading(false);
  };

  const saveCover = async () => {
    if (!litterId) { alert('Sla eerst het nestje op; de profielfoto wordt dan meegenomen.'); return; }
    setSavingCover(true);
    await updateLitter(litterId, { cover_image_url: litter.cover_image_url || null });
    setSavingCover(false);
    alert('Profielfoto van het nest opgeslagen.');
  };

  const removeCover = async () => {
    if (!confirm('Weet je zeker dat je de profielfoto van dit nestje wilt verwijderen?')) return;
    setLitter((l) => ({ ...l, cover_image_url: '' }));
    if (litterId) await updateLitter(litterId, { cover_image_url: null });
  };

  const handleKitCover = async (file) => {
    if (!file) return;
    setKitCoverUploading(true);
    try {
      const data = await uploadFile(file, 'cattery_media');
      setKit((k) => ({ ...k, cover_image: data.url }));
    } catch (err) { alert('Uploaden mislukt: ' + err.message); }
    setKitCoverUploading(false);
  };

  const saveLitter = async () => {
    if (!litter.name.trim()) { alert('Vul a.u.b. een naam in voor het nestje.'); return; }
    setSavingLitter(true);
    if (!litterId) {
      const res = await addLitter({ ...litter, born: litter.date_of_birth });
      setSavingLitter(false);
      if (res?.error) { alert('Fout bij opslaan nestje: ' + res.error.message); return; }
      setLitterId(res.data.id);
    } else {
      await updateLitter(litterId, {
        name: litter.name,
        breed: litter.breed || 'Maine Coon (MCO)',
        status: litter.status || 'verwacht',
        expected_count: (litter.expected_count === '' || litter.expected_count == null) ? null : Number(litter.expected_count),
        date_of_birth: litter.date_of_birth || null,
        description: litter.description || null,
        cover_image_url: litter.cover_image_url || null,
        sire_id: litter.sire_id || null,
        sire_name: litter.sire_name || null,
        dam_id: litter.dam_id || null,
        dam_name: litter.dam_name || null,
      });
      setSavingLitter(false);
    }
  };

  const saveKit = async () => {
    if (!litterId) { alert('Sla eerst het nestje op.'); return; }
    if (!kit.name.trim()) { alert('Vul a.u.b. een naam in voor het kitten.'); return; }
    setSavingKit(true);
    const res = await addKitten({ ...kit, litter_id: litterId, gender: kit.sex, price_nl: kit.priceNL, price_be: kit.priceBE });
    setSavingKit(false);
    if (res?.error) { alert('Fout bij opslaan kitten: ' + res.error.message); return; }
    setKit({ ...EMPTY_KIT });
    setShowKitForm(false);
  };

  return (
    <Card className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-forest-900">{litterId ? 'Nestje bewerken' : 'Nieuw nestje aanmaken'}</h2>
          {savedLitter && <p className="mt-1 text-sm text-forest-600">{savedLitter.name}</p>}
        </div>
        {onClose && <Btn variant="ghost" onClick={onClose} className="!px-3 !py-1.5 !text-xs">← Terug</Btn>}
      </div>

      {/* 0. Profielfoto van het nest */}
      <section>
        <SectionTitle hint="Een foto van alle kittens samen. Deze verschijnt als profielfoto in het nestjes-overzicht.">Profielfoto van het nest</SectionTitle>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {litter.cover_image_url ? (
            <img src={litter.cover_image_url} alt="Profielfoto nest" className="h-48 w-full rounded-2xl border border-forest-900/10 object-cover shadow sm:w-72" />
          ) : (
            <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-dashed border-forest-900/20 bg-forest-50 text-forest-300 sm:w-72">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-10 w-10"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>
            </div>
          )}
          <div className="flex flex-1 flex-col gap-3">
            <FilePicker
              accept="image/*"
              disabled={coverUploading}
              onFileReady={handleCover}
              uploadLabel={coverUploading ? 'Uploaden…' : (litter.cover_image_url ? 'Foto vervangen' : 'Foto uploaden')}
              cameraLabel="Open camera"
            />
            <div className="flex flex-wrap gap-3">
              <Btn variant="brass" onClick={saveCover} disabled={savingCover || coverUploading}>{savingCover ? 'Opslaan…' : 'Foto opslaan'}</Btn>
              {litter.cover_image_url && <Btn variant="danger" onClick={removeCover} disabled={savingCover}>Verwijderen</Btn>}
            </div>
            {!litterId && <p className="text-xs text-forest-600">Sla eerst het nestje op om de foto los op te slaan; hij wordt ook meegenomen bij "Nestje opslaan".</p>}
          </div>
        </div>
      </section>

      {/* 1. Nestgegevens */}
      <section>
        <SectionTitle hint="De basisgegevens van dit nestje.">Nestgegevens</SectionTitle>
        <div className="grid gap-4">
          <Field label="Naam nestje"><Input value={litter.name} onChange={(e) => setLitter({ ...litter, name: e.target.value })} placeholder="Bijv. Noorderlicht" /></Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Ras"><Input value={litter.breed} onChange={(e) => setLitter({ ...litter, breed: e.target.value })} /></Field>
            <Field label="Status"><Select value={litter.status} onChange={(e) => setLitter({ ...litter, status: e.target.value })}>{LITTER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></Field>
            <Field label="Aantal kittens"><Input type="number" min="0" value={litter.expected_count} onChange={(e) => setLitter({ ...litter, expected_count: e.target.value })} placeholder="Optioneel" /></Field>
          </div>
          <Field label="Geboortedatum"><Input type="date" value={litter.date_of_birth} onChange={(e) => setLitter({ ...litter, date_of_birth: e.target.value })} /></Field>
          <Field label="Beschrijving (wervende tekst)">
            <Textarea value={litter.description} onChange={(e) => setLitter({ ...litter, description: e.target.value })} className="min-h-[90px]" placeholder="Vertel iets leuks over dit nestje…" />
          </Field>
        </div>
      </section>

      {/* 2. Ouders */}
      <section>
        <SectionTitle hint="Kies bestaande fokdieren, voeg een nieuw fokdier toe met alle gegevens, of vul alleen een naam in.">Ouders</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          <ParentSection role="sire" litter={litter} setLitter={setLitter} options={sireOptions} parentCat={sireCat} parentDocs={sireDocs} deleteDocument={deleteDocument} />
          <ParentSection role="dam" litter={litter} setLitter={setLitter} options={damOptions} parentCat={damCat} parentDocs={damDocs} deleteDocument={deleteDocument} />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Btn variant="brass" onClick={saveLitter} disabled={savingLitter} className="w-full sm:w-auto">
          {savingLitter ? 'Opslaan…' : (litterId ? 'Wijzigingen opslaan' : 'Nestje opslaan')}
        </Btn>
        {!litterId && <span className="text-xs text-forest-600">Sla het nestje op om documenten en kittens toe te voegen.</span>}
      </div>

      {litterId && (
        <>
          {/* 3. Documenten van het nestje */}
          <section>
            <SectionTitle hint="Paspoort, dierenarts/vet clinic, HCM/PKD/FIV-checks, stamboom en overige papieren van het nestje.">Documenten & checks van het nestje</SectionTitle>
            <DocumentUploader litterId={litterId} folder={`cattery_documents/litter_${litterId}`} />
            <div className="mt-4"><DocumentList documents={litterDocs} onDelete={deleteDocument} /></div>
          </section>

          {/* 4. Kittens */}
          <section>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-forest-900/10 pb-2">
              <div>
                <h3 className="font-display text-lg text-forest-900">Kittens van dit nestje</h3>
                <p className="mt-1 text-xs text-forest-600">{nestKittens.length} kitten(s) gekoppeld aan dit nestje.</p>
              </div>
              <Btn variant="solid" onClick={() => setShowKitForm((v) => !v)} className="!px-4 !py-2 !text-sm">
                {showKitForm ? 'Formulier sluiten' : '+ Voeg kittens toe aan dit nestje'}
              </Btn>
            </div>

            {showKitForm && (
              <div className="mb-6 rounded-2xl border border-brass-300/60 bg-brass-50/40 p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Field label="Naam"><Input value={kit.name} onChange={(e) => setKit({ ...kit, name: e.target.value })} placeholder="Bijv. Orion" /></Field>
                  <Field label="Geslacht"><Select value={kit.sex} onChange={(e) => setKit({ ...kit, sex: e.target.value })}>{SEXES.map((s) => <option key={s} value={s}>{s}</option>)}</Select></Field>
                  <Field label="Status"><Select value={kit.status} onChange={(e) => setKit({ ...kit, status: e.target.value })}>{KITTEN_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></Field>
                  <Field label="Kleur"><Combobox id="new-kit-color" options={COLORS} value={kit.color} onChange={(e) => setKit({ ...kit, color: e.target.value })} /></Field>
                  <Field label="Patroon"><Combobox id="new-kit-pattern" options={PATTERNS} value={kit.pattern} onChange={(e) => setKit({ ...kit, pattern: e.target.value })} /></Field>
                  <Field label="EMS-code"><Input value={kit.ems_code} onChange={(e) => setKit({ ...kit, ems_code: e.target.value })} placeholder="Bijv. MCO n 22" /></Field>
                  <Field label="Stamboomnummer"><Input value={kit.registration_no} onChange={(e) => setKit({ ...kit, registration_no: e.target.value })} /></Field>
                  <Field label="Chipnummer"><Input value={kit.chip_no} onChange={(e) => setKit({ ...kit, chip_no: e.target.value })} /></Field>
                  <Field label="Geboortegewicht (g)"><Input type="number" min="0" value={kit.birth_weight_g} onChange={(e) => setKit({ ...kit, birth_weight_g: e.target.value })} placeholder="Bijv. 110" /></Field>
                  <Field label="Gereserveerd door"><Input value={kit.reserved_by} onChange={(e) => setKit({ ...kit, reserved_by: e.target.value })} placeholder="Optioneel" /></Field>
                  <Field label="Prijs NL (€)"><Input type="number" value={kit.priceNL} onChange={(e) => setKit({ ...kit, priceNL: e.target.value })} /></Field>
                  <Field label="Prijs BE (€)"><Input type="number" value={kit.priceBE} onChange={(e) => setKit({ ...kit, priceBE: e.target.value })} /></Field>
                </div>
                <Field label="Cover-afbeelding (optioneel)">
                  <div className="flex flex-col items-start gap-3">
                    <FilePicker
                      accept="image/*"
                      disabled={kitCoverUploading}
                      onFileReady={handleKitCover}
                      uploadLabel="Cover uploaden"
                      cameraLabel="Open camera"
                    />
                    {kitCoverUploading && <span className="text-xs text-forest-500">Uploaden…</span>}
                    {kit.cover_image && <img src={kit.cover_image} alt="Preview" className="h-10 w-10 rounded object-cover shadow" />}
                  </div>
                </Field>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Btn variant="brass" onClick={saveKit} disabled={savingKit}>{savingKit ? 'Opslaan…' : 'Kitten opslaan'}</Btn>
                  <Btn variant="ghost" onClick={() => { setKit({ ...EMPTY_KIT }); setShowKitForm(false); }}>Annuleren</Btn>
                </div>
              </div>
            )}

            {nestKittens.length === 0 ? (
              <p className="text-sm italic text-forest-600">Nog geen kittens in dit nestje. Gebruik de knop hierboven om ze toe te voegen.</p>
            ) : (
              <div className="grid gap-3">
                {nestKittens.map((k) => (
                  <KittenRow key={k.id} kitten={k} onSave={updateKitten} onDelete={deleteKitten} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </Card>
  );
}
