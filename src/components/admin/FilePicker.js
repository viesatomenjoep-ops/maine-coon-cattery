'use client';
import { useRef, useState } from 'react';
import { rotateImageFile, isImageFile } from '@/lib/rotateImage';

const tileBase = 'inline-flex items-center justify-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium text-ink transition disabled:opacity-50';
const btnTile = `${tileBase} border-stone-300/80 bg-gradient-to-b from-stone-100 to-stone-200/90 shadow-sm hover:from-stone-200 hover:to-stone-300/80 hover:border-stone-400/60`;
const btnGhost = `${tileBase} border-forest-900/15 bg-white text-ink hover:bg-stone-50`;
const btnSolid = `${tileBase} !text-white border-emerald-600 bg-emerald-600 hover:bg-emerald-700 hover:border-emerald-700`;

function FolderIcon({ className = 'h-4 w-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l1.5 2h9A1.5 1.5 0 0 1 21 9.5v9A1.5 1.5 0 0 1 19.5 20h-15A1.5 1.5 0 0 1 3 18.5v-11Z" />
    </svg>
  );
}

function CameraIcon({ className = 'h-4 w-4' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8.25h2.25l1.5-2h8.5l1.5 2H20a1.5 1.5 0 0 1 1.5 1.5v8.5A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18V9.75A1.5 1.5 0 0 1 4 8.25Z" />
      <circle cx="12" cy="13.25" r="2.75" />
    </svg>
  );
}

/**
 * Universele bestandskiezer voor het adminportaal:
 * - Kies bestand (galerij / bestanden)
 * - Open camera (iPhone, iPad, Android via capture)
 * - Bij afbeeldingen: roteren vóór opslaan
 */
export default function FilePicker({
  accept = 'image/*',
  multiple = false,
  disabled = false,
  onFileReady,
  uploadLabel = 'Kies bestand',
  cameraLabel = 'Open camera',
  showCamera = true,
  layout = 'buttons',
  className = '',
  uploadClassName = btnTile,
  cameraClassName = btnTile,
  children,
}) {
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const queueRef = useRef([]);
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);

  const canCamera = showCamera && (accept.includes('image') || accept === 'image/*');

  const deliverFile = async (file) => {
    if (!onFileReady) return;
    await onFileReady(file);
  };

  const processQueue = async () => {
    if (modal || queueRef.current.length === 0) return;
    const next = queueRef.current.shift();
    if (isImageFile(next)) {
      setModal({ file: next, previewUrl: URL.createObjectURL(next), rotation: 0 });
      return;
    }
    await deliverFile(next);
    processQueue();
  };

  const enqueueFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    queueRef.current.push(...(multiple ? files : [files[0]]));
    processQueue();
  };

  const handlePick = (e) => {
    enqueueFiles(e.target.files);
    e.target.value = '';
  };

  const closeModal = () => {
    if (modal?.previewUrl) URL.revokeObjectURL(modal.previewUrl);
    setModal(null);
  };

  const confirmImage = async () => {
    if (!modal) return;
    setBusy(true);
    try {
      let file = modal.file;
      if (modal.rotation) file = await rotateImageFile(file, modal.rotation);
      await deliverFile(file);
      URL.revokeObjectURL(modal.previewUrl);
      setModal(null);
      await processQueue();
    } finally {
      setBusy(false);
    }
  };

  const openFile = () => !disabled && fileRef.current?.click();
  const openCamera = () => !disabled && cameraRef.current?.click();

  return (
    <>
      <input ref={fileRef} type="file" className="hidden" accept={accept} multiple={multiple} disabled={disabled} onChange={handlePick} />
      {canCamera && (
        <input ref={cameraRef} type="file" className="hidden" accept="image/*" capture="environment" disabled={disabled} onChange={handlePick} />
      )}

      {children ? (
        children({ openFile, openCamera, canCamera })
      ) : layout === 'buttons' ? (
        <div className={`flex flex-wrap gap-2 ${className}`}>
          <button type="button" onClick={openFile} disabled={disabled} className={uploadClassName}>
            <FolderIcon />
            <span>{uploadLabel}</span>
          </button>
          {canCamera && (
            <button type="button" onClick={openCamera} disabled={disabled} className={cameraClassName}>
              <CameraIcon />
              <span>{cameraLabel}</span>
            </button>
          )}
        </div>
      ) : null}

      {modal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-cream-50 p-5 shadow-lux">
            <h3 className="font-display text-lg text-forest-900">Foto rechtzetten</h3>
            <p className="mt-1 text-sm text-forest-600">Draai de foto indien nodig en sla daarna op.</p>

            <div className="mt-4 flex items-center justify-center overflow-hidden rounded-xl border border-forest-900/10 bg-forest-900/5 p-4">
              <img
                src={modal.previewUrl}
                alt="Voorbeeld"
                className="max-h-64 max-w-full object-contain transition-transform duration-200"
                style={{ transform: `rotate(${modal.rotation}deg)` }}
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => setModal((m) => m && { ...m, rotation: (m.rotation + 270) % 360 })} className={btnGhost} disabled={busy}>
                ↺ Linksom
              </button>
              <button type="button" onClick={() => setModal((m) => m && { ...m, rotation: (m.rotation + 90) % 360 })} className={btnGhost} disabled={busy}>
                ↻ Rechtsom
              </button>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={closeModal} className={btnGhost} disabled={busy}>Annuleren</button>
              <button type="button" onClick={confirmImage} className={btnSolid} disabled={busy}>
                {busy ? 'Opslaan…' : 'Opslaan & uploaden'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Upload direct naar /api/upload — vervangt de oude CldUploadWidget overal in admin. */
export function AdminUpload({ children, onSuccess, options }) {
  const uploadOne = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (options?.folder) formData.append('folder', options.folder);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Upload mislukt');
      if (onSuccess) onSuccess({ event: 'success', info: { secure_url: data.url, name: file.name, ...data } });
    } catch (err) {
      alert('Upload mislukt: ' + (err.message || 'Onbekende fout'));
    }
  };

  const rawFormats = options?.clientAllowedFormats;
  let accept = options?.accept || 'image/*,video/*,application/pdf';
  if (rawFormats?.length) {
    const mapped = rawFormats.map((f) => (f === 'images' ? 'image/*' : f === 'videos' ? 'video/*' : f));
    accept = mapped.join(',');
  }

  return (
    <FilePicker accept={accept} multiple={options?.multiple} onFileReady={uploadOne}>
      {({ openFile, openCamera, canCamera }) => children({ open: openFile, openCamera, canCamera })}
    </FilePicker>
  );
}
