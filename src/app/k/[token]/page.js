'use client';
import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { Logo, PawMark } from '@/components/ui';
import { supabase } from '@/lib/supabase';

// Helper component for updates
function TimelineUpdate({ update }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-brass-400 border-[3px] border-cream-50"></div>
      <div className="absolute left-1.5 top-5 -bottom-8 w-px bg-forest-900/10 last:hidden"></div>
      
      <p className="text-xs font-bold uppercase tracking-wide text-brass-600">
        {update.date} <span className="text-forest-600/50 ml-2">({update.tag})</span>
      </p>
      <div className="mt-2 rounded-xl bg-white p-5 shadow-sm border border-forest-900/5">
        <h3 className="font-display text-lg text-forest-900">{update.title}</h3>
        <div className="mt-2 text-sm leading-relaxed text-forest-700 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: update.text }}></div>
      </div>
    </div>
  );
}

export default function CustomerPortal({ params }) {
  const { token } = params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomerData() {
      // 1. Haal de klant op via de unieke token
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('token', token)
        .single();
        
      if (!customerData) {
        setLoading(false);
        return;
      }

      // 2. Haal de kittens en nestjes op die aan deze klant gekoppeld zijn
      const { data: kittensData } = await supabase.from('cats').select('*').eq('customer_id', customerData.id);
      const { data: littersData } = await supabase.from('litters').select('*').eq('customer_id', customerData.id);

      // 3. Haal nieuws/updates, media en medische gegevens op voor deze kittens
      const catIds = (kittensData || []).map(k => k.id);
      const litterIds = (littersData || []).map(l => l.id);

      // Fetch gerelateerd nieuws (timeline_updates heeft hopelijk een cat_id of we halen gewoon alles op en filteren)
      // Omdat we geen litter_id in timeline_updates hebben (alleen cat_id), doen we het via catIds.
      // Als er nieuws is met cat_id in de lijst, tonen we dat.
      const { data: allNews } = await supabase.from('timeline_updates').select('*').order('created_at', { ascending: false });
      
      let customerUpdates = [];
      if (allNews) {
        customerUpdates = allNews
          .filter(n => !n.cat_id || catIds.includes(n.cat_id)) // Toon algemeen nieuws én specifiek kitten nieuws
          .map(n => ({
            id: n.id,
            date: n.created_at ? new Date(n.created_at).toLocaleDateString('nl-NL') : 'Onbekend',
            title: n.title,
            text: n.content,
            tag: n.cat_id ? kittensData.find(k => k.id === n.cat_id)?.name || 'Kitten update' : 'Cattery nieuws'
          }));
      }

      // 4. Bouw het dashboard object op
      setData({
        customer: customerData,
        kittens: kittensData || [],
        litters: littersData || [],
        updates: customerUpdates
      });
      setLoading(false);
    }
    
    fetchCustomerData();
  }, [token]);

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-cream-50 text-forest-700">Je unieke portaal wordt geladen...</div>;
  }

  if (!data) {
    return notFound();
  }

  const { customer, kittens, litters, updates } = data;

  return (
    <div className="min-h-screen bg-cream-50 pb-20">
      <header className="flex items-center justify-center border-b border-forest-900/10 bg-white py-6">
        <Logo />
      </header>

      <main className="mx-auto max-w-2xl px-6 pt-12">
        <div className="text-center mb-12">
          <PawMark className="mx-auto mb-4 h-8 w-8 text-brass-400" />
          <h1 className="font-display text-4xl text-forest-950">Hallo {customer.name}!</h1>
          <p className="mt-2 text-forest-700">Welkom in jouw persoonlijke Wendy's Dream portaal.</p>
        </div>

        {kittens.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-2xl text-forest-900 mb-6">Jouw Gekoppelde Kittens</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {kittens.map(k => (
                <div key={k.id} className="overflow-hidden rounded-2xl border border-forest-900/10 bg-white shadow-soft">
                  {k.cover_image ? (
                    <img src={k.cover_image} alt={k.name} className="h-48 w-full object-cover" />
                  ) : (
                    <div className="h-48 w-full bg-forest-50 flex items-center justify-center">
                      <PawMark className="h-8 w-8 text-forest-200" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-display text-xl text-forest-900">{k.name}</h3>
                    <p className="text-sm text-forest-600">{k.color} · {k.gender}</p>
                    <p className="text-sm text-forest-600 mt-2 font-medium">Status: {k.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {litters.length > 0 && (
          <div className="mb-12">
            <h2 className="font-display text-2xl text-forest-900 mb-6">Nestjes die je volgt</h2>
            <div className="grid gap-6">
              {litters.map(l => (
                <div key={l.id} className="rounded-2xl border border-forest-900/10 bg-white shadow-soft p-5">
                  <h3 className="font-display text-xl text-forest-900">{l.name}</h3>
                  <p className="text-sm text-forest-600 mt-1">Ouders: {l.sire_name} & {l.dam_name}</p>
                  {l.date_of_birth && <p className="text-sm text-forest-600">Geboren: {new Date(l.date_of_birth).toLocaleDateString('nl-NL')}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12">
          <h2 className="font-display text-2xl text-forest-900">Jouw Tijdlijn & Updates</h2>
          {updates.length > 0 ? (
            <div className="mt-6 space-y-8">
              {updates.map((update, i) => <TimelineUpdate key={update.id || i} update={update} />)}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-forest-900/10 bg-white shadow-soft p-8 text-center text-forest-600">
              Er zijn nog geen updates voor jou. We houden je hier op de hoogte zodra er nieuws is!
            </div>
          )}
        </div>

        <div className="mt-16 text-center text-xs text-forest-900/40">
          <p>Deze link is strikt persoonlijk en gekoppeld aan <b>{customer.email || 'je account'}</b>.</p>
        </div>
      </main>
    </div>
  );
}
