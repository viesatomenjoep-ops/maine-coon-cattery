'use client';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Input, Select, Btn } from '@/components/admin';
import { StatusPill, ImageSlot } from '@/components/ui';
import { AdminUpload } from '@/components/admin/FilePicker';

const CldUploadWidget = AdminUpload;

const STATUSES = ['Beschikbaar', 'Gereserveerd', 'Verkocht'];
const eur = (n) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);

import { useState, useEffect } from 'react';
import Link from 'next/link';

const KittenSalesCard = ({ k, updateKitten, handleCopyLink, customers }) => {
  const [localK, setLocalK] = useState(k);
  const [saving, setSaving] = useState(false);

  // Sync with upstream if needed, but don't overwrite if user is typing
  useEffect(() => {
    if (!saving) setLocalK(k);
  }, [k.published, k.cover_image, k.status]);

  const save = async () => {
    setSaving(true);
    await updateKitten(k.id, {
      price_nl: localK.price_nl,
      price_be: localK.price_be,
      customer_nationality: localK.customer_nationality,
      status: localK.status
    });
    setSaving(false);
    alert('Wijzigingen succesvol opgeslagen!');
  };

  const customer = customers?.find(c => c.id === k.customer_id);

  return (
          <Card className="flex flex-col">
            <div className="relative overflow-hidden rounded-xl bg-forest-50 aspect-[4/3] group">
              {k.cover_image ? (
                <img src={k.cover_image} alt="Cover" className="h-full w-full object-cover" />
              ) : (
                <ImageSlot label="Geen afbeelding" ratio="aspect-[4/3]" className="!rounded-xl" />
              )}
              
              <div className="absolute inset-0 bg-ink/40 opacity-0 transition group-hover:opacity-100 flex items-center justify-center gap-2">
                {true ? (
                  <CldUploadWidget 
                    onSuccess={(result) => {
                      if (result.event === 'success') updateKitten(k.id, { cover_image: result.info.secure_url });
                    }}
                    options={{ folder: `cattery_sales/${k.id}`, clientAllowedFormats: ['images'] }}
                  >
                    {({ open, openCamera }) => (
                      <>
                        <button type="button" onClick={(e) => { e.preventDefault(); open(); }} className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-forest-900 shadow hover:bg-white">
                          Upload
                        </button>
                        <button type="button" onClick={(e) => { e.preventDefault(); openCamera(); }} className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-forest-900 shadow hover:bg-white">
                          Camera
                        </button>
                      </>
                    )}
                  </CldUploadWidget>
                ) : (
                  <button type="button" className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-900 shadow" disabled>
                    ENV Ontbreekt
                  </button>
                )}
                {k.cover_image && (
                  <button onClick={() => updateKitten(k.id, { cover_image: null })} className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-500">
                     Wis
                  </button>
                )}
              </div>
              <div className="absolute left-3 top-3 pointer-events-none"><StatusPill status={k.status} /></div>
            </div>
            
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className="font-display text-xl text-forest-900">{k.name}</h3>
              <span className="text-sm text-forest-600/70">{k.sex} · {k.color}</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Prijs NL (€)</span>
                  <Input type="number" value={localK.price_nl || ''} onChange={(e)=>setLocalK({...localK, price_nl:Number(e.target.value)})} className="mt-1" />
                </label>
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Prijs BE (€)</span>
                  <Input type="number" value={localK.price_be || ''} onChange={(e)=>setLocalK({...localK, price_be:Number(e.target.value)})} className="mt-1" />
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Klant Nat.</span>
                  <Select value={localK.customer_nationality || 'NL'} onChange={(e)=>setLocalK({...localK, customer_nationality:e.target.value})} className="mt-1">
                    <option value="NL">Nederland (NL)</option>
                    <option value="BE">België (BE)</option>
                  </Select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Status</span>
                  <Select value={localK.status} onChange={(e)=>setLocalK({...localK, status:e.target.value})} className="mt-1">
                    {STATUSES.map(s=><option key={s}>{s}</option>)}
                  </Select>
                </label>
              </div>
              <Btn variant="brass" className="w-full mt-2" onClick={save}>Opslaan</Btn>
            </div>

            <div className="mt-4 rounded-xl border border-forest-900/10 bg-forest-50 p-3 space-y-3">
               {customer ? (
                 <div>
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-medium uppercase text-forest-700">Link Klantenportaal</span>
                     <button onClick={() => handleCopyLink(customer.token)} className="text-xs font-semibold text-brass-600 hover:underline">Kopieer Link</button>
                   </div>
                   <p className="mt-1 text-[10px] text-forest-600 font-medium">Klant: {customer.name}</p>
                   <p className="mt-1 truncate text-[10px] text-forest-600 font-mono">.../k/{customer.token?.split('-')[0]}...</p>
                 </div>
               ) : (
                 <div className="text-center py-2">
                   <p className="text-xs text-forest-600 mb-2">Dit kitten is nog niet gekoppeld.</p>
                   <Link href={`/admin/customers`}>
                     <Btn variant="ghost" className="text-[10px] py-1 px-2 border-forest-900/20 w-full text-center block">Naar Klantenbestand</Btn>
                   </Link>
                 </div>
               )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-forest-900/8 pt-4">
              <span className="text-sm text-forest-600/70">{k.published ? 'Live in portaal' : 'Niet gepubliceerd'}</span>
              <Btn
                variant={k.published ? 'ghost' : 'brass'}
                onClick={()=>updateKitten(k.id,{published:!k.published})}
              >
                {k.published ? 'Offline halen' : 'Publiceren'}
              </Btn>
            </div>
          </Card>
  );
};

export default function SalesPage() {
  const { kittens, updateKitten, customers } = useStore();

  let hasCloudinary = false;
  try { hasCloudinary = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME); } catch (e) {}

  const handleCopyLink = (token) => {
    navigator.clipboard.writeText(`${window.location.origin}/k/${token}`);
    alert('Klantenlink gekopieerd naar klembord!');
  };

  return (
    <>
      <PageHead label="Verkoop" title="Advertentie & Sales Beheer" />
      <p className="-mt-4 mb-8 max-w-2xl text-sm text-forest-700/70">
        Publiceer kittens als advertentie in de Private Access omgeving, stel de prijs in en
        werk de status bij. Wijzigingen zijn direct zichtbaar voor ingelogde klanten.
      </p>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {kittens.map((k) => (
          <KittenSalesCard key={k.id} k={k} updateKitten={updateKitten} handleCopyLink={handleCopyLink} customers={customers} />
        ))}
      </div>
    </>
  );
}
