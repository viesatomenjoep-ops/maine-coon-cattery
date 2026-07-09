'use client';
import { Btn } from '@/components/admin';
import FilePicker from '@/components/admin/FilePicker';

export default function MediaUpload({ catId, onUploadSuccess }) {
  const uploadOne = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', `cattery_media/${catId || 'general'}`);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.url && onUploadSuccess) onUploadSuccess(data.url);
  };

  return (
    <div className="rounded-xl border border-dashed border-forest-900/20 bg-forest-900/5 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
        <svg className="h-6 w-6 text-brass-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>

      <h3 className="font-display text-lg text-forest-900">Media Uploaden</h3>
      <p className="mt-1 text-sm text-forest-600">Voeg foto&apos;s of video&apos;s toe vanaf je apparaat</p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <FilePicker
          accept="image/*,video/*"
          multiple
          onFileReady={uploadOne}
          uploadLabel="Kies bestand(en)"
          cameraLabel="Open camera"
        />
      </div>

      <p className="mt-4 text-xs text-forest-500">
        Tip: bij foto&apos;s kun je ze eerst rechtzetten voordat ze worden opgeslagen.
      </p>
    </div>
  );
}
