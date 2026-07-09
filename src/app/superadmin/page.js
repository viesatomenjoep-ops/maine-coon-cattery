'use client';
import { useState, useEffect, useCallback } from 'react';

const Card = ({ children, className = '' }) => (
  <div className={`rounded-2xl border border-forest-900/10 bg-white p-5 shadow-soft ${className}`}>{children}</div>
);

export default function SuperadminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ catteryName: '', ownerName: '', ownerEmail: '', ownerPassword: '' });
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/overview');
      if (res.ok) setData(await res.json());
      else setData({ error: true });
    } catch { setData({ error: true }); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const assign = async (payload) => {
    setBusy(true);
    const res = await fetch('/api/superadmin/assign', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) { const e = await res.json().catch(() => ({})); alert(e.error || 'Mislukt.'); return; }
    load();
  };

  const createCattery = async () => {
    if (!form.catteryName.trim() || !form.ownerEmail.trim() || form.ownerPassword.length < 6) {
      return alert('Vul cattery-naam, e-mail en wachtwoord (min. 6 tekens) in.');
    }
    setBusy(true);
    const res = await fetch('/api/admin/create-cattery', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg({ ok: false, text: j.error || 'Aanmaken mislukt.' }); return; }
    setMsg({ ok: true, text: `Cattery "${form.catteryName}" aangemaakt (login: ${form.ownerEmail}).` });
    setForm({ catteryName: '', ownerName: '', ownerEmail: '', ownerPassword: '' });
    load();
  };

  if (loading) return <p className="text-forest-700">Laden…</p>;
  if (!data || data.error) return <p className="text-red-700">Kon de gegevens niet laden. Is de database-update (superadmin-rol) toegepast?</p>;

  const { tenants, users, totals } = data;
  const tenantName = (id) => tenants.find((t) => t.id === id)?.name || '—';

  return (
    <div className="space-y-8">
      {/* Totalen */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-xs uppercase tracking-wide text-forest-600/60">Catteries</p><p className="mt-1 font-display text-4xl text-forest-950">{totals.tenants}</p></Card>
        <Card><p className="text-xs uppercase tracking-wide text-forest-600/60">Kittens (totaal)</p><p className="mt-1 font-display text-4xl text-forest-950">{totals.kittens}</p></Card>
        <Card><p className="text-xs uppercase tracking-wide text-forest-600/60">Klanten (totaal)</p><p className="mt-1 font-display text-4xl text-forest-950">{totals.customers}</p></Card>
      </div>

      {/* Catteries */}
      <div>
        <h2 className="mb-3 font-display text-xl text-forest-900">Catteries</h2>
        <div className="space-y-3">
          {tenants.map((t) => (
            <Card key={t.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <input
                      defaultValue={t.name}
                      onBlur={(e) => { if (e.target.value.trim() && e.target.value !== t.name) assign({ action: 'renameTenant', tenant_id: t.id, name: e.target.value }); }}
                      className="rounded-lg border border-transparent px-1 font-display text-lg text-forest-950 hover:border-forest-900/15 focus:border-brass-400 focus:outline-none"
                    />
                    <span className="rounded-full bg-forest-900/5 px-2 py-0.5 text-[10px] font-semibold uppercase text-forest-600">{t.plan || 'trial'}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-forest-600">/site/{t.slug} · eigenaar: {t.owners.join(', ') || '—'}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-4 text-sm text-forest-700">
                  <span><b>{t.litters}</b> nestjes</span>
                  <span><b>{t.kittens}</b> kittens</span>
                  <span><b>{t.customers}</b> klanten</span>
                  <a href={`/site/${t.slug}`} target="_blank" rel="noreferrer" className="font-semibold text-brass-600 hover:underline">Site →</a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Gebruikers */}
      <div>
        <h2 className="mb-3 font-display text-xl text-forest-900">Gebruikers &amp; koppelingen</h2>
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-900/10 text-left text-xs uppercase tracking-wide text-forest-600/60">
                <th className="py-2 pr-4">E-mail</th>
                <th className="pr-4">Naam</th>
                <th className="pr-4">Cattery</th>
                <th className="pr-4">Superadmin</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} className="border-b border-forest-900/5 last:border-none">
                  <td className="py-2 pr-4 font-medium text-forest-900">{u.email}</td>
                  <td className="pr-4 text-forest-700">{u.name || '—'}</td>
                  <td className="pr-4">
                    <select
                      value={u.tenant_id || ''}
                      onChange={(e) => assign({ action: 'setTenant', user_id: u.user_id, tenant_id: e.target.value || null })}
                      disabled={busy}
                      className="rounded-lg border border-forest-900/15 bg-white px-2 py-1 text-sm"
                    >
                      <option value="">— Geen cattery (platform) —</option>
                      {tenants.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </td>
                  <td className="pr-4">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={!!u.is_superadmin} disabled={busy} onChange={(e) => assign({ action: 'setSuperadmin', user_id: u.user_id, value: e.target.checked })} className="h-4 w-4 accent-brass-500" />
                      <span className="text-xs text-forest-600">{u.is_superadmin ? 'ja' : 'nee'}</span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Nieuwe cattery */}
      <div>
        <h2 className="mb-3 font-display text-xl text-forest-900">Nieuwe cattery + login aanmaken</h2>
        <Card>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={form.catteryName} onChange={(e) => setForm({ ...form, catteryName: e.target.value })} placeholder="Naam cattery" className="rounded-xl border border-forest-900/15 px-4 py-2.5 text-sm" />
            <input value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Naam eigenaar" className="rounded-xl border border-forest-900/15 px-4 py-2.5 text-sm" />
            <input type="email" value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} placeholder="Inlog e-mail" className="rounded-xl border border-forest-900/15 px-4 py-2.5 text-sm" />
            <input value={form.ownerPassword} onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })} placeholder="Wachtwoord (min. 6 tekens)" className="rounded-xl border border-forest-900/15 px-4 py-2.5 text-sm" />
          </div>
          <button onClick={createCattery} disabled={busy} className="mt-4 rounded-xl bg-brass-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brass-600 disabled:opacity-60">{busy ? 'Bezig…' : 'Cattery aanmaken'}</button>
          {msg && <p className={`mt-3 rounded-xl px-4 py-2 text-sm ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{msg.text}</p>}
        </Card>
      </div>
    </div>
  );
}
