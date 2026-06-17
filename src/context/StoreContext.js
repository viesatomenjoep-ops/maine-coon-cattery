'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { parents } from '@/data/mock'; // We houden de ouders nog in de mock voor deze prototype fase

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [news, setNews] = useState([]);
  const [litters, setLitters] = useState([]);
  const [kittens, setKittens] = useState([]);

  // Initiele data fetch
  useEffect(() => {
    async function fetchData() {
      try {
        const { data: nData } = await supabase.from('timeline_updates').select('*').order('created_at', { ascending: false });
        if (nData) setNews(nData);

        const { data: lData } = await supabase.from('litters').select('*');
        if (lData) setLitters(lData);

        const { data: kData } = await supabase.from('cats').select('*').order('created_at', { ascending: false });
        if (kData) setKittens(kData);
      } catch (err) {
        console.error("Supabase fetch error:", err);
      }
    }
    fetchData();
  }, []);

  // ---- news ----
  const addNews = async (post) => {
    const newPost = { title: post.title, content: post.html || post.body }; // Mapping naar timeline_updates schema
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
    if (patch.priceNL !== undefined) dbPatch.price_nl = patch.priceNL;
    if (patch.priceBE !== undefined) dbPatch.price_be = patch.priceBE;
    if (patch.secretToken !== undefined) delete dbPatch.secretToken; // prevent updating token names wrong
    if (patch.sex !== undefined) { dbPatch.gender = patch.sex; delete dbPatch.sex; }
    
    await supabase.from('cats').update(dbPatch).eq('id', id);
  };

  const deleteKitten = async (id) => {
    await supabase.from('cats').delete().eq('id', id);
    setKittens(s => s.filter(k => k.id !== id));
  };

  return (
    <StoreContext.Provider value={{
      news, litters, kittens, parents,
      addNews, deleteNews, addLitter, updateLitter, deleteLitter,
      addKitten, updateKitten, deleteKitten,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
