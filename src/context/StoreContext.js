'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [news, setNews] = useState([]);
  const [litters, setLitters] = useState([]);
  const [kittens, setKittens] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [media, setMedia] = useState([]);

  // Initiele data fetch
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: nData } = await supabase.from('timeline_updates').select('*').order('created_at', { ascending: false });
        if (nData) setNews(nData);

        const { data: lData } = await supabase.from('litters').select('*');
        if (lData) setLitters(lData);

        const { data: dData } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
        if (dData) setDocuments(dData);

        const { data: mData } = await supabase.from('media').select('*').order('created_at', { ascending: false });
        if (mData) setMedia(mData);

        const { data: vData } = await supabase.from('vaccinations').select('*');

        const { data: kData } = await supabase.from('cats').select('*').order('created_at', { ascending: false });
        if (kData) {
          const kittensWithMed = kData.map(k => {
            const med = vData?.filter(v => v.cat_id === k.id).map(v => ({
              id: v.id,
              type: v.vaccine_name,
              date: v.vaccination_date,
              note: v.veterinarian_info
            })) || [];
            return { ...k, medical: med };
          });
          setKittens(kittensWithMed);
        }
      } catch (err) {
        console.error("Supabase fetch error:", err);
      }
    }
    fetchData();
  }, []);

  // ---- news ----
  const addNews = async (post) => {
    const newPost = { 
      title: post.title, 
      content: post.html || post.body,
      cat_id: post.cat_id || null
    }; // Mapping naar timeline_updates schema
    const { data, error } = await supabase.from('timeline_updates').insert([newPost]).select();
    if (!error && data) setNews(s => [data[0], ...s]);
  };
  const deleteNews = async (id) => {
    await supabase.from('timeline_updates').delete().eq('id', id);
    setNews(s => s.filter(p => p.id !== id));
  };

  // ---- litters ----
  const addLitter = async (litter) => {
    const { data, error } = await supabase.from('litters').insert([{ 
      name: litter.name, 
      date_of_birth: litter.born,
      description: litter.description || null,
      sire_name: litter.sire_name,
      dam_name: litter.dam_name 
    }]).select();
    if (!error && data) setLitters(s => [...s, data[0]]);
  };
  
  const updateLitter = async (id, patch) => {
    setLitters(s => s.map(l => (l.id === id ? { ...l, ...patch } : l)));
    await supabase.from('litters').update(patch).eq('id', id);
  };
  
  const deleteLitter = async (id) => {
    await supabase.from('litters').delete().eq('id', id);
    setLitters(s => s.filter(l => l.id !== id));
  };

  // ---- kittens ----
  const addKitten = async (kit) => {
    const dbKit = {
      litter_id: kit.litter_id,
      name: kit.name || 'Naamloos',
      gender: kit.gender || kit.sex,
      color: kit.color,
      pattern: kit.pattern,
      status: kit.status || 'beschikbaar',
      price_nl: kit.price_nl || kit.priceNL || 0,
      price_be: kit.price_be || kit.priceBE || 0,
      customer_nationality: kit.customer_nationality || 'NL',
      cover_image: kit.cover_image || null,
      published: kit.published || false
    };
    const { data, error } = await supabase.from('cats').insert([dbKit]).select();
    if (!error && data) setKittens(s => [...s, data[0]]);
  };

  const updateKitten = async (id, patch) => {
    // We updaten lokaal direct voor een snelle UI
    setKittens(s => s.map(k => (k.id === id ? { ...k, ...patch } : k)));
    
    // DB Update: we map formData props naar db kolommen indien nodig
    let dbPatch = { ...patch };
    if (patch.priceNL !== undefined) { dbPatch.price_nl = patch.priceNL; delete dbPatch.priceNL; }
    if (patch.priceBE !== undefined) { dbPatch.price_be = patch.priceBE; delete dbPatch.priceBE; }
    if (patch.secretToken !== undefined) delete dbPatch.secretToken; // prevent updating token names wrong
    if (patch.sex !== undefined) { dbPatch.gender = patch.sex; delete dbPatch.sex; }
    
    await supabase.from('cats').update(dbPatch).eq('id', id);
  };

  const deleteKitten = async (id) => {
    await supabase.from('cats').delete().eq('id', id);
    setKittens(s => s.filter(k => k.id !== id));
  };

  // ---- documents ----
  const addDocument = async (doc) => {
    const { data, error } = await supabase.from('documents').insert([{
      cat_id: doc.cat_id || null,
      document_type: doc.category,
      file_url: doc.url,
      notes: doc.name,
      is_private: true
    }]).select();
    if (!error && data) setDocuments(s => [data[0], ...s]);
    return data?.[0];
  };
  const deleteDocument = async (id) => {
    await supabase.from('documents').delete().eq('id', id);
    setDocuments(s => s.filter(d => d.id !== id));
  };

  // ---- media (gallery) ----
  const addMedia = async (med) => {
    const { data, error } = await supabase.from('media').insert([{
      media_url: med.url,
      media_type: 'image',
      is_public: true
    }]).select();
    if (!error && data) setMedia(s => [data[0], ...s]);
    return data?.[0];
  };
  const deleteMedia = async (id) => {
    await supabase.from('media').delete().eq('id', id);
    setMedia(s => s.filter(m => m.id !== id));
  };

  // ---- medical (vaccinations) ----
  const addMedical = async (catId, entry) => {
    const post = {
      cat_id: catId,
      vaccine_name: entry.type,
      vaccination_date: entry.date,
      veterinarian_info: entry.note
    };
    const { data, error } = await supabase.from('vaccinations').insert([post]).select();
    if (!error && data) {
      const dbEntry = { id: data[0].id, ...entry };
      setKittens(s => s.map(k => {
        if (k.id === catId) return { ...k, medical: [...(k.medical || []), dbEntry] };
        return k;
      }));
    }
  };

  const deleteMedical = async (catId, index) => {
    // Vind the record ID
    let recordId;
    setKittens(s => {
      const cat = s.find(k => k.id === catId);
      if (cat && cat.medical[index]) {
        recordId = cat.medical[index].id;
      }
      return s;
    });
    
    if (recordId) {
      await supabase.from('vaccinations').delete().eq('id', recordId);
    }
    
    setKittens(s => s.map(k => {
      if (k.id === catId) {
        const newMed = [...k.medical];
        newMed.splice(index, 1);
        return { ...k, medical: newMed };
      }
      return k;
    }));
  };

  return (
    <StoreContext.Provider value={{
      news, litters, kittens, documents, media,
      addNews, deleteNews, addLitter, updateLitter, deleteLitter,
      addKitten, updateKitten, deleteKitten,
      addDocument, deleteDocument, addMedia, deleteMedia, addMedical, deleteMedical
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
