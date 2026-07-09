-- Fotogalerij voor de advertentie van een (verwacht) nestje.
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS ad_gallery JSONB DEFAULT '[]'::jsonb;
