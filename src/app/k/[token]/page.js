'use client';
import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Logo, PawMark } from '@/components/ui';
import { StoreProvider, useStore } from '@/context/StoreContext';

function CustomerPortalInner({ token }) {
  const { kittens, news, media } = useStore();
  const [kittenData, setKittenData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Als de globale state nog leeg is (aan het fetchen), doe nog niks
    if (!kittens || kittens.length === 0) {
      // Zet een fallback timeout voor als er na 3 seconden echt niks is
      const timer = setTimeout(() => setLoading(false), 3000);
      return () => clearTimeout(timer);
    }

    const cat = kittens.find(k => k.secret_token_nl === token || k.secret_token_be === token);
    if (!cat) {
      setKittenData(null);
    } else {
      const isBE = cat.secret_token_be === token;
      const price = isBE ? cat.price_be : cat.price_nl;

      // Koppel actuele tijdlijn updates (sorteren op nieuwste eerst of oplopend)
      // We gaan er vanuit dat news.cat_id de koppeling is (moeten we toevoegen aan admin/news)
      const catNews = news.filter(n => n.cat_id === cat.id).map(n => ({
        id: n.id,
        date: n.created_at ? new Date(n.created_at).toLocaleDateString('nl-NL') : 'Onbekend',
        title: n.title,
        text: n.content
      }));

      // Fallback updates als er geen zijn
      const displayUpdates = catNews.length > 0 ? catNews : [
        { id: 'start', date: cat.created_at ? new Date(cat.created_at).toLocaleDateString('nl-NL') : 'Vandaag', title: 'Dossier Aangemaakt', text: `Het digitale dossier voor ${cat.name} is geopend.` }
      ];

      // Koppel actuele media
      const catMediaUrls = media.filter(m => m.cat_id === cat.id || m.media_url?.includes(cat.id)).map(m => m.media_url);
      const displayImages = cat.cover_image 
        ? [cat.cover_image, ...catMediaUrls] 
        : catMediaUrls.length > 0 
          ? catMediaUrls 
          : ["https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=800"];

      setKittenData({
        name: cat.name,
        customerName: isBE ? 'Beste zuiderbuur' : 'Beste klant',
        breed: "Maine Coon",
        color: cat.color,
        dateOfBirth: cat.born || cat.date_of_birth ? new Date(cat.born || cat.date_of_birth).toLocaleDateString('nl-NL') : "Onbekend",
        price: price,
        updates: displayUpdates,
        images: displayImages.filter(Boolean), // remove any nulls
        medical: cat.medical || []
      });
    }
    setLoading(false);
  }, [token, kittens, news, media]);

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
          <h2 className="font-display text-2xl text-forest-900">Medisch Overzicht</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-soft p-6">
            {kittenData.medical.length > 0 ? (
              <ul className="space-y-3">
                {kittenData.medical.map((med, i) => (
                  <li key={i} className="flex justify-between border-b border-forest-900/5 pb-2 last:border-0 text-sm">
                    <span className="font-medium text-forest-900">{med.type}</span>
                    <span className="text-forest-600">{new Date(med.date).toLocaleDateString('nl-NL')} - {med.note}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-forest-700 italic">Nog geen medische gegevens geregistreerd.</p>
            )}
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-2xl text-forest-900">Tijdlijn & Updates</h2>
          <div className="mt-6 space-y-8">
            {kittenData.updates.map((update) => (
              <div key={update.id} className="relative pl-6">
                <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-brass-400 border-[3px] border-cream-50"></div>
                <div className="absolute left-1.5 top-5 -bottom-8 w-px bg-forest-900/10 last:hidden"></div>
                
                <p className="text-xs font-bold uppercase tracking-wide text-brass-600">{update.date}</p>
                <div className="mt-2 rounded-xl bg-white p-5 shadow-sm border border-forest-900/5">
                  <h3 className="font-display text-lg text-forest-900">{update.title}</h3>
                  <div className="mt-2 text-sm leading-relaxed text-forest-700 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: update.text }}></div>
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

export default function CustomerPortal({ params }) {
  return (
    <StoreProvider>
      <CustomerPortalInner token={params.token} />
    </StoreProvider>
  );
}
