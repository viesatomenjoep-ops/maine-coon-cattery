'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Field, Input, Select, Combobox } from '@/components/admin';
import { PageHeader, FormSection, FormActions } from '@/components/admin/PageShell';
import FilePicker from '@/components/admin/FilePicker';
import { cap } from '@/lib/species';

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

function NewKittenForm() {
  const router = useRouter();
  const params = useSearchParams();
  const litterParam = params.get('litter') || '';
  const { litters = [], customers = [], addKitten, terms, species } = useStore();
  const isCat = species === 'katten';
  const SEXES = [cap(terms.male), cap(terms.female)];

  const [kit, setKit] = useState({
    litter_id: litterParam, name: '', call_name: '', sex: cap(terms.male), color: '', pattern: '',
    status: 'beschikbaar', chip_no: '', registration_no: '', birth_weight_g: '', ems_code: '',
    reserved_by: '', customer_id: '', priceNL: 1250, priceBE: 1300, cover_image: '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setKit((s) => ({ ...s, [k]: v }));

  const litter = litters.find((l) => l.id === kit.litter_id) || null;
  const backHref = litterParam ? (litter ? `/admin/litters/${litter.id}` : '/admin/litters') : '/admin/litters/new-cat';
  const backLabel = litterParam ? (litter ? `Terug naar ${litter.name}` : `Terug naar ${terms.litterPlural}`) : 'Terug';

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'cattery_media');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) set('cover_image', data.url);
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const saveKitten = async () => {
    if (!kit.litter_id) return alert(`Kies eerst een ${terms.litter} om dit ${terms.young} aan toe te voegen.`);
    if (!kit.name.trim()) return alert(`Vul een naam in voor het ${terms.young}.`);
    setSaving(true);
    const res = await addKitten({
      ...kit,
      gender: kit.sex,
      price_nl: kit.priceNL,
      price_be: kit.priceBE,
      customer_id: kit.customer_id || null,
    });
    setSaving(false);
    if (res?.error) return alert(`Fout bij opslaan ${terms.young}: ` + res.error.message);
    router.push(`/admin/litters/${kit.litter_id}`);
  };

  return (
    <div>
      <Link href={backHref} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-forest-600 transition hover:text-forest-900">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
        {backLabel}
      </Link>

      <PageHeader
        icon={<><circle cx="12" cy="14" r="6" /><path d="M7 9 5 4l4 4" /><path d="M17 9l2-5-4 4" /><path d="M9.5 15h.01M14.5 15h.01" /></>}
        title={`${cap(terms.young)} toevoegen`}
        subtitle={litter ? litter.name : null}
      />

      <div className="max-w-4xl">
        <FormSection title="Basisgegevens">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Naam *">
              <Input value={kit.name} onChange={(e) => set('name', e.target.value)} placeholder="Bijv. Orion" autoFocus />
            </Field>
            <Field label="Roepnaam">
              <Input value={kit.call_name} onChange={(e) => set('call_name', e.target.value)} placeholder="Optioneel" />
            </Field>
            <Field label={`${cap(terms.litter)} *`}>
              <Select value={kit.litter_id} onChange={(e) => set('litter_id', e.target.value)}>
                <option value="">{`Kies een ${terms.litter}…`}</option>
                {litters.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
            </Field>
            <Field label="Geslacht *">
              <Select value={kit.sex} onChange={(e) => set('sex', e.target.value)}>
                {SEXES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Uiterlijk">
          <div className="grid gap-5 sm:grid-cols-2">
            {isCat ? (
              <>
                <Field label="Kleurslag">
                  <Combobox id="colorsList" options={COLORS} value={kit.color} onChange={(e) => set('color', e.target.value)} placeholder="Bijv. Black Solid" />
                </Field>
                <Field label="Patroon">
                  <Combobox id="patternsList" options={PATTERNS} value={kit.pattern} onChange={(e) => set('pattern', e.target.value)} placeholder="Bijv. Classic Tabby" />
                </Field>
              </>
            ) : (
              <Field label="Kleur / aftekening">
                <Input value={kit.color} onChange={(e) => set('color', e.target.value)} placeholder="Bijv. Zwart-wit" />
              </Field>
            )}
            <Field label="Geboortegewicht (gram)">
              <Input type="number" min="0" value={kit.birth_weight_g} onChange={(e) => set('birth_weight_g', e.target.value)} placeholder="Bijv. 110" />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Identificatie" hint="Mag je later ook nog invullen.">
          <div className="grid gap-5 sm:grid-cols-2">
            {isCat && (
              <Field label="EMS-code">
                <Input value={kit.ems_code} onChange={(e) => set('ems_code', e.target.value)} placeholder="Bijv. MCO n 22" />
              </Field>
            )}
            <Field label="Stamboomnummer">
              <Input value={kit.registration_no} onChange={(e) => set('registration_no', e.target.value)} />
            </Field>
            <Field label="Chipnummer">
              <Input value={kit.chip_no} onChange={(e) => set('chip_no', e.target.value)} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Verkoop">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Status">
              <Select value={kit.status} onChange={(e) => set('status', e.target.value)}>
                {KITTEN_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </Field>
            <Field label="Koper">
              <Select value={kit.customer_id} onChange={(e) => set('customer_id', e.target.value)}>
                <option value="">Nog geen koper gekoppeld</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
            <Field label="Prijs NL (€)">
              <Input type="number" value={kit.priceNL} onChange={(e) => set('priceNL', Number(e.target.value))} />
            </Field>
            <Field label="Prijs BE (€)">
              <Input type="number" value={kit.priceBE} onChange={(e) => set('priceBE', Number(e.target.value))} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Foto" hint="De foto die je overal terugziet in de overzichten.">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {kit.cover_image ? (
              <img src={kit.cover_image} alt="Voorbeeld" className="h-24 w-24 shrink-0 rounded-2xl object-cover shadow-sm" />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-dashed border-forest-900/20 bg-forest-50 text-forest-300">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-8 w-8"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>
              </div>
            )}
            <div>
              <FilePicker
                accept="image/*"
                disabled={uploading}
                onFileReady={handleUpload}
                uploadLabel={uploading ? 'Uploaden…' : (kit.cover_image ? 'Foto vervangen' : 'Foto uploaden')}
                cameraLabel="Open camera"
              />
              {uploading && <p className="mt-2 text-xs text-forest-500">Bezig met uploaden…</p>}
            </div>
          </div>
        </FormSection>

        <FormActions
          onCancel={() => router.push(backHref)}
          onSave={saveKitten}
          saving={saving}
          saveLabel={`${cap(terms.young)} toevoegen`}
          note="De rest van het dossier — gezondheid, gewicht, documenten — vul je aan zodra dit is opgeslagen."
        />
      </div>
    </div>
  );
}

export default function NewKittenPage() {
  return (
    <Suspense fallback={null}>
      <NewKittenForm />
    </Suspense>
  );
}
