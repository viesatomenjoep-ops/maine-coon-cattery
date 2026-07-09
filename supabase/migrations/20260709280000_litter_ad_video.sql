-- Eén advertentievideo per nestje (met public_id + uploaddatum voor auto-opruiming na 1 jaar).
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS ad_video JSONB;
