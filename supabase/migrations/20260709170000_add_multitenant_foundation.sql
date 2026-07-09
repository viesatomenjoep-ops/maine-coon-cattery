-- FASE A: multi-tenant fundering. Elke fokkerij (cattery) = één "tenant".
-- Niet-brekend: bestaande data komt onder één eerste tenant, jouw login wordt
-- eraan gekoppeld als owner + superadmin. De strikte afscherming (RLS per tenant)
-- volgt in fase B.

-- 1. Tenants (catteries) en gebruikersprofielen.
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(120) UNIQUE,
    plan VARCHAR(50) DEFAULT 'trial',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    role VARCHAR(30) DEFAULT 'owner',
    is_superadmin BOOLEAN DEFAULT FALSE,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. tenant_id op alle datatabellen.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['litters','cats','customers','documents','media','vaccinations','cat_weights','timeline_updates','kitten_interests','site_content']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE', t);
  END LOOP;
END $$;

-- 3. Eerste tenant aanmaken + bestaande data en logins eraan koppelen.
DO $$
DECLARE first_tenant UUID;
DECLARE t text;
BEGIN
  SELECT id INTO first_tenant FROM public.tenants ORDER BY created_at LIMIT 1;
  IF first_tenant IS NULL THEN
    INSERT INTO public.tenants (name, slug, plan, status)
    VALUES ('Wendy''s Dream', 'wendys-dream', 'trial', 'active')
    RETURNING id INTO first_tenant;
  END IF;

  FOREACH t IN ARRAY ARRAY['litters','cats','customers','documents','media','vaccinations','cat_weights','timeline_updates','kitten_interests','site_content']
  LOOP
    EXECUTE format('UPDATE public.%I SET tenant_id = %L WHERE tenant_id IS NULL', t, first_tenant);
  END LOOP;

  -- Bestaande logins koppelen (eerste beheerder wordt superadmin).
  INSERT INTO public.profiles (user_id, tenant_id, role, is_superadmin, name)
  SELECT id, first_tenant, 'owner', TRUE, COALESCE(raw_user_meta_data->>'name', 'Beheerder')
  FROM auth.users
  ON CONFLICT (user_id) DO NOTHING;
END $$;

-- 4. Voorlopige publieke policies op de nieuwe tabellen (fase B vervangt dit
--    door strikte afscherming per tenant).
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['tenants','profiles']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "public_select" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "public_insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "public_update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "public_delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "public_select" ON public.%I FOR SELECT USING (true)', t);
    EXECUTE format('CREATE POLICY "public_insert" ON public.%I FOR INSERT WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "public_update" ON public.%I FOR UPDATE USING (true) WITH CHECK (true)', t);
    EXECUTE format('CREATE POLICY "public_delete" ON public.%I FOR DELETE USING (true)', t);
  END LOOP;
END $$;
