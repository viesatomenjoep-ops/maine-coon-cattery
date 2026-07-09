'use client';
import { useEffect, useState } from 'react';

// Zet een base64 VAPID-sleutel om naar het formaat dat de browser verwacht.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export default function PushSetup() {
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | on | off | busy | error
  const [msg, setMsg] = useState('');
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
      setSupported(false);
      return;
    }
    setSupported(true);
    navigator.serviceWorker.register('/sw.js').catch(() => {});
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? 'on' : 'off'))
      .catch(() => setStatus('off'));
  }, []);

  const enable = async () => {
    if (!vapidKey) { setStatus('error'); setMsg('VAPID-sleutel ontbreekt in de omgeving.'); return; }
    setStatus('busy');
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setStatus('off'); setMsg('Meldingen zijn geblokkeerd in de browser.'); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: sub, label: navigator.userAgent.slice(0, 120) }),
      });
      if (!res.ok) throw new Error('Opslaan mislukt');
      setStatus('on');
      setMsg('Meldingen staan aan — ook als de app dicht is.');
    } catch (e) {
      setStatus('error');
      setMsg('Kon meldingen niet inschakelen.');
    }
  };

  const disable = async () => {
    setStatus('busy');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus('off');
      setMsg('');
    } catch {
      setStatus('error');
      setMsg('Kon meldingen niet uitschakelen.');
    }
  };

  if (!supported) return null;

  return (
    <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-forest-900/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xl">🔔</span>
        <div>
          <p className="text-sm font-semibold text-forest-900">Push-meldingen voor behandelingen</p>
          <p className="text-xs text-forest-600">
            {status === 'on'
              ? (msg || 'Staan aan — je krijgt een melding, ook als de app dicht is.')
              : 'Ontvang automatisch een herinnering voor ontworming en inentingen, ook als de app gesloten is.'}
            {status === 'error' && <span className="text-red-600"> {msg}</span>}
          </p>
        </div>
      </div>
      <div className="shrink-0">
        {status === 'on' ? (
          <button onClick={disable} className="rounded-xl border border-forest-900/15 bg-white px-4 py-2 text-sm font-semibold text-forest-700 transition hover:bg-forest-50">Meldingen uitzetten</button>
        ) : (
          <button onClick={enable} disabled={status === 'busy'} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
            {status === 'busy' ? 'Bezig…' : 'Meldingen aanzetten'}
          </button>
        )}
      </div>
    </div>
  );
}
