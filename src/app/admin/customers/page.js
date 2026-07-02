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
    address: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newCustomer = await addCustomer(formData);
    if (newCustomer) {
      setShowAdd(false);
      setFormData({ name: '', email: '', whatsapp_number: '', address: '' });
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
            <div>
              <label className="block text-sm font-medium text-forest-800">NAW / Adres</label>
              <textarea value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} rows={2} className="mt-1 block w-full rounded-xl border border-forest-900/10 p-3 shadow-sm focus:border-brass-400 focus:ring-brass-400" />
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
            <Card className="flex items-center justify-between transition group-hover:border-brass-400 group-hover:shadow-md">
              <div>
                <p className="font-display text-xl text-forest-900 group-hover:text-brass-600">{c.name}</p>
                <p className="mt-1 text-sm text-forest-600">
                  {c.email && <span className="mr-3">📧 {c.email}</span>}
                  {c.whatsapp_number && <span>📱 {c.whatsapp_number}</span>}
                </p>
              </div>
              <div className="text-brass-600">
                Beheren →
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
