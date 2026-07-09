-- FASE B: strikte afscherming per tenant (Row Level Security).
-- Vanaf nu ziet/wijzigt een ingelogde fokker via de app UITSLUITEND zijn eigen
-- data. Publieke pagina's (/k, /nestje, /portal) draaien via server-routes met
-- de service-role sleutel en blijven werken.

-- 1. Helpers: welke tenant hoort bij de ingelogde gebruiker, en is die superadmin?
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_superadmin FROM public.profiles WHERE user_id = auth.uid()), false);
$$;

-- 2. Datatabellen: vervang de publieke policies door tenant-afscherming.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['litters','cats','customers','documents','media','vaccinations','cat_weights','timeline_updates','kitten_interests']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "public_select" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "public_insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "public_update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "public_delete" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "tenant_all" ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY "tenant_all" ON public.%I FOR ALL TO authenticated
         USING (tenant_id = public.current_tenant_id() OR public.is_superadmin())
         WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_superadmin())', t);
  END LOOP;
END $$;

-- 3. site_content: openbaar leesbaar (website-teksten), schrijven per tenant.
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select" ON public.site_content;
DROP POLICY IF EXISTS "public_insert" ON public.site_content;
DROP POLICY IF EXISTS "public_update" ON public.site_content;
DROP POLICY IF EXISTS "public_delete" ON public.site_content;
DROP POLICY IF EXISTS "site_read" ON public.site_content;
DROP POLICY IF EXISTS "site_write" ON public.site_content;
CREATE POLICY "site_read" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "site_write" ON public.site_content FOR ALL TO authenticated
  USING (tenant_id = public.current_tenant_id() OR public.is_superadmin())
  WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_superadmin());

-- 4. profiles: je mag alleen je eigen profiel lezen (superadmin alles).
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select" ON public.profiles;
DROP POLICY IF EXISTS "public_insert" ON public.profiles;
DROP POLICY IF EXISTS "public_update" ON public.profiles;
DROP POLICY IF EXISTS "public_delete" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read" ON public.profiles;
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_superadmin());

-- 5. tenants: je mag alleen je eigen cattery lezen (superadmin alles).
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select" ON public.tenants;
DROP POLICY IF EXISTS "public_insert" ON public.tenants;
DROP POLICY IF EXISTS "public_update" ON public.tenants;
DROP POLICY IF EXISTS "public_delete" ON public.tenants;
DROP POLICY IF EXISTS "tenants_read" ON public.tenants;
CREATE POLICY "tenants_read" ON public.tenants FOR SELECT TO authenticated
  USING (id = public.current_tenant_id() OR public.is_superadmin());

-- push_subscriptions blijft server-only (RLS aan, geen policies → alleen service role).
