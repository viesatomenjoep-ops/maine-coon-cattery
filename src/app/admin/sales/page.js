'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Input, Select, Btn } from '@/components/admin';
import { StatusPill, ImageSlot } from '@/components/ui';
import { AdminUpload } from '@/components/admin/FilePicker';
import { nextTreatment, formatDate } from '@/lib/treatments';

const STATUS_OPTIONS = ['Beschikbaar', 'Gereserveerd', 'Verkocht', 'Houden'];
const matchStatus = (s) => STATUS_OPTIONS.find((o) => o.toLowerCase() === (s || '').toLowerCase()) || 'Beschikbaar';
const eur = (n) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0);
const sexLabel = (g) => {
  const v = (g || '').toLowerCase();
  if (/kater|mann|\bmale\b|\bm\b/.test(v)) return 'Kater';
  if (/poes|vrouw|female|\bf\b/.test(v)) return 'Poes';
  return g || 'Onbekend';
};

// Klein infoveldje voor de gesynchroniseerde dossiergegevens
function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-forest-900/10 bg-white p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-forest-600/60">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-forest-900">{value || '—'}</p>
    </div>
  );
}

function AdEditor({ k, customers, documents, media, updateKitten, onCopyLink }) {
  // Lokale, bewerkbare kopie voor prijs/status/nationaliteit
  const [form, setForm] = useState({
    price_nl: k.price_nl ?? '',
    price_be: k.price_be ?? '',
    customer_nationality: k.customer_nationality || 'NL',
    status: matchStatus(k.status),
  });
  const [saving, setSaving] = useState(false);

  // Bij wisselen van kitten (key remount) is dit al fris; deze sync vangt
  // updates op die van buitenaf komen (bv. publiceren).
  useEffect(() => {
    setForm({
      price_nl: k.price_nl ?? '',
      price_be: k.price_be ?? '',
      customer_nationality: k.customer_nationality || 'NL',
      status: matchStatus(k.status),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [k.id]);

  const save = async () => {
    setSaving(true);
    await updateKitten(k.id, {
      price_nl: form.price_nl === '' ? null : Number(form.price_nl),
      price_be: form.price_be === '' ? null : Number(form.price_be),
      customer_nationality: form.customer_nationality,
      status: form.status,
    });
    setSaving(false);
    alert('Advertentie opgeslagen! De gegevens zijn overal bijgewerkt.');
  };

  const assignCustomer = (customerId) => {
    updateKitten(k.id, { customer_id: customerId || null });
  };

  const { litters = [], updateLitter, updateDocument, updateMedia } = useStore();
  const litter = litters.find((l) => l.id === k.litter_id) || null;
  const adv = k.ad_settings || {};
  const advOn = (key) => adv[key] !== false; // standaard aan
  const setAdv = (key, val) => updateKitten(k.id, { ad_settings: { ...adv, [key]: val } });
  const customer = customers?.find((c) => c.id === k.customer_id) || null;
  const catDocs = documents.filter((d) => d.cat_id === k.id);
  const catMedia = media.filter((m) => m.cat_id === k.id);
  const hasPassport = catDocs.some((d) => (d.document_type || '').toLowerCase() === 'paspoort');
  const weights = k.weights || [];
  const lastWeight = weights.length ? weights[weights.length - 1] : null;

  return (
    <div className="space-y-6">
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ---- KOLOM 1: de advertentie ---- */}
      <Card className="flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-forest-50 group">
          {k.cover_image ? (
            <img src={k.cover_image} alt={k.name} className="h-full w-full object-cover" />
          ) : (
            <ImageSlot label="Nog geen advertentiefoto" ratio="aspect-[4/3]" className="!rounded-xl" />
          )}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/40 opacity-0 transition group-hover:opacity-100">
            <AdminUpload
              onSuccess={(res) => { if (res.event === 'success') updateKitten(k.id, { cover_image: res.info.secure_url }); }}
              options={{ folder: `cattery_sales/${k.id}`, clientAllowedFormats: ['images'] }}
            >
              {({ open, openCamera }) => (
                <>
                  <button type="button" onClick={(e) => { e.preventDefault(); open(); }} className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-forest-900 shadow hover:bg-white">Upload foto</button>
                  <button type="button" onClick={(e) => { e.preventDefault(); openCamera(); }} className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-forest-900 shadow hover:bg-white">Camera</button>
                </>
              )}
            </AdminUpload>
            {k.cover_image && (
              <button onClick={() => updateKitten(k.id, { cover_image: null })} className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-500">Wis</button>
            )}
          </div>
          <div className="pointer-events-none absolute left-3 top-3"><StatusPill status={matchStatus(k.status)} /></div>
        </div>
        <p className="mt-2 text-center text-[11px] text-forest-500">Deze foto hoort specifiek bij de advertentie van {k.name}.</p>

        <div className="mt-4 flex items-baseline justify-between">
          <h3 className="font-display text-2xl text-forest-900">{k.name}</h3>
          <span className="text-sm text-forest-600/70">{sexLabel(k.gender || k.sex)} · {k.color || 'Maine Coon'}</span>
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Prijs NL (€)</span>
              <Input type="number" value={form.price_nl} onChange={(e) => setForm({ ...form, price_nl: e.target.value })} className="mt-1" />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Prijs BE (€)</span>
              <Input type="number" value={form.price_be} onChange={(e) => setForm({ ...form, price_be: e.target.value })} className="mt-1" />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Klant nationaliteit</span>
              <Select value={form.customer_nationality} onChange={(e) => setForm({ ...form, customer_nationality: e.target.value })} className="mt-1">
                <option value="NL">Nederland (NL)</option>
                <option value="BE">België (BE)</option>
              </Select>
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Status</span>
              <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1">
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </label>
          </div>
          <Btn variant="brass" className="mt-2 w-full" onClick={save} disabled={saving}>{saving ? 'Opslaan…' : 'Advertentie opslaan'}</Btn>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-forest-900/10 pt-4">
          <span className="text-sm text-forest-600/70">{k.published ? '🟢 Live in klantportaal' : '⚪️ Niet gepubliceerd'}</span>
          <Btn variant={k.published ? 'ghost' : 'brass'} onClick={() => updateKitten(k.id, { published: !k.published })}>
            {k.published ? 'Offline halen' : 'Publiceren'}
          </Btn>
        </div>
      </Card>

      {/* ---- KOLOM 2: klant koppelen + gesynchroniseerd dossier ---- */}
      <div className="flex flex-col gap-6">
        <Card>
          <h4 className="font-display text-lg text-forest-900">Klant koppelen</h4>
          <p className="mt-1 text-sm text-forest-600">Wijs een klant toe aan {k.name}. Daarna kun je de persoonlijke link kopiëren en versturen.</p>

          <label className="mt-4 block">
            <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Gekoppelde klant</span>
            <Select value={k.customer_id || ''} onChange={(e) => assignCustomer(e.target.value)} className="mt-1">
              <option value="">— Geen klant gekoppeld —</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}{c.email ? ` (${c.email})` : ''}</option>)}
            </Select>
          </label>

          {customer ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-900">Gekoppeld aan {customer.name}</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/k/${customer.token}` : ''}
                  className="min-w-0 flex-1 truncate rounded-lg border border-forest-900/10 bg-white p-2.5 font-mono text-xs text-brass-700 outline-none"
                />
                <Btn variant="brass" onClick={() => onCopyLink(customer.token)} className="shrink-0 justify-center py-2 text-xs">Kopieer link</Btn>
              </div>
              <p className="mt-2 text-[11px] text-emerald-800/70">Via deze link ziet {customer.name} het volledige dossier van {k.name}: foto's, groeicurve, chipnummer, paspoort en documenten.</p>
            </div>
          ) : (
            <p className="mt-4 rounded-xl border border-forest-900/10 bg-forest-50 p-3 text-sm text-forest-600">Nog geen klant gekoppeld. Kies hierboven een klant, of maak er eerst een aan in het <Link href="/admin/customers" className="font-semibold text-brass-600 hover:underline">Klantenbestand</Link>.</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg text-forest-900">Dossiergegevens (gesynchroniseerd)</h4>
            <Link href={`/admin/cats/${k.id}`} className="inline-flex items-center rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700">Open volledig dossier →</Link>
          </div>
          <p className="mt-1 text-sm text-forest-600">Deze gegevens komen rechtstreeks uit het dossier van {k.name} en blijven overal automatisch gelijk.</p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <Info label="Chipnummer" value={k.chip_number} />
            <Info label="Stamboomnr." value={k.registration_no} />
            <Info label="EMS-code" value={k.ems_code} />
            <Info label="Geboortedatum" value={k.date_of_birth ? new Date(k.date_of_birth).toLocaleDateString('nl-NL') : ''} />
            <Info label="Geboortegewicht" value={k.birth_weight_g ? `${k.birth_weight_g} g` : ''} />
            <Info label="Laatste weging" value={lastWeight ? `${lastWeight.grams} g` : ''} />
            <Info label="Paspoort" value={hasPassport ? 'Aanwezig ✓' : 'Nog niet'} />
            <Info label="Prijs (huidig)" value={`${eur(k.price_nl)} NL · ${eur(k.price_be)} BE`} />
            <Info label="Volgende ontworming" value={nextTreatment(k, 'Ontworming') ? formatDate(nextTreatment(k, 'Ontworming').due) : 'Niet gepland'} />
            <Info label="Volgende inenting" value={nextTreatment(k, 'Vaccinatie') ? formatDate(nextTreatment(k, 'Vaccinatie').due) : 'Niet gepland'} />
            <Info label="Foto's" value={`${catMedia.length} in galerij`} />
            <Info label="Documenten" value={`${catDocs.length} bestand(en)`} />
          </div>
        </Card>
      </div>
    </div>

      {/* ---- Ouderfoto's (vader & moeder) ---- */}
      <Card>
        <h4 className="font-display text-lg text-forest-900">Ouderfoto's — vader &amp; moeder</h4>
        <p className="mt-1 text-sm text-forest-600">Deze verschijnen op een mooie plek in de advertentie van het nestje.</p>
        {litter ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:max-w-md">
            <ParentPhoto label={`Vader${litter.sire_name ? ` · ${litter.sire_name}` : ''}`} src={litter.sire_image_url} folder={`cattery_parents/${litter.id}/sire`} onSet={(url) => updateLitter(litter.id, { sire_image_url: url })} />
            <ParentPhoto label={`Moeder${litter.dam_name ? ` · ${litter.dam_name}` : ''}`} src={litter.dam_image_url} folder={`cattery_parents/${litter.id}/dam`} onSet={(url) => updateLitter(litter.id, { dam_image_url: url })} />
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-forest-900/10 bg-forest-50 p-3 text-sm text-forest-600">Dit kitten hoort nog niet bij een nestje, dus ouderfoto's kunnen hier nog niet worden ingesteld.</p>
        )}
      </Card>

      {/* ---- Advertentie-weergave (vinkjes) + advertentietekst ---- */}
      <Card>
        <h4 className="font-display text-lg text-forest-900">Advertentie-weergave</h4>
        <p className="mt-1 text-sm text-forest-600">Bepaal met vinkjes wat er op de advertentie zichtbaar is voor {k.name}.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <ToggleRow label="Prijs weergeven" checked={advOn('showPrice')} onToggle={(v) => setAdv('showPrice', v)} />
          <ToggleRow label="Ouderfoto's weergeven" checked={advOn('showParents')} onToggle={(v) => setAdv('showParents', v)} />
          <ToggleRow label="Zorg (ontworming/inenting) weergeven" checked={advOn('showCare')} onToggle={(v) => setAdv('showCare', v)} />
          <ToggleRow label="Groeicurve weergeven" checked={advOn('showGrowth')} onToggle={(v) => setAdv('showGrowth', v)} />
        </div>

        {litter && (
          <div className="mt-5">
            <label className="text-xs font-medium uppercase tracking-wide text-forest-700">Advertentietekst (voor dit nestje)</label>
            <textarea
              defaultValue={litter.ad_text || ''}
              onBlur={(e) => { if (e.target.value !== (litter.ad_text || '')) updateLitter(litter.id, { ad_text: e.target.value }); }}
              rows={6}
              placeholder="Vertel het verhaal van je cattery… Deze tekst verschijnt bovenaan de advertentie, met de kittens eronder."
              className="mt-1.5 w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:border-brass-400 focus:ring-2 focus:ring-brass-200"
            />
            <p className="mt-1 text-xs text-forest-500">Wordt gedeeld door het hele nestje. Sla op door buiten het veld te klikken.</p>
          </div>
        )}
      </Card>

      {/* ---- Bestanden publiceren (vinkjes) ---- */}
      <Card>
        <h4 className="font-display text-lg text-forest-900">Bestanden op de advertentie</h4>
        <p className="mt-1 text-sm text-forest-600">Vink aan welke foto's en documenten de klant/geïnteresseerde te zien krijgt. Uitgevinkt = verborgen.</p>
        <div className="mt-4 space-y-2">
          {catMedia.length === 0 && catDocs.length === 0 && (
            <p className="text-sm text-forest-600">Nog geen bestanden geüpload voor {k.name}. Upload ze in het dossier.</p>
          )}
          {catMedia.map((m) => (
            <FileRow key={`m-${m.id}`} thumb={m.media_url} name={m.name || 'Foto'} type="Foto" checked={m.is_public !== false} onToggle={(v) => updateMedia(m.id, { is_public: v })} />
          ))}
          {catDocs.map((d) => (
            <FileRow key={`d-${d.id}`} thumb={/\.(jpe?g|png|gif|webp)$/i.test(d.file_url || '') ? d.file_url : null} name={d.title || d.document_type || 'Document'} type={d.document_type || 'Document'} checked={d.is_private === false} onToggle={(v) => updateDocument(d.id, { is_private: !v })} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function ParentPhoto({ label, src, folder, onSet }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-forest-700">{label}</p>
      <div className="group relative aspect-square overflow-hidden rounded-xl bg-forest-50">
        {src ? <img src={src} alt={label} className="h-full w-full object-cover" /> : <ImageSlot label="Geen foto" ratio="aspect-square" className="!rounded-xl" />}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/40 opacity-0 transition group-hover:opacity-100">
          <AdminUpload onSuccess={(res) => { if (res.event === 'success') onSet(res.info.secure_url); }} options={{ folder, clientAllowedFormats: ['images'] }}>
            {({ open, openCamera }) => (
              <>
                <button type="button" onClick={(e) => { e.preventDefault(); open(); }} className="rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-forest-900 shadow hover:bg-white">Upload</button>
                <button type="button" onClick={(e) => { e.preventDefault(); openCamera(); }} className="rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-forest-900 shadow hover:bg-white">Camera</button>
              </>
            )}
          </AdminUpload>
          {src && <button onClick={() => onSet(null)} className="rounded-lg bg-red-500/90 px-2.5 py-1 text-[11px] font-semibold text-white shadow">Wis</button>}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onToggle }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-forest-900/10 bg-white p-3">
      <span className="text-sm text-forest-800">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} className="h-5 w-5 accent-emerald-600" />
    </label>
  );
}

function FileRow({ thumb, name, type, checked, onToggle }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-forest-900/10 bg-white p-2.5">
      {thumb ? <img src={thumb} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" /> : <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-forest-50 text-sm">📄</div>}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-forest-900">{name}</p>
        <p className="text-xs uppercase tracking-wide text-forest-500">{type}</p>
      </div>
      <span className={`text-xs font-semibold ${checked ? 'text-emerald-700' : 'text-forest-400'}`}>{checked ? 'Zichtbaar' : 'Verborgen'}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onToggle(e.target.checked)} className="h-5 w-5 accent-emerald-600" />
    </label>
  );
}

function ModeCard({ active, onClick, icon, title, desc }) {
  return (
    <button onClick={onClick} className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition ${active ? 'border-brass-400 bg-brass-50 ring-2 ring-brass-300' : 'border-forest-900/15 bg-white hover:border-brass-300 hover:bg-forest-50/50'}`}>
      <span className="text-3xl">{icon}</span>
      <span>
        <span className="block font-display text-lg text-forest-900">{title}</span>
        <span className="mt-0.5 block text-sm text-forest-600">{desc}</span>
      </span>
    </button>
  );
}

function LitterAdEditor({ litter, updateLitter }) {
  const gallery = Array.isArray(litter.ad_gallery) ? litter.ad_gallery : [];
  const addPhoto = (url) => updateLitter(litter.id, { ad_gallery: [...gallery, url] });
  const removePhoto = (url) => updateLitter(litter.id, { ad_gallery: gallery.filter((g) => g !== url) });
  const copyLink = () => {
    if (!litter.share_token) return alert('Deel-link nog niet beschikbaar (database-update nodig).');
    navigator.clipboard.writeText(`${window.location.origin}/nestje/${litter.share_token}`);
    alert('Advertentielink van dit nestje gekopieerd!');
  };
  return (
    <div className="space-y-6">
      <Card>
        <h4 className="font-display text-lg text-forest-900">Deelbare advertentielink</h4>
        <p className="mt-1 text-sm text-forest-600">Stuur deze naar (potentiële) klanten — ze zien de aankondiging van dit verwachte nestje.</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input readOnly value={typeof window !== 'undefined' ? `${window.location.origin}/nestje/${litter.share_token || ''}` : ''} className="min-w-0 flex-1 truncate rounded-lg border border-forest-900/10 bg-white p-2.5 font-mono text-xs text-brass-700 outline-none" />
          <Btn variant="brass" onClick={copyLink} className="shrink-0 justify-center py-2 text-xs">Kopieer link</Btn>
        </div>
      </Card>

      <Card>
        <h4 className="font-display text-lg text-forest-900">Nestje-gegevens</h4>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="block"><span className="text-xs font-medium uppercase tracking-wide text-forest-700">Verwacht op</span>
            <Input type="date" defaultValue={litter.date_of_birth || ''} onBlur={(e) => { if (e.target.value !== (litter.date_of_birth || '')) updateLitter(litter.id, { date_of_birth: e.target.value || null }); }} className="mt-1" /></label>
          <label className="block"><span className="text-xs font-medium uppercase tracking-wide text-forest-700">Vader (naam)</span>
            <Input defaultValue={litter.sire_name || ''} onBlur={(e) => { if (e.target.value !== (litter.sire_name || '')) updateLitter(litter.id, { sire_name: e.target.value }); }} className="mt-1" /></label>
          <label className="block"><span className="text-xs font-medium uppercase tracking-wide text-forest-700">Moeder (naam)</span>
            <Input defaultValue={litter.dam_name || ''} onBlur={(e) => { if (e.target.value !== (litter.dam_name || '')) updateLitter(litter.id, { dam_name: e.target.value }); }} className="mt-1" /></label>
        </div>
      </Card>

      <Card>
        <h4 className="font-display text-lg text-forest-900">Ouderfoto's — vader &amp; moeder</h4>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:max-w-md">
          <ParentPhoto label={`Vader${litter.sire_name ? ` · ${litter.sire_name}` : ''}`} src={litter.sire_image_url} folder={`cattery_parents/${litter.id}/sire`} onSet={(url) => updateLitter(litter.id, { sire_image_url: url })} />
          <ParentPhoto label={`Moeder${litter.dam_name ? ` · ${litter.dam_name}` : ''}`} src={litter.dam_image_url} folder={`cattery_parents/${litter.id}/dam`} onSet={(url) => updateLitter(litter.id, { dam_image_url: url })} />
        </div>
      </Card>

      <Card>
        <h4 className="font-display text-lg text-forest-900">Foto's van de verwachting</h4>
        <p className="mt-1 text-sm text-forest-600">Bijvoorbeeld foto's van eerdere nestjes of de ouders — voor de sfeer.</p>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {gallery.map((src, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-forest-900/10">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button onClick={() => removePhoto(src)} className="absolute right-1 top-1 rounded-md bg-red-500/90 px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">Wis</button>
            </div>
          ))}
          <AdminUpload onSuccess={(res) => { if (res.event === 'success') addPhoto(res.info.secure_url); }} options={{ folder: `cattery_litter_ad/${litter.id}`, clientAllowedFormats: ['images'] }}>
            {({ open }) => (
              <button type="button" onClick={(e) => { e.preventDefault(); open(); }} className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-forest-900/20 text-3xl text-forest-400 transition hover:border-brass-400 hover:text-brass-500">+</button>
            )}
          </AdminUpload>
        </div>
      </Card>

      <Card>
        <h4 className="font-display text-lg text-forest-900">Advertentietekst</h4>
        <textarea defaultValue={litter.ad_text || ''} onBlur={(e) => { if (e.target.value !== (litter.ad_text || '')) updateLitter(litter.id, { ad_text: e.target.value }); }} rows={7}
          placeholder="Vertel het verhaal van je cattery en dit verwachte nestje…" className="mt-3 w-full rounded-xl border border-forest-900/15 bg-white px-4 py-3 text-sm leading-relaxed outline-none focus:border-brass-400 focus:ring-2 focus:ring-brass-200" />
        <p className="mt-1 text-xs text-forest-500">Verschijnt bovenaan de advertentie. Sla op door buiten het veld te klikken.</p>
      </Card>
    </div>
  );
}

export default function SalesPage() {
  const { kittens, litters = [], updateKitten, updateLitter, customers = [], documents = [], media = [] } = useStore();

  const saleKittens = kittens.filter((k) => !k.is_own_breeding_cat);
  const [mode, setMode] = useState('kitten');
  const [selectedId, setSelectedId] = useState('');
  const [litterId, setLitterId] = useState('');
  const selected = saleKittens.find((k) => k.id === selectedId) || null;
  const selectedLitter = litters.find((l) => l.id === litterId) || null;

  const handleCopyLink = (token) => {
    navigator.clipboard.writeText(`${window.location.origin}/k/${token}`);
    alert('Klantenlink gekopieerd naar klembord!');
  };

  return (
    <>
      <PageHead label="Verkoop" title="Advertentie & Sales Beheer" />
      <p className="-mt-4 mb-6 max-w-2xl text-sm text-forest-700/70">
        Maak twee soorten advertenties: voor een <b>bestaande kitten</b> (met alle details en prijs),
        of voor een <b>verwacht nestje</b> (aankondiging met ouders, foto's en jouw verhaal).
      </p>

      {/* Modus-keuze */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <ModeCard active={mode === 'kitten'} onClick={() => setMode('kitten')} icon="🐱" title="Bestaande kitten" desc="Volledige advertentie met foto, prijs, status en klantlink." />
        <ModeCard active={mode === 'litter'} onClick={() => setMode('litter')} icon="🍼" title="Verwacht nestje" desc="Aankondiging met ouders, sfeerfoto's en jouw verhaal." />
      </div>

      {mode === 'kitten' ? (
        <>
          <Card className="mb-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-forest-900">1. Selecteer een kitten</h3>
              {selected && <button onClick={() => setSelectedId('')} className="text-xs font-semibold text-brass-600 hover:underline">Andere kitten kiezen</button>}
            </div>
            {saleKittens.length === 0 ? (
              <p className="mt-4 text-sm italic text-forest-600">Er zijn nog geen kittens. Maak eerst een nestje met kittens aan bij <Link href="/admin/litters" className="font-semibold text-brass-600 hover:underline">Nestjes &amp; Kittens</Link>.</p>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {saleKittens.map((k) => {
                  const active = k.id === selectedId;
                  return (
                    <button key={k.id} onClick={() => setSelectedId(k.id)} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? 'border-brass-400 bg-brass-50 ring-2 ring-brass-300' : 'border-forest-900/15 bg-white hover:border-brass-300 hover:bg-forest-50/50'}`}>
                      {k.cover_image ? <img src={k.cover_image} alt={k.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-forest-100 bg-forest-50 text-[9px] text-forest-400">Geen foto</div>}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-forest-900">{k.name}</p>
                        <p className="truncate text-xs text-forest-600">{sexLabel(k.gender || k.sex)} · {matchStatus(k.status)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {selected ? (
            <>
              <h3 className="mb-4 font-display text-lg text-forest-900">2. Beheer de advertentie van {selected.name}</h3>
              <AdEditor key={selected.id} k={selected} customers={customers} documents={documents} media={media} updateKitten={updateKitten} onCopyLink={handleCopyLink} />
            </>
          ) : (
            saleKittens.length > 0 && <div className="rounded-2xl border border-dashed border-forest-900/20 bg-white/60 py-12 text-center text-forest-600">Selecteer hierboven een kitten om de advertentie te beheren.</div>
          )}
        </>
      ) : (
        <>
          <Card className="mb-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg text-forest-900">1. Selecteer een nestje</h3>
              {selectedLitter && <button onClick={() => setLitterId('')} className="text-xs font-semibold text-brass-600 hover:underline">Ander nestje kiezen</button>}
            </div>
            {litters.length === 0 ? (
              <p className="mt-4 text-sm italic text-forest-600">Er zijn nog geen nestjes. Maak er een aan bij <Link href="/admin/litters" className="font-semibold text-brass-600 hover:underline">Nestjes &amp; Kittens</Link>.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {litters.map((l) => {
                  const active = l.id === litterId;
                  return (
                    <button key={l.id} onClick={() => setLitterId(l.id)} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? 'border-brass-400 bg-brass-50 ring-2 ring-brass-300' : 'border-forest-900/15 bg-white hover:border-brass-300 hover:bg-forest-50/50'}`}>
                      {l.cover_image_url ? <img src={l.cover_image_url} alt={l.name} className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-forest-100 bg-forest-50 text-lg">🍼</div>}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-forest-900">{l.name}</p>
                        <p className="truncate text-xs text-forest-600">{l.sire_name || '?'} × {l.dam_name || '?'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {selectedLitter ? (
            <>
              <h3 className="mb-4 font-display text-lg text-forest-900">2. Beheer de advertentie van {selectedLitter.name}</h3>
              <LitterAdEditor key={selectedLitter.id} litter={selectedLitter} updateLitter={updateLitter} />
            </>
          ) : (
            litters.length > 0 && <div className="rounded-2xl border border-dashed border-forest-900/20 bg-white/60 py-12 text-center text-forest-600">Selecteer hierboven een nestje om de advertentie te beheren.</div>
          )}
        </>
      )}
    </>
  );
}
