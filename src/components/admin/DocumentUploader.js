'use client';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Select, Input } from '@/components/admin';

export const DOC_TYPES = [
  { value: 'stamboom', label: 'Stamboom' },
  { value: 'hcm_echo', label: 'HCM Echo' },
  { value: 'dierenarts', label: 'Dierenarts' },
  { value: 'pkd', label: 'PKD' },
  { value: 'fiv_felv', label: 'FIV/FeLV' },
  { value: 'vaccinatie', label: 'Vaccinatie' },
  { value: 'chip', label: 'Chip' },
  { value: 'overig', label: 'Overig' },
];

function isImage(doc) {
  if (doc.mime_type) return doc.mime_type.startsWith('image');
  return /\.(jpe?g|png|gif|webp|avif)$/i.test(doc.file_url || '');
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
              {!isImage(d) && (
                <a href={d.file_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-700 hover:text-emerald-900">Bekijk →</a>
              )}
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

export default function DocumentUploader({ catId, kittenId, litterId, folder = 'cattery_documents', onUploaded }) {
  const { addDocumentFull } = useStore();
  const [docType, setDocType] = useState('overig');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const targetCatId = catId || kittenId || null;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
        document_type: docType,
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
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="block sm:w-40">
        <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Type</span>
        <div className="mt-1.5">
          <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Select>
        </div>
      </label>
      <label className="block flex-1">
        <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Titel (optioneel)</span>
        <div className="mt-1.5">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bijv. HCM echo 2026" />
        </div>
      </label>
      <label className={`inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-xl bg-brass-400 px-5 py-2.5 text-sm font-medium text-forest-950 transition hover:bg-brass-300 ${uploading ? 'opacity-60' : ''}`}>
        {uploading ? 'Uploaden…' : '+ Document'}
        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFile} disabled={uploading} />
      </label>
    </div>
  );
}
