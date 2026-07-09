-- Advertentie-instellingen per kitten (zichtbaarheid met vinkjes) + advertentietekst per nestje.
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS ad_settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS ad_text TEXT;
