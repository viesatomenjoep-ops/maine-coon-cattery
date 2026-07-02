'use client';
import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Logo, PawMark } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRef } from 'react';

const CustomerUploadWidget = ({ children, onSuccess, folder }) => {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);
  
  const handleFile = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) formData.append('folder', folder);
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url && onSuccess) onSuccess({ secure_url: data.url, name: file.name });
      } catch (err) {
        console.error("Upload failed", err);
      }
    }
    setUploading(false);
    e.target.value = '';
  };
  return (
    <>
      <input type="file" ref={ref} className="hidden" accept="image/*,video/*,application/pdf" onChange={handleFile} />
      {children({ open: () => ref.current?.click(), uploading })}
    </>
  );
};

// Helper component for updates
function TimelineUpdate({ update }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-brass-400 border-[3px] border-cream-50"></div>
      <div className="absolute left-1.5 top-5 -bottom-8 w-px bg-forest-900/10 last:hidden"></div>
      
      <p className="text-xs font-bold uppercase tracking-wide text-brass-600">
        {update.date} <span className="text-forest-600/50 ml-2">({update.tag})</span>
      </p>
      <div className="mt-2 rounded-xl bg-white p-5 shadow-sm border border-forest-900/5">
        <h3 className="font-display text-lg text-forest-900">{update.title}</h3>
        <div className="mt-2 text-sm leading-relaxed text-forest-700 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: update.text }}></div>
      </div>
    </div>
  );
}

export default function CustomerPortal({ params }) {
  const { token } = params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomerData() {
      // 1. Haal de klant op via de unieke token
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('token', token)
        .single();
        
      if (!customerData) {
        setLoading(false);
        return;
      }

      // 2. Haal de kittens en nestjes op die aan deze klant gekoppeld zijn
      const { data: kittensData } = await supabase.from('cats').select('*').eq('customer_id', customerData.id);
      const { data: littersData } = await supabase.from('litters').select('*').eq('customer_id', customerData.id);

      // 3. Haal nieuws/updates, media en medische gegevens op voor deze kittens
      const catIds = (kittensData || []).map(k => k.id);
      
      const { data: weightsData } = await supabase.from('cat_weights').select('*').in('cat_id', catIds.length ? catIds : ['00000000-0000-0000-0000-000000000000']).order('weigh_date', { ascending: true });
      
      const kittensWithWeights = (kittensData || []).map(k => {
        const catWeights = (weightsData || []).filter(w => w.cat_id === k.id).map(w => ({
          date: new Date(w.weigh_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
          grams: w.weight_grams
        }));
        return { ...k, weights: catWeights };
      });

      const { data: allMedia } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      const { data: allDocs } = await supabase.from('documents').select('*').order('created_at', { ascending: false });

      const kittensWithEverything = kittensWithWeights.map(k => {
        const catMedia = allMedia?.filter(m => m.media_url?.includes(k.id)) || [];
        const catDocs = allDocs?.filter(d => d.cat_id === k.id) || [];
        return { ...k, media: catMedia, documents: catDocs };
      });

      const litterIds = (littersData || []).map(l => l.id);

      // Fetch gerelateerd nieuws (timeline_updates heeft hopelijk een cat_id of we halen gewoon alles op en filteren)
      // Omdat we geen litter_id in timeline_updates hebben (alleen cat_id), doen we het via catIds.
      // Als er nieuws is met cat_id in de lijst, tonen we dat.
      const { data: allNews } = await supabase.from('timeline_updates').select('*').order('created_at', { ascending: false });
      
      let customerUpdates = [];
      if (allNews) {
        customerUpdates = allNews
          .filter(n => !n.cat_id || catIds.includes(n.cat_id)) // Toon algemeen nieuws én specifiek kitten nieuws
          .map(n => ({
            id: n.id,
            date: n.created_at ? new Date(n.created_at).toLocaleDateString('nl-NL') : 'Onbekend',
            title: n.title,
            text: n.content,
            tag: n.cat_id ? kittensData.find(k => k.id === n.cat_id)?.name || 'Kitten update' : 'Cattery nieuws'
          }));
      }

      // 4. Bouw het dashboard object op
      setData({
        customer: customerData,
        kittens: kittensWithEverything,
        litters: littersData || [],
        updates: customerUpdates
      });
      setLoading(false);
    }
    
    fetchCustomerData();
  }, [token]);

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-cream-50 text-forest-700">Je unieke portaal wordt geladen...</div>;
  }

  if (!data) {
    return notFound();
  }

  const forceDownload = async (url, filename) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = filename || `cattery-media-${Date.now()}`;
      a.click();
    } catch(e) {
      window.open(url, '_blank');
    }
  };

  const { customer, kittens, litters, updates } = data;

  return (
    <div className="min-h-screen bg-cream-50 pb-20">
      <header className="flex items-center justify-center border-b border-forest-900/10 bg-white py-6">
        <Logo />
      </header>

      <main className="mx-auto max-w-5xl px-6 pt-12">
        <div className="text-center mb-12">
          <PawMark className="mx-auto mb-4 h-8 w-8 text-brass-400" />
          <h1 className="font-display text-4xl text-forest-950">Hallo {customer.name}!</h1>
          <p className="mt-2 text-forest-700">Welkom in jouw persoonlijke Wendy's Dream portaal.</p>
        </div>

        {kittens.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-2xl text-forest-900 mb-6 text-center">Jouw Gekoppelde Kittens</h2>
            <div className={`grid gap-6 ${kittens.length === 1 ? 'max-w-xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
              {kittens.map(k => (
                <div key={k.id} className="overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-soft">
                  {k.cover_image ? (
                    <img src={k.cover_image} alt={k.name} className="h-48 w-full object-cover" />
                  ) : (
                    <div className="h-48 w-full bg-forest-50 flex items-center justify-center">
                      <PawMark className="h-8 w-8 text-forest-200" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-display text-xl text-forest-900">{k.name}</h3>
                    <p className="text-sm text-forest-600">{k.color} · {k.gender}</p>
                    <p className="text-sm text-forest-600 mt-2 font-medium">Status: {k.status}</p>

                    {/* Weights Chart */}
                    {k.weights && k.weights.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-forest-800 mb-4">Groei (Weegcurve)</h4>
                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={k.weights} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                              <XAxis dataKey="date" tick={{fontSize: 10, fill: '#4B5563'}} axisLine={false} tickLine={false} />
                              <YAxis tick={{fontSize: 10, fill: '#4B5563'}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}g`} />
                              <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                              <Line type="monotone" dataKey="grams" stroke="#C4A484" strokeWidth={3} dot={{r: 4, fill: '#C4A484', strokeWidth: 0}} activeDot={{r: 6}} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Pedigree */}
                    {k.pedigree_data && (k.pedigree_data.sire || k.pedigree_data.dam || k.pedigree_data.image_url) && (
                      <div className="mt-6 pt-6 border-t border-forest-900/10">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-forest-800 mb-3">Stamboom & Afstamming</h4>
                        {k.pedigree_data.sire && <p className="text-sm text-forest-700">Vader: <span className="font-medium text-forest-900">{k.pedigree_data.sire}</span></p>}
                        {k.pedigree_data.dam && <p className="text-sm text-forest-700 mt-1">Moeder: <span className="font-medium text-forest-900">{k.pedigree_data.dam}</span></p>}
                        {k.pedigree_data.image_url && (
                          <div className="mt-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-3 rounded-xl border border-forest-900/10 shadow-sm">
                            <img src={k.pedigree_data.image_url} alt="Stamboom" className="h-16 w-16 object-cover rounded-lg border border-forest-900/10 shrink-0" />
                            <div className="flex-1 w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <a href={k.pedigree_data.image_url} target="_blank" rel="noreferrer" className="inline-block text-sm font-semibold text-forest-900 hover:text-brass-600 transition truncate">
                                Stamboom Afbeelding
                              </a>
                              <button onClick={() => forceDownload(k.pedigree_data.image_url, `stamboom-${k.name}.jpg`)} className="inline-flex items-center justify-center gap-1.5 rounded bg-brass-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brass-700 transition shadow-sm w-full sm:w-auto">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Media Gallery */}
                    {k.media && k.media.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-forest-900/10">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-forest-800 mb-4">Gallerij & Foto's</h4>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {k.media.map(m => (
                            <div key={m.id} className="flex flex-col gap-2 rounded-xl bg-white p-2 border border-forest-900/10 shadow-sm">
                              <img src={m.media_url} alt="Kitten foto" className="aspect-square w-full rounded-lg object-cover cursor-pointer hover:opacity-90 transition" onClick={() => window.open(m.media_url, '_blank')} />
                              <button onClick={() => forceDownload(m.media_url, m.name || `foto-${k.name}.jpg`)} className="w-full inline-flex items-center justify-center gap-1.5 rounded bg-forest-50 border border-forest-900/5 px-2 py-2 text-[10px] font-bold text-forest-800 hover:bg-forest-100 hover:text-forest-950 transition uppercase tracking-wider">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Documents */}
                    <div className="mt-6 pt-6 border-t border-forest-900/10">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-forest-800">Documenten (Medisch & Paspoort)</h4>
                        
                        <CustomerUploadWidget 
                          folder={`customer_uploads/${customer.id}`}
                          onSuccess={async (res) => {
                            const { error } = await supabase.from('documents').insert({
                              cat_id: k.id,
                              file_url: res.secure_url,
                              notes: `Geüpload door klant: ${res.name}`,
                              document_type: 'Klant Upload',
                              category: 'Klant'
                            });
                            if (!error) {
                              alert('Bestand succesvol geüpload!');
                              window.location.reload();
                            } else {
                              alert('Er ging iets mis bij het opslaan.');
                            }
                          }}
                        >
                          {({ open, uploading }) => (
                            <button onClick={open} disabled={uploading} className="rounded-xl border border-brass-200 bg-brass-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-brass-700 transition hover:bg-brass-100 shadow-sm disabled:opacity-50">
                              {uploading ? 'Aan het uploaden...' : '+ Bestand Uploaden'}
                            </button>
                          )}
                        </CustomerUploadWidget>
                      </div>
                      
                      {k.documents && k.documents.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {k.documents.map(d => {
                            const isImage = d.file_url?.match(/\.(jpeg|jpg|gif|png)$/i);
                            return (
                              <div key={d.id} className="flex flex-col sm:flex-row items-center gap-4 rounded-xl bg-white p-3 text-sm text-forest-800 border border-forest-900/10 shadow-sm transition">
                                {isImage ? (
                                  <img src={d.file_url} alt="Preview" className="h-16 w-16 shrink-0 rounded-lg object-cover border border-forest-900/10" />
                                ) : (
                                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-forest-50 border border-forest-900/10 text-xl font-bold text-forest-300">📄</div>
                                )}
                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                  <a href={d.file_url} target="_blank" rel="noreferrer" className="block truncate font-semibold text-forest-900 hover:text-brass-600 transition mb-1" title={d.notes || d.name || d.document_type || 'Document'}>
                                    {d.notes || d.name || d.document_type || 'Document'}
                                  </a>
                                  <button onClick={() => forceDownload(d.file_url, d.notes || d.name || 'document')} className="inline-flex items-center justify-center gap-1.5 rounded bg-brass-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brass-700 transition shadow-sm w-full sm:w-auto">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Download
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-forest-600 italic mt-2">Geen documenten beschikbaar.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {litters.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-2xl text-forest-900 mb-6 text-center">Nestjes die je volgt</h2>
            <div className={`grid gap-6 ${litters.length === 1 ? 'max-w-xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
              {litters.map(l => (
                <div key={l.id} className="rounded-2xl border border-forest-900/10 bg-white shadow-soft p-5">
                  <h3 className="font-display text-xl text-forest-900">{l.name}</h3>
                  <p className="text-sm text-forest-600 mt-1">Ouders: {l.sire_name} & {l.dam_name}</p>
                  {l.date_of_birth && <p className="text-sm text-forest-600">Geboren: {new Date(l.date_of_birth).toLocaleDateString('nl-NL')}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="font-display text-2xl text-forest-900 text-center">Jouw Tijdlijn & Updates</h2>
          {updates.length > 0 ? (
            <div className="mt-8 space-y-8 max-w-2xl mx-auto">
              {updates.map((update, i) => <TimelineUpdate key={update.id || i} update={update} />)}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-forest-900/10 bg-white shadow-soft p-8 text-center text-forest-600">
              Er zijn nog geen updates voor jou. We houden je hier op de hoogte zodra er nieuws is!
            </div>
          )}
        </div>

        <div className="mt-16 text-center text-xs text-forest-900/40">
          <p>Deze link is strikt persoonlijk en gekoppeld aan <b>{customer.email || 'je account'}</b>.</p>
        </div>
      </main>
    </div>
  );
}
