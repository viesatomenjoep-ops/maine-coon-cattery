'use client';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Select, Btn } from '@/components/admin';
import { ImageSlot } from '@/components/ui';
import { CldUploadWidget } from 'next-cloudinary';

export default function MediaPage() {
  const { kittens } = useStore();
  const [target, setTarget] = useState(kittens[0]?.id || '');
  const [uploadedMedia, setUploadedMedia] = useState([]);

  let hasCloudinary = false;
  try { hasCloudinary = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME); } catch (e) {}

  return (
    <>
      <PageHead label="Media" title="Media Sync" />
      <p className="-mt-4 mb-8 max-w-2xl text-sm text-forest-700/70">
        Voorbereiding voor de naadloze koppeling met Cloudinary. Upload (later AI-gegenereerde)
        afbeeldingen en koppel ze direct aan een advertentie of nieuwsbericht.
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <h2 className="mb-4 font-display text-xl text-forest-900">Uploaden & koppelen</h2>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Koppelen aan kitten</span>
            <Select value={target} onChange={(e)=>setTarget(e.target.value)} className="mt-1.5">
              {kittens.map(k=><option key={k.id} value={k.id}>{k.name} · {k.color}</option>)}
            </Select>
          </label>

          <div className="mt-5 grid place-items-center rounded-2xl border-2 border-dashed border-forest-900/15 bg-white/60 p-10 text-center">
            <ImageSlot label="Sleep bestand" ratio="aspect-square w-24" className="rounded-xl" />
            <p className="mt-4 text-sm text-forest-700">Selecteer of sleep afbeeldingen</p>
            <p className="text-xs text-forest-600/60">maximaal 10 per keer</p>
            
            {hasCloudinary ? (
              <CldUploadWidget 
                signatureEndpoint="/api/sign-cloudinary-params"
                onSuccess={(result) => {
                  if (result.event === 'success') {
                    setUploadedMedia(prev => [result.info.secure_url, ...prev]);
                  }
                }}
                options={{
                  sources: ['local', 'url', 'camera'],
                  multiple: true,
                  folder: `cattery_media/${target || 'general'}`,
                  clientAllowedFormats: ['images', 'video']
                }}
              >
                {({ open }) => (
                  <button 
                    type="button"
                    className="mt-4 rounded-xl border border-forest-900/10 bg-forest-900/5 px-5 py-2.5 text-sm font-semibold text-forest-900 transition hover:bg-forest-900/10"
                    onClick={(e) => { e.preventDefault(); open(); }}
                  >
                    Bladeren / Open Camera
                  </button>
                )}
              </CldUploadWidget>
            ) : (
              <p className="mt-4 text-xs font-bold text-red-600 bg-red-50 p-2 rounded">
                Cloudinary is niet gekoppeld op Vercel (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ontbreekt).
              </p>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-dashed border-brass-300 bg-brass-50 p-4 text-xs text-brass-900">
            <p className="font-semibold uppercase tracking-wide">Integratie-status</p>
            <p className="mt-1">Cloudinary upload-widget wordt gekoppeld bij migratie naar de Viesa Automations Stack. URLs worden opgeslagen in het <code className="rounded bg-white/60 px-1">media</code> veld per record.</p>
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-xl text-forest-900">Mediabibliotheek (preview)</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {uploadedMedia.map((url, i) => (
              <img key={i} src={url} alt="Geüpload" className="aspect-square w-full rounded-xl object-cover" />
            ))}
            {['Hero', 'Castor profiel', 'Pollux spelen', 'Lyra vacht', 'Nest 4wk', 'Vega'].map((l) => (
              <ImageSlot key={l} label={l} ratio="aspect-square" className="rounded-xl" />
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
