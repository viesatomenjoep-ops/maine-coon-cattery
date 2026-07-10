'use client';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Select, Input } from '@/components/admin';
import FilePicker from '@/components/admin/FilePicker';

export const DOC_TYPES = [
  { value: 'paspoort', label: 'Paspoort' },
  { value: 'chip', label: 'Chip / Identificatie' },
  { value: 'dierenarts', label: 'Dierenarts' },
  { value: 'vaccinatie', label: 'Vaccinatie' },
  { value: 'hcm_echo', label: 'HCM Echo' },
  { value: 'pkd', label: 'PKD' },
  { value: 'fiv_felv', label: 'FIV/FeLV' },
  { value: 'stamboom', label: 'Stamboom' },
  { value: 'stamboom_overig', label: 'Stamboom - Overig' },
  { value: 'groei', label: 'Groei / Weegcurve' },
  { value: 'verkoop', label: 'Verkoop' },
  { value: 'contract', label: 'Contract' },
  { value: 'overig', label: 'Overig' },
];

// De zes vaste categorieën van het dossier (in weergavevolgorde).
export const DOC_SECTIONS = [
  { id: 'paspoort', label: 'Paspoort & Beschrijving' },
  { id: 'chip', label: 'Identificatie & Chip' },
  { id: 'medisch', label: 'Inentingen & Medisch' },
  { id: 'stamboom', label: 'Stamboom & Afstamming' },
  { id: 'gewicht', label: 'Groei & Weegcurves' },
  { id: 'verkoop', label: 'Portaal & Verkoop' },
];

// Koppel elk documenttype aan één van de dossier-secties.
export const DOC_TYPE_SECTION = {
  paspoort: 'paspoort',
  chip: 'chip',
  dierenarts: 'medisch',
  vaccinatie: 'medisch',
  hcm_echo: 'medisch',
  pkd: 'medisch',
  fiv_felv: 'medisch',
  stamboom: 'stamboom',
  stamboom_overig: 'stamboom',
  groei: 'gewicht',
  verkoop: 'verkoop',
  contract: 'verkoop',
  overig: 'overig',
};

export const sectionForDocType = (type) => DOC_TYPE_SECTION[type] || 'overig';

function isImage(doc) {
  if (doc.mime_type) return doc.mime_type.startsWith('image');
  return /\.(jpe?g|png|gif|webp|avif)$/i.test(doc.file_url || '');
}

// Download een document (werkt ook voor Cloudinary-bestanden).
async function downloadDoc(url, filename) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = filename || `document-${Date.now()}`;
    a.click();
  } catch {
    window.open(url, '_blank');
  }
}

export function DocumentList({ documents = [], onDelete }) {
  if (!documents.length) {
    return <p className="text-sm text-forest-600 italic">Nog geen documenten geüpload.</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {documents.map((d) => {
        const label = DOC_TYPES.find((t) => t.value === d.document_type)?.label || d.document_type || 'Document';
        return (
          <li key={d.id} className="flex items-center gap-3 rounded-xl border border-forest-900/10 bg-white p-3">
            {isImage(d) ? (
              <a href={d.file_url} target="_blank" rel="noreferrer" className="shrink-0">
                <img src={d.file_url} alt={d.title || label} className="h-14 w-14 rounded-lg object-cover border border-forest-900/10" />
              </a>
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-forest-900/10 bg-forest-50 text-xl">📄</div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-forest-900">{d.title || label}</p>
              <p className="text-xs uppercase tracking-wide text-brass-600">{label}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <a href={d.file_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">Bekijk →</a>
              <button onClick={() => downloadDoc(d.file_url, d.title || label)} className="text-xs font-semibold text-brass-600 hover:text-brass-800">⬇ Download</button>
              {onDelete && (
                <button onClick={() => onDelete(d.id)} className="text-xs text-red-500 hover:text-red-700 underline">Verwijder</button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function DocumentUploader({ catId, kittenId, litterId, folder = 'cattery_documents', defaultType = 'overig', types, onUploaded }) {
  const { addDocumentFull } = useStore();
  const [docType, setDocType] = useState(defaultType);
  const [customType, setCustomType] = useState('');
  const options = types && types.length ? DOC_TYPES.filter((t) => types.includes(t.value)) : DOC_TYPES;
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const targetCatId = catId || kittenId || null;
  // Bij "eigen sectie" gebruiken we de zelf ingetypte naam als documenttype.
  const isCustom = docType === '__new__';
  const effectiveType = isCustom ? customType.trim() : docType;

  const handleFile = async (file) => {
    if (!file) return;
    if (isCustom && !effectiveType) {
      alert('Vul eerst een naam in voor je eigen sectie.');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', folder);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload mislukt');
      const result = await addDocumentFull({
        cat_id: targetCatId,
        litter_id: litterId || null,
        document_type: effectiveType || 'overig',
        title: title || file.name,
        file_url: data.url,
        cloudinary_public_id: data.public_id,
        mime_type: data.mime_type,
      });
      if (result?.error) throw new Error(result.error.message || 'Opslaan in database mislukt');
      setTitle('');
      if (onUploaded) onUploaded(result.data);
    } catch (err) {
      console.error(err);
      alert('Uploaden mislukt: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="block sm:w-48">
        <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Type / sectie</span>
        <div className="mt-1.5">
          <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
            {options.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            <option value="__new__">➕ Eigen sectie…</option>
          </Select>
        </div>
        {isCustom && (
          <div className="mt-2">
            <Input
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="Naam eigen sectie, bijv. Verzekering"
              autoFocus
            />
          </div>
        )}
      </label>
      <label className="block flex-1">
        <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Titel (optioneel)</span>
        <div className="mt-1.5">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bijv. HCM echo 2026" />
        </div>
      </label>
      <FilePicker
        accept="image/*,application/pdf"
        disabled={uploading}
        onFileReady={handleFile}
        className="!gap-3 sm:!gap-4"
        uploadLabel={uploading ? 'Uploaden…' : '+ Document'}
        cameraLabel="Open camera"
        uploadClassName={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-xl bg-brass-400 px-5 py-2.5 text-sm font-medium text-forest-950 transition hover:bg-brass-300 ${uploading ? 'opacity-60' : ''}`}
        cameraClassName={`inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-forest-900/15 bg-white px-5 py-2.5 text-sm font-medium text-forest-800 transition hover:bg-forest-50 ${uploading ? 'opacity-60' : ''}`}
      />
    </div>
  );
}
