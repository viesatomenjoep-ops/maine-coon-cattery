'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHead, Card, Field, Input, Select, Textarea, Btn } from '@/components/admin';
import MediaUpload from '@/components/admin/MediaUpload';
import { useStore } from '@/context/StoreContext';
// import { CldUploadWidget } from 'next-cloudinary';

import { useRef } from 'react';

const CldUploadWidget = ({ children, onSuccess, options }) => {
  const ref = useRef(null);
  const handleFile = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      if (options?.folder) formData.append('folder', options.folder);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url && onSuccess) onSuccess({ event: 'success', info: { secure_url: data.url } });
    }
    e.target.value = '';
  };
  return (
    <>
      <input type="file" ref={ref} className="hidden" multiple={options?.multiple} accept={options?.clientAllowedFormats?.join(',') || "image/*,video/*,application/pdf"} onChange={handleFile} />
      {children({ open: () => ref.current?.click() })}
    </>
  );
};

export default function CatDossier({ params }) {
  const router = useRouter();
  const { kittens, deleteKitten, updateKitten, addKitten, addDocument, addMedia, documents, media, addWeight, deleteWeight } = useStore();
  const isNew = params.id === 'new';

  const catDocs = documents.filter(d => d.cat_id === params.id);
  const catMedia = media.filter(m => m.media_url?.includes(params.id) || m.cat_id === params.id); // Or general media


  let hasCloudinary = false;
  try { hasCloudinary = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME); } catch (e) {}
  
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
    secretToken: isNew ? ((typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)) : '123e4567-e89b-12d3-a456-426614174000',
    // Vaccinations
    vaccineName: '',
    vaccineBatch: '',
    vaccineDate: '',
    vaccineValidUntil: '',
    // Pedigree
    pedigree_data: { sire: '', dam: '', image_url: '' },
    // Weights
    weights: [],
    weightDate: '',
    weightGrams: ''
  });

  useEffect(() => {
    if (!isNew) {
      const cat = kittens.find((k) => k.id === params.id);
      if (cat) {
        setFormData(prev => ({ ...prev, ...cat }));
      }
    }
  }, [params.id, isNew, kittens]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sire' || name === 'dam') {
      setFormData(prev => ({ ...prev, pedigree_data: { ...prev.pedigree_data, [name]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    if (!isNew) {
      updateKitten(params.id, formData);
    } else {
      addKitten(formData);
    }
    alert('Sectie opgeslagen in actieve sessie!');
    if (isNew) router.push('/admin/cats');
  };

  const handleDelete = () => {
    if (confirm('Weet je zeker dat je dit dossier (en alle bijbehorende gegevens) definitief wilt verwijderen?')) {
      if (!isNew) deleteKitten(params.id);
      router.push('/admin/cats');
    }
  };

  const ActionBar = () => (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-forest-900/10 pt-5">
      <button type="button" onClick={handleDelete} className="w-full sm:w-auto rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-600 transition hover:bg-red-50">
        Verwijderen
      </button>
      <button type="button" onClick={handleSave} className="w-full sm:w-auto rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 transition hover:bg-emerald-50">
        Opslaan
      </button>
    </div>
  );

  const tabs = [
    { id: 'paspoort', label: '1. Paspoort & Beschrijving' },
    { id: 'chip', label: '2. Identificatie & Chip' },
    { id: 'medisch', label: '3. Inentingen & Medisch' },
    { id: 'stamboom', label: '4. Stamboom & Afstamming' },
    { id: 'gewicht', label: '5. Groei & Weegcurves' },
    { id: 'media', label: '6. Media & Galerij' },
    { id: 'verkoop', label: '7. Portaal & Verkoop' }
  ];

  return (
    <>
      <PageHead label="Dossier" title={isNew ? 'Nieuwe Kat Toevoegen' : formData.name || 'Laden...'} />

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Mobiele Dropdown Navigatie */}
        <div className="w-full lg:hidden">
          <label className="block text-xs font-bold uppercase tracking-wider text-forest-600 mb-2">Navigeer door dossier</label>
          <select 
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full rounded-xl border border-forest-900/10 bg-white p-3.5 text-sm font-bold text-forest-900 shadow-sm outline-none focus:border-brass-400 focus:ring-1 focus:ring-brass-400"
          >
            {tabs.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        {/* Desktop Sidebar Navigatie */}
        <div className="hidden lg:flex w-64 shrink-0 flex-col gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`text-left rounded-xl px-4 py-3 text-sm transition border outline-none focus:outline-none ${
                activeTab === t.id 
                  ? 'bg-brass-400 text-forest-950 border-transparent font-bold shadow-sm' 
                  : 'bg-white text-forest-600 border-forest-900/10 hover:bg-forest-50 hover:text-forest-900 font-medium'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full">
          <Card>
            <div className="space-y-6">
              
              {/* TAB 1: PASPOORT */}
              {activeTab === 'paspoort' && (
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
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
                  <div className="col-span-full"><ActionBar /></div>
                </div>
              )}

              {/* TAB 2: CHIP */}
              {activeTab === 'chip' && (
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                  <h2 className="col-span-full font-display text-xl text-forest-900">Kennzeichnung / Marking</h2>
                  <Field label="Transpondercode (Chipnummer)"><Input name="chipNumber" value={formData.chipNumber} onChange={handleChange} placeholder="276098109155736" /></Field>
                  <Field label="Datum van implantatie"><Input type="date" name="chipImplantDate" value={formData.chipImplantDate} onChange={handleChange} /></Field>
                  <Field label="Plaats van implantatie"><Input name="chipLocation" value={formData.chipLocation} onChange={handleChange} placeholder="Left shoulder" /></Field>
                  <Field label="Naam Dierenarts"><Input name="vetName" value={formData.vetName} onChange={handleChange} placeholder="Dr. Antje Waldschmidt" /></Field>
                  <div className="col-span-full"><ActionBar /></div>
                </div>
              )}

              {/* TAB 3: INENTINGEN */}
              {activeTab === 'medisch' && (
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                  <h2 className="col-span-full font-display text-xl text-forest-900">Tollwutimpfung / Rabies</h2>
                  <Field label="Fabrikant & Vaccin"><Input name="vaccineName" value={formData.vaccineName} onChange={handleChange} placeholder="RABISIN, Boehringer Ingelheim" /></Field>
                  <Field label="Batchnummer"><Input name="vaccineBatch" value={formData.vaccineBatch} onChange={handleChange} placeholder="G64953" /></Field>
                  <Field label="Datum inenting"><Input type="date" name="vaccineDate" value={formData.vaccineDate} onChange={handleChange} /></Field>
                  <Field label="Geldig tot"><Input type="date" name="vaccineValidUntil" value={formData.vaccineValidUntil} onChange={handleChange} /></Field>
                  
                  <div className="col-span-full mt-6 rounded-xl border border-brass-200 bg-brass-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-brass-900">Digitale Kluis (PDF / Scans van Dierenarts)</p>
                    {true ? (
                      <CldUploadWidget 
                        signatureEndpoint="/api/sign-cloudinary-params"
                        onSuccess={async (res) => { 
                          if(res.event === 'success') {
                            await addDocument({ url: res.info.secure_url, name: 'Medisch Document', category: 'Medisch', cat_id: params.id });
                            alert('Document succesvol geüpload en opgeslagen in de kluis!');
                          } 
                        }}
                        options={{ sources: ['local', 'url', 'camera'], multiple: true, folder: `cattery_medisch/${params.id}`, clientAllowedFormats: ['pdf', 'images', 'png', 'jpg', 'jpeg'] }}
                      >
                        {({ open }) => (
                          <Btn type="button" variant="ghost" onClick={(e) => { e.preventDefault(); open(); }} className="bg-white border-brass-300 text-brass-800 hover:bg-brass-100">
                            Bestand Uploaden
                          </Btn>
                        )}
                      </CldUploadWidget>
                    ) : (
                      <p className="text-xs text-red-600">Cloudinary (ENV) niet geconfigureerd.</p>
                    )}
                    
                    {catDocs.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {catDocs.map(d => (
                          <a key={d.id} href={d.file_url} target="_blank" className="text-xs text-brass-700 bg-white border border-brass-200 px-2 py-1 rounded hover:bg-brass-100 transition truncate max-w-[200px]">
                            📄 {d.notes || 'Document'}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="col-span-full"><ActionBar /></div>
                </div>
              )}

              {/* TAB 4: STAMBOOM */}
              {activeTab === 'stamboom' && (
                <div className="grid gap-4">
                  <h2 className="font-display text-xl text-forest-900">Stamboom & Afstamming</h2>
                  <Field label="Vader (Sire)"><Input name="sire" value={formData.pedigree_data?.sire || ''} onChange={handleChange} placeholder="Naam van de vader" /></Field>
                  <Field label="Moeder (Dam)"><Input name="dam" value={formData.pedigree_data?.dam || ''} onChange={handleChange} placeholder="Naam van de moeder" /></Field>
                  
                  <div className="mt-4 rounded-xl border border-brass-200 bg-brass-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-brass-900">Digitale Stamboom Uploaden</p>
                    <CldUploadWidget 
                      signatureEndpoint="/api/sign-cloudinary-params"
                      onSuccess={(res) => { 
                        if(res.event === 'success') {
                          setFormData(prev => ({ ...prev, pedigree_data: { ...prev.pedigree_data, image_url: res.info.secure_url } }));
                        } 
                      }}
                      options={{ folder: `cattery_stamboom/${params.id}` }}
                    >
                      {({ open }) => (
                        <Btn type="button" variant="ghost" onClick={(e) => { e.preventDefault(); open(); }} className="bg-white border-brass-300 text-brass-800 hover:bg-brass-100 mb-4">
                          Stamboom Uploaden
                        </Btn>
                      )}
                    </CldUploadWidget>
                    {formData.pedigree_data?.image_url && (
                      <div className="mt-2 relative inline-block">
                        <img src={formData.pedigree_data.image_url} alt="Stamboom" className="h-48 rounded shadow border border-brass-200" />
                        <Btn type="button" variant="danger" className="absolute -top-2 -right-2 text-[10px] px-2 py-1" onClick={() => setFormData(prev => ({ ...prev, pedigree_data: { ...prev.pedigree_data, image_url: null } }))}>X</Btn>
                      </div>
                    )}
                  </div>
                  <ActionBar />
                </div>
              )}

              {/* TAB 5: GEWICHT */}
              {activeTab === 'gewicht' && (
                <div className="grid gap-4">
                  <h2 className="font-display text-xl text-forest-900">Groei & Weegcurves</h2>
                  <p className="text-sm text-forest-700 mb-4">Voeg hier de wekelijkse wegingen toe. Deze curve wordt getoond in het klantenportaal.</p>
                  
                  <div className="flex items-end gap-4 bg-cream-50 p-4 rounded-xl border border-forest-900/10">
                    <div className="flex-1">
                      <Field label="Datum"><Input type="date" name="weightDate" value={formData.weightDate} onChange={handleChange} /></Field>
                    </div>
                    <div className="flex-1">
                      <Field label="Gewicht (gram)"><Input type="number" name="weightGrams" value={formData.weightGrams} onChange={handleChange} placeholder="Bv. 1250" /></Field>
                    </div>
                    <Btn 
                      type="button" 
                      variant="brass" 
                      onClick={async () => {
                        if (formData.weightDate && formData.weightGrams && !isNew) {
                          await addWeight(params.id, formData.weightDate, formData.weightGrams);
                          setFormData(prev => ({ ...prev, weightDate: '', weightGrams: '' }));
                        } else if (isNew) {
                          alert('Sla het kitten eerst op voordat je gewichten kunt toevoegen.');
                        }
                      }}
                    >
                      Toevoegen
                    </Btn>
                  </div>

                  {formData.weights && formData.weights.length > 0 ? (
                    <div className="mt-4 rounded-xl overflow-hidden border border-forest-900/10 bg-white">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-forest-50 text-forest-900">
                          <tr>
                            <th className="p-3 font-semibold">Datum</th>
                            <th className="p-3 font-semibold">Gewicht</th>
                            <th className="p-3 font-semibold text-right">Actie</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.weights.map(w => (
                            <tr key={w.id} className="border-t border-forest-900/5 hover:bg-forest-50/50">
                              <td className="p-3 text-forest-800">{new Date(w.date).toLocaleDateString('nl-NL')}</td>
                              <td className="p-3 font-medium text-forest-900">{w.grams} g</td>
                              <td className="p-3 text-right">
                                <button type="button" onClick={() => deleteWeight(params.id, w.id)} className="text-red-500 hover:text-red-700 text-xs font-semibold uppercase">Verwijder</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-forest-500 italic mt-2">Nog geen gewichten toegevoegd.</p>
                  )}
                  
                  <div className="mt-8"><ActionBar /></div>
                </div>
              )}

              {/* TAB 5: PORTAAL & VERKOOP */}
              {activeTab === 'verkoop' && (
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
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
                  
                  <div className="col-span-full grid grid-cols-2 gap-4 items-end">
                    <Field label="Prijs NL (€)">
                      <Input type="number" name="priceNL" value={formData.priceNL} onChange={handleChange} />
                    </Field>
                    <Field label="Prijs BE (€)">
                      <Input type="number" name="priceBE" value={formData.priceBE} onChange={handleChange} />
                    </Field>
                  </div>

                  <div className="col-span-full rounded-2xl border border-forest-900/10 bg-forest-50 p-6 shadow-inner">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-brass-600 shadow-sm">K</span>
                      <h3 className="font-display text-lg text-forest-900">Verborgen Klantenlinks</h3>
                    </div>
                    <p className="mb-4 text-xs text-forest-700">Deel deze links via WhatsApp. Ze bevatten de specifieke prijs (NL of BE) per link.</p>
                    
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <div className="flex-1 min-w-0">
                          <Input readOnly value={typeof window !== 'undefined' ? `${window.location.origin}/k/${formData.secret_token_nl || 'Onbekend'}` : `.../k/${formData.secret_token_nl || 'Onbekend'}`} className="w-full bg-white font-mono text-[10px] text-forest-600" />
                        </div>
                        <Btn type="button" variant="ghost" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/k/${formData.secret_token_nl}`); alert('NL Link gekopieerd!'); }} className="whitespace-nowrap shrink-0 text-xs px-3">Kopieer NL</Btn>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="flex-1 min-w-0">
                          <Input readOnly value={typeof window !== 'undefined' ? `${window.location.origin}/k/${formData.secret_token_be || 'Onbekend'}` : `.../k/${formData.secret_token_be || 'Onbekend'}`} className="w-full bg-white font-mono text-[10px] text-forest-600" />
                        </div>
                        <Btn type="button" variant="ghost" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/k/${formData.secret_token_be}`); alert('BE Link gekopieerd!'); }} className="whitespace-nowrap shrink-0 text-xs px-3">Kopieer BE</Btn>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-full"><ActionBar /></div>
                </div>
              )}

              {/* TAB 6: MEDIA */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  <h2 className="font-display text-xl text-forest-900">Media Galerij</h2>
                  <MediaUpload 
                    catId={params.id} 
                    onUploadSuccess={async (url) => {
                       await addMedia({ url, name: formData.name });
                       alert('Media succesvol geüpload!');
                    }} 
                  />
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {media.filter(m => m.media_url?.includes(params.id)).map(m => (
                      <img key={m.id} src={m.media_url} alt="" className="aspect-square w-full rounded-xl object-cover shadow-sm border border-forest-900/10" />
                    ))}
                  </div>
                  <ActionBar />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
