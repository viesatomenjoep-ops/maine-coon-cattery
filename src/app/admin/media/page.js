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
  const { kittens, documents, media, addDocument, deleteDocument, addMedia, deleteMedia } = useStore();
  const [targetMedical, setTargetMedical] = useState(kittens[0]?.id || '');
  const [targetContract, setTargetContract] = useState(kittens[0]?.id || '');
  
  // States voor de previews na uploaden
  const [previewMedical, setPreviewMedical] = useState(null);
  const [previewContract, setPreviewContract] = useState(null);
  const [previewGallery, setPreviewGallery] = useState(null);

  const handleUploadSuccess = async (category, kittenId, result) => {
    if (category === 'Galerij') {
      await addMedia({ url: result.info.secure_url, name: result.info.name });
      setPreviewGallery({ url: result.info.secure_url, name: result.info.name });
    } else {
      await addDocument({ 
        url: result.info.secure_url, 
        name: result.info.name || 'Document',
        category,
        cat_id: kittenId || null 
      });
      if (category === 'Medisch') {
        setPreviewMedical({ url: result.info.secure_url, name: result.info.name });
      } else {
        setPreviewContract({ url: result.info.secure_url, name: result.info.name });
      }
    }
  };

  // Combineer documenten en media voor het overzicht, zodat we alles zien
  const allUploads = [
    ...documents.map(d => ({ ...d, isDoc: true, kittenName: kittens.find(k=>k.id===d.cat_id)?.name || 'Algemeen', label: d.document_type })),
    ...media.map(m => ({ ...m, isDoc: false, kittenName: 'Galerij', label: 'Algemeen' }))
  ].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

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
                  <span className="text-xs text-blue-600/70">Upload PDF of Foto (Auto-Save)</span>
                </button>
              )}
            </NativeUploadWidget>
            
            {previewMedical && (
              <div className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-blue-200 bg-blue-50">
                <span className="text-xl">✅</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-900 truncate">Geüpload: {previewMedical.name}</p>
                  <a href={previewMedical.url} target="_blank" className="text-xs text-blue-600 hover:underline">Bekijk preview</a>
                </div>
              </div>
            )}
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
                  <span className="text-xs text-terracotta-600/70">Upload Ondertekend Contract (Auto-Save)</span>
                </button>
              )}
            </NativeUploadWidget>

            {previewContract && (
              <div className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-terracotta-200 bg-terracotta-50">
                <span className="text-xl">✅</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-terracotta-900 truncate">Geüpload: {previewContract.name}</p>
                  <a href={previewContract.url} target="_blank" className="text-xs text-terracotta-600 hover:underline">Bekijk preview</a>
                </div>
              </div>
            )}
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
                <span className="text-xs text-brass-700/70">Upload hoge resolutie foto's en video's (Auto-Save)</span>
              </button>
            )}
          </NativeUploadWidget>

          {previewGallery && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-xl border border-brass-200 bg-brass-50 max-w-sm">
              <img src={previewGallery.url} alt="Preview" className="h-16 w-16 object-cover rounded-lg shadow-sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-brass-900 truncate">Geüpload: {previewGallery.name}</p>
                <span className="text-[10px] text-brass-700">In galerij geplaatst ✅</span>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Recente Uploads Overzicht */}
      <div className="mt-12 space-y-6">
        <h2 className="font-display text-2xl text-forest-900">Documenten & Media Archief</h2>
        {allUploads.length === 0 ? (
          <p className="text-forest-700">Nog geen documenten of media geüpload in de database.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allUploads.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 rounded-xl border border-forest-900/10 bg-white p-3 shadow-sm hover:border-forest-900/20 transition">
                <div className="h-12 w-12 shrink-0 rounded-lg bg-forest-50 overflow-hidden relative border border-forest-900/5">
                  {(doc.file_url || doc.media_url).endsWith('.pdf') ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-red-500 bg-red-50">PDF</div>
                  ) : (
                    <img src={doc.file_url || doc.media_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-forest-900">{doc.label}: {doc.kittenName}</p>
                  <a href={doc.file_url || doc.media_url} target="_blank" className="text-xs text-brass-600 hover:underline truncate block mt-0.5">{doc.notes || 'Bekijk bestand'}</a>
                </div>
                <button 
                  onClick={() => doc.isDoc ? deleteDocument(doc.id) : deleteMedia(doc.id)} 
                  className="shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                  title="Verwijder"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
