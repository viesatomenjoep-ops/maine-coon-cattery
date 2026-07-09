-- Cover-afbeelding voor nestjes.
-- Reeds toegepast op het remote-project via de Supabase-integratie op 2026-07-09.

ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
