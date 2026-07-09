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
  const [customers, setCustomers] = useState([]);
  const [siteContent, setSiteContent] = useState({});

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
        const { data: wData } = await supabase.from('cat_weights').select('*').order('weigh_date', { ascending: true });

        const { data: kData } = await supabase.from('cats').select('*').order('created_at', { ascending: false });
        if (kData) {
          const kittensWithMed = kData.map(k => {
            const med = vData?.filter(v => v.cat_id === k.id).map(v => ({
              id: v.id,
              type: v.vaccine_name,
              date: v.vaccination_date,
              note: v.veterinarian_info
            })) || [];
            
            const catWeights = wData?.filter(w => w.cat_id === k.id).map(w => ({
              id: w.id,
              date: w.weigh_date,
              grams: w.weight_grams
            })) || [];
            
            return { ...k, medical: med, weights: catWeights };
          });
          setKittens(kittensWithMed);
        }

        const { data: cData } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (cData) setCustomers(cData);

        const { data: sData, error: sErr } = await supabase.from('site_content').select('*').eq('key', 'homepage_nl').single();
        if (sData?.content) setSiteContent(sData.content);
      } catch (err) {
        console.error("Supabase fetch error:", err);
      }
    }
    fetchData();
  }, []);

  // ---- news ----
  const addNews = async (post) => {
    // We map frontend props to db columns
    const newPost = {
      title: post.title,
      content: post.html || post.body, // timeline_updates usually stores HTML if we use a WYSIWYG
      cat_id: post.cat_id,
      // tags are not in timeline_updates, but let's assume content/title is main
    };
    const { data, error } = await supabase.from('timeline_updates').insert([newPost]).select();
    if (!error && data) setNews(s => [data[0], ...s]);
  };

  const updateNews = async (id, post) => {
    const patch = {
      title: post.title,
      content: post.html || post.body,
      cat_id: post.cat_id
    };
    const { error } = await supabase.from('timeline_updates').update(patch).eq('id', id);
    if (!error) {
      setNews(s => s.map(n => n.id === id ? { ...n, ...patch } : n));
    } else {
      console.error("Error updating news:", error);
      alert("Fout bij wijzigen van nieuwsbericht.");
    }
  };

  const deleteNews = async (id) => {
    try {
      const { error } = await supabase.from('timeline_updates').delete().eq('id', id);
      if (error) {
        console.error("Error deleting news:", error);
        alert("Fout bij verwijderen. Mogelijk geen permissie.");
      } else {
        setNews(s => s.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Netwerkfout bij verwijderen.");
    }
  };

  const addLitter = async (litter) => {
    const { data, error } = await supabase.from('litters').insert([{ 
      name: litter.name, 
      date_of_birth: litter.born || null,
      description: litter.description || null,
      sire_name: litter.sire_name || null,
      dam_name: litter.dam_name || null,
      sire_id: litter.sire_id || null,
      dam_id: litter.dam_id || null,
      breed: litter.breed || 'Maine Coon (MCO)',
      status: litter.status || 'verwacht',
      expected_count: (litter.expected_count === '' || litter.expected_count == null) ? null : Number(litter.expected_count),
      cover_image_url: litter.cover_image_url || null
    }]).select();
    if (!error && data) {
      setLitters(s => [...s, data[0]]);
      return { data: data[0] };
    }
    console.error("Error adding litter:", error);
    return { error };
  };
  
  const updateLitter = async (id, patch) => {
    setLitters(s => s.map(l => (l.id === id ? { ...l, ...patch } : l)));
    await supabase.from('litters').update(patch).eq('id', id);
  };
  
  const deleteLitter = async (id) => {
    await supabase.from('litters').delete().eq('id', id);
    setLitters(s => s.filter(l => l.id !== id));
  };

  const addKitten = async (kit) => {
    const dbKit = {
      litter_id: kit.litter_id || null,
      name: kit.name || 'Naamloos',
      gender: kit.gender || kit.sex,
      color: kit.color,
      pattern: kit.pattern,
      status: kit.status || 'Beschikbaar',
      price_nl: kit.price_nl || kit.priceNL || null,
      price_be: kit.price_be || kit.priceBE || null,
      customer_nationality: kit.customer_nationality || 'NL',
      cover_image: kit.cover_image || null,
      published: kit.published || false,
      date_of_birth: kit.dateOfBirth || kit.date_of_birth || null,
      chip_number: kit.chip_no || kit.chipNumber || kit.chip_number || null,
      registration_no: kit.registration_no || null,
      ems_code: kit.ems_code || null,
      birth_weight_g: (kit.birth_weight_g === '' || kit.birth_weight_g == null) ? null : Number(kit.birth_weight_g),
      reserved_by: kit.reserved_by || null,
      is_own_breeding_cat: false,
      pedigree_data: {
        ...(kit.pedigree_data || {}),
        chipImplantDate: kit.chipImplantDate || '',
        chipLocation: kit.chipLocation || '',
        vetName: kit.vetName || '',
        breed: kit.breed || 'Maine Coon',
        species: kit.species || 'Cat'
      },
      customer_id: kit.customer_id || null
    };
    const { data, error } = await supabase.from('cats').insert([dbKit]).select();
    if (!error && data) {
      setKittens(s => [...s, data[0]]);
      return { data: data[0] };
    }
    console.error("Error adding cat:", error);
    return { error };
  };

  const updateKitten = async (id, patch) => {
    // DB Update: we map formData props naar db kolommen indien nodig
    let dbPatch = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.sex !== undefined) dbPatch.gender = patch.sex;
    if (patch.color !== undefined) dbPatch.color = patch.color;
    if (patch.pattern !== undefined) dbPatch.pattern = patch.pattern;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.priceNL !== undefined) dbPatch.price_nl = patch.priceNL === '' ? null : patch.priceNL;
    if (patch.priceBE !== undefined) dbPatch.price_be = patch.priceBE === '' ? null : patch.priceBE;
    if (patch.customer_nationality !== undefined) dbPatch.customer_nationality = patch.customer_nationality;
    if (patch.cover_image !== undefined) dbPatch.cover_image = patch.cover_image;
    if (patch.published !== undefined) dbPatch.published = patch.published;
    if (patch.dateOfBirth !== undefined) dbPatch.date_of_birth = patch.dateOfBirth === '' ? null : patch.dateOfBirth;
    if (patch.chipNumber !== undefined) dbPatch.chip_number = patch.chipNumber;
    if (patch.chip_no !== undefined) dbPatch.chip_number = patch.chip_no;
    if (patch.ems_code !== undefined) dbPatch.ems_code = patch.ems_code;
    if (patch.registration_no !== undefined) dbPatch.registration_no = patch.registration_no;
    if (patch.birth_weight_g !== undefined) dbPatch.birth_weight_g = (patch.birth_weight_g === '' || patch.birth_weight_g == null) ? null : Number(patch.birth_weight_g);
    if (patch.reserved_by !== undefined) dbPatch.reserved_by = patch.reserved_by;
    if (patch.customer_id !== undefined) dbPatch.customer_id = patch.customer_id === '' ? null : patch.customer_id;
    if (patch.litter_id !== undefined) dbPatch.litter_id = patch.litter_id;
    
    if (patch.pedigree_data !== undefined || patch.chipImplantDate !== undefined || patch.chipLocation !== undefined || patch.vetName !== undefined || patch.breed !== undefined || patch.species !== undefined) {
      // Find current cat to merge pedigree_data
      const currentCat = kittens.find(k => k.id === id) || {};
      dbPatch.pedigree_data = {
        ...(currentCat.pedigree_data || {}),
        ...(patch.pedigree_data || {}),
      };
      if (patch.chipImplantDate !== undefined) dbPatch.pedigree_data.chipImplantDate = patch.chipImplantDate;
      if (patch.chipLocation !== undefined) dbPatch.pedigree_data.chipLocation = patch.chipLocation;
      if (patch.vetName !== undefined) dbPatch.pedigree_data.vetName = patch.vetName;
      if (patch.breed !== undefined) dbPatch.pedigree_data.breed = patch.breed;
      if (patch.species !== undefined) dbPatch.pedigree_data.species = patch.species;
    }
    
    const { error } = await supabase.from('cats').update(dbPatch).eq('id', id);
    if (error) {
      console.error("Error updating cat:", error);
      return { error };
    } else {
      // Pas lokaal aan als succesvol (zowel formulier-props als db-kolommen mergen)
      setKittens(s => s.map(k => (k.id === id ? { ...k, ...patch, ...dbPatch } : k)));
      return { success: true };
    }
  };

  const deleteKitten = async (id) => {
    await supabase.from('cats').delete().eq('id', id);
    setKittens(s => s.filter(k => k.id !== id));
  };

  // ---- fokdieren (breeding cats, opgeslagen in de cats-tabel) ----
  const mapBreedingCat = (cat) => ({
    name: cat.name || 'Naamloos',
    registration_no: cat.registration_no || null,
    gender: cat.gender || null,
    ems_code: cat.ems_code || null,
    color: cat.color || null,
    pattern: cat.pattern || null,
    date_of_birth: cat.date_of_birth || null,
    chip_number: cat.chip_number || null,
    breeder: cat.breeder || null,
    sire_name: cat.sire_name || null,
    dam_name: cat.dam_name || null,
    is_own_breeding_cat: cat.is_own_breeding_cat ?? true,
    pedigree_data: { ...(cat.pedigree_data || {}), breed: cat.breed || 'Maine Coon (MCO)' }
  });

  const addBreedingCat = async (cat) => {
    const { data, error } = await supabase.from('cats').insert([mapBreedingCat(cat)]).select();
    if (!error && data) {
      setKittens(s => [data[0], ...s]);
      return { data: data[0] };
    }
    console.error("Error adding breeding cat:", error);
    return { error };
  };

  const updateBreedingCat = async (id, cat) => {
    const patch = mapBreedingCat(cat);
    const { error } = await supabase.from('cats').update(patch).eq('id', id);
    if (error) {
      console.error("Error updating breeding cat:", error);
      return { error };
    }
    setKittens(s => s.map(k => (k.id === id ? { ...k, ...patch } : k)));
    return { success: true };
  };

  // ---- documenten (rijk: koppeling naar kat/nestje + Cloudinary-metadata) ----
  const addDocumentFull = async (doc) => {
    const { data, error } = await supabase.from('documents').insert([{
      cat_id: doc.cat_id || null,
      litter_id: doc.litter_id || null,
      document_type: doc.document_type || doc.doc_type || 'overig',
      title: doc.title || null,
      file_url: doc.file_url || doc.url,
      cloudinary_public_id: doc.cloudinary_public_id || null,
      mime_type: doc.mime_type || null,
      notes: doc.notes || null,
      is_private: doc.is_private ?? true
    }]).select();
    if (!error && data) {
      setDocuments(s => [data[0], ...s]);
      return { data: data[0] };
    }
    console.error("Error adding document:", error);
    return { error };
  };

  // ---- customers ----
  const addCustomer = async (customer) => {
    const { data, error } = await supabase.from('customers').insert([{
      name: customer.name,
      address: customer.address || null,
      email: customer.email || null,
      whatsapp_number: customer.whatsapp_number || null,
    }]).select();
    if (!error && data) setCustomers(s => [data[0], ...s]);
    return data?.[0];
  };

  const updateCustomer = async (id, patch) => {
    setCustomers(s => s.map(c => (c.id === id ? { ...c, ...patch } : c)));
    await supabase.from('customers').update(patch).eq('id', id);
  };

  const deleteCustomer = async (id) => {
    await supabase.from('customers').delete().eq('id', id);
    setCustomers(s => s.filter(c => c.id !== id));
  };

  // ---- site content ----
  const saveSiteContent = async (newContent) => {
    setSiteContent(newContent);
    await supabase.from('site_content').upsert({ key: 'homepage_nl', content: newContent });
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
      cat_id: med.cat_id || null,
      litter_id: med.litter_id || null,
      media_url: med.url,
      media_type: med.media_type || 'image',
      is_public: med.is_public ?? true
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

  // ---- weights ----
  const addWeight = async (catId, date, grams) => {
    const { data, error } = await supabase.from('cat_weights').insert([{
      cat_id: catId,
      weigh_date: date,
      weight_grams: parseInt(grams, 10)
    }]).select();
    if (!error && data) {
      const dbEntry = { id: data[0].id, date: data[0].weigh_date, grams: data[0].weight_grams };
      setKittens(s => s.map(k => {
        if (k.id === catId) {
          const newWeights = [...(k.weights || []), dbEntry].sort((a, b) => new Date(a.date) - new Date(b.date));
          return { ...k, weights: newWeights };
        }
        return k;
      }));
    }
  };

  const deleteWeight = async (catId, weightId) => {
    await supabase.from('cat_weights').delete().eq('id', weightId);
    setKittens(s => s.map(k => {
      if (k.id === catId) {
        return { ...k, weights: k.weights.filter(w => w.id !== weightId) };
      }
      return k;
    }));
  };

  const breedingCats = kittens.filter(k => k.is_own_breeding_cat);

  return (
    <StoreContext.Provider value={{
      news, litters, kittens, breedingCats, documents, media, customers, siteContent,
      addNews, deleteNews, addLitter, updateLitter, deleteLitter,
      addKitten, updateKitten, deleteKitten,
      addBreedingCat, updateBreedingCat,
      addDocument, addDocumentFull, deleteDocument, addMedia, deleteMedia, addMedical, deleteMedical,
      addWeight, deleteWeight,
      addCustomer, updateCustomer, deleteCustomer,
      saveSiteContent
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
