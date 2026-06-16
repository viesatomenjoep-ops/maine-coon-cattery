'use client';
import { CldUploadWidget } from 'next-cloudinary';
import { Btn } from '@/components/admin';

export default function MediaUpload({ catId, onUploadSuccess }) {
  
  const handleUpload = (result) => {
    if (result.event === 'success') {
      const url = result.info.secure_url;
      // Stuur de geüploade image URL direct terug naar de form (of sla lokaal op)
      if (onUploadSuccess) onUploadSuccess(url);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-forest-900/20 bg-forest-900/5 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
        <svg className="h-6 w-6 text-brass-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      </div>
      <h3 className="font-display text-lg text-forest-900">Media Uploaden</h3>
      <p className="mt-1 text-sm text-forest-600">Voeg foto's of video's toe vanaf je apparaat (max 5)</p>
      
      <div className="mt-6 flex justify-center gap-3">
        {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? (
          <CldUploadWidget 
            signatureEndpoint="/api/sign-cloudinary-params"
            onSuccess={handleUpload}
            options={{
              sources: ['local', 'url', 'camera'],
              multiple: true,
              maxFiles: 5,
              folder: `cattery_media/${catId || 'general'}`,
              clientAllowedFormats: ['images', 'video']
            }}
          >
            {({ open }) => {
              return (
                <Btn type="button" onClick={(e) => { e.preventDefault(); open(); }} variant="solid">
                  Kies Bestand(en)
                </Btn>
              );
            }}
          </CldUploadWidget>
        ) : (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium">
            Cloudinary niet gekoppeld (ENV)
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-forest-500">
        <p>Tip: Klik op de knop om direct op je telefoon de camera/galerij te openen.</p>
      </div>
    </div>
  );
}
