-- Foto van vader (sire) en moeder (dam) per nestje, voor op de advertentie.
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS sire_image_url TEXT;
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS dam_image_url TEXT;
