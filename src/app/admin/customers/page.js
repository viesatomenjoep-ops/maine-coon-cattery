'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Btn } from '@/components/admin';

export default function CustomersPage() {
  const { customers, addCustomer, deleteCustomer } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp_number: '',
    street: '',
    zipcode: '',
    city: '',
    country: 'Nederland'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const addressStr = [
      formData.street, 
      formData.zipcode && formData.city ? `${formData.zipcode} ${formData.city}` : (formData.zipcode || formData.city), 
      formData.country
    ].filter(Boolean).join('\n');
    
    const newCustomer = await addCustomer({
      name: formData.name,
      email: formData.email,
      whatsapp_number: formData.whatsapp_number,
      address: addressStr
    });
    
    if (newCustomer) {
      setShowAdd(false);
      setFormData({ name: '', email: '', whatsapp_number: '', street: '', zipcode: '', city: '', country: 'Nederland' });
      router.push(`/admin/customers/${newCustomer.id}`);
    }
  };

  return (
    <>
      <PageHead 
        title="Klantenbestand" 
        label="Beheer alle klanten en toewijzingen"
      >
        <Btn variant="brass" onClick={() => setShowAdd(!showAdd)}>+ Nieuwe Klant</Btn>
      </PageHead>

      {showAdd && (
        <Card className="mb-8">
          <h2 className="mb-4 font-display text-xl text-forest-900">Nieuwe klant toevoegen</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-forest-800">Naam *</label>
              <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="mt-1 block w-full rounded-xl border border-forest-900/10 p-3 shadow-sm focus:border-brass-400 focus:ring-brass-400" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-forest-800">E-mailadres</label>
                <input type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="mt-1 block w-full rounded-xl border border-forest-900/10 p-3 shadow-sm focus:border-brass-400 focus:ring-brass-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-800">WhatsApp Nummer (bijv. +31612345678)</label>
                <input type="text" value={formData.whatsapp_number} onChange={e=>setFormData({...formData, whatsapp_number: e.target.value})} className="mt-1 block w-full rounded-xl border border-forest-900/10 p-3 shadow-sm focus:border-brass-400 focus:ring-brass-400" />
              </div>
            </div>
            <div className="pt-2 border-t border-forest-900/10">
              <label className="block text-sm font-bold text-forest-900 mb-3">NAW Gegevens</label>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-forest-800">Straat en Huisnummer</label>
                  <input type="text" value={formData.street} onChange={e=>setFormData({...formData, street: e.target.value})} className="mt-1 block w-full rounded-xl border border-forest-900/10 p-3 shadow-sm focus:border-brass-400 focus:ring-brass-400" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-forest-800">Postcode</label>
                    <input type="text" value={formData.zipcode} onChange={e=>setFormData({...formData, zipcode: e.target.value})} className="mt-1 block w-full rounded-xl border border-forest-900/10 p-3 shadow-sm focus:border-brass-400 focus:ring-brass-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-forest-800">Woonplaats</label>
                    <input type="text" value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value})} className="mt-1 block w-full rounded-xl border border-forest-900/10 p-3 shadow-sm focus:border-brass-400 focus:ring-brass-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-forest-800">Land</label>
                  <select value={formData.country} onChange={e=>setFormData({...formData, country: e.target.value})} className="mt-1 block w-full rounded-xl border border-forest-900/10 p-3 shadow-sm focus:border-brass-400 focus:ring-brass-400">
                    <option value="Nederland">Nederland</option>
                    <option value="België">België</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Btn variant="brass" type="submit">Aanmaken</Btn>
              <Btn type="button" variant="ghost" onClick={() => setShowAdd(false)}>Annuleren</Btn>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {customers.map((c) => (
          <Link key={c.id} href={`/admin/customers/${c.id}`} className="block group">
            <Card className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition group-hover:border-brass-400 group-hover:shadow-md">
              <div>
                <p className="font-display text-xl text-forest-900 group-hover:text-brass-600">{c.name}</p>
                <p className="mt-1 text-sm text-forest-600">
                  {c.email && <span className="mr-3">📧 {c.email}</span>}
                  {c.whatsapp_number && <span>📱 {c.whatsapp_number}</span>}
                </p>
              </div>
              <div className="flex items-center gap-4 text-brass-600 w-full sm:w-auto justify-end">
                <span>Beheren →</span>
                <button 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    if(confirm('Weet je zeker dat je deze klant wilt verwijderen?')) deleteCustomer(c.id); 
                  }} 
                  className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 border border-red-100"
                >
                  Verwijder
                </button>
              </div>
            </Card>
          </Link>
        ))}
        {customers.length === 0 && !showAdd && (
          <p className="text-forest-600 text-sm">Geen klanten gevonden. Voeg er een toe!</p>
        )}
      </div>
    </>
  );
}
