'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { translations } from '@/data/translations';
import { PageHead, Btn } from '@/components/admin';
import { AdminUpload } from '@/components/admin/FilePicker';
import { PawMark, SectionLabel } from '@/components/ui';

const defaultNL = translations.nl;
const fallbackSlides = [
  { image: '/images/litter_terrace.png', title: defaultNL.hero_slides[0].title, subtitle: defaultNL.hero_slides[0].subtitle, text: defaultNL.hero_slides[0].text },
  { image: '/images/kittens_basket.png', title: defaultNL.hero_slides[1].title, subtitle: defaultNL.hero_slides[1].subtitle, text: defaultNL.hero_slides[1].text },
  { image: '/images/adult_regal.png', title: defaultNL.hero_slides[2].title, subtitle: defaultNL.hero_slides[2].subtitle, text: defaultNL.hero_slides[2].text },
];

const growthImages = [
  '/images/mother_kittens.png', '/images/kitten_sleepy.png', '/images/kitten_playful.png',
  '/images/kitten_curious.png', '/images/litter_terrace.png', '/images/junior_garden.png',
  '/images/junior_window.png', '/images/adult_regal.png', '/images/adult_fluffy.png', '/images/adult_smoke.png'
];

const CldUploadWidget = AdminUpload;

function VisualInput({ value, onChange, className, type = "text" }) {
  if (type === 'textarea') {
    return <textarea value={value} onChange={e=>onChange(e.target.value)} className={`bg-white/50 border border-forest-900/20 hover:border-brass-400 focus:border-brass-500 rounded-lg outline-none transition w-full resize-y min-h-[100px] p-2 ${className}`} />
  }
  return <input type="text" value={value} onChange={e=>onChange(e.target.value)} className={`bg-white/50 border-b border-forest-900/20 hover:border-brass-400 focus:border-brass-500 outline-none transition w-full px-1 py-0.5 ${className}`} />
}

// Beeld-vak dat uploaden én verwijderen ondersteunt.
// Lege waarde ('' of null) betekent: geen foto → op de website verschijnt niets in dit vlak.
function ImageUploadBox({ src, onChange, className }) {
  const hasImage = !!src;
  return (
    <div className={`relative group overflow-hidden bg-forest-50 border border-dashed border-forest-900/20 ${className}`}>
      {hasImage ? (
        <img src={src} alt="Voorbeeld" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 text-forest-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 mb-2 opacity-60"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>
          <span className="text-xs font-medium">Geen foto — niet zichtbaar op de website</span>
        </div>
      )}
      <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition gap-2 z-20 p-2">
        <CldUploadWidget onSuccess={(res) => { if(res.event === 'success') onChange(res.info.secure_url) }} options={{ folder: 'cattery_cms' }}>
          {({ open, openCamera }) => (
            <>
              <button onClick={open} className="bg-white text-forest-900 px-4 py-2 rounded-xl text-sm font-semibold shadow">
                {hasImage ? '📷 Andere foto' : '📷 Foto uploaden'}
              </button>
              <button onClick={openCamera} className="bg-white text-forest-900 px-4 py-2 rounded-xl text-sm font-semibold shadow">
                📸 Open camera
              </button>
            </>
          )}
        </CldUploadWidget>
        {hasImage && (
          <button onClick={() => onChange('')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow hover:bg-red-700">
            🗑️ Foto verwijderen
          </button>
        )}
      </div>
    </div>
  );
}

// Kop van een sectie met een schakelaar om de hele sectie te tonen/verbergen op de website.
function SectionHeader({ title, hidden, onToggle }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b pb-2">
      <h3 className="text-xl font-semibold text-forest-900">{title}</h3>
      <button
        onClick={onToggle}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${hidden ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-forest-100 text-forest-800 hover:bg-forest-200'}`}
      >
        {hidden ? '🚫 Verborgen op website — klik om te tonen' : '✅ Zichtbaar op website — klik om te verbergen'}
      </button>
    </div>
  );
}

export default function ContentEditor() {
  const { siteContent, saveSiteContent } = useStore();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Hydrate state from DB or default
    const st = siteContent || {};
    setData({
      hero_slides: st.hero_slides || fallbackSlides,
      hero_hidden: st.hero_hidden || false,
      intro_hidden: st.intro_hidden || false,
      intro_label: st.intro_label || defaultNL.intro_label,
      intro_title: st.intro_title || defaultNL.intro_title,
      intro_text: st.intro_text || defaultNL.intro_text,
      intro_tested: st.intro_tested || defaultNL.intro_tested,
      timeline_hidden: st.timeline_hidden || false,
      timeline_label: st.timeline_label || defaultNL.timeline_label,
      timeline_title: st.timeline_title || defaultNL.timeline_title,
      timeline_desc: st.timeline_desc || defaultNL.timeline_desc,
      timeline_stages: st.timeline_stages || defaultNL.timeline_stages.map((s, i) => ({ ...s, image: growthImages[i] })),
      portal_cta_title: st.portal_cta_title || defaultNL.portal_cta_title,
      portal_cta_desc: st.portal_cta_desc || defaultNL.portal_cta_desc,
    });
  }, [siteContent]);

  const handleSave = async () => {
    setSaving(true);
    await saveSiteContent(data);
    setSaving(false);
    alert('Wijzigingen zijn direct live op de website!');
  };

  if (!data) return <div>Laden...</div>;

  // --- Hero slides helpers ---
  const addSlide = () => {
    setData({ ...data, hero_slides: [...data.hero_slides, { image: '', subtitle: 'Nieuwe dia', title: 'Titel van de dia', text: '' }] });
  };
  const removeSlide = (idx) => {
    if (!confirm('Deze hero-dia definitief verwijderen?')) return;
    setData({ ...data, hero_slides: data.hero_slides.filter((_, i) => i !== idx) });
  };

  // --- Timeline stage helpers ---
  const addStage = () => {
    setData({ ...data, timeline_stages: [...data.timeline_stages, { stage: 'Nieuwe fase', age: 'Leeftijd', title: 'Titel', desc: 'Beschrijving...', image: '' }] });
  };
  const removeStage = (idx) => {
    if (!confirm('Dit tijdlijn-item definitief verwijderen?')) return;
    setData({ ...data, timeline_stages: data.timeline_stages.filter((_, i) => i !== idx) });
  };

  return (
    <div className="pb-32 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <PageHead label="CMS" title="Visuele Website Editor" />
        <Btn variant="brass" onClick={handleSave} className="shadow-lux fixed bottom-8 right-8 z-50 text-lg px-8 py-4 rounded-full">
          {saving ? 'Opslaan...' : '💾 Wijzigingen Opslaan'}
        </Btn>
      </div>

      <p className="mb-12 max-w-3xl text-sm text-forest-700/70 bg-white p-4 rounded-xl border border-forest-900/10 shadow-sm">
        Pas hier de teksten en afbeeldingen aan. Klik op teksten om ze te bewerken en houd je muis over een foto om die te vervangen of te verwijderen. Met de knop rechtsboven elke sectie kun je een hele sectie verbergen op de website. Vergeet niet op <strong>Wijzigingen Opslaan</strong> te klikken.
      </p>

      {/* 1. HERO SLIDER EDITOR */}
      <div className="mb-16">
        <SectionHeader title="1. Hero Slider (Bovenaan website)" hidden={data.hero_hidden} onToggle={() => setData({ ...data, hero_hidden: !data.hero_hidden })} />
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          {data.hero_slides.map((slide, idx) => (
            <div key={idx} className="relative bg-cream-50 rounded-[2rem] p-6 shadow-soft border border-forest-900/5">
              <button
                onClick={() => removeSlide(idx)}
                className="absolute -top-3 -right-3 z-30 h-9 w-9 rounded-full bg-red-600 text-white text-lg font-bold shadow-lux hover:bg-red-700 flex items-center justify-center"
                title="Deze dia verwijderen"
              >×</button>
              <ImageUploadBox 
                src={slide.image} 
                onChange={(url) => {
                  const newSlides = [...data.hero_slides];
                  newSlides[idx] = { ...newSlides[idx], image: url };
                  setData({...data, hero_slides: newSlides});
                }}
                className="w-full aspect-[4/5] rounded-[1.5rem] mb-6 shadow-sm"
              />
              <VisualInput 
                value={slide.subtitle} 
                onChange={(v) => { const n = [...data.hero_slides]; n[idx] = { ...n[idx], subtitle: v }; setData({...data, hero_slides: n}); }}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600 mb-2" 
              />
              <VisualInput 
                value={slide.title} 
                onChange={(v) => { const n = [...data.hero_slides]; n[idx] = { ...n[idx], title: v }; setData({...data, hero_slides: n}); }}
                type="textarea"
                className="font-display text-2xl font-light text-ink leading-tight mb-2" 
              />
              <VisualInput 
                value={slide.text} 
                onChange={(v) => { const n = [...data.hero_slides]; n[idx] = { ...n[idx], text: v }; setData({...data, hero_slides: n}); }}
                type="textarea"
                className="text-sm font-light text-ink/80 leading-relaxed" 
              />
            </div>
          ))}
          <button
            onClick={addSlide}
            className="min-h-[300px] rounded-[2rem] border-2 border-dashed border-forest-900/20 text-forest-600 hover:border-brass-400 hover:text-brass-600 hover:bg-brass-50/30 transition flex flex-col items-center justify-center gap-2 font-semibold"
          >
            <span className="text-4xl">＋</span>
            Nieuwe hero-dia toevoegen
          </button>
        </div>
      </div>

      {/* 2. OVER WENDY'S DREAM */}
      <div className="mb-16">
        <SectionHeader title="2. Introductie (Over ons)" hidden={data.intro_hidden} onToggle={() => setData({ ...data, intro_hidden: !data.intro_hidden })} />
        <div className={`relative py-16 px-6 bg-sand-100/50 rounded-[3rem] border border-forest-900/5 ${data.intro_hidden ? 'opacity-40' : ''}`}>
          <div className="mx-auto max-w-4xl text-center">
            <VisualInput value={data.intro_label} onChange={v=>setData({...data, intro_label: v})} className="text-xs font-semibold uppercase tracking-widest text-terracotta-500 mb-4 text-center" />
            <VisualInput value={data.intro_title} onChange={v=>setData({...data, intro_title: v})} className="font-display text-4xl md:text-5xl font-light text-ink text-center mb-6" type="textarea" />
            <VisualInput value={data.intro_text} onChange={v=>setData({...data, intro_text: v})} className="mx-auto max-w-3xl text-base md:text-lg font-light leading-relaxed text-ink/80 text-center" type="textarea" />
            <div className="mt-8 flex justify-center items-center">
              <PawMark className="h-5 w-5 text-terracotta-600 mr-2" />
              <VisualInput value={data.intro_tested} onChange={v=>setData({...data, intro_tested: v})} className="text-sm font-semibold tracking-wider text-terracotta-600 uppercase w-auto" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. TIMELINE */}
      <div className="mb-16">
        <SectionHeader title="3. Tijdlijn & Fotodagboek" hidden={data.timeline_hidden} onToggle={() => setData({ ...data, timeline_hidden: !data.timeline_hidden })} />
        <div className={`bg-beige-100/50 rounded-[3rem] py-16 px-6 border border-forest-900/5 ${data.timeline_hidden ? 'opacity-40' : ''}`}>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <VisualInput value={data.timeline_label} onChange={v=>setData({...data, timeline_label: v})} className="text-xs font-semibold uppercase tracking-widest text-terracotta-500 mb-4 text-center" />
            <VisualInput value={data.timeline_title} onChange={v=>setData({...data, timeline_title: v})} className="font-display text-4xl md:text-5xl font-light text-ink text-center mb-4" />
            <VisualInput value={data.timeline_desc} onChange={v=>setData({...data, timeline_desc: v})} className="text-sm md:text-base font-light text-ink/75 leading-relaxed text-center" type="textarea" />
          </div>

          <div className="space-y-16 max-w-5xl mx-auto">
            {data.timeline_stages.map((stage, idx) => (
              <div key={idx} className={`relative flex flex-col md:flex-row gap-10 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <button
                  onClick={() => removeStage(idx)}
                  className="absolute -top-3 right-0 md:-right-3 z-30 inline-flex items-center gap-1 rounded-full bg-red-600 text-white px-3 py-1.5 text-xs font-semibold shadow-lux hover:bg-red-700"
                  title="Dit item verwijderen"
                >🗑️ Verwijder item</button>
                <div className="w-full md:w-1/2">
                   <ImageUploadBox 
                    src={stage.image} 
                    onChange={(url) => {
                      const n = [...data.timeline_stages];
                      n[idx] = { ...n[idx], image: url };
                      setData({...data, timeline_stages: n});
                    }}
                    className="w-full aspect-[4/3] rounded-[2rem] shadow-soft"
                  />
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <VisualInput value={stage.stage} onChange={(v) => { const n = [...data.timeline_stages]; n[idx] = { ...n[idx], stage: v }; setData({...data, timeline_stages: n}); }} className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500 w-full sm:w-1/2" />
                    <VisualInput value={stage.age} onChange={(v) => { const n = [...data.timeline_stages]; n[idx] = { ...n[idx], age: v }; setData({...data, timeline_stages: n}); }} className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500 w-full sm:w-1/2" />
                  </div>
                  <VisualInput value={stage.title} onChange={(v) => { const n = [...data.timeline_stages]; n[idx] = { ...n[idx], title: v }; setData({...data, timeline_stages: n}); }} className="font-display text-3xl font-light text-ink" />
                  <VisualInput value={stage.desc} onChange={(v) => { const n = [...data.timeline_stages]; n[idx] = { ...n[idx], desc: v }; setData({...data, timeline_stages: n}); }} type="textarea" className="text-sm md:text-base font-light leading-relaxed text-ink/80" />
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-5xl mx-auto mt-12">
            <button
              onClick={addStage}
              className="w-full rounded-[2rem] border-2 border-dashed border-forest-900/20 py-8 text-forest-600 hover:border-brass-400 hover:text-brass-600 hover:bg-brass-50/30 transition flex flex-col items-center justify-center gap-2 font-semibold"
            >
              <span className="text-4xl">＋</span>
              Nieuw tijdlijn-item toevoegen
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
