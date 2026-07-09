-- Behandeling kunnen afvinken als voltooid (stopt de herinnering).
ALTER TABLE public.vaccinations ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;
