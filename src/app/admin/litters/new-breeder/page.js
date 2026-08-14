'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Textarea, Combobox, Btn } from '@/components/admin';

const PATTERNS = [
  'Classic Tabby', 'Mackerel Tabby', 'Spotted Tabby', 'Ticked Tabby',
  'Solid (Effen)', 'Smoke', 'Shaded', 'Shell/Chinchilla',
  'Bicolor', 'Harlequin', 'Van', 'Tortie (Schildpad)', 'Torbie',
];
const COLORS = [
  'Black (Zwart)', 'Blue (Blauw)', 'Red (Rood)', 'Cream (Crème)',
  'White (Wit)', 'Black Tortie', 'Blue Tortie',
];
const EMPTY_BREEDER = {
  name: '', registration_no: '', breed: 'Maine Coon (MCO)', ems_code: '', color: '', pattern: '',
  date_of_birth: '', chip_number: '', breeder: '', sire_name: '', dam_name: '', notes: '',
};

function NewBreederForm() {
  const router = useRouter();
  const params = useSearchParams();
  const gender = params.get('gender') === 'male' ? 'male' : 'female';
  const { addBreedingCat } = useStore();
  const [form, setForm] = useState({ ...EMPTY_BREEDER });
  const [saving, setSaving] = useState(false);
  const title = gender === 'male' ? 'Fokkater (vader)' : 'Fokpoes (moeder)';

  const save = async () => {
    if (!form.name.trim()) return alert('Vul een naam in.');
    setSaving(true);
    const res = await addBreedingCat({ ...form, gender, is_own_breeding_cat: true });
    setSaving(false);
    if (res?.error) return alert('Opslaan mislukt: ' + res.error.message);
    router.push(`/admin/cats/${res.data.id}`);
  };

  return (
    <>
      <Link href="/admin/litters/new-cat" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-600 transition hover:text-forest-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
        Terug
      </Link>
      <PageHead label="Fokkerij" title={`Nieuwe ${title.toLowerCase()}`} />
      <Card className="max-w-2xl">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Naam"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Bijv. Jona" autoFocus /></Field>
          <Field label="Ras"><Input value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })} /></Field>
          <Field label="Stamboomnummer"><Input value={form.registration_no} onChange={(e) => setForm({ ...form, registration_no: e.target.value })} /></Field>
          <Field label="EMS-code"><Input value={form.ems_code} onChange={(e) => setForm({ ...form, ems_code: e.target.value })} placeholder="Bijv. MCO n 22" /></Field>
          <Field label="Kleur"><Combobox id="bc-color" options={COLORS} value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} /></Field>
          <Field label="Patroon"><Combobox id="bc-pattern" options={PATTERNS} value={form.pattern} onChange={(e) => setForm({ ...form, pattern: e.target.value })} /></Field>
          <Field label="Geboortedatum"><Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} /></Field>
          <Field label="Chipnummer"><Input value={form.chip_number} onChange={(e) => setForm({ ...form, chip_number: e.target.value })} /></Field>
          <Field label="Fokker"><Input value={form.breeder} onChange={(e) => setForm({ ...form, breeder: e.target.value })} /></Field>
        </div>
        <div className="mt-4"><Field label="Notities"><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="min-h-[70px]" /></Field></div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Btn variant="brass" onClick={save} disabled={saving}>{saving ? 'Opslaan…' : `${title} toevoegen`}</Btn>
        </div>
      </Card>
    </>
  );
}

export default function NewBreederPage() {
  return (
    <Suspense fallback={null}>
      <NewBreederForm />
    </Suspense>
  );
}
