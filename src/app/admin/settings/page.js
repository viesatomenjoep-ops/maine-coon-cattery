'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Select, Btn } from '@/components/admin';
import { cap } from '@/lib/species';

const SPECIES_OPTIONS = [
  { value: 'katten', label: 'Katten' },
  { value: 'honden', label: 'Honden' },
  { value: 'vogels', label: 'Vogels' },
  { value: 'duiven', label: 'Duiven' },
  { value: 'knaagdieren', label: 'Knaagdieren' },
  { value: 'anders', label: 'Iets anders' },
];

export default function SettingsPage() {
  const { siteContent, saveSiteContent, currentTenant, terms, updateTenant } = useStore();

  const [speciesForm, setSpeciesForm] = useState({ species: 'katten', breed: '' });
  const [savingSpecies, setSavingSpecies] = useState(false);

  useEffect(() => {
    if (currentTenant) {
      setSpeciesForm({ species: currentTenant.species || 'katten', breed: currentTenant.breed || '' });
    }
  }, [currentTenant]);

  const saveSpecies = async () => {
    setSavingSpecies(true);
    const res = await updateTenant({ species: speciesForm.species, breed: speciesForm.breed || null });
    setSavingSpecies(false);
    if (res?.error) return alert('Opslaan mislukt: ' + res.error + ' — mogelijk moet de kolom "species" nog aan de database worden toegevoegd (migratie 20260823090000).');
    alert('Diersoort opgeslagen.');
  };

  const [formData, setFormData] = useState({
    catteryName: currentTenant?.name || '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    facebook: '',
    instagram: '',
  });

  useEffect(() => {
    if (siteContent && siteContent.general_settings) {
      setFormData(prev => ({ ...prev, ...siteContent.general_settings }));
    }
  }, [siteContent]);

  useEffect(() => {
    if (currentTenant?.name) setFormData((prev) => (prev.catteryName ? prev : { ...prev, catteryName: currentTenant.name }));
  }, [currentTenant]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSiteContent('general_settings', formData);
    alert('Algemene instellingen succesvol opgeslagen!');
  };

  return (
    <div>
      <PageHead label="Configuratie" title="Instellingen" />

      <div className="mb-8 grid max-w-4xl gap-4 sm:grid-cols-2">
        <Link href="/admin/content" className="group flex items-center gap-4 rounded-2xl border border-forest-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brass-400/60 hover:shadow-md">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-2xl">🌍</span>
          <div>
            <p className="font-display text-lg text-forest-900">Website Editor</p>
            <p className="text-sm text-forest-600">Pas teksten en foto's op je site aan</p>
          </div>
        </Link>
        <Link href="/admin/backup" className="group flex items-center gap-4 rounded-2xl border border-forest-900/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brass-400/60 hover:shadow-md">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-2xl">💾</span>
          <div>
            <p className="font-display text-lg text-forest-900">Back-up &amp; Export</p>
            <p className="text-sm text-forest-600">Download een kopie van al je gegevens</p>
          </div>
        </Link>
      </div>

      <div className="mb-8 max-w-4xl">
        <Card>
          <h2 className="font-display text-xl text-forest-900 mb-1 border-b border-forest-900/10 pb-4">Diersoort</h2>
          <p className="mb-6 mt-3 text-sm text-forest-600">
            Bepaalt de woorden door de hele app heen — bijvoorbeeld "pup" en "kennel" bij honden,
            of "kitten" en "cattery" bij katten.
          </p>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <Field label="Diersoort">
              <Select value={speciesForm.species} onChange={(e) => setSpeciesForm((s) => ({ ...s, species: e.target.value }))}>
                {SPECIES_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            </Field>
            <Field label="Ras (optioneel)">
              <Input value={speciesForm.breed} onChange={(e) => setSpeciesForm((s) => ({ ...s, breed: e.target.value }))} placeholder="Bijv. Maine Coon" />
            </Field>
          </div>
          <div className="mt-5">
            <Btn variant="brass" type="button" onClick={saveSpecies} disabled={savingSpecies}>{savingSpecies ? 'Opslaan…' : 'Diersoort opslaan'}</Btn>
          </div>
        </Card>
      </div>

      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        <Card>
          <h2 className="font-display text-xl text-forest-900 mb-6 border-b border-forest-900/10 pb-4">{`${cap(terms.facility)}-informatie`}</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <Field label={`Naam van de ${terms.facility} *`}>
              <Input required name="catteryName" value={formData.catteryName} onChange={handleChange} placeholder="Bijv. Wendy's Dream" />
            </Field>
            <div className="col-span-full">
              <Field label="Volledig Adres">
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="Straat 123&#10;1234 AB Woonplaats&#10;Nederland"
                  className="mt-1 block w-full rounded-xl border border-forest-900/10 p-3 text-sm shadow-sm focus:border-brass-400 focus:ring-1 focus:ring-brass-400 focus:outline-none bg-white text-forest-900" 
                />
              </Field>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-forest-900 mb-6 border-b border-forest-900/10 pb-4">Contactgegevens</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <Field label="Openbaar E-mailadres">
              <Input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="info@voorbeeld.nl" />
            </Field>
            <Field label="Telefoonnummer">
              <Input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+31 6 12345678" />
            </Field>
            <Field label="WhatsApp Nummer (voor knoppen)">
              <Input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+31612345678" />
            </Field>
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-xl text-forest-900 mb-6 border-b border-forest-900/10 pb-4">Social Media Links</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <Field label="Facebook Pagina URL">
              <Input type="url" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." />
            </Field>
            <Field label="Instagram Profiel URL">
              <Input type="url" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." />
            </Field>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
          <Btn variant="ghost" type="button" onClick={() => window.location.reload()}>Wijzigingen Annuleren</Btn>
          <Btn variant="brass" type="submit">Instellingen Opslaan</Btn>
        </div>
      </form>
    </div>
  );
}
