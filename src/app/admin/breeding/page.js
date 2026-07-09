'use client';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Select, Combobox, Btn } from '@/components/admin';
import DocumentUploader, { DocumentList } from '@/components/admin/DocumentUploader';

const GENDERS = [
  { value: 'female', label: 'Poes (female)' },
  { value: 'male', label: 'Kater (male)' },
];
const MALE_TOKENS = ['m', 'male', 'kater', 'mannelijk'];
const normGender = (g) => (MALE_TOKENS.includes((g || '').toString().trim().toLowerCase()) ? 'male' : 'female');
const PATTERNS = [
  'Classic Tabby', 'Mackerel Tabby', 'Spotted Tabby', 'Ticked Tabby',
  'Solid (Effen)', 'Smoke', 'Shaded', 'Shell/Chinchilla',
  'Bicolor', 'Harlequin', 'Van', 'Tortie (Schildpad)', 'Torbie',
];
const COLORS = [
  'Black (Zwart)', 'Blue (Blauw)', 'Red (Rood)', 'Cream (Crème)',
  'White (Wit)', 'Black Tortie', 'Blue Tortie',
];

const EMPTY = {
  id: null,
  name: '',
  registration_no: '',
  breed: 'Maine Coon (MCO)',
  gender: 'female',
  ems_code: '',
  color: '',
  pattern: '',
  date_of_birth: '',
  chip_number: '',
  breeder: '',
  sire_name: '',
  dam_name: '',
  is_own_breeding_cat: true,
};

export default function BreedingPage() {
  const { breedingCats = [], documents = [], addBreedingCat, updateBreedingCat, deleteKitten, deleteDocument } = useStore();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const isEditing = Boolean(form.id);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const save = async () => {
    if (!form.name.trim()) {
      alert('Vul a.u.b. een naam in.');
      return;
    }
    setSaving(true);
    const payload = { ...form, date_of_birth: form.date_of_birth || null };
    const res = isEditing ? await updateBreedingCat(form.id, payload) : await addBreedingCat(payload);
    setSaving(false);
    if (res?.error) {
      alert('Fout bij opslaan: ' + res.error.message);
      return;
    }
    setForm(EMPTY);
    alert(isEditing ? 'Fokdier bijgewerkt.' : 'Fokdier toegevoegd.');
  };

  const edit = (cat) => {
    setForm({
      id: cat.id,
      name: cat.name || '',
      registration_no: cat.registration_no || '',
      breed: cat.pedigree_data?.breed || 'Maine Coon (MCO)',
      gender: normGender(cat.gender),
      ems_code: cat.ems_code || '',
      color: cat.color || '',
      pattern: cat.pattern || '',
      date_of_birth: cat.date_of_birth || '',
      chip_number: cat.chip_number || '',
      breeder: cat.breeder || '',
      sire_name: cat.sire_name || '',
      dam_name: cat.dam_name || '',
      is_own_breeding_cat: cat.is_own_breeding_cat ?? true,
    });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = (cat) => {
    if (confirm(`Weet je zeker dat je fokdier "${cat.name}" wilt verwijderen?`)) deleteKitten(cat.id);
  };

  return (
    <>
      <PageHead label="Fokkerij" title="Fokdieren" />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card className="flex flex-col">
          <h2 className="mb-4 font-display text-xl text-forest-900">{isEditing ? 'Fokdier bewerken' : 'Nieuw fokdier toevoegen'}</h2>
          <div className="grid flex-1 gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Naam"><Input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Bijv. Wendy's Dream Aslan" /></Field>
              <Field label="Registratienummer"><Input value={form.registration_no} onChange={(e) => set({ registration_no: e.target.value })} placeholder="Bijv. NHSB 1234567" /></Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Ras"><Input value={form.breed} onChange={(e) => set({ breed: e.target.value })} /></Field>
              <Field label="Geslacht"><Select value={form.gender} onChange={(e) => set({ gender: e.target.value })}>{GENDERS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}</Select></Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="EMS-code"><Input value={form.ems_code} onChange={(e) => set({ ems_code: e.target.value })} placeholder="Bijv. MCO n 22" /></Field>
              <Field label="Geboortedatum"><Input type="date" value={form.date_of_birth || ''} onChange={(e) => set({ date_of_birth: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Kleur"><Combobox id="breedColors" options={COLORS} value={form.color} onChange={(e) => set({ color: e.target.value })} placeholder="Bijv. Black" /></Field>
              <Field label="Patroon"><Combobox id="breedPatterns" options={PATTERNS} value={form.pattern} onChange={(e) => set({ pattern: e.target.value })} placeholder="Bijv. Classic Tabby" /></Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Chipnummer"><Input value={form.chip_number} onChange={(e) => set({ chip_number: e.target.value })} /></Field>
              <Field label="Fokker"><Input value={form.breeder} onChange={(e) => set({ breeder: e.target.value })} placeholder="Naam cattery/fokker" /></Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Vader (Sire) — vrije tekst"><Input value={form.sire_name} onChange={(e) => set({ sire_name: e.target.value })} /></Field>
              <Field label="Moeder (Dam) — vrije tekst"><Input value={form.dam_name} onChange={(e) => set({ dam_name: e.target.value })} /></Field>
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-forest-900/10 bg-white/60 p-3 text-sm text-forest-800">
              <input type="checkbox" checked={form.is_own_breeding_cat} onChange={(e) => set({ is_own_breeding_cat: e.target.checked })} className="h-4 w-4 rounded border-forest-900/30 text-brass-500 focus:ring-brass-400" />
              Eigen fokdier (verschijnt in Sire/Dam-keuze bij nestjes)
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Btn variant="brass" onClick={save} disabled={saving}>{saving ? 'Opslaan…' : isEditing ? 'Wijzigingen opslaan' : 'Fokdier toevoegen'}</Btn>
            {isEditing && <Btn variant="ghost" onClick={() => setForm(EMPTY)}>Annuleren</Btn>}
          </div>
        </Card>

        {/* List */}
        <div className="space-y-6">
          <h2 className="font-display text-xl text-forest-900">Overzicht fokdieren</h2>
          {breedingCats.length === 0 && (
            <Card><p className="text-sm text-forest-600 italic">Nog geen fokdieren toegevoegd. Voeg er links eentje toe.</p></Card>
          )}
          {breedingCats.map((cat) => {
            const catDocs = documents.filter((d) => d.cat_id === cat.id);
            return (
              <Card key={cat.id} className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-display text-lg text-forest-950">{cat.name}</h3>
                    <p className="text-sm text-forest-700">
                      {GENDERS.find((g) => g.value === normGender(cat.gender))?.label || '—'}
                      {cat.ems_code ? <span className="mx-2 opacity-50">|</span> : null}{cat.ems_code}
                    </p>
                    {cat.registration_no && <p className="text-xs text-forest-600">Reg.: {cat.registration_no}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Btn variant="ghost" onClick={() => edit(cat)} className="!py-1.5 !px-3 !text-xs">Bewerken</Btn>
                    <Btn variant="ghost" onClick={() => remove(cat)} className="!py-1.5 !px-3 !text-xs !text-red-600 hover:!bg-red-50">Verwijderen</Btn>
                  </div>
                </div>

                <div className="border-t border-forest-900/10 pt-4">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-forest-700">Documenten</h4>
                  <DocumentUploader catId={cat.id} folder={`cattery_documents/${cat.id}`} />
                  <div className="mt-4">
                    <DocumentList documents={catDocs} onDelete={deleteDocument} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
