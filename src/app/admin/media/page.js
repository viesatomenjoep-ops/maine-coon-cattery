'use client';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Select, Btn } from '@/components/admin';
import { ImageSlot } from '@/components/ui';
import { AdminUpload } from '@/components/admin/FilePicker';
import jsPDF from 'jspdf';

const NativeUploadWidget = AdminUpload;

// Onderscheid: kitten (hoort bij een nestje), fokkater of fokpoes.
const isMale = (g) => /kater|mann|\bmale\b|\bm\b/i.test(g || '');
const isFemale = (g) => /poes|vrouw|female|\bf\b/i.test(g || '');
const catGroup = (k) => (!k.is_own_breeding_cat ? 'kitten' : isMale(k.gender) ? 'kater' : isFemale(k.gender) ? 'poes' : 'overig');
const GROUP_TABS = [
  { key: 'kitten', label: 'Kitten', plural: 'kittens' },
  { key: 'kater', label: 'Kater', plural: 'katers' },
  { key: 'poes', label: 'Poes', plural: 'poezen' },
];

// Eerst het type kiezen (Kitten/Kater/Poes), daarna de specifieke kat.
function CatPicker({ kittens, value, onChange }) {
  const selected = kittens.find((k) => k.id === value);
  const [type, setType] = useState(selected ? catGroup(selected) : 'kitten');
  const list = kittens.filter((k) => catGroup(k) === type);
  const tab = GROUP_TABS.find((t) => t.key === type) || GROUP_TABS[0];
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        {GROUP_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => { setType(t.key); onChange(''); }}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${type === t.key ? 'border-emerald-500 bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300' : 'border-forest-900/15 bg-white text-forest-700 hover:bg-forest-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Kies een {tab.label.toLowerCase()}…</option>
        {list.map((k) => <option key={k.id} value={k.id}>{k.name}{k.color ? ` (${k.color})` : ''}</option>)}
      </Select>
      {list.length === 0 && <p className="mt-1.5 text-xs italic text-forest-500">Nog geen {tab.plural} gevonden.</p>}
    </div>
  );
}

export default function MediaDocumentenPage() {
  const { kittens, documents, media, addDocument, deleteDocument, addMedia, deleteMedia } = useStore();
  const [targetMedical, setTargetMedical] = useState('');
  const [targetContract, setTargetContract] = useState('');
  const [archiveCat, setArchiveCat] = useState('');
  
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

  // Alleen de bestanden van de geselecteerde kat (kitten/kater/poes).
  const catUploads = allUploads.filter((u) => u.cat_id === archiveCat);

  const [selectedItems, setSelectedItems] = useState([]);

  const toggleSelect = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const forceDownload = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = filename || `cattery-media-${Date.now()}`;
      a.click();
    } catch(e) {
      window.open(url, '_blank');
    }
  };

  const fetchImageData = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve({ dataUrl: canvas.toDataURL('image/jpeg', 0.9), width: img.width, height: img.height });
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  };

  const handleDownloadSelectedFiles = async () => {
    if(selectedItems.length === 0) return alert('Selecteer minimaal 1 bestand.');
    const items = allUploads.filter(u => selectedItems.includes(u.id));
    for (const item of items) {
      await forceDownload(item.file_url || item.media_url, item.name || `media-${Date.now()}`);
    }
  };

  const handleDownloadSelectedPDF = async () => {
    const items = allUploads.filter(u => selectedItems.includes(u.id) && !(u.file_url || u.media_url).endsWith('.pdf'));
    if(items.length === 0) return alert("Selecteer minimaal 1 afbeelding om een PDF album te maken. (Bestaande PDF's worden overgeslagen)");
    
    const pdf = new jsPDF();
    let pagesAdded = 0;
    
    for (const item of items) {
      const imgObj = await fetchImageData(item.file_url || item.media_url);
      if (imgObj) {
        if (pagesAdded > 0) pdf.addPage();
        const pw = pdf.internal.pageSize.getWidth();
        const ph = pdf.internal.pageSize.getHeight();
        const ratio = Math.min((pw - 20) / imgObj.width, (ph - 20) / imgObj.height);
        const w = imgObj.width * ratio;
        const h = imgObj.height * ratio;
        const x = (pw - w) / 2;
        const y = (ph - h) / 2;
        pdf.addImage(imgObj.dataUrl, 'JPEG', x, y, w, h);
        pagesAdded++;
      }
    }
    
    if (pagesAdded > 0) {
      pdf.save('cattery-album.pdf');
    } else {
      alert('Kon geen afbeeldingen verwerken.');
    }
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
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Voor welke kat? Kies eerst het type.</span>
              <div className="mt-1.5"><CatPicker kittens={kittens} value={targetMedical} onChange={setTargetMedical} /></div>
            </div>

            <NativeUploadWidget
              options={{ folder: `cattery_medical/${targetMedical || 'general'}`, accept: 'image/*,application/pdf' }}
              onSuccess={(res) => handleUploadSuccess('Medisch', targetMedical, res)}
            >
              {({ open, openCamera }) => (
                <div className="flex flex-col gap-3">
                  <button type="button" onClick={(e) => { e.preventDefault(); open(); }} className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-6 transition hover:bg-blue-50">
                    <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">📁 Kies bestand</span>
                    <span className="text-xs text-blue-600/70">PDF of foto (auto-save)</span>
                  </button>
                  <button type="button" onClick={(e) => { e.preventDefault(); openCamera(); }} className="w-full rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                    📷 Open camera
                  </button>
                </div>
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
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Voor welke kat? Kies eerst het type.</span>
              <div className="mt-1.5"><CatPicker kittens={kittens} value={targetContract} onChange={setTargetContract} /></div>
            </div>

            <NativeUploadWidget
              options={{ folder: `cattery_contracts/${targetContract || 'general'}`, accept: 'application/pdf,image/*' }}
              onSuccess={(res) => handleUploadSuccess('Contract', targetContract, res)}
            >
              {({ open, openCamera }) => (
                <div className="flex flex-col gap-3">
                  <button type="button" onClick={(e) => { e.preventDefault(); open(); }} className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-terracotta-200 bg-terracotta-50/50 p-6 transition hover:bg-terracotta-50">
                    <span className="rounded-full bg-terracotta-100 px-4 py-2 text-sm font-semibold text-terracotta-700 shadow-sm">📁 Kies bestand</span>
                    <span className="text-xs text-terracotta-600/70">Contract PDF of foto (auto-save)</span>
                  </button>
                  <button type="button" onClick={(e) => { e.preventDefault(); openCamera(); }} className="w-full rounded-xl border border-terracotta-200 bg-white px-4 py-3 text-sm font-semibold text-terracotta-700 transition hover:bg-terracotta-50">
                    📷 Open camera
                  </button>
                </div>
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
            options={{ folder: 'cattery_gallery', accept: 'image/*,video/*', multiple: true }}
            onSuccess={(res) => handleUploadSuccess('Galerij', null, res)}
          >
            {({ open, openCamera }) => (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={(e) => { e.preventDefault(); open(); }} className="flex-1 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brass-300 bg-brass-50/50 p-6 transition hover:bg-brass-50">
                  <span className="rounded-full bg-brass-200 px-4 py-2 text-sm font-semibold text-brass-800 shadow-sm">📁 Kies bestand(en)</span>
                  <span className="text-xs text-brass-700/70">Foto&apos;s en video&apos;s (auto-save)</span>
                </button>
                <button type="button" onClick={(e) => { e.preventDefault(); openCamera(); }} className="sm:w-48 rounded-xl border border-brass-300 bg-white px-4 py-6 text-sm font-semibold text-brass-800 transition hover:bg-brass-50">
                  📷 Open camera
                </button>
              </div>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-forest-900">Documenten & Media Archief</h2>
          {selectedItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
               <span className="text-xs font-semibold text-forest-700 mr-2">{selectedItems.length} geselecteerd</span>
               <Btn variant="ghost" className="text-xs py-1.5 border-forest-900/20" onClick={handleDownloadSelectedFiles}>Download Losse Bestanden</Btn>
               <Btn variant="brass" className="text-xs py-1.5" onClick={handleDownloadSelectedPDF}>Download PDF Album</Btn>
            </div>
          )}
        </div>
        
        <Card>
          <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Bekijk bestanden van welke kat? Kies eerst het type.</span>
          <div className="mt-1.5 max-w-md"><CatPicker kittens={kittens} value={archiveCat} onChange={setArchiveCat} /></div>
        </Card>

        {!archiveCat ? (
          <p className="rounded-2xl border border-dashed border-forest-900/20 bg-white/60 py-10 text-center text-forest-600">Selecteer hierboven een kitten, kater of poes om de bijbehorende bestanden te zien.</p>
        ) : catUploads.length === 0 ? (
          <p className="text-forest-700">Nog geen documenten of media voor {kittens.find((k) => k.id === archiveCat)?.name || 'deze kat'}.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catUploads.map((doc) => {
              const url = doc.file_url || doc.media_url;
              return (
              <div key={doc.id} className={`flex items-center gap-4 rounded-xl border p-3 shadow-sm transition ${selectedItems.includes(doc.id) ? 'border-brass-400 bg-brass-50/50' : 'border-forest-900/10 bg-white hover:border-forest-900/20'}`}>
                
                <input type="checkbox" checked={selectedItems.includes(doc.id)} onChange={() => toggleSelect(doc.id)} className="ml-1 rounded border-forest-900/20 text-brass-600 focus:ring-brass-400" />
                
                <div className="h-12 w-12 shrink-0 rounded-lg bg-forest-50 overflow-hidden relative border border-forest-900/5 cursor-pointer" onClick={() => toggleSelect(doc.id)}>
                  {url.endsWith('.pdf') ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-red-500 bg-red-50">PDF</div>
                  ) : (
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-forest-900" title={`${doc.label}: ${doc.kittenName}`}>{doc.label}: {doc.kittenName}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <a href={url} target="_blank" className="text-xs text-forest-500 hover:underline truncate">Bekijk</a>
                    <button onClick={() => forceDownload(url, doc.name || 'download')} className="text-xs font-semibold text-brass-600 hover:underline">Download</button>
                  </div>
                </div>
                <button 
                  onClick={() => { if(confirm('Weet je zeker dat je dit bestand wilt verwijderen?')) { doc.isDoc ? deleteDocument(doc.id) : deleteMedia(doc.id) } }} 
                  className="shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                  title="Verwijder"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            )})}
          </div>
        )}
      </div>
    </>
  );
}
