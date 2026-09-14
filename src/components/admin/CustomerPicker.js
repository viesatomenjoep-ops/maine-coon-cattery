'use client';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Select, Input, Field, Btn } from '@/components/admin';

/**
 * Koper kiezen, met de mogelijkheid om er meteen een nieuwe aan te maken.
 * Zo hoef je niet eerst naar het klantenscherm en terug.
 */
export default function CustomerPicker({ value, onChange, placeholder = 'Nog geen koper gekoppeld' }) {
  const { customers = [], addCustomer } = useStore();
  const [open, setOpen] = useState(false);
  const [bezig, setBezig] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', whatsapp_number: '',
    street: '', zipcode: '', city: '', country: 'Nederland',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const maakAan = async () => {
    if (!form.name.trim()) return alert('Vul in ieder geval een naam in.');
    setBezig(true);
    const adres = [
      form.street,
      [form.zipcode, form.city].filter(Boolean).join(' '),
      form.country,
    ].filter(Boolean).join('\n');

    const nieuw = await addCustomer({
      name: form.name.trim(),
      email: form.email || null,
      whatsapp_number: form.whatsapp_number || null,
      address: adres || null,
    });
    setBezig(false);

    if (!nieuw?.id) return alert('Aanmaken van de klant is niet gelukt.');
    onChange(nieuw.id);            // meteen koppelen aan dit dier
    setForm({ name: '', email: '', whatsapp_number: '', street: '', zipcode: '', city: '', country: 'Nederland' });
    setOpen(false);
  };

  return (
    <div>
      <div className="flex gap-2">
        <div className="min-w-0 flex-1">
          <Select value={value || ''} onChange={(e) => onChange(e.target.value)}>
            <option value="">{placeholder}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.email ? ` — ${c.email}` : ''}</option>
            ))}
          </Select>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          title="Nieuwe klant aanmaken"
          className={`flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-lg border transition ${
            open
              ? 'border-brass-400 bg-brass-50 text-brass-700'
              : 'border-forest-900/15 bg-white text-forest-600 hover:border-forest-900/30 hover:text-forest-900'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6M22 11h-6" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="mt-3 rounded-2xl border border-brass-300/70 bg-brass-50/40 p-5">
          <p className="mb-4 font-display text-lg text-forest-900">Nieuwe klant</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Naam *">
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Voor- en achternaam" autoFocus />
            </Field>
            <Field label="E-mailadres">
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="naam@voorbeeld.nl" />
            </Field>
            <Field label="Telefoon / WhatsApp">
              <Input value={form.whatsapp_number} onChange={(e) => set('whatsapp_number', e.target.value)} placeholder="+31 6 12345678" />
            </Field>
            <Field label="Straat en huisnummer">
              <Input value={form.street} onChange={(e) => set('street', e.target.value)} />
            </Field>
            <Field label="Postcode">
              <Input value={form.zipcode} onChange={(e) => set('zipcode', e.target.value)} />
            </Field>
            <Field label="Plaats">
              <Input value={form.city} onChange={(e) => set('city', e.target.value)} />
            </Field>
            <Field label="Land">
              <Select value={form.country} onChange={(e) => set('country', e.target.value)}>
                <option>Nederland</option>
                <option>België</option>
                <option>Duitsland</option>
                <option>Anders</option>
              </Select>
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Btn variant="brass" onClick={maakAan} disabled={bezig}>
              {bezig ? 'Bezig…' : 'Aanmaken en koppelen'}
            </Btn>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Annuleren</Btn>
          </div>
          <p className="mt-3 text-xs text-forest-500">
            De klant wordt meteen aan dit dier gekoppeld en verschijnt daarna ook in je klantenbestand.
          </p>
        </div>
      )}
    </div>
  );
}
