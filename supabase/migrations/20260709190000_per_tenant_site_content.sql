-- Per-tenant website-content: elke cattery heeft zijn eigen homepage-content
-- onder dezelfde key. Zo krijgt iedere fokker een eigen (aanvankelijk blanco) site.

-- Van één globale key naar uniek per (tenant, key).
ALTER TABLE public.site_content DROP CONSTRAINT IF EXISTS site_content_pkey;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS id UUID DEFAULT uuid_generate_v4();
UPDATE public.site_content SET id = uuid_generate_v4() WHERE id IS NULL;
ALTER TABLE public.site_content ADD PRIMARY KEY (id);
DROP INDEX IF EXISTS site_content_tenant_key_unique;
ALTER TABLE public.site_content DROP CONSTRAINT IF EXISTS site_content_tenant_key_unique;
CREATE UNIQUE INDEX site_content_tenant_key_unique ON public.site_content (tenant_id, key);
