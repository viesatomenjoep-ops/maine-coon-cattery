'use client';
import { useState, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Select, Btn } from '@/components/admin';
import { ImageSlot } from '@/components/ui';

// Onze native filepicker integratie met Cloudinary API
const NativeUploadWidget = ({ children, onSuccess, folder, accept }) => {
  const ref = useRef(null);
  const handleFile = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url && onSuccess) onSuccess({ event: 'success', info: { secure_url: data.url, name: file.name } });
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
    e.target.value = '';
  };
  return (
    <>
      <input type="file" ref={ref} className="hidden" accept={accept || "image/*,video/*,application/pdf"} onChange={handleFile} />
      {children({ open: () => ref.current?.click() })}
    </>
  );
};

export default function MediaDocumentenPage() {
  const { kittens } = useStore();
  const [targetMedical, setTargetMedical] = useState(kittens[0]?.id || '');
  const [targetContract, setTargetContract] = useState(kittens[0]?.id || '');
  
  // Lokale state om de zojuist geüploade bestanden te laten zien in de preview
  const [uploadedDocs, setUploadedDocs] = useState([]);

  const handleUploadSuccess = (category, kittenId, result) => {
    const kitten = kittens.find(k => k.id === kittenId) || { name: 'Algemeen' };
    setUploadedDocs(prev => [{
      url: result.info.secure_url,
      name: result.info.name || 'Document',
      category,
      kittenName: kitten.name
    }, ...prev]);
  };

  return (
    <>
      <PageHead label="Fokkerij" title="Media & Documenten" />
      <p className="-mt-4 mb-8 max-w-2xl text-sm text-forest-700/70">
        Het centrale portaal voor alle cattery documentatie. Upload veilig paspoorten, medische dossiers, 
        inentingsboekjes en verkoopcontracten direct naar het beveiligde dossier van de kat.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sectie: Paspoorten & Inentingen */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-3 mb-4 border-b border-forest-900/10 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 font-bold">🩺</span>
            <div>
              <h2 className="font-display text-xl text-forest-900">Medisch & Paspoorten</h2>
              <p className="text-xs text-forest-600">Paspoorten, HCM/PKD testen, Inentingen</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Voor welk kitten?</span>
              <Select value={targetMedical} onChange={(e)=>setTargetMedical(e.target.value)} className="mt-1.5">
                <option value="">Selecteer een kitten...</option>
                {kittens.map(k=><option key={k.id} value={k.id}>{k.name} ({k.color})</option>)}
              </Select>
            </label>

            <NativeUploadWidget 
              folder={`cattery_medical/${targetMedical || 'general'}`}
              onSuccess={(res) => handleUploadSuccess('Medisch', targetMedical, res)}
              accept="image/*,application/pdf"
            >
              {({ open }) => (
                <button type="button" onClick={(e) => { e.preventDefault(); open(); }} className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 transition hover:bg-blue-50">
                  <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">Bladeren / Open Camera</span>
                  <span className="text-xs text-blue-600/70">Upload PDF of Foto</span>
                </button>
              )}
            </NativeUploadWidget>
          </div>
        </Card>

        {/* Sectie: Verkoopcontracten */}
        <Card className="flex flex-col">
          <div className="flex items-center gap-3 mb-4 border-b border-forest-900/10 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta-100 text-terracotta-600 font-bold">📄</span>
            <div>
              <h2 className="font-display text-xl text-forest-900">Verkoopcontracten</h2>
              <p className="text-xs text-forest-600">Ondertekende contracten & reserveringen</p>
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Voor welk kitten?</span>
              <Select value={targetContract} onChange={(e)=>setTargetContract(e.target.value)} className="mt-1.5">
                <option value="">Selecteer een kitten...</option>
                {kittens.map(k=><option key={k.id} value={k.id}>{k.name}</option>)}
              </Select>
            </label>

            <NativeUploadWidget 
              folder={`cattery_contracts/${targetContract || 'general'}`}
              onSuccess={(res) => handleUploadSuccess('Contract', targetContract, res)}
              accept="application/pdf,image/*"
            >
              {({ open }) => (
                <button type="button" onClick={(e) => { e.preventDefault(); open(); }} className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-terracotta-200 bg-terracotta-50/50 p-8 transition hover:bg-terracotta-50">
                  <span className="rounded-full bg-terracotta-100 px-4 py-2 text-sm font-semibold text-terracotta-700 shadow-sm">Bladeren / Open Camera</span>
                  <span className="text-xs text-terracotta-600/70">Upload Ondertekend Contract (PDF of Foto)</span>
                </button>
              )}
            </NativeUploadWidget>
          </div>
        </Card>

        {/* Sectie: Algemene Galerij (Volledige breedte) */}
        <Card className="col-span-full">
          <div className="flex items-center gap-3 mb-4 border-b border-forest-900/10 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brass-100 text-brass-700 font-bold">📸</span>
            <div>
              <h2 className="font-display text-xl text-forest-900">Cattery Galerij</h2>
              <p className="text-xs text-forest-600">Sfeerfoto's, nieuwe nestjes en media voor advertenties</p>
            </div>
          </div>
          
          <NativeUploadWidget 
            folder="cattery_gallery"
            onSuccess={(res) => handleUploadSuccess('Galerij', null, res)}
            accept="image/*,video/*"
          >
            {({ open }) => (
              <button type="button" onClick={(e) => { e.preventDefault(); open(); }} className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-brass-300 bg-brass-50/50 p-8 transition hover:bg-brass-50">
                <span className="rounded-full bg-brass-200 px-4 py-2 text-sm font-semibold text-brass-800 shadow-sm">Meerdere Bestanden Selecteren</span>
                <span className="text-xs text-brass-700/70">Upload hoge resolutie foto's en video's</span>
              </button>
            )}
          </NativeUploadWidget>
        </Card>
      </div>

      {/* Recente Uploads Overzicht */}
      <div className="mt-12 space-y-6">
        <h2 className="font-display text-2xl text-forest-900">Recente Uploads</h2>
        {uploadedDocs.length === 0 ? (
          <p className="text-forest-700">Nog geen documenten geüpload in deze sessie.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {uploadedDocs.map((doc, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-forest-900/10 bg-white p-3 shadow-sm">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-forest-50 overflow-hidden relative">
                  {doc.url.endsWith('.pdf') ? (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-red-500">PDF</div>
                  ) : (
                    <img src={doc.url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-forest-900">{doc.category}: {doc.kittenName}</p>
                  <a href={doc.url} target="_blank" className="text-xs text-brass-600 hover:underline truncate block mt-0.5">{doc.name}</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
