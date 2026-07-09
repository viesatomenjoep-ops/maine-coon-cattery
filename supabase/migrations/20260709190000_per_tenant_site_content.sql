-- Per-tenant website-content: elke cattery heeft zijn eigen homepage-content
-- onder dezelfde key. Zo krijgt iedere fokker een eigen (aanvankelijk blanco) site.

-- Van één globale key naar uniek per (tenant, key). Idempotent (veilig herhaalbaar).
ALTER TABLE public.site_content DROP CONSTRAINT IF EXISTS site_content_pkey;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4();
UPDATE public.site_content SET id = uuid_generate_v4() WHERE id IS NULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.site_content'::regclass AND contype = 'p'
  ) THEN
    ALTER TABLE public.site_content ADD PRIMARY KEY (id);
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS site_content_tenant_key_unique ON public.site_content (tenant_id, key);
