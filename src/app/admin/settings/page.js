'use client';
import { PageHead, Card } from '@/components/admin';

export default function SettingsPage() {
  return (
    <>
      <PageHead label="Configuratie" title="Instellingen" />
      <Card className="max-w-2xl">
        <h2 className="font-display text-xl text-forest-900 mb-4">Algemene Instellingen</h2>
        <p className="text-forest-700 text-sm mb-6">
          Deze pagina wordt in een latere update toegevoegd. Hier zul je algemene instellingen zoals je contactgegevens, e-mailnotificaties en wachtwoord kunnen aanpassen.
        </p>
        <div className="rounded-xl bg-forest-50 border border-forest-900/10 p-6 flex flex-col items-center justify-center text-center">
          <span className="text-4xl mb-4">🛠️</span>
          <h3 className="font-bold text-forest-900 mb-1">Under Construction</h3>
          <p className="text-xs text-forest-600">We zijn achter de schermen bezig met deze functionaliteit.</p>
        </div>
      </Card>
    </>
  );
}
