'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHead, Card, Field, Input, Select, Textarea, Btn } from '@/components/admin';
import MediaUpload from '@/components/admin/MediaUpload';
import DocumentUploader, { DocumentList } from '@/components/admin/DocumentUploader';
import MediaGallery from '@/components/admin/MediaGallery';
import { useStore } from '@/context/StoreContext';
import { AdminUpload } from '@/components/admin/FilePicker';

const CldUploadWidget = AdminUpload;

const MALE_TOKENS = ['m', 'male', 'kater', 'mannelijk'];
const genderToSex = (g) => (MALE_TOKENS.includes((g || '').toString().trim().toLowerCase()) ? 'Kater' : 'Poes');
const STATUS_MAP = { beschikbaar: 'Beschikbaar', gereserveerd: 'Gereserveerd', verkocht: 'Verkocht', houden: 'Houden', 'eigen fok': 'Eigen fok' };
const normStatus = (s) => STATUS_MAP[(s || '').toString().trim().toLowerCase()] || (s || 'Beschikbaar');

export default function CatDossier() {
  const router = useRouter();
  const { id } = useParams();
  const { kittens, customers, deleteKitten, updateKitten, addKitten, addDocument, addMedia, deleteMedia, documents, media, addWeight, deleteWeight, deleteDocument } = useStore();
  const isNew = id === 'new';

  const catDocs = documents.filter(d => d.cat_id === id);
  const catMedia = media.filter(m => m.media_url?.includes(id) || m.cat_id === id); // Or general media


  let hasCloudinary = false;
  try { hasCloudinary = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME); } catch (e) {}
  
  // States voor de verschillende tabbladen of secties
  const [activeTab, setActiveTab] = useState('paspoort');
  
  // Voorbeeld data state (in de toekomst wordt dit Supabase)
  const [formData, setFormData] = useState({
    name: '',
    species: 'Cat',
    breed: 'Maine Coon',
    sex: 'Poes',
    dateOfBirth: '',
    color: '',
    ems_code: '',
    registration_no: '',
    birth_weight_g: '',
    reserved_by: '',
    chipNumber: '',
    chipImplantDate: '',
    chipLocation: '',
    vetName: '',
    status: 'Beschikbaar',
    priceNL: '',
    priceBE: '',
    customer_id: '',
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
      const cat = kittens.find((k) => k.id === id);
      if (cat) {
        setFormData(prev => ({
          ...prev,
          ...cat,
          sex: genderToSex(cat.gender),
          breed: cat.pedigree_data?.breed || 'Maine Coon',
          species: cat.pedigree_data?.species || prev.species || 'Cat',
          color: cat.color || '',
          dateOfBirth: cat.date_of_birth || '',
          ems_code: cat.ems_code || '',
          registration_no: cat.registration_no || '',
          birth_weight_g: cat.birth_weight_g ?? '',
          reserved_by: cat.reserved_by || '',
          chipNumber: cat.chip_number || '',
          chipImplantDate: cat.pedigree_data?.chipImplantDate || '',
          chipLocation: cat.pedigree_data?.chipLocation || '',
          vetName: cat.pedigree_data?.vetName || '',
          status: normStatus(cat.status),
          priceNL: cat.price_nl ?? '',
          priceBE: cat.price_be ?? '',
          pedigree_data: cat.pedigree_data || prev.pedigree_data,
        }));
      }
    }
  }, [id, isNew, kittens]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'sire' || name === 'dam') {
      setFormData(prev => ({ ...prev, pedigree_data: { ...prev.pedigree_data, [name]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || formData.name.trim() === '') {
        alert('Vul a.u.b. een naam in voor de kat. Dit veld is verplicht.');
        return;
      }

      // Check if there is pending weight data
      if (formData.weightDate && formData.weightGrams && !isNew) {
        await addWeight(id, formData.weightDate, formData.weightGrams);
        setFormData(prev => ({ ...prev, weightDate: '', weightGrams: '' }));
      }

      let res;
      if (!isNew) {
        res = await updateKitten(id, formData);
      } else {
        res = await addKitten(formData);
      }

      if (res && res.error) {
        alert('Er ging iets mis bij het opslaan: ' + (res.error.message || JSON.stringify(res.error)));
        return;
      }

      alert('Dossier is succesvol opgeslagen.');
      if (isNew) router.push('/admin/cats');
    } catch (err) {
      console.error("Save error:", err);
      alert('Er is een onverwachte fout opgetreden: ' + err.message);
    }
  };

  const handleDelete = () => {
    if (confirm('Weet je zeker dat je dit dossier (en alle bijbehorende gegevens) definitief wilt verwijderen?')) {
      if (!isNew) deleteKitten(id);
      router.push('/admin/cats');
    }
  };

  const ActionBar = () => (
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-forest-900/10 pt-5">
      <button type="button" onClick={handleSave} className="w-full sm:w-auto rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-2 text-sm font-bold uppercase tracking-wider text-emerald-700 transition hover:bg-emerald-100 shadow-sm">
        Dossier Opslaan
      </button>
    </div>
  );

  const tabs = [
    { id: 'paspoort', label: '1. Paspoort & Beschrijving' },
    { id: 'chip', label: '2. Identificatie & Chip' },
    { id: 'medisch', label: '3. Inentingen & Medisch' },
    { id: 'stamboom', label: '4. Stamboom & Afstamming' },
    { id: 'gewicht', label: '5. Groei & Weegcurves' },
    { id: 'verkoop', label: '6. Portaal & Verkoop' },
    { id: 'media', label: '7. Media & Galerij' }
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <PageHead label="Dossier" title={isNew ? 'Nieuwe Kat Toevoegen' : formData.name || 'Laden...'} />
        {!isNew && (
          <button type="button" onClick={handleDelete} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-600 transition hover:bg-red-50 shadow-sm">
            Volledig Dossier Verwijderen
          </button>
        )}
      </div>

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

                  {/* Profielfoto van de kitten (cover_image, getoond in overzichten) */}
                  <div className="col-span-full rounded-xl border border-forest-900/10 bg-cream-50 p-4">
                    <p className="mb-1 text-sm font-semibold text-forest-900">Profielfoto</p>
                    <p className="mb-3 text-xs text-forest-600">Deze foto wordt getoond in de overzichten (kattenbeheer, nestje, verkoop en klantenportaal). Vergeet niet op "Dossier Opslaan" te drukken.</p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      {formData.cover_image ? (
                        <img src={formData.cover_image} alt="Profielfoto" className="h-40 w-40 rounded-2xl border border-forest-900/10 object-cover shadow" />
                      ) : (
                        <div className="flex h-40 w-40 items-center justify-center rounded-2xl border border-dashed border-forest-900/20 bg-forest-50 text-forest-300">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="h-9 w-9"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>
                        </div>
                      )}
                      <div className="flex flex-1 flex-col gap-3">
                        <CldUploadWidget
                          onSuccess={(res) => { if (res.event === 'success') setFormData(prev => ({ ...prev, cover_image: res.info.secure_url })); }}
                          options={{ folder: `cattery_covers/${id}` }}
                        >
                          {({ open, openCamera }) => (
                            <div className="flex flex-wrap gap-2">
                              <Btn type="button" variant="ghost" onClick={(e) => { e.preventDefault(); open(); }} className="w-fit bg-white">
                                {formData.cover_image ? 'Profielfoto Vervangen' : 'Profielfoto Uploaden'}
                              </Btn>
                              <Btn type="button" variant="ghost" onClick={(e) => { e.preventDefault(); openCamera(); }} className="w-fit bg-white">Open camera</Btn>
                            </div>
                          )}
                        </CldUploadWidget>
                        {formData.cover_image && (
                          <Btn type="button" variant="danger" className="w-fit" onClick={() => setFormData(prev => ({ ...prev, cover_image: null }))}>Verwijderen</Btn>
                        )}
                      </div>
                    </div>
                  </div>

                  <Field label="Naam *"><Input required name="name" value={formData.name} onChange={handleChange} placeholder="Big Giant Resort's Dajana" /></Field>
                  <Field label="Diersoort"><Input name="species" value={formData.species} onChange={handleChange} /></Field>
                  <Field label="Ras"><Input name="breed" value={formData.breed} onChange={handleChange} /></Field>
                  <Field label="Geslacht">
                    <Select name="sex" value={formData.sex} onChange={handleChange}>
                      <option value="Poes">Vrouwelijk (Poes)</option>
                      <option value="Kater">Mannelijk (Kater)</option>
                    </Select>
                  </Field>
                  <Field label="Geboortedatum"><Input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} /></Field>
                  <Field label="Kleur"><Input name="color" value={formData.color} onChange={handleChange} placeholder="blue-silver-torbie" /></Field>
                  <Field label="Geboortegewicht (gram)"><Input type="number" min="0" name="birth_weight_g" value={formData.birth_weight_g} onChange={handleChange} placeholder="Bijv. 110" /></Field>

                  {/* Paspoort van de kitten (enkele afbeelding) */}
                  <div className="col-span-full mt-2 rounded-xl border border-brass-200 bg-brass-50 p-4">
                    <p className="mb-1 text-sm font-semibold text-brass-900">Paspoort van de kitten</p>
                    <p className="mb-3 text-xs text-forest-600">Upload hier één afbeelding of scan van het paspoort. Vergeet niet op "Dossier Opslaan" te drukken.</p>
                    <CldUploadWidget
                      onSuccess={(res) => {
                        if (res.event === 'success') {
                          setFormData(prev => ({ ...prev, pedigree_data: { ...prev.pedigree_data, passport_url: res.info.secure_url } }));
                        }
                      }}
                      options={{ folder: `cattery_paspoort/${id}` }}
                    >
                      {({ open, openCamera }) => (
                        <div className="flex flex-wrap gap-2">
                          <Btn type="button" variant="ghost" onClick={(e) => { e.preventDefault(); open(); }} className="bg-white border-brass-300 text-brass-800 hover:bg-brass-100">
                            {formData.pedigree_data?.passport_url ? 'Paspoort Vervangen' : 'Paspoort Uploaden'}
                          </Btn>
                          <Btn type="button" variant="ghost" onClick={(e) => { e.preventDefault(); openCamera(); }} className="bg-white border-brass-300 text-brass-800 hover:bg-brass-100">Open camera</Btn>
                        </div>
                      )}
                    </CldUploadWidget>
                    {formData.pedigree_data?.passport_url && (
                      <div className="mt-3 relative inline-block">
                        <img src={formData.pedigree_data.passport_url} alt="Paspoort" className="h-48 rounded shadow border border-brass-200" />
                        <Btn type="button" variant="danger" className="absolute -top-2 -right-2 text-[10px] px-2 py-1" onClick={() => setFormData(prev => ({ ...prev, pedigree_data: { ...prev.pedigree_data, passport_url: null } }))}>X</Btn>
                      </div>
                    )}
                  </div>

                  {/* Foto's van de kitten zelf */}
                  <div className="col-span-full mt-2 rounded-xl border border-forest-900/10 bg-cream-50 p-4">
                    <p className="mb-1 text-sm font-semibold text-forest-900">Foto's van de kitten</p>
                    <p className="mb-3 text-xs text-forest-600">Deze foto's verschijnen ook in het klantenportaal zodra een klant aan dit dossier is gekoppeld.</p>
                    {isNew ? (
                      <p className="text-xs italic text-forest-600">Sla het dossier eerst op voordat je foto's kunt uploaden.</p>
                    ) : (
                      <>
                        <MediaUpload
                          catId={id}
                          onUploadSuccess={async (url) => {
                            await addMedia({ url, cat_id: id, media_type: 'image' });
                          }}
                        />
                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                          {catMedia.map(m => (
                            <div key={m.id} className="relative group">
                              <img src={m.media_url} alt="" className="aspect-square w-full rounded-xl object-cover shadow-sm border border-forest-900/10" />
                              <button
                                type="button"
                                onClick={() => { if (confirm('Weet je zeker dat je deze foto definitief wilt verwijderen?')) deleteMedia(m.id); }}
                                className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                                title="Verwijder foto"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

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

                  <div className="col-span-full mt-6 rounded-xl border border-brass-200 bg-brass-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-brass-900">Documenten (Chip- / Identificatiebewijs)</p>
                    {isNew ? (
                      <p className="text-xs italic text-forest-600">Sla het dossier eerst op voordat je documenten kunt uploaden.</p>
                    ) : (
                      <>
                        <DocumentUploader kittenId={id} folder={`cattery_documents/${id}`} defaultType="chip" types={['chip', 'overig']} />
                        <div className="mt-4">
                          <DocumentList documents={catDocs.filter(d => d.document_type === 'chip')} onDelete={deleteDocument} />
                        </div>
                      </>
                    )}
                  </div>
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
                    <p className="mb-3 text-sm font-semibold text-brass-900">Digitale Kluis (PDF / Scans van Dierenarts)</p>
                    {isNew ? (
                      <p className="text-xs italic text-forest-600">Sla het dossier eerst op voordat je documenten kunt uploaden.</p>
                    ) : (
                      <>
                        <DocumentUploader kittenId={id} folder={`cattery_documents/${id}`} defaultType="dierenarts" types={['dierenarts', 'vaccinatie', 'hcm_echo', 'pkd', 'fiv_felv', 'overig']} />
                        <div className="mt-4">
                          <DocumentList documents={catDocs.filter(d => ['dierenarts', 'vaccinatie', 'hcm_echo', 'pkd', 'fiv_felv'].includes(d.document_type))} onDelete={deleteDocument} />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="col-span-full"><ActionBar /></div>
                </div>
              )}

              {/* TAB 4: STAMBOOM */}
              {activeTab === 'stamboom' && (
                <div className="grid gap-4">
                  <h2 className="font-display text-xl text-forest-900">Stamboom & Afstamming</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Stamboomnummer (registratie)"><Input name="registration_no" value={formData.registration_no} onChange={handleChange} placeholder="Bijv. NHSB 1234567" /></Field>
                    <Field label="EMS-code"><Input name="ems_code" value={formData.ems_code} onChange={handleChange} placeholder="Bijv. MCO n 22" /></Field>
                  </div>
                  <Field label="Vader (Sire)"><Input name="sire" value={formData.pedigree_data?.sire || ''} onChange={handleChange} placeholder="Naam van de vader" /></Field>
                  <Field label="Moeder (Dam)"><Input name="dam" value={formData.pedigree_data?.dam || ''} onChange={handleChange} placeholder="Naam van de moeder" /></Field>
                  
                  <div className="mt-4 rounded-xl border border-brass-200 bg-brass-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-brass-900">Digitale Stamboom Uploaden</p>
                    <CldUploadWidget 
                      onSuccess={(res) => { 
                        if(res.event === 'success') {
                          setFormData(prev => ({ ...prev, pedigree_data: { ...prev.pedigree_data, image_url: res.info.secure_url } }));
                          alert('Stamboom afbeelding is geüpload! Vergeet niet op Opslaan te drukken.');
                        } 
                      }}
                      options={{ folder: `cattery_stamboom/${id}` }}
                    >
                      {({ open, openCamera }) => (
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Btn type="button" variant="ghost" onClick={(e) => { e.preventDefault(); open(); }} className="bg-white border-brass-300 text-brass-800 hover:bg-brass-100">
                            Stamboom Uploaden
                          </Btn>
                          <Btn type="button" variant="ghost" onClick={(e) => { e.preventDefault(); openCamera(); }} className="bg-white border-brass-300 text-brass-800 hover:bg-brass-100">Open camera</Btn>
                        </div>
                      )}
                    </CldUploadWidget>
                    {formData.pedigree_data?.image_url && (
                      <div className="mt-2 relative inline-block">
                        <img src={formData.pedigree_data.image_url} alt="Stamboom" className="h-48 rounded shadow border border-brass-200" />
                        <Btn type="button" variant="danger" className="absolute -top-2 -right-2 text-[10px] px-2 py-1" onClick={() => setFormData(prev => ({ ...prev, pedigree_data: { ...prev.pedigree_data, image_url: null } }))}>X</Btn>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl border border-forest-900/10 bg-cream-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-forest-900">Overige documenten (stamboom & afstamming)</p>
                    {isNew ? (
                      <p className="text-xs italic text-forest-600">Sla het dossier eerst op voordat je documenten kunt uploaden.</p>
                    ) : (
                      <>
                        <DocumentUploader kittenId={id} folder={`cattery_stamboom/${id}`} defaultType="stamboom_overig" types={['stamboom', 'stamboom_overig', 'overig']} />
                        <div className="mt-4">
                          <DocumentList documents={catDocs.filter(d => ['stamboom', 'stamboom_overig'].includes(d.document_type))} onDelete={deleteDocument} />
                        </div>
                      </>
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
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 bg-cream-50 p-4 rounded-xl border border-forest-900/10">
                    <div className="flex-1 w-full">
                      <Field label="Datum"><Input type="date" name="weightDate" value={formData.weightDate} onChange={handleChange} className="w-full" /></Field>
                    </div>
                    <div className="flex-1 w-full">
                      <Field label="Gewicht (gram)"><Input type="number" name="weightGrams" value={formData.weightGrams} onChange={handleChange} placeholder="Bv. 1250" className="w-full" /></Field>
                    </div>
                    <Btn 
                      type="button" 
                      variant="brass" 
                      className="w-full sm:w-auto mt-2 sm:mt-0 justify-center py-3 sm:py-2.5" 
                      onClick={async () => {
                        if (!formData.weightDate || !formData.weightGrams) {
                          alert('Vul a.u.b. een datum en gewicht in.');
                          return;
                        }
                        if (!isNew) {
                          await addWeight(id, formData.weightDate, formData.weightGrams);
                          setFormData(prev => ({ ...prev, weightDate: '', weightGrams: '' }));
                          alert('Het gewicht is succesvol toegevoegd.');
                        } else {
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
                                <button type="button" onClick={() => { if(confirm('Weet je zeker dat je dit gewicht wilt verwijderen?')) deleteWeight(id, w.id); }} className="text-red-500 hover:text-red-700 text-xs font-semibold uppercase">Verwijder</button>
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

              {/* TAB 6: PORTAAL & VERKOOP */}
              {activeTab === 'verkoop' && (
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                  <h2 className="col-span-full font-display text-xl text-forest-900">Verkoop & Klantenportaal</h2>
                  <Field label="Status">
                    <Select name="status" value={formData.status} onChange={handleChange}>
                      <option value="Beschikbaar">Beschikbaar</option>
                      <option value="Gereserveerd">Gereserveerd</option>
                      <option value="Verkocht">Verkocht</option>
                      <option value="Houden">Houden</option>
                      <option value="Eigen fok">Eigen fok</option>
                    </Select>
                  </Field>
                  <Field label="Gekoppelde Klant">
                    <Select name="customer_id" value={formData.customer_id || ''} onChange={handleChange}>
                      <option value="">- Geen klant (of nieuw in klantenbestand) -</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Gereserveerd door (naam)"><Input name="reserved_by" value={formData.reserved_by} onChange={handleChange} placeholder="Optioneel" /></Field>
                  
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

              {/* TAB 7: MEDIA & GALERIJ */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="font-display text-xl text-forest-900">Media & Galerij</h2>
                    <p className="mt-1 text-sm text-forest-600">Compleet overzicht van alle foto's en documenten van deze kitten, geordend per categorie. Uploaden doe je binnen de betreffende tabbladen.</p>
                  </div>
                  {isNew ? (
                    <p className="text-sm italic text-forest-600">Sla het dossier eerst op om de media-galerij te bekijken.</p>
                  ) : (
                    <MediaGallery
                      media={catMedia}
                      documents={catDocs}
                      pedigreeData={formData.pedigree_data}
                      onDeleteMedia={(mid) => { if (confirm('Weet je zeker dat je deze foto definitief wilt verwijderen?')) deleteMedia(mid); }}
                      onDeleteDocument={(did) => { if (confirm('Weet je zeker dat je dit document definitief wilt verwijderen?')) deleteDocument(did); }}
                    />
                  )}
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
