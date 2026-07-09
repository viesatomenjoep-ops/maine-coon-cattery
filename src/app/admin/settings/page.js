'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Btn } from '@/components/admin';

export default function SettingsPage() {
  const { siteContent, saveSiteContent } = useStore();
  
  const [formData, setFormData] = useState({
    catteryName: "Wendy's Dream Maine Coon Cattery",
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

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await saveSiteContent('general_settings', formData);
    alert('Algemene instellingen succesvol opgeslagen!');
  };

  return (
    <>
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

      <form onSubmit={handleSave} className="space-y-8 max-w-4xl">
        <Card>
          <h2 className="font-display text-xl text-forest-900 mb-6 border-b border-forest-900/10 pb-4">Cattery Informatie</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <Field label="Naam van de Cattery *">
              <Input required name="catteryName" value={formData.catteryName} onChange={handleChange} placeholder="Wendy's Dream" />
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
    </>
  );
}
