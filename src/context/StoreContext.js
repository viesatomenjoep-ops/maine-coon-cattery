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
  const [interests, setInterests] = useState([]);
  const [siteContent, setSiteContent] = useState({});

  // Multi-tenant (fase A): welke cattery hoort bij de ingelogde gebruiker.
  const [tenantId, setTenantId] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [tenants, setTenants] = useState([]);

  // Voeg tenant_id toe aan een insert zodra we een tenant kennen (anders legacy-gedrag).
  const withTid = (obj) => (tenantId ? { ...obj, tenant_id: tenantId } : obj);

  // Initiele data fetch
  useEffect(() => {
    async function fetchData() {
      try {
        // Bepaal eerst de tenant van de ingelogde gebruiker (fase A).
        // Faalt dit (tabellen bestaan nog niet / geen profiel), dan vallen we
        // terug op het oude gedrag: alle data ophalen zonder filter.
        let tid = null;
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: prof } = await supabase.from('profiles').select('tenant_id, is_superadmin').eq('user_id', user.id).single();
            if (prof) {
              tid = prof.tenant_id || null;
              setIsSuperadmin(!!prof.is_superadmin);
              if (prof.is_superadmin) {
                const { data: allTen } = await supabase.from('tenants').select('*').order('created_at', { ascending: true });
                if (allTen) setTenants(allTen);
              }
            }
            if (tid) {
              const { data: ten } = await supabase.from('tenants').select('*').eq('id', tid).single();
              if (ten) setCurrentTenant(ten);
            }
          }
        } catch { /* pre-migratie: geen tenants/profiles → legacy modus */ }
        setTenantId(tid);
        const onTenant = (q) => (tid ? q.eq('tenant_id', tid) : q);

        const { data: nData } = await onTenant(supabase.from('timeline_updates').select('*')).order('created_at', { ascending: false });
        if (nData) setNews(nData);

        const { data: lData } = await onTenant(supabase.from('litters').select('*'));
        if (lData) setLitters(lData);

        const { data: dData } = await onTenant(supabase.from('documents').select('*')).order('created_at', { ascending: false });
        if (dData) setDocuments(dData);

        const { data: mData } = await onTenant(supabase.from('media').select('*')).order('created_at', { ascending: false });
        if (mData) setMedia(mData);

        const { data: vData } = await onTenant(supabase.from('vaccinations').select('*'));
        const { data: wData } = await onTenant(supabase.from('cat_weights').select('*')).order('weigh_date', { ascending: true });
        let noteData = null;
        try {
          const notesRes = await onTenant(supabase.from('cat_notes').select('*')).order('note_date', { ascending: false });
          noteData = notesRes.data;
        } catch (e) { /* cat_notes tabel bestaat mogelijk nog niet */ }

        const { data: kData } = await onTenant(supabase.from('cats').select('*')).order('created_at', { ascending: false });
        if (kData) {
          const kittensWithMed = kData.map(k => {
            const med = vData?.filter(v => v.cat_id === k.id).map(v => ({
              id: v.id,
              type: v.vaccine_name,
              date: v.vaccination_date,
              note: v.veterinarian_info,
              due: v.next_due_date || null,
              completed: v.completed || false
            })) || [];

            const catWeights = wData?.filter(w => w.cat_id === k.id).map(w => ({
              id: w.id,
              date: w.weigh_date,
              grams: w.weight_grams
            })) || [];

            const catNotes = noteData?.filter(n => n.cat_id === k.id).map(n => ({
              id: n.id, date: n.note_date, note: n.note
            })) || [];

            return { ...k, medical: med, weights: catWeights, notes: catNotes };
          });
          setKittens(kittensWithMed);
        }

        const { data: cData } = await onTenant(supabase.from('customers').select('*')).order('created_at', { ascending: false });
        if (cData) setCustomers(cData);

        const { data: iData } = await onTenant(supabase.from('kitten_interests').select('*')).order('created_at', { ascending: false });
        if (iData) setInterests(iData);

        // Site-content per tenant: ingelogd → eigen cattery; anoniem (homepage /)
        // → de eerste/hoofd-cattery.
        let scQ = supabase.from('site_content').select('*').eq('key', 'homepage_nl');
        if (tid) scQ = scQ.eq('tenant_id', tid);
        const { data: sData } = await scQ.order('created_at', { ascending: true }).limit(1).maybeSingle();
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
    const { data, error } = await supabase.from('timeline_updates').insert([withTid(newPost)]).select();
    if (!error && data) { setNews(s => [data[0], ...s]); return { data: data[0] }; }
    console.error("Error adding news:", error);
    return { error };
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
      return { success: true };
    }
    console.error("Error updating news:", error);
    return { error };
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
    const { data, error } = await supabase.from('litters').insert([withTid({
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
    })]).select();
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
    const { data, error } = await supabase.from('cats').insert([withTid(dbKit)]).select();
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
    if (patch.ad_settings !== undefined) dbPatch.ad_settings = patch.ad_settings;
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
    const { data, error } = await supabase.from('cats').insert([withTid(mapBreedingCat(cat))]).select();
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
    const { data, error } = await supabase.from('documents').insert([withTid({
      cat_id: doc.cat_id || null,
      litter_id: doc.litter_id || null,
      document_type: doc.document_type || doc.doc_type || 'overig',
      title: doc.title || null,
      file_url: doc.file_url || doc.url,
      cloudinary_public_id: doc.cloudinary_public_id || null,
      mime_type: doc.mime_type || null,
      notes: doc.notes || null,
      is_private: doc.is_private ?? true
    })]).select();
    if (!error && data) {
      setDocuments(s => [data[0], ...s]);
      return { data: data[0] };
    }
    console.error("Error adding document:", error);
    return { error };
  };

  // ---- customers ----
  const addCustomer = async (customer) => {
    const { data, error } = await supabase.from('customers').insert([withTid({
      name: customer.name,
      address: customer.address || null,
      email: customer.email || null,
      whatsapp_number: customer.whatsapp_number || null,
    })]).select();
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
    const row = withTid({ key: 'homepage_nl', content: newContent });
    // Per-tenant opslaan (uniek op tenant_id + key). Fallback naar de oude
    // sleutel als de nieuwe index nog niet is toegepast.
    let { error } = await supabase.from('site_content').upsert(row, { onConflict: 'tenant_id,key' });
    if (error) {
      await supabase.from('site_content').upsert(row, { onConflict: 'key' });
    }
  };

  // ---- documents ----
  const addDocument = async (doc) => {
    const { data, error } = await supabase.from('documents').insert([withTid({
      cat_id: doc.cat_id || null,
      document_type: doc.category,
      file_url: doc.url,
      notes: doc.name,
      is_private: true
    })]).select();
    if (!error && data) setDocuments(s => [data[0], ...s]);
    return data?.[0];
  };
  const deleteDocument = async (id) => {
    await supabase.from('documents').delete().eq('id', id);
    setDocuments(s => s.filter(d => d.id !== id));
  };

  // ---- media (gallery) ----
  const addMedia = async (med) => {
    const { data, error } = await supabase.from('media').insert([withTid({
      cat_id: med.cat_id || null,
      litter_id: med.litter_id || null,
      media_url: med.url,
      media_type: med.media_type || 'image',
      is_public: med.is_public ?? true
    })]).select();
    if (!error && data) setMedia(s => [data[0], ...s]);
    return data?.[0];
  };
  const deleteMedia = async (id) => {
    await supabase.from('media').delete().eq('id', id);
    setMedia(s => s.filter(m => m.id !== id));
  };
  // Publicatie-status van bestanden bijwerken (voor de advertentie-vinkjes).
  const updateDocument = async (id, patch) => {
    const { error } = await supabase.from('documents').update(patch).eq('id', id);
    if (!error) setDocuments(s => s.map(d => (d.id === id ? { ...d, ...patch } : d)));
    return { error };
  };
  const updateMedia = async (id, patch) => {
    const { error } = await supabase.from('media').update(patch).eq('id', id);
    if (!error) setMedia(s => s.map(m => (m.id === id ? { ...m, ...patch } : m)));
    return { error };
  };

  // ---- medical (vaccinations) ----
  const addMedical = async (catId, entry) => {
    const post = {
      cat_id: catId,
      vaccine_name: entry.type,
      vaccination_date: entry.date || null,
      veterinarian_info: entry.note,
      next_due_date: entry.due || null
    };
    let { data, error } = await supabase.from('vaccinations').insert([withTid(post)]).select();
    // Veilige fallback als de kolom next_due_date nog niet bestaat in de database.
    if (error && /next_due_date/.test(error.message || '')) {
      const { next_due_date, ...legacy } = post;
      ({ data, error } = await supabase.from('vaccinations').insert([withTid(legacy)]).select());
    }
    if (!error && data) {
      const dbEntry = { id: data[0].id, ...entry, due: entry.due || null };
      setKittens(s => s.map(k => {
        if (k.id === catId) return { ...k, medical: [...(k.medical || []), dbEntry] };
        return k;
      }));
      return { success: true };
    }
    console.error('Error adding medical:', error);
    return { error };
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

  // Een behandeling bijwerken (bv. afvinken als voltooid). Werkt op record-id.
  const updateMedical = async (catId, medId, patch) => {
    const dbPatch = {};
    if (patch.completed !== undefined) dbPatch.completed = patch.completed;
    if (patch.due !== undefined) dbPatch.next_due_date = patch.due || null;
    if (patch.date !== undefined) dbPatch.vaccination_date = patch.date || null;
    if (patch.note !== undefined) dbPatch.veterinarian_info = patch.note;
    if (patch.type !== undefined) dbPatch.vaccine_name = patch.type;
    const { error } = await supabase.from('vaccinations').update(dbPatch).eq('id', medId);
    if (!error) {
      setKittens(s => s.map(k => (k.id === catId
        ? { ...k, medical: (k.medical || []).map(m => (m.id === medId ? { ...m, ...patch } : m)) }
        : k)));
    }
    return { error };
  };

  // ---- weights ----
  const addWeight = async (catId, date, grams) => {
    const { data, error } = await supabase.from('cat_weights').insert([withTid({
      cat_id: catId,
      weigh_date: date,
      weight_grams: parseInt(grams, 10)
    })]).select();
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

  // ---- algemene notities (interne admin-notities per kat) ----
  const addNote = async (catId, { date, note }) => {
    const { data, error } = await supabase.from('cat_notes').insert([withTid({
      cat_id: catId, note_date: date || null, note: note || ''
    })]).select();
    if (error) { console.error('Error adding note:', error); return { error }; }
    const dbEntry = { id: data[0].id, date: data[0].note_date, note: data[0].note };
    setKittens(s => s.map(k => (k.id === catId
      ? { ...k, notes: [dbEntry, ...(k.notes || [])] }
      : k)));
    return { data: dbEntry };
  };

  const deleteNote = async (catId, noteId) => {
    await supabase.from('cat_notes').delete().eq('id', noteId);
    setKittens(s => s.map(k => (k.id === catId
      ? { ...k, notes: (k.notes || []).filter(n => n.id !== noteId) }
      : k)));
  };

  // ---- interesse-aanvragen (leads vanaf de publieke advertentielink) ----
  const updateInterest = async (id, patch) => {
    const { error } = await supabase.from('kitten_interests').update(patch).eq('id', id);
    if (!error) setInterests(s => s.map(i => (i.id === id ? { ...i, ...patch } : i)));
    return { error };
  };
  const deleteInterest = async (id) => {
    await supabase.from('kitten_interests').delete().eq('id', id);
    setInterests(s => s.filter(i => i.id !== id));
  };

  // ---- tenants (multi-tenant beheer, alleen superadmin) ----
  // Nieuwe cattery + eigenaar-login aanmaken gaat via een beveiligde server-route
  // (service role), zodat we een echte auth-gebruiker kunnen aanmaken.
  const createCattery = async ({ catteryName, ownerName, ownerEmail, ownerPassword }) => {
    const res = await fetch('/api/admin/create-cattery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ catteryName, ownerName, ownerEmail, ownerPassword }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: data.error || 'Aanmaken mislukt.' };
    if (data.tenant) setTenants((s) => [...s, data.tenant]);
    return { data };
  };

  const breedingCats = kittens.filter(k => k.is_own_breeding_cat);

  return (
    <StoreContext.Provider value={{
      news, litters, kittens, breedingCats, documents, media, customers, interests, siteContent,
      updateInterest, deleteInterest,
      currentTenant, isSuperadmin, tenants, createCattery,
      addNews, deleteNews, addLitter, updateLitter, deleteLitter,
      addKitten, updateKitten, deleteKitten,
      addBreedingCat, updateBreedingCat,
      addDocument, addDocumentFull, deleteDocument, updateDocument, addMedia, deleteMedia, updateMedia, addMedical, deleteMedical, updateMedical,
      addWeight, deleteWeight, addNote, deleteNote,
      addCustomer, updateCustomer, deleteCustomer,
      saveSiteContent
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
