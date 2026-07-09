-- ==============================================================================
-- 1. VEILIGHEID: dit script is NIET-DESTRUCTIEF.
-- Alle tabellen worden aangemaakt met CREATE TABLE IF NOT EXISTS, dus bestaande
-- data blijft behouden. Wil je bewust 100% opnieuw beginnen (ALLE DATA WEG),
-- draai dan handmatig de DROP TABLE ... CASCADE statements hieronder.
-- ==============================================================================
-- DROP TABLE IF EXISTS public.site_content CASCADE;
-- DROP TABLE IF EXISTS public.media CASCADE;
-- DROP TABLE IF EXISTS public.timeline_updates CASCADE;
-- DROP TABLE IF EXISTS public.vaccinations CASCADE;
-- DROP TABLE IF EXISTS public.documents CASCADE;
-- DROP TABLE IF EXISTS public.cat_weights CASCADE;
-- DROP TABLE IF EXISTS public.cats CASCADE;
-- DROP TABLE IF EXISTS public.litters CASCADE;
-- DROP TABLE IF EXISTS public.customers CASCADE;

-- ==============================================================================
-- 2. EXTENSIE VOOR UUIDs
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 3. MAAK ALLE TABELLEN OPNIEUW AAN (IN DE JUISTE VOLGORDE)
-- ==============================================================================

-- 3.1 KLANTEN (CUSTOMERS)
-- 3.0 MULTI-TENANT (FASE A): catteries + gebruikersprofielen
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

-- Alle datatabellen hieronder krijgen een tenant_id (zie migratie 20260709170000).

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    email TEXT,
    whatsapp_number TEXT,
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.2 NESTJES (LITTERS)
-- Let op: sire_id/dam_id verwijzen naar public.cats en worden onderaan dit
-- script via ALTER TABLE toegevoegd (cats bestaat pas na deze tabel).
CREATE TABLE IF NOT EXISTS public.litters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    description TEXT,
    sire_name VARCHAR(255),
    dam_name VARCHAR(255),
    breed VARCHAR(255) DEFAULT 'Maine Coon (MCO)',
    status VARCHAR(50) DEFAULT 'verwacht',
    expected_count INTEGER,
    cover_image_url TEXT,
    share_token UUID DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2b INTERESSE-AANVRAGEN (KITTEN_INTERESTS) — leads vanaf de publieke advertentielink
CREATE TABLE IF NOT EXISTS public.kitten_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE,
    litter_id UUID REFERENCES public.litters(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    message TEXT,
    status VARCHAR(30) DEFAULT 'nieuw',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.3 KATTEN (CATS) — bevat zowel fokdieren als kittens
CREATE TABLE IF NOT EXISTS public.cats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    litter_id UUID REFERENCES public.litters(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(50),
    color VARCHAR(255),
    pattern VARCHAR(255),
    chip_number VARCHAR(100),
    status VARCHAR(50) DEFAULT 'beschikbaar',
    price_nl NUMERIC(10, 2),
    price_be NUMERIC(10, 2),
    customer_nationality VARCHAR(5),
    cover_image TEXT,
    pedigree_data JSONB,
    secret_token_nl UUID DEFAULT uuid_generate_v4() UNIQUE,
    secret_token_be UUID DEFAULT uuid_generate_v4() UNIQUE,
    published BOOLEAN DEFAULT FALSE,
    customer_name VARCHAR(255),
    registration_no VARCHAR(255),
    ems_code VARCHAR(50),
    breeder VARCHAR(255),
    sire_name VARCHAR(255),
    dam_name VARCHAR(255),
    is_own_breeding_cat BOOLEAN DEFAULT FALSE,
    birth_weight_g INTEGER,
    reserved_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.4 DOCUMENTEN (DOCUMENTS)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE,
    litter_id UUID REFERENCES public.litters(id) ON DELETE CASCADE,
    document_type VARCHAR(50),
    title VARCHAR(255),
    file_url TEXT NOT NULL,
    cloudinary_public_id TEXT,
    mime_type VARCHAR(100),
    notes TEXT,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.5 VACCINATIES (VACCINATIONS)
CREATE TABLE IF NOT EXISTS public.vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255),
    batch_number VARCHAR(100),
    vaccination_date DATE,
    valid_until DATE,
    next_due_date DATE,
    veterinarian_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.6 TIJDLIJN/NIEUWS UPDATES (TIMELINE_UPDATES)
CREATE TABLE IF NOT EXISTS public.timeline_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.7 MEDIA/GALERIJ (MEDIA)
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE,
    litter_id UUID REFERENCES public.litters(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.8 GEWICHTEN & GROEICURVES (CAT_WEIGHTS)
CREATE TABLE IF NOT EXISTS public.cat_weights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE,
    weigh_date DATE NOT NULL,
    weight_grams INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.8b WEB PUSH ABONNEMENTEN (PUSH_SUBSCRIPTIONS)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.9 SITE CONTENT (HOMEPAGE TEXTS)
-- Per-tenant website-content: uniek op (tenant_id, key) — zie migratie 20260709190000.
CREATE TABLE IF NOT EXISTS public.site_content (
  key text,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT current_timestamp,
  updated_at timestamp with time zone DEFAULT current_timestamp
);
INSERT INTO public.site_content (key, content)
VALUES ('homepage_nl', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ==============================================================================
-- 4. ENABLE RLS (ROW LEVEL SECURITY) & POLICIES
-- ==============================================================================

-- We staan voor nu public read/write toe zodat de app via de anon key overal bij kan
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site content read access" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Site content write access" ON public.site_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Site content update access" ON public.site_content FOR UPDATE USING (true);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers viewable" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Admins can insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update customers" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Admins can delete customers" ON public.customers FOR DELETE USING (true);

ALTER TABLE public.cat_weights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view cat weights" ON public.cat_weights FOR SELECT USING (true);
CREATE POLICY "Admins can insert cat weights" ON public.cat_weights FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update cat weights" ON public.cat_weights FOR UPDATE USING (true);
CREATE POLICY "Admins can delete cat weights" ON public.cat_weights FOR DELETE USING (true);

-- Publieke lees/schrijf-policies voor de kern-tabellen (app schrijft via de anon key).
-- Let op: dit maakt de tabellen publiek schrijfbaar. Bescherming zit in de /admin-routeguard.
-- Wil je strenger: vervang using/with check door (auth.role() = 'authenticated') voor de
-- INSERT/UPDATE/DELETE-policies.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['litters','cats','documents','vaccinations','timeline_updates','media']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
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

-- ==============================================================================
-- 5. LITTERS ↔ CATS KOPPELING (Sire/Dam)
-- Wordt hier toegevoegd omdat cats pas na litters bestaat (circulaire referentie).
-- ==============================================================================
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS sire_id UUID REFERENCES public.cats(id) ON DELETE SET NULL;
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS dam_id UUID REFERENCES public.cats(id) ON DELETE SET NULL;

-- Klaar! De database is nu volledig geconfigureerd voor de gehele website.
