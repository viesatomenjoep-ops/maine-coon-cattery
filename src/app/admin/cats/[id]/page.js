'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHead, Card, Field, Input, Select, Textarea, Btn } from '@/components/admin';
import MediaUpload from '@/components/admin/MediaUpload';
import { useStore } from '@/context/StoreContext';

export default function CatDossier({ params }) {
  const router = useRouter();
  const { kittens } = useStore();
  const isNew = params.id === 'new';
  
  // States voor de verschillende tabbladen of secties
  const [activeTab, setActiveTab] = useState('paspoort');
  
  // Voorbeeld data state (in de toekomst wordt dit Supabase)
  const [formData, setFormData] = useState({
    name: '',
    species: 'Cat',
    breed: 'Maine Coon',
    sex: 'Vrouwelijk',
    dateOfBirth: '',
    color: '',
    chipNumber: '',
    chipImplantDate: '',
    chipLocation: '',
    vetName: '',
    status: 'Beschikbaar',
    priceNL: '',
    priceBE: '',
    customerName: '',
    secretToken: isNew ? crypto.randomUUID() : '123e4567-e89b-12d3-a456-426614174000',
    // Vaccinations
    vaccineName: '',
    vaccineBatch: '',
    vaccineDate: '',
    vaccineValidUntil: '',
    // Pedigree (vereenvoudigde JSON weergave)
    pedigree: JSON.stringify({
      parents: { sire: '', dam: '' },
      grandparents: {},
      greatGrandparents: {}
    }, null, 2)
  });

  useEffect(() => {
    if (!isNew) {
      const cat = kittens.find((k) => k.id === params.id);
      if (cat) {
        setFormData(prev => ({ ...prev, name: cat.name, sex: cat.sex, color: cat.color, status: cat.status }));
      }
    }
  }, [params.id, isNew, kittens]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert('Dossier opgeslagen (Supabase integratie volgt)');
    if (isNew) router.push('/admin/cats');
  };

  const tabs = [
    { id: 'paspoort', label: '1. Paspoort & Beschrijving' },
    { id: 'chip', label: '2. Identificatie & Chip' },
    { id: 'medisch', label: '3. Inentingen & Medisch' },
    { id: 'stamboom', label: '4. Stamboom' },
    { id: 'media', label: '5. Media & Galerij' },
    { id: 'verkoop', label: '6. Portaal & Verkoop' }
  ];

  return (
    <>
      <PageHead label="Dossier" title={isNew ? 'Nieuwe Kat Toevoegen' : formData.name || 'Laden...'} />

      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-forest-900/10 pb-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${
              activeTab === t.id ? 'bg-forest-900 text-cream-50' : 'bg-white text-forest-600 hover:bg-forest-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          
          {/* TAB 1: PASPOORT */}
          {activeTab === 'paspoort' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <h2 className="col-span-full font-display text-xl text-forest-900">Beschrijving van het dier</h2>
              <Field label="Naam *"><Input required name="name" value={formData.name} onChange={handleChange} placeholder="Big Giant Resort's Dajana" /></Field>
              <Field label="Diersoort"><Input name="species" value={formData.species} onChange={handleChange} /></Field>
              <Field label="Ras"><Input name="breed" value={formData.breed} onChange={handleChange} /></Field>
              <Field label="Geslacht">
                <Select name="sex" value={formData.sex} onChange={handleChange}>
                  <option value="Vrouwelijk">Vrouwelijk (Poes)</option>
                  <option value="Mannelijk">Mannelijk (Kater)</option>
                </Select>
              </Field>
              <Field label="Geboortedatum"><Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} /></Field>
              <Field label="Kleur"><Input name="color" value={formData.color} onChange={handleChange} placeholder="blue-silver-torbie" /></Field>
            </div>
          )}

          {/* TAB 2: CHIP */}
          {activeTab === 'chip' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <h2 className="col-span-full font-display text-xl text-forest-900">Kennzeichnung / Marking</h2>
              <Field label="Transpondercode (Chipnummer)"><Input name="chipNumber" value={formData.chipNumber} onChange={handleChange} placeholder="276098109155736" /></Field>
              <Field label="Datum van implantatie"><Input type="date" name="chipImplantDate" value={formData.chipImplantDate} onChange={handleChange} /></Field>
              <Field label="Plaats van implantatie"><Input name="chipLocation" value={formData.chipLocation} onChange={handleChange} placeholder="Left shoulder" /></Field>
              <Field label="Naam Dierenarts"><Input name="vetName" value={formData.vetName} onChange={handleChange} placeholder="Dr. Antje Waldschmidt" /></Field>
            </div>
          )}

          {/* TAB 3: INENTINGEN */}
          {activeTab === 'medisch' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <h2 className="col-span-full font-display text-xl text-forest-900">Tollwutimpfung / Rabies</h2>
              <Field label="Fabrikant & Vaccin"><Input name="vaccineName" value={formData.vaccineName} onChange={handleChange} placeholder="RABISIN, Boehringer Ingelheim" /></Field>
              <Field label="Batchnummer"><Input name="vaccineBatch" value={formData.vaccineBatch} onChange={handleChange} placeholder="G64953" /></Field>
              <Field label="Datum inenting"><Input type="date" name="vaccineDate" value={formData.vaccineDate} onChange={handleChange} /></Field>
              <Field label="Geldig tot"><Input type="date" name="vaccineValidUntil" value={formData.vaccineValidUntil} onChange={handleChange} /></Field>
              
              <div className="col-span-full mt-6 rounded-xl border border-brass-200 bg-brass-50 p-4">
                <p className="text-sm text-brass-800"><b>Let op:</b> Hier kunnen we straks ook bestanden (PDF scans) van de dierenarts uploaden in de 'Digitale Kluis'. Deze zijn onzichtbaar voor klanten.</p>
              </div>
            </div>
          )}

          {/* TAB 4: STAMBOOM */}
          {activeTab === 'stamboom' && (
            <div className="grid gap-4">
              <h2 className="font-display text-xl text-forest-900">Pedigree JSON Editor</h2>
              <p className="text-xs text-forest-600">Omdat stambomen zeer ver teruggaan (tot Great-Great-Grandparents), gebruiken we een flexibele JSON structuur.</p>
              <Field label="Stamboom Data">
                <Textarea 
                  name="pedigree" 
                  rows={12} 
                  value={formData.pedigree} 
                  onChange={handleChange} 
                  className="font-mono text-xs"
                />
              </Field>
            </div>
          )}

          {/* TAB 5: PORTAAL & VERKOOP */}
          {activeTab === 'verkoop' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <h2 className="col-span-full font-display text-xl text-forest-900">Verkoop & Klantenportaal</h2>
              <Field label="Status">
                <Select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Beschikbaar">Beschikbaar</option>
                  <option value="Gereserveerd">Gereserveerd</option>
                  <option value="Verkocht">Verkocht</option>
                  <option value="Eigen fok">Eigen fok</option>
                </Select>
              </Field>
              <Field label="Klant Naam"><Input name="customerName" value={formData.customerName} onChange={handleChange} placeholder="Bv. Jan & Lisa" /></Field>
              
              <div className="col-span-full flex gap-4">
                <div className="flex-1">
                  <Field label="Prijs Nederland (€)"><Input type="number" name="priceNL" value={formData.priceNL} onChange={handleChange} /></Field>
                </div>
                <div className="flex-1">
                  <Field label="Prijs België (€)"><Input type="number" name="priceBE" value={formData.priceBE} onChange={handleChange} /></Field>
                </div>
              </div>

              <div className="col-span-full mt-4 rounded-xl border-2 border-forest-900/10 bg-forest-900/5 p-4">
                <p className="mb-2 text-sm font-bold text-forest-900">Verborgen Klantenlink</p>
                <p className="mb-4 text-xs text-forest-700">Deel deze link via WhatsApp. Niemand anders kan deze pagina zien.</p>
                <div className="flex gap-2">
                  <Input readOnly value={`https://mainecoon-app.vercel.app/k/${formData.secretToken}`} className="bg-white font-mono text-xs text-forest-600" />
                  <Btn type="button" variant="ghost" onClick={() => { navigator.clipboard.writeText(`https://mainecoon-app.vercel.app/k/${formData.secretToken}`); alert('Link gekopieerd!'); }}>Kopieer</Btn>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-4">
              <h2 className="font-display text-xl text-forest-900">Media Galerij</h2>
              <MediaUpload catId={formData.secretToken} onUploadSuccess={(url) => console.log("Geüpload:", url)} />
            </div>
          )}

          <div className="pt-6">
            <Btn type="submit" variant="solid">Opslaan in Supabase (Mock)</Btn>
          </div>
        </form>
      </Card>
    </>
  );
}
