'use client';
import { DOC_SECTIONS, sectionForDocType, DOC_TYPES } from './DocumentUploader';

function isImageUrl(url = '', mime = '') {
  if (mime) return mime.startsWith('image');
  return /\.(jpe?g|png|gif|webp|avif)$/i.test((url || '').split('?')[0]);
}

const docTypeLabel = (type) => DOC_TYPES.find((t) => t.value === type)?.label || type || 'Document';

function Thumb({ item }) {
  return (
    <div className="group relative w-32 shrink-0">
      <a href={item.url} target="_blank" rel="noreferrer" className="block">
        {item.isImage ? (
          <img
            src={item.url}
            alt={item.label}
            className="aspect-square w-full rounded-xl object-cover border border-forest-900/10 shadow-sm transition group-hover:opacity-90"
          />
        ) : (
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border border-forest-900/10 bg-white shadow-sm transition group-hover:bg-forest-50">
            <span className="text-3xl">📄</span>
            <span className="px-1 text-center text-[10px] font-semibold uppercase tracking-wide text-forest-600">PDF</span>
          </div>
        )}
      </a>
      <p className="mt-1.5 truncate text-center text-[11px] font-medium text-forest-700" title={item.label}>{item.label}</p>
      {item.onDelete && (
        <button
          type="button"
          onClick={item.onDelete}
          title="Verwijderen"
          className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm opacity-0 transition hover:bg-red-50 group-hover:opacity-100"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function MediaGallery({ media = [], documents = [], pedigreeData = {}, onDeleteMedia, onDeleteDocument }) {
  const sections = DOC_SECTIONS.map((s) => ({ ...s, items: [] }));
  const overig = { id: 'overig', label: 'Overige documenten', items: [] };
  const byId = Object.fromEntries([...sections, overig].map((s) => [s.id, s]));

  // Paspoort (enkele afbeelding, opgeslagen in pedigree_data)
  if (pedigreeData?.passport_url) {
    byId.paspoort.items.push({
      key: 'passport',
      url: pedigreeData.passport_url,
      label: 'Paspoort',
      isImage: isImageUrl(pedigreeData.passport_url),
    });
  }

  // Foto's van de kitten (media-tabel)
  (media || []).forEach((m) => {
    byId.paspoort.items.push({
      key: `media-${m.id}`,
      url: m.media_url,
      label: 'Foto kitten',
      isImage: m.media_type ? m.media_type === 'image' : isImageUrl(m.media_url),
      onDelete: onDeleteMedia ? () => onDeleteMedia(m.id) : null,
    });
  });

  // Stamboom afbeelding (opgeslagen in pedigree_data)
  if (pedigreeData?.image_url) {
    byId.stamboom.items.push({
      key: 'pedigree',
      url: pedigreeData.image_url,
      label: 'Stamboom',
      isImage: isImageUrl(pedigreeData.image_url),
    });
  }

  // Documenten (documents-tabel) verdeeld over de secties
  (documents || []).forEach((d) => {
    const secId = sectionForDocType(d.document_type);
    const target = byId[secId] || byId.overig;
    target.items.push({
      key: `doc-${d.id}`,
      url: d.file_url,
      label: d.title || docTypeLabel(d.document_type),
      isImage: isImageUrl(d.file_url, d.mime_type),
      onDelete: onDeleteDocument ? () => onDeleteDocument(d.id) : null,
    });
  });

  const visible = [...sections, ...(overig.items.length ? [overig] : [])];

  return (
    <div className="space-y-4">
      {visible.map((s) => (
        <div key={s.id} className="rounded-2xl border border-forest-900/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h3 className="font-display text-lg text-forest-900">{s.label}</h3>
            <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-semibold text-forest-600">{s.items.length}</span>
          </div>
          {s.items.length ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {s.items.map((item) => <Thumb key={item.key} item={item} />)}
            </div>
          ) : (
            <p className="text-sm italic text-forest-500">Nog niets geüpload in deze categorie.</p>
          )}
        </div>
      ))}
    </div>
  );
}
