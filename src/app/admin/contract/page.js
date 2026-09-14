'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHeader, FormSection, EmptyHero } from '@/components/admin/PageShell';
import { Field, Input, Select, Btn } from '@/components/admin';
import CustomerPicker from '@/components/admin/CustomerPicker';
import { downloadPurchaseContract, purchaseContractFile, klantnummer } from '@/lib/contract';
import { cap, sexLabel } from '@/lib/species';

const vandaag = () => new Date().toISOString().slice(0, 10);

export default function ContractPage() {
  const {
    kittens = [], litters = [], customers = [], currentTenant,
    siteContent, addDocumentFull, updateKitten, terms, species,
  } = useStore();

  const [catId, setCatId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [bezig, setBezig] = useState(false);
  const [bewaard, setBewaard] = useState(false);
  const [verkoop, setVerkoop] = useState({
    contractdatum: vandaag(),
    verkocht_als: 'huisdier',
    prijs: '',
    aanbetaling: '',
    restbedrag: '',
    gewicht: '',
  });

  const set = (k, v) => setVerkoop((s) => ({ ...s, [k]: v }));

  const cat = kittens.find((k) => k.id === catId) || null;
  const litter = cat ? litters.find((l) => l.id === cat.litter_id) || null : null;
  const customer = customers.find((c) => c.id === customerId) || null;

  // Zodra je een kitten kiest: neem over wat we al weten.
  useEffect(() => {
    if (!cat) return;
    setVerkoop((s) => ({
      ...s,
      prijs: s.prijs || (cat.price_nl ?? ''),
    }));
    if (!customerId && cat.customer_id) setCustomerId(cat.customer_id);
  }, [catId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Het restbedrag rekent zichzelf uit, maar je kunt het overschrijven.
  useEffect(() => {
    const p = Number(verkoop.prijs);
    const a = Number(verkoop.aanbetaling);
    if (verkoop.prijs !== '' && verkoop.aanbetaling !== '' && !isNaN(p) && !isNaN(a)) {
      set('restbedrag', String(Math.max(0, p - a)));
    }
  }, [verkoop.prijs, verkoop.aanbetaling]); // eslint-disable-line react-hooks/exhaustive-deps

  const fokkerij = useMemo(() => {
    const alg = siteContent?.general_settings || {};
    const adresRegels = String(alg.address || '').split('\n').filter(Boolean);
    return {
      name: currentTenant?.name || "Wendy's Dream",
      subtitle: 'Maine Coon Cattery',
      owner: alg.ownerName || 'Willem de Graaf',
      street: adresRegels[0] || 'Henriette Bosmansstraat 13',
      city: adresRegels.slice(1).join(', ') || '4207 JA  Gorinchem',
      email: alg.email || 'Wammes37@ziggo.nl',
      phone: alg.phone ? `Tel ${alg.phone}` : 'Tel 0645070868',
    };
  }, [currentTenant, siteContent]);

  const opts = { cat: cat || {}, litter, customer, fokkerij, verkoop, species };

  const download = async () => {
    if (!cat) return alert(`Kies eerst een ${terms.young}.`);
    setBezig(true);
    try { await downloadPurchaseContract(opts); }
    catch (e) { alert('Maken van de PDF is mislukt: ' + (e.message || e)); }
    setBezig(false);
  };

  // Contract bewaren bij het dier én de verkoopgegevens bijwerken.
  const bewaarBijDier = async () => {
    if (!cat) return alert(`Kies eerst een ${terms.young}.`);
    setBezig(true);
    try {
      const file = await purchaseContractFile(opts);
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'cattery_contracts');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'uploaden mislukt');

      const r = await addDocumentFull({
        cat_id: cat.id,
        litter_id: cat.litter_id || null,
        document_type: 'contract',
        title: `Koopovereenkomst ${cat.name}`,
        file_url: data.url,
        cloudinary_public_id: data.public_id,
        mime_type: 'application/pdf',
      });
      if (r?.error) throw new Error(r.error.message || 'opslaan mislukt');

      // Wat we nu weten ook in het dossier vastleggen.
      const patch = {};
      if (customerId) patch.customer_id = customerId;
      if (verkoop.prijs !== '') patch.priceNL = Number(verkoop.prijs);
      if (customer?.name) patch.reserved_by = customer.name;
      if (Object.keys(patch).length) await updateKitten(cat.id, patch);

      setBewaard(true);
      setTimeout(() => setBewaard(false), 4000);
    } catch (e) {
      alert('Er ging iets mis: ' + (e.message || e));
    }
    setBezig(false);
  };

  if (kittens.length === 0) {
    return (
      <div>
        <PageHeader
          icon={<><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2Z" /><path d="M13 2v6h6" /></>}
          title="Koopovereenkomst"
        />
        <EmptyHero
          icon={<><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2Z" /><path d="M13 2v6h6" /></>}
          title={`Eerst een ${terms.young} nodig`}
          desc={`Voeg een ${terms.young} toe, dan kun je daar een koopovereenkomst voor maken die zichzelf invult.`}
          action={
            <Link href="/admin/litters/new-cat" className="rounded-xl bg-forest-800 px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-forest-900">
              {`${cap(terms.animal)} toevoegen`}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={<><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2Z" /><path d="M13 2v6h6" /></>}
        title="Koopovereenkomst"
        subtitle="Vult zichzelf in met wat er al in het dossier staat"
      />

      <div className="max-w-4xl">
        <FormSection title={`Welk ${terms.young}?`}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={`${cap(terms.young)} *`}>
              <Select value={catId} onChange={(e) => setCatId(e.target.value)}>
                <option value="">{`Kies een ${terms.young}…`}</option>
                {kittens.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name}{k.chip_number ? ` — ${k.chip_number}` : ''}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Verkocht als">
              <Select value={verkoop.verkocht_als} onChange={(e) => set('verkocht_als', e.target.value)}>
                <option value="huisdier">huisdier</option>
                <option value="huisdier en showkat">huisdier en showkat</option>
                <option value="fokkat">fokkat</option>
                <option value="fok- en showkat">fok- en showkat</option>
              </Select>
            </Field>
          </div>

          {cat && (
            <div className="mt-4 rounded-xl border border-forest-900/10 bg-forest-50/50 p-4">
              <p className="text-sm text-forest-700">
                <b>{cat.name}</b>
                {' · '}{sexLabel(cat.gender || cat.sex, species)}
                {cat.color ? ` · ${cat.color}` : ''}
                {cat.chip_number ? ` · chip ${cat.chip_number}` : ' · geen chipnummer bekend'}
              </p>
              {litter && (
                <p className="mt-0.5 text-sm text-forest-500">
                  {litter.sire_name || '?'} × {litter.dam_name || '?'}
                  {litter.date_of_birth ? ` · geboren ${new Date(litter.date_of_birth).toLocaleDateString('nl-NL')}` : ''}
                </p>
              )}
            </div>
          )}
        </FormSection>

        <FormSection title="Koper" hint="Staat de koper er nog niet bij? Maak hem aan met de knop ernaast.">
          <CustomerPicker value={customerId} onChange={setCustomerId} />
          {customer && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-forest-900/10 bg-white p-4">
              <span className="rounded-lg bg-forest-800 px-2.5 py-1 font-mono text-xs font-bold text-cream-50">
                {klantnummer(customer.customer_no)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-forest-900">{customer.name}</span>
                <span className="block text-sm text-forest-500">
                  {[customer.email, customer.whatsapp_number].filter(Boolean).join(' · ') || 'geen contactgegevens'}
                </span>
              </span>
              <Link href={`/admin/customers/${customer.id}`} className="shrink-0 text-sm font-semibold text-forest-600 hover:underline">
                Bewerken
              </Link>
            </div>
          )}
          {!customer?.customer_no && customer && (
            <p className="mt-2 text-xs text-amber-700">
              ⚠ Deze klant heeft nog geen klantnummer. Draai de database-update
              <code className="mx-1 rounded bg-amber-50 px-1.5 py-0.5">20260914140000_customer_number.sql</code>
              om nummers toe te kennen.
            </p>
          )}
        </FormSection>

        <FormSection title="Prijs en betaling">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Prijs (€)">
              <Input type="number" value={verkoop.prijs} onChange={(e) => set('prijs', e.target.value)} placeholder="1200" />
            </Field>
            <Field label="Aanbetaald (€)">
              <Input type="number" value={verkoop.aanbetaling} onChange={(e) => set('aanbetaling', e.target.value)} placeholder="300" />
            </Field>
            <Field label="Resterend bij levering (€)">
              <Input type="number" value={verkoop.restbedrag} onChange={(e) => set('restbedrag', e.target.value)} />
            </Field>
          </div>
          <p className="mt-2 text-xs text-forest-500">
            Het restbedrag rekent zichzelf uit zodra je prijs en aanbetaling invult. Je kunt het altijd zelf aanpassen.
          </p>
        </FormSection>

        <FormSection title="Overdracht">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Datum overeenkomst">
              <Input type="date" value={verkoop.contractdatum} onChange={(e) => set('contractdatum', e.target.value)} />
            </Field>
            <Field label="Gewicht bij overdracht (gram)">
              <Input type="number" value={verkoop.gewicht} onChange={(e) => set('gewicht', e.target.value)} placeholder="1800" />
            </Field>
          </div>
        </FormSection>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-forest-900/10 pt-6">
          <p className="text-sm text-forest-500">
            Velden die je leeg laat komen als stippellijn op het contract, zodat je ze met de pen kunt invullen.
          </p>
          <div className="flex flex-wrap gap-3">
            <Btn variant="ghost" onClick={download} disabled={bezig || !cat}>
              {bezig ? 'Bezig…' : 'Download PDF'}
            </Btn>
            <Btn variant="brass" onClick={bewaarBijDier} disabled={bezig || !cat}>
              {bezig ? 'Bezig…' : `Bewaar bij ${cat?.name || terms.theAnimal}`}
            </Btn>
          </div>
        </div>

        {bewaard && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="font-semibold text-emerald-900">Contract bewaard</p>
            <p className="mt-0.5 text-sm text-emerald-800/80">
              Je vindt het terug in het dossier van {cat?.name} onder Verkoop, en de koper is gekoppeld.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
