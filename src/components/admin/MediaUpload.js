'use client';
import { useState } from 'react';
import { Btn } from '@/components/admin';

export default function MediaUpload({ catId, onUploadSuccess }) {
  const [isUploading, setIsUploading] = useState(false);

  // Dit is een placeholder. Straks implementeren we next-cloudinary of de Cloudinary Upload Widget.
  const handleMockUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      alert('Mock: Foto/Video succesvol geüpload naar Cloudinary!');
      setIsUploading(false);
      if (onUploadSuccess) onUploadSuccess('https://res.cloudinary.com/demo/image/upload/sample.jpg');
    }, 1500);
  };

  return (
    <div className="rounded-xl border border-dashed border-forest-900/20 bg-forest-900/5 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
        <svg className="h-6 w-6 text-brass-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>
      <h3 className="font-display text-lg text-forest-900">Upload Media naar Cloudinary</h3>
      <p className="mt-1 text-sm text-forest-600">Selecteer een foto of video (max 5 per kitten)</p>
      
      <div className="mt-6 flex justify-center gap-3">
        <Btn type="button" onClick={handleMockUpload} disabled={isUploading} variant={isUploading ? 'ghost' : 'solid'}>
          {isUploading ? 'Bezig met uploaden...' : 'Kies Bestand'}
        </Btn>
      </div>

      <div className="mt-4 text-xs text-forest-500">
        <p>Tip: Voor lange video's adviseren we een (verborgen) YouTube/Vimeo link.</p>
      </div>
    </div>
  );
}
