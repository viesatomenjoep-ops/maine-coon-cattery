-- Naam/label bij galerij- en mediabestanden.
ALTER TABLE public.media ADD COLUMN IF NOT EXISTS name TEXT;
