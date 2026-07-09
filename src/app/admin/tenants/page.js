'use client';
import { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Btn } from '@/components/admin';

export default function TenantsPage() {
  const { isSuperadmin, tenants = [], createCattery } = useStore();
  const [form, setForm] = useState({ catteryName: '', ownerName: '', ownerEmail: '', ownerPassword: '' });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  if (!isSuperadmin) {
    return (
      <>
        <PageHead label="Beheer" title="Catteries" />
        <Card>
          <p className="text-forest-700">Deze pagina is alleen voor de hoofdbeheerder (superadmin). Je ziet dit ook als de database-update (fase A) nog niet is toegepast.</p>
        </Card>
      </>
    );
  }

  const submit = async () => {
    if (!form.catteryName.trim() || !form.ownerEmail.trim() || form.ownerPassword.length < 6) {
      alert('Vul cattery-naam, e-mail en een wachtwoord (min. 6 tekens) in.');
      return;
    }
    setBusy(true);
    setResult(null);
    const res = await createCattery(form);
    setBusy(false);
    if (res.error) { setResult({ ok: false, msg: res.error }); return; }
    setResult({ ok: true, msg: `Cattery "${form.catteryName}" aangemaakt. De eigenaar kan inloggen met ${form.ownerEmail}.` });
    setForm({ catteryName: '', ownerName: '', ownerEmail: '', ownerPassword: '' });
  };

  return (
    <>
      <PageHead label="Beheer" title="Catteries" />
      <p className="-mt-4 mb-8 max-w-2xl text-sm text-forest-700/70">
        Maak nieuwe fokkerijen (catteries) aan met een eigen login. Elke cattery beheert
        volledig gescheiden zijn eigen nestjes, kittens, klanten en documenten.
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-xl text-forest-900">Nieuwe cattery + login aanmaken</h2>
          <div className="grid gap-4">
            <Field label="Naam van de cattery"><Input value={form.catteryName} onChange={(e) => setForm({ ...form, catteryName: e.target.value })} placeholder="Bijv. Maine Dream Cattery" /></Field>
            <Field label="Naam eigenaar"><Input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Voor- en achternaam" /></Field>
            <Field label="Inlog e-mail"><Input type="email" value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} placeholder="naam@voorbeeld.nl" /></Field>
            <Field label="Wachtwoord (min. 6 tekens)"><Input value={form.ownerPassword} onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })} placeholder="Tijdelijk wachtwoord" /></Field>
            <Btn variant="brass" onClick={submit} disabled={busy}>{busy ? 'Aanmaken…' : 'Cattery aanmaken'}</Btn>
            {result && (
              <p className={`rounded-xl px-4 py-3 text-sm ${result.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{result.msg}</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-xl text-forest-900">Bestaande catteries ({tenants.length})</h2>
          {tenants.length === 0 ? (
            <p className="text-sm text-forest-600">Nog geen catteries geladen.</p>
          ) : (
            <div className="space-y-2">
              {tenants.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl border border-forest-900/10 bg-white px-4 py-3">
                  <div>
                    <p className="font-semibold text-forest-900">{t.name}</p>
                    <p className="text-xs text-forest-600">{t.slug || '—'}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${t.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}>{t.plan || 'trial'}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
