'use client';
import { useRef } from 'react';
import { Btn } from '@/components/admin';

export default function MediaUpload({ catId, onUploadSuccess }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      if (onUploadSuccess) onUploadSuccess(url);
    });
    
    e.target.value = ''; // Reset
  };

  return (
    <div className="rounded-xl border border-dashed border-forest-900/20 bg-forest-900/5 p-8 text-center">
      <button 
        type="button" 
        onClick={() => fileInputRef.current?.click()}
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm outline-none hover:bg-forest-50 focus:ring-2 focus:ring-brass-500 transition"
      >
        <svg className="h-6 w-6 text-brass-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </button>
      
      <h3 className="font-display text-lg text-forest-900">Media Uploaden</h3>
      <p className="mt-1 text-sm text-forest-600">Voeg foto's of video's toe vanaf je apparaat (max 5)</p>
      
      <div className="mt-6 flex justify-center gap-3">
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          accept="image/*,video/*"
          className="hidden" 
        />
        <Btn type="button" onClick={() => fileInputRef.current?.click()} variant="solid">
          Kies Bestand(en)
        </Btn>
      </div>

      <div className="mt-4 text-xs text-forest-500">
        <p>Tip: Klik op de knop of het icoon erboven om direct je camera of galerij te openen.</p>
      </div>
    </div>
  );
}
