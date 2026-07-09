-- Fokdier-, kitten- en documentvelden toevoegen.
-- Reeds toegepast op het remote-project via de Supabase-integratie op 2026-07-09.

-- Litters: fokkerij-metadata
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS breed VARCHAR(255) DEFAULT 'Maine Coon (MCO)';
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'verwacht';
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS expected_count INTEGER;
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS sire_id UUID REFERENCES public.cats(id) ON DELETE SET NULL;
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS dam_id UUID REFERENCES public.cats(id) ON DELETE SET NULL;

-- Cats: fokdier- en kitten-metadata
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS registration_no VARCHAR(255);
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS ems_code VARCHAR(50);
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS breeder VARCHAR(255);
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS sire_name VARCHAR(255);
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS dam_name VARCHAR(255);
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS is_own_breeding_cat BOOLEAN DEFAULT FALSE;
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS birth_weight_g INTEGER;
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS reserved_by VARCHAR(255);

-- Documents: koppeling naar nestje + rijkere metadata
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS litter_id UUID REFERENCES public.litters(id) ON DELETE CASCADE;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS cloudinary_public_id TEXT;
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100);
