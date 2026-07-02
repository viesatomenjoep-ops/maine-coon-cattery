-- ==============================================================================
-- 1. DROP OUDE TABELLEN (ZODAT WE 100% SCHOON BEGINNEN)
-- Let op: Dit verwijdert alle bestaande data definitief!
-- ==============================================================================
DROP TABLE IF EXISTS public.site_content CASCADE;
DROP TABLE IF EXISTS public.media CASCADE;
DROP TABLE IF EXISTS public.timeline_updates CASCADE;
DROP TABLE IF EXISTS public.vaccinations CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.cat_weights CASCADE;
DROP TABLE IF EXISTS public.cats CASCADE;
DROP TABLE IF EXISTS public.litters CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;

-- ==============================================================================
-- 2. EXTENSIE VOOR UUIDs
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 3. MAAK ALLE TABELLEN OPNIEUW AAN (IN DE JUISTE VOLGORDE)
-- ==============================================================================

-- 3.1 KLANTEN (CUSTOMERS)
CREATE TABLE public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    email TEXT,
    whatsapp_number TEXT,
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3.2 NESTJES (LITTERS)
CREATE TABLE public.litters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    description TEXT,
    sire_name VARCHAR(255),
    dam_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.3 KATTEN (CATS)
CREATE TABLE public.cats (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.4 DOCUMENTEN (DOCUMENTS)
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE,
    document_type VARCHAR(50),
    file_url TEXT NOT NULL,
    notes TEXT,
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.5 VACCINATIES (VACCINATIONS)
CREATE TABLE public.vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255),
    batch_number VARCHAR(100),
    vaccination_date DATE,
    valid_until DATE,
    veterinarian_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.6 TIJDLIJN/NIEUWS UPDATES (TIMELINE_UPDATES)
CREATE TABLE public.timeline_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE,
    title VARCHAR(255),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.7 MEDIA/GALERIJ (MEDIA)
CREATE TABLE public.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE,
    litter_id UUID REFERENCES public.litters(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.8 GEWICHTEN & GROEICURVES (CAT_WEIGHTS)
CREATE TABLE public.cat_weights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE,
    weigh_date DATE NOT NULL,
    weight_grams INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.9 SITE CONTENT (HOMEPAGE TEXTS)
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
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

-- Klaar! De database is nu 100% goed geconfigureerd voor de gehele website, zonder neppe testdata.
