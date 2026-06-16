'use client';
import { createContext, useContext, useState } from 'react';
import {
  newsPosts as seedNews,
  litters as seedLitters,
  kittens as seedKittens,
  parents,
} from '@/data/mock';

// Session-scoped store so admin edits reflect live across modules in the prototype.
// On migration these setters become Supabase insert/update/delete calls.
const StoreContext = createContext(null);

let idc = 1000;
const nid = (p) => `${p}${++idc}`;

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export function StoreProvider({ children }) {
  const [news, setNews] = useState(seedNews);
  const [litters, setLitters] = useState(seedLitters);
  const [kittens, setKittens] = useState(seedKittens);

  // ---- news ----
  const addNews = (post) =>
    setNews((s) => [{ id: nid('n'), published_at: new Date().toISOString(), author: 'Cattery beheer', cover: null, ...post }, ...s]);
  const deleteNews = (id) => setNews((s) => s.filter((p) => p.id !== id));

  // ---- litters ----
  const addLitter = (litter) =>
    setLitters((s) => [...s, { id: nid('l'), expected: false, ...litter }]);

  // ---- kittens ----
  const addKitten = (kit) =>
    setKittens((s) => [...s, {
      id: nid('k'), published: false, price_nl: 0, price_be: 0, status: 'Beschikbaar',
      weights: [], medical: [], chip: '', cover_image: null,
      customer_nationality: 'NL', secret_token: generateId(), ...kit,
    }]);
  const updateKitten = (id, patch) =>
    setKittens((s) => s.map((k) => (k.id === id ? { ...k, ...patch } : k)));
  const deleteKitten = (id) => setKittens((s) => s.filter((k) => k.id !== id));
  const addMedical = (id, entry) =>
    setKittens((s) => s.map((k) => (k.id === id ? { ...k, medical: [...k.medical, entry] } : k)));

  return (
    <StoreContext.Provider value={{
      news, litters, kittens, parents,
      addNews, deleteNews, addLitter,
      addKitten, updateKitten, deleteKitten, addMedical,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
