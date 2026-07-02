'use client';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { translations } from '@/data/translations';
import { PageHead, Btn } from '@/components/admin';
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

const CldUploadWidget = ({ children, onSuccess, options }) => {
  const ref = useRef(null);
  const handleFile = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      if (options?.folder) formData.append('folder', options.folder);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url && onSuccess) onSuccess({ event: 'success', info: { secure_url: data.url } });
    }
    e.target.value = '';
  };
  return (
    <>
      <input type="file" ref={ref} className="hidden" multiple={options?.multiple} accept="image/*,video/*" onChange={handleFile} />
      {children({ open: () => ref.current?.click() })}
    </>
  );
};

function VisualInput({ value, onChange, className, type = "text" }) {
  if (type === 'textarea') {
    return <textarea value={value} onChange={e=>onChange(e.target.value)} className={`bg-white/50 border border-forest-900/20 hover:border-brass-400 focus:border-brass-500 rounded-lg outline-none transition w-full resize-y min-h-[100px] p-2 ${className}`} />
  }
  return <input type="text" value={value} onChange={e=>onChange(e.target.value)} className={`bg-white/50 border-b border-forest-900/20 hover:border-brass-400 focus:border-brass-500 outline-none transition w-full px-1 py-0.5 ${className}`} />
}

function ImageUploadBox({ src, onChange, className }) {
  return (
    <div className={`relative group overflow-hidden ${className}`}>
      <img src={src} alt="Upload" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition gap-2 z-20">
        <CldUploadWidget onSuccess={(res) => { if(res.event === 'success') onChange(res.info.secure_url) }} options={{ folder: 'cattery_cms' }}>
          {({ open }) => (
            <button onClick={open} className="bg-white text-forest-900 px-4 py-2 rounded-xl text-sm font-semibold shadow">Nieuwe foto uploaden</button>
          )}
        </CldUploadWidget>
      </div>
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
      intro_label: st.intro_label || defaultNL.intro_label,
      intro_title: st.intro_title || defaultNL.intro_title,
      intro_text: st.intro_text || defaultNL.intro_text,
      intro_tested: st.intro_tested || defaultNL.intro_tested,
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

  return (
    <div className="pb-32 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <PageHead label="CMS" title="Visuele Website Editor" />
        <Btn variant="brass" onClick={handleSave} className="shadow-lux fixed bottom-8 right-8 z-50 text-lg px-8 py-4 rounded-full">
          {saving ? 'Opslaan...' : '💾 Wijzigingen Opslaan'}
        </Btn>
      </div>

      <p className="mb-12 max-w-3xl text-sm text-forest-700/70 bg-white p-4 rounded-xl border border-forest-900/10 shadow-sm">
        Pas hier de teksten en afbeeldingen aan. De layouts zijn nagemaakt zoals op de voorkant. Klik op teksten om ze te bewerken, en houd je muis over afbeeldingen om een nieuwe te uploaden.
      </p>

      {/* 1. HERO SLIDER EDITOR */}
      <div className="mb-16">
        <h3 className="text-xl font-semibold mb-4 text-forest-900 border-b pb-2">1. Hero Slider (Bovenaan website)</h3>
        <div className="grid gap-8 md:grid-cols-3">
          {data.hero_slides.map((slide, idx) => (
            <div key={idx} className="bg-cream-50 rounded-[2rem] p-6 shadow-soft border border-forest-900/5">
              <ImageUploadBox 
                src={slide.image} 
                onChange={(url) => {
                  const newSlides = [...data.hero_slides];
                  newSlides[idx].image = url;
                  setData({...data, hero_slides: newSlides});
                }}
                className="w-full aspect-[4/5] rounded-[1.5rem] mb-6 shadow-sm"
              />
              <VisualInput 
                value={slide.subtitle} 
                onChange={(v) => { const n = [...data.hero_slides]; n[idx].subtitle = v; setData({...data, hero_slides: n}); }}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600 mb-2" 
              />
              <VisualInput 
                value={slide.title} 
                onChange={(v) => { const n = [...data.hero_slides]; n[idx].title = v; setData({...data, hero_slides: n}); }}
                type="textarea"
                className="font-display text-2xl font-light text-ink leading-tight mb-2" 
              />
              <VisualInput 
                value={slide.text} 
                onChange={(v) => { const n = [...data.hero_slides]; n[idx].text = v; setData({...data, hero_slides: n}); }}
                type="textarea"
                className="text-sm font-light text-ink/80 leading-relaxed" 
              />
            </div>
          ))}
        </div>
      </div>

      {/* 2. OVER WENDY'S DREAM */}
      <div className="mb-16">
        <h3 className="text-xl font-semibold mb-4 text-forest-900 border-b pb-2">2. Introductie (Over ons)</h3>
        <div className="relative py-16 px-6 bg-sand-100/50 rounded-[3rem] border border-forest-900/5">
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

      {/* 4. TIMELINE */}
      <div className="mb-16">
        <h3 className="text-xl font-semibold mb-4 text-forest-900 border-b pb-2">3. Tijdlijn & Fotodagboek</h3>
        <div className="bg-beige-100/50 rounded-[3rem] py-16 px-6 border border-forest-900/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <VisualInput value={data.timeline_label} onChange={v=>setData({...data, timeline_label: v})} className="text-xs font-semibold uppercase tracking-widest text-terracotta-500 mb-4 text-center" />
            <VisualInput value={data.timeline_title} onChange={v=>setData({...data, timeline_title: v})} className="font-display text-4xl md:text-5xl font-light text-ink text-center mb-4" />
            <VisualInput value={data.timeline_desc} onChange={v=>setData({...data, timeline_desc: v})} className="text-sm md:text-base font-light text-ink/75 leading-relaxed text-center" type="textarea" />
          </div>

          <div className="space-y-16 max-w-5xl mx-auto">
            {data.timeline_stages.map((stage, idx) => (
              <div key={idx} className={`flex flex-col md:flex-row gap-10 items-center ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className="w-full md:w-1/2">
                   <ImageUploadBox 
                    src={stage.image} 
                    onChange={(url) => {
                      const n = [...data.timeline_stages];
                      n[idx].image = url;
                      setData({...data, timeline_stages: n});
                    }}
                    className="w-full aspect-[4/3] rounded-[2rem] shadow-soft"
                  />
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  <div className="flex gap-2">
                    <VisualInput value={stage.stage} onChange={(v) => { const n = [...data.timeline_stages]; n[idx].stage = v; setData({...data, timeline_stages: n}); }} className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500 w-1/2" />
                    <VisualInput value={stage.age} onChange={(v) => { const n = [...data.timeline_stages]; n[idx].age = v; setData({...data, timeline_stages: n}); }} className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-500 w-1/2" />
                  </div>
                  <VisualInput value={stage.title} onChange={(v) => { const n = [...data.timeline_stages]; n[idx].title = v; setData({...data, timeline_stages: n}); }} className="font-display text-3xl font-light text-ink" />
                  <VisualInput value={stage.desc} onChange={(v) => { const n = [...data.timeline_stages]; n[idx].desc = v; setData({...data, timeline_stages: n}); }} type="textarea" className="text-sm md:text-base font-light leading-relaxed text-ink/80" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
