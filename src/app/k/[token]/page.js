'use client';
import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Logo, PawMark } from '@/components/ui';

export default function CustomerPortal({ params }) {
  // In de toekomst wordt dit een Supabase fetch op basis van de token
  const token = params.token;
  const [kittenData, setKittenData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data ophalen (straks: SELECT * FROM cats WHERE secret_token = token)
    setTimeout(() => {
      // Fake token validatie
      if (token !== '123e4567-e89b-12d3-a456-426614174000') {
        setKittenData(null);
      } else {
        setKittenData({
          name: "Big Giant Resort's Dajana",
          customerName: "Jan & Lisa",
          breed: "Maine Coon",
          color: "blue-silver-torbie",
          dateOfBirth: "08-06-2025",
          updates: [
            { id: 1, date: "15-09-2025", title: "Eerste inenting gehad!", text: "Dajana was heel dapper bij de dierenarts. Ze heeft haar eerste prikje gehad en is nu lekker aan het slapen." },
            { id: 2, date: "02-09-2025", title: "Spelen met het muisje", text: "Vandaag ontdekte Dajana haar favoriete speeltje. Ze rent er het hele huis mee door." }
          ],
          images: [
            "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800"
          ]
        });
      }
      setLoading(false);
    }, 800);
  }, [token]);

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-cream-50 text-forest-700">Laden van jouw kitten...</div>;
  }

  if (!kittenData) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-cream-50 pb-20">
      <header className="flex items-center justify-center border-b border-forest-900/10 bg-white py-6">
        <Logo />
      </header>

      <main className="mx-auto max-w-2xl px-6 pt-12">
        <div className="text-center">
          <PawMark className="mx-auto mb-4 h-8 w-8 text-brass-400" />
          <h1 className="font-display text-4xl text-forest-950">Hallo {kittenData.customerName}!</h1>
          <p className="mt-2 text-forest-700">Welkom in het exclusieve dossier van <strong className="text-forest-900">{kittenData.name}</strong></p>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-soft">
          {kittenData.images.length > 0 && (
            <img src={kittenData.images[0]} alt={kittenData.name} className="h-64 w-full object-cover" />
          )}
          <div className="p-6">
            <h2 className="font-display text-2xl text-forest-900">Details</h2>
            <ul className="mt-4 space-y-2 text-sm text-forest-700">
              <li><b>Ras:</b> {kittenData.breed}</li>
              <li><b>Kleur:</b> {kittenData.color}</li>
              <li><b>Geboortedatum:</b> {kittenData.dateOfBirth}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-2xl text-forest-900">Tijdlijn & Updates</h2>
          <div className="mt-6 space-y-8">
            {kittenData.updates.map((update) => (
              <div key={update.id} className="relative pl-6">
                <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-brass-400 border-[3px] border-cream-50"></div>
                {/* Lijn ertussen (dit kan nog mooier met absolute borders, we houden het nu simpel) */}
                <div className="absolute left-1.5 top-5 -bottom-8 w-px bg-forest-900/10 last:hidden"></div>
                
                <p className="text-xs font-bold uppercase tracking-wide text-brass-600">{update.date}</p>
                <div className="mt-2 rounded-xl bg-white p-5 shadow-sm border border-forest-900/5">
                  <h3 className="font-display text-lg text-forest-900">{update.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-forest-700">{update.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center text-xs text-forest-900/40">
          <p>Deze link is strikt persoonlijk en exclusief voor de koper.</p>
        </div>
      </main>
    </div>
  );
}
