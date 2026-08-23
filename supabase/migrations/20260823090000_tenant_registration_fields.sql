-- Velden uit de registratiewizard (/welkom) op de tenant zelf, zodat de
-- diersoort en contactgegevens overal in de app beschikbaar zijn via
-- useStore().species / .terms, in plaats van alleen in user_metadata.
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS species VARCHAR(30);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS breed VARCHAR(120);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS animal_count VARCHAR(30);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS litters_per_year VARCHAR(30);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS street VARCHAR(255);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS zipcode VARCHAR(20);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS city VARCHAR(120);
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS country VARCHAR(120);

-- Bestaande fokkerijen (zoals Wendy's Dream) fokten tot nu toe alleen katten.
UPDATE public.tenants SET species = 'katten' WHERE species IS NULL;
