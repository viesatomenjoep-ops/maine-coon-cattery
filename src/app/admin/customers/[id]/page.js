'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Btn } from '@/components/admin';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { customers, updateCustomer, deleteCustomer, kittens, updateKitten, litters, updateLitter } = useStore();
  const [customer, setCustomer] = useState(null);
  
  // Assignment state
  const [selectedKitten, setSelectedKitten] = useState('');
  const [selectedLitter, setSelectedLitter] = useState('');

  useEffect(() => {
    if (!id || customers.length === 0) return;
    const found = customers.find((c) => c.id === id);
    setCustomer(found || null);
  }, [id, customers]);

  if (customers.length === 0) {
    return <div className="p-10 text-forest-700">Laden...</div>;
  }

  if (!customer) {
    return (
      <div className="space-y-4 p-10">
        <p className="text-forest-700">Deze klant bestaat niet (meer).</p>
        <Link href="/admin/customers" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">← Terug naar klanten</Link>
      </div>
    );
  }

  // Find assigned items
  const assignedKittens = kittens.filter(k => k.customer_id === id);
  const assignedLitters = litters.filter(l => l.customer_id === id);

  // Available items (not assigned to THIS customer, maybe assigned to someone else, but we just allow overwriting or unassigned)
  const availableKittens = kittens.filter(k => k.customer_id !== id);
  const availableLitters = litters.filter(l => l.customer_id !== id);

  const handleDelete = async () => {
    if(confirm('Weet je zeker dat je deze klant wilt verwijderen?')) {
      // First, unassign everything to avoid orphaned references (though DB handles with SET NULL)
      for(const k of assignedKittens) await updateKitten(k.id, { customer_id: null });
      for(const l of assignedLitters) await updateLitter(l.id, { customer_id: null });
      
      await deleteCustomer(id);
      router.push('/admin/customers');
    }
  };

  const handleAssignKitten = async () => {
    if(selectedKitten) {
      await updateKitten(selectedKitten, { customer_id: id });
      setSelectedKitten('');
      alert('Kitten is succesvol gekoppeld en opgeslagen.');
    }
  };

  const handleUnassignKitten = async (kittenId) => {
    if(confirm('Weet je zeker dat je dit kitten wilt ontkoppelen?')) {
      await updateKitten(kittenId, { customer_id: null });
    }
  };

  const handleAssignLitter = async () => {
    if(selectedLitter) {
      await updateLitter(selectedLitter, { customer_id: id });
      setSelectedLitter('');
      alert('Nestje is succesvol gekoppeld en opgeslagen.');
    }
  };

  const handleUnassignLitter = async (litterId) => {
    if(confirm('Weet je zeker dat je dit nestje wilt ontkoppelen?')) {
      await updateLitter(litterId, { customer_id: null });
    }
  };

  const sendWhatsApp = () => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/k/${customer.token}`;
    const text = `Hoi ${customer.name}, hier is je exclusieve toegang tot het dossier: ${link}`;
    const url = `https://wa.me/${customer.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/customers" className="text-sm font-semibold text-forest-600 hover:text-forest-900">← Terug naar Klanten</Link>
      </div>

      <PageHead 
        title={customer.name} 
        label="Klantprofiel"
      >
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-0 w-full sm:w-auto">
          {customer.whatsapp_number && (
            <Btn onClick={sendWhatsApp} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto justify-center">
              WhatsApp Sturen
            </Btn>
          )}
          <Btn onClick={handleDelete} className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 w-full sm:w-auto justify-center">
            Klant Verwijderen
          </Btn>
        </div>
      </PageHead>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-2xl text-forest-900">Gegevens</h2>
          <div className="space-y-4 text-sm text-forest-800">
            <div>
              <span className="block font-semibold text-forest-900">Naam</span>
              {customer.name}
            </div>
            <div>
              <span className="block font-semibold text-forest-900">E-mail</span>
              {customer.email || '-'}
            </div>
            <div>
              <span className="block font-semibold text-forest-900">WhatsApp</span>
              {customer.whatsapp_number || '-'}
            </div>
            <div>
              <span className="block font-semibold text-forest-900">Adres</span>
              <p className="whitespace-pre-wrap">{customer.address || '-'}</p>
            </div>
            <div className="pt-4 border-t border-forest-900/10">
              <span className="block font-semibold text-forest-900 mb-2">Unieke Klantenlink (Magisch Portaal)</span>
              <div className="flex flex-col sm:flex-row gap-2">
                <input readOnly value={typeof window !== 'undefined' ? `${window.location.origin}/k/${customer.token}` : ''} className="text-xs bg-forest-50 p-2.5 rounded-xl block flex-1 w-full text-brass-700 border border-forest-900/10 font-mono outline-none" />
                <Btn variant="brass" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/k/${customer.token}`); alert('Link gekopieerd!'); }} className="text-xs shrink-0 w-full sm:w-auto justify-center py-2">Kopieer</Btn>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-8">
          {/* Assigned Kittens */}
          <Card>
            <h2 className="mb-4 font-display text-2xl text-forest-900">Gekoppelde Kittens</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <select value={selectedKitten} onChange={e=>setSelectedKitten(e.target.value)} className="flex-1 w-full rounded-xl border border-forest-900/10 p-2.5 text-sm min-w-0">
                <option value="">Kies een kitten om te koppelen...</option>
                {availableKittens.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
              </select>
              <Btn variant="brass" onClick={handleAssignKitten} className="shrink-0 w-full sm:w-auto justify-center">Koppel Kitten</Btn>
            </div>

            <ul className="space-y-3">
              {assignedKittens.map(k => (
                <li key={k.id} className="flex items-center justify-between p-3 rounded-xl border border-forest-900/10">
                  <span className="font-medium text-forest-900">{k.name}</span>
                  <button onClick={() => handleUnassignKitten(k.id)} className="text-xs text-red-600 hover:underline">Ontkoppelen</button>
                </li>
              ))}
              {assignedKittens.length === 0 && <p className="text-sm text-forest-600 italic">Geen kittens gekoppeld.</p>}
            </ul>
          </Card>

          {/* Assigned Litters */}
          <Card>
            <h2 className="mb-4 font-display text-2xl text-forest-900">Gekoppelde Nestjes (Wachtlijst/Volgen)</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <select value={selectedLitter} onChange={e=>setSelectedLitter(e.target.value)} className="flex-1 w-full rounded-xl border border-forest-900/10 p-2.5 text-sm min-w-0">
                <option value="">Kies een nestje om te koppelen...</option>
                {availableLitters.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <Btn variant="brass" onClick={handleAssignLitter} className="shrink-0 w-full sm:w-auto justify-center">Koppel Nestje</Btn>
            </div>

            <ul className="space-y-3">
              {assignedLitters.map(l => (
                <li key={l.id} className="flex items-center justify-between p-3 rounded-xl border border-forest-900/10">
                  <span className="font-medium text-forest-900">{l.name}</span>
                  <button onClick={() => handleUnassignLitter(l.id)} className="text-xs text-red-600 hover:underline">Ontkoppelen</button>
                </li>
              ))}
              {assignedLitters.length === 0 && <p className="text-sm text-forest-600 italic">Geen nestjes gekoppeld.</p>}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
