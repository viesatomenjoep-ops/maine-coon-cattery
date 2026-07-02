'use client';
import { useRef, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Select, Btn } from '@/components/admin';
import { ImageSlot } from '@/components/ui';
// import { CldUploadWidget } from 'next-cloudinary';

const CldUploadWidget = ({ children, onSuccess, options }) => {
  const ref = useRef(null);
  const handleFile = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      if (options?.folder) formData.append('folder', options.folder);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url && onSuccess) onSuccess({ event: 'success', info: { secure_url: data.url } });
    }
    e.target.value = '';
  };
  return (
    <>
      <input type="file" ref={ref} className="hidden" multiple={options?.multiple} accept={options?.clientAllowedFormats?.join(',') || "image/*,video/*"} onChange={handleFile} />
      {children({ open: () => ref.current?.click() })}
    </>
  );
};

const TAGS = ['Aankondiging', 'Update', 'Medisch', 'Show'];

function Toolbar({ exec }) {
  const btn = 'h-9 w-9 rounded-lg border border-forest-900/15 text-forest-800 transition hover:bg-forest-100';
  return (
    <div className="flex flex-wrap gap-2 border-b border-forest-900/10 pb-3">
      <button type="button" onMouseDown={(e)=>{e.preventDefault();exec('bold');}} className={`${btn} font-bold`}>B</button>
      <button type="button" onMouseDown={(e)=>{e.preventDefault();exec('italic');}} className={`${btn} italic`}>I</button>
      <button type="button" onMouseDown={(e)=>{e.preventDefault();exec('underline');}} className={`${btn} underline`}>U</button>
      <button type="button" onMouseDown={(e)=>{e.preventDefault();exec('insertUnorderedList');}} className={btn}>•</button>
      <button type="button" onMouseDown={(e)=>{e.preventDefault();exec('formatBlock','<h3>');}} className={`${btn} w-auto px-3 text-xs`}>Kop</button>
    </div>
  );
}

export default function NewsEditor() {
  const { news, kittens, addNews, updateNews, deleteNews } = useStore();
  const editorRef = useRef(null);
  
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState(TAGS[0]);
  const [catId, setCatId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saved, setSaved] = useState(false);

  const exec = (cmd, val) => document.execCommand(cmd, false, val);

  const handleEdit = (n) => {
    setEditingId(n.id);
    setTitle(n.title || '');
    setTag(n.tag || TAGS[0]);
    setCatId(n.cat_id || '');
    setImageUrl(n.image || '');
    if (editorRef.current) editorRef.current.innerHTML = n.content || '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle(''); setTag(TAGS[0]); setCatId(''); setImageUrl('');
    if (editorRef.current) editorRef.current.innerHTML = '';
  };

  const publish = () => {
    const html = editorRef.current?.innerHTML?.trim();
    const text = editorRef.current?.innerText?.trim();
    if (!title.trim() || !text) return;
    
    if (editingId) {
      updateNews(editingId, { title: title.trim(), body: text, html, tag, image: imageUrl, cat_id: catId || null });
      alert('Nieuwsbericht is succesvol gewijzigd.');
      cancelEdit();
    } else {
      addNews({ title: title.trim(), body: text, html, tag, image: imageUrl, cat_id: catId || null });
      alert('Het nieuwsbericht is succesvol gepubliceerd.');
      cancelEdit();
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <>
      <PageHead label="CMS" title={editingId ? "Nieuwsbericht Wijzigen" : "Nieuws Editor"}>
        {saved && <span className="rounded-full bg-forest-100 px-4 py-2 text-sm text-forest-700">✓ Opgeslagen</span>}
      </PageHead>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
            <Field label="Titel"><Input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Bijv. Nieuw nestje verwacht!" /></Field>
            <Field label="Categorie"><Select value={tag} onChange={(e)=>setTag(e.target.value)}>{TAGS.map(t=><option key={t}>{t}</option>)}</Select></Field>
            <Field label="Koppel aan Kitten">
              <Select value={catId} onChange={(e)=>setCatId(e.target.value)}>
                <option value="">Algemeen (Geen specifieke kat)</option>
                {kittens.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </Select>
            </Field>
          </div>

          <div className="mt-4">
            <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Inhoud</span>
            <div className="mt-1.5 rounded-xl border border-forest-900/15 bg-white p-3">
              <Toolbar exec={exec} />
              <div ref={editorRef} contentEditable suppressContentEditableWarning
                className="prose-sm mt-3 min-h-[160px] w-full text-sm leading-relaxed text-forest-900 outline-none [&_h3]:font-display [&_h3]:text-lg [&_ul]:list-disc [&_ul]:pl-5"
                data-placeholder="Schrijf hier de update…" />
            </div>
          </div>

          <Field label="Afbeelding (Cloudinary)">
            <div className="flex items-center gap-4">
              {imageUrl ? (
                <img src={imageUrl} alt="Geüploade afbeelding" className="h-20 w-28 rounded-xl object-cover" />
              ) : (
                <ImageSlot label="Upload" ratio="aspect-[3/2] w-28" className="rounded-xl" />
              )}
              
              <CldUploadWidget 
                signatureEndpoint="/api/sign-cloudinary-params"
                onSuccess={(result) => {
                  if (result.event === 'success') {
                    setImageUrl(result.info.secure_url);
                  }
                }}
                options={{
                  sources: ['local', 'url', 'camera'],
                  multiple: false,
                  folder: `cattery_media/news`,
                  clientAllowedFormats: ['images']
                }}
              >
                {({ open }) => (
                  <Btn variant="ghost" type="button" onClick={() => open()}>
                    Selecteer bestand
                  </Btn>
                )}
              </CldUploadWidget>
              {imageUrl && (
                <button type="button" onClick={() => setImageUrl('')} className="text-xs text-red-500 hover:underline">
                  Wis foto
                </button>
              )}
            </div>
          </Field>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Btn variant="brass" onClick={publish}>{editingId ? 'Wijzigingen Opslaan' : 'Publiceren'}</Btn>
            {editingId ? (
              <Btn variant="ghost" onClick={cancelEdit}>Annuleren</Btn>
            ) : (
              <Btn variant="ghost" onClick={cancelEdit}>Wissen</Btn>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-xl text-forest-900">Gepubliceerd ({news.length})</h2>
          <div className="space-y-3">
            {news.map((n) => (
              <div key={n.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-forest-900/8 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-forest-900 truncate">{n.title}</p>
                  <p suppressHydrationWarning className="text-xs text-forest-600/70 truncate">
                    {new Date(n.created_at).toLocaleDateString('nl-NL')} · {n.tag || 'Update'}
                    {n.cat_id && ` · Gelinkt aan ${kittens.find(k => k.id === n.cat_id)?.name || 'Kitten'}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => handleEdit(n)} className="text-xs text-brass-700 hover:underline">Wijzig</button>
                  <button onClick={()=>{ if(confirm('Weet je zeker dat je dit nieuwsbericht wilt verwijderen?')) deleteNews(n.id); }} className="text-xs text-red-600 hover:underline">Verwijder</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
