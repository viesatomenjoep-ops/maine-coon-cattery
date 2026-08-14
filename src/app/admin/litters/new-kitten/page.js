'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Select, Textarea, Combobox, Btn, Stepper, Icon } from '@/components/admin';
import FilePicker from '@/components/admin/FilePicker';

const SEXES = ['Kater', 'Poes'];
const PATTERNS = [
  'Classic Tabby', 'Mackerel Tabby', 'Spotted Tabby', 'Ticked Tabby',
  'Solid (Effen)', 'Smoke', 'Shaded', 'Shell/Chinchilla',
  'Bicolor', 'Harlequin', 'Van', 'Tortie (Schildpad)', 'Torbie',
];
const COLORS = [
  'Black (Zwart)', 'Blue (Blauw)', 'Red (Rood)', 'Cream (Crème)',
  'White (Wit)', 'Black Tortie', 'Blue Tortie',
];
const KITTEN_STATUSES = [
  { value: 'beschikbaar', label: 'Beschikbaar' },
  { value: 'gereserveerd', label: 'Gereserveerd' },
  { value: 'verkocht', label: 'Verkocht' },
  { value: 'houden', label: 'Houden' },
];
const KIT_STEPS = ['Naam & nestje', 'Uiterlijk', 'Identificatie', 'Verkoop', 'Foto'];
const EMPTY_BREEDER = {
  name: '', registration_no: '', breed: 'Maine Coon (MCO)', ems_code: '', color: '', pattern: '',
  date_of_birth: '', chip_number: '', breeder: '', sire_name: '', dam_name: '', notes: '',
};

function TypeCard({ icon, title, desc, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start gap-3 rounded-2xl border border-forest-900/10 bg-white/70 p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-brass-400/60 hover:shadow-lg"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 transition group-hover:bg-brass-100 group-hover:text-brass-700">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <div>
        <p className="font-display text-lg text-forest-900">{title}</p>
        <p className="text-sm text-forest-600">{desc}</p>
      </div>
    </button>
  );
}

function BreedingCatWizard({ gender, onCancel }) {
  const router = useRouter();
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
    <Card className="max-w-2xl">
      <h2 className="mb-4 font-display text-xl text-forest-900">Nieuwe {title.toLowerCase()}</h2>
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
        <Btn variant="ghost" onClick={onCancel}>← Terug</Btn>
      </div>
    </Card>
  );
}

function NewKittenForm() {
  const router = useRouter();
  const params = useSearchParams();
  const litterParam = params.get('litter') || '';
  const { litters = [], addKitten } = useStore();

  const [type, setType] = useState(litterParam ? 'kitten' : null);

  const [kit, setKit] = useState({
    litter_id: litterParam, name: '', sex: 'Kater', color: '', pattern: '', status: 'beschikbaar',
    chip_no: '', registration_no: '', birth_weight_g: '', ems_code: '', reserved_by: '',
    priceNL: 1250, priceBE: 1300, cover_image: '',
  });
  const [kitStep, setKitStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const litter = litters.find((l) => l.id === kit.litter_id) || null;

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'cattery_media');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setKit((k) => ({ ...k, cover_image: data.url }));
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const saveKitten = async () => {
    if (!kit.litter_id) return alert('Selecteer a.u.b. een nestje om dit kitten aan toe te voegen.');
    if (!kit.name.trim()) return alert('Vul a.u.b. een naam in voor het kitten.');
    setSaving(true);
    const res = await addKitten({ ...kit, gender: kit.sex, price_nl: kit.priceNL, price_be: kit.priceBE });
    setSaving(false);
    if (res?.error) return alert('Fout bij opslaan kitten: ' + res.error.message);
    router.push(`/admin/litters/${kit.litter_id}`);
  };

  const backHref = litter ? `/admin/litters/${litter.id}` : '/admin/litters';
  const backLabel = litter ? `Terug naar ${litter.name}` : 'Terug naar nestjes';

  if (type === null) {
    return (
      <>
        <Link href="/admin/litters" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-600 transition hover:text-forest-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
          Terug naar nestjes
        </Link>
        <PageHead label="Fokkerij" title="Kat toevoegen" />
        <p className="mb-6 text-sm text-forest-600">Wat wil je toevoegen?</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <TypeCard icon="cat" title="Nieuwe kitten" desc="Een kitten uit een van je nestjes." onClick={() => setType('kitten')} />
          <TypeCard icon="health" title="Fokpoes" desc="Een moederdier, niet gekoppeld aan een nestje." onClick={() => setType('fokpoes')} />
          <TypeCard icon="health" title="Fokkater" desc="Een vaderdier, niet gekoppeld aan een nestje." onClick={() => setType('fokkater')} />
          <TypeCard icon="customer" title="Bestaande kat" desc="Een kat die je elders al had, handmatig invoeren." onClick={() => router.push('/admin/cats/new')} />
        </div>
      </>
    );
  }

  if (type === 'fokpoes' || type === 'fokkater') {
    return (
      <>
        <button onClick={() => setType(null)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-600 transition hover:text-forest-900">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
          Terug
        </button>
        <PageHead label="Fokkerij" title="Kat toevoegen" />
        <BreedingCatWizard gender={type === 'fokkater' ? 'male' : 'female'} onCancel={() => setType(null)} />
      </>
    );
  }

  return (
    <>
      <Link href={litterParam ? backHref : '/admin/litters/new-kitten'} onClick={(e) => { if (!litterParam) { e.preventDefault(); setType(null); } }} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-600 transition hover:text-forest-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
        {litterParam ? backLabel : 'Terug'}
      </Link>
      <PageHead label="Fokkerij" title="Kitten toevoegen" />
      <Card className="max-w-2xl">
        <Stepper
          steps={KIT_STEPS}
          current={kitStep}
          onBack={() => setKitStep((s) => Math.max(0, s - 1))}
          onNext={() => setKitStep((s) => Math.min(KIT_STEPS.length - 1, s + 1))}
          onFinish={saveKitten}
          canNext={kitStep === 0 ? Boolean(kit.litter_id && kit.name.trim()) : true}
          finishing={saving}
          finishLabel="Kitten toevoegen"
        >
          {kitStep === 0 && (
            <div className="grid gap-4">
              <Field label="Nestje">
                <Select value={kit.litter_id} onChange={(e) => setKit({ ...kit, litter_id: e.target.value })}>
                  <option value="">Selecteer nestje...</option>
                  {litters.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </Select>
              </Field>
              <Field label="Naam"><Input value={kit.name} onChange={(e) => setKit({ ...kit, name: e.target.value })} placeholder="Bijv. Orion" autoFocus /></Field>
              <Field label="Geslacht"><Select value={kit.sex} onChange={(e) => setKit({ ...kit, sex: e.target.value })}>{SEXES.map((s) => <option key={s} value={s}>{s}</option>)}</Select></Field>
            </div>
          )}
          {kitStep === 1 && (
            <div className="grid gap-4">
              <Field label="Kleurslag (Color)">
                <Combobox id="colorsList" options={COLORS} value={kit.color} onChange={(e) => setKit({ ...kit, color: e.target.value })} placeholder="Bijv. Black Solid" />
              </Field>
              <Field label="Patroon (Pattern)">
                <Combobox id="patternsList" options={PATTERNS} value={kit.pattern} onChange={(e) => setKit({ ...kit, pattern: e.target.value })} placeholder="Bijv. Classic Tabby" />
              </Field>
              <Field label="Geboortegewicht (g)"><Input type="number" min="0" value={kit.birth_weight_g} onChange={(e) => setKit({ ...kit, birth_weight_g: e.target.value })} placeholder="Bijv. 110" /></Field>
            </div>
          )}
          {kitStep === 2 && (
            <div className="grid gap-4">
              <Field label="EMS-code"><Input value={kit.ems_code} onChange={(e) => setKit({ ...kit, ems_code: e.target.value })} placeholder="Bijv. MCO n 22" /></Field>
              <Field label="Stamboomnummer"><Input value={kit.registration_no} onChange={(e) => setKit({ ...kit, registration_no: e.target.value })} placeholder="Registratienummer" /></Field>
              <Field label="Chipnummer"><Input value={kit.chip_no} onChange={(e) => setKit({ ...kit, chip_no: e.target.value })} /></Field>
            </div>
          )}
          {kitStep === 3 && (
            <div className="grid gap-4">
              <Field label="Status"><Select value={kit.status} onChange={(e) => setKit({ ...kit, status: e.target.value })}>{KITTEN_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Prijs NL (€)"><Input type="number" value={kit.priceNL} onChange={(e) => setKit({ ...kit, priceNL: Number(e.target.value) })} /></Field>
                <Field label="Prijs BE (€)"><Input type="number" value={kit.priceBE} onChange={(e) => setKit({ ...kit, priceBE: Number(e.target.value) })} /></Field>
              </div>
              <Field label="Gereserveerd door"><Input value={kit.reserved_by} onChange={(e) => setKit({ ...kit, reserved_by: e.target.value })} placeholder="Naam klant (optioneel)" /></Field>
            </div>
          )}
          {kitStep === 4 && (
            <Field label="Cover Afbeelding (Optioneel)">
              <div className="flex flex-col items-start gap-3">
                <FilePicker
                  accept="image/*"
                  disabled={uploading}
                  onFileReady={handleUpload}
                  uploadLabel="Cover uploaden"
                  cameraLabel="Open camera"
                />
                {uploading && <span className="text-xs text-forest-500">Uploaden...</span>}
                {kit.cover_image && <img src={kit.cover_image} alt="Preview" className="h-10 w-10 rounded object-cover shadow" />}
              </div>
            </Field>
          )}
        </Stepper>
      </Card>
    </>
  );
}

export default function NewKittenPage() {
  return (
    <Suspense fallback={null}>
      <NewKittenForm />
    </Suspense>
  );
}
