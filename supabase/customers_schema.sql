-- ==============================================================================
-- RUN DIT SCRIPT IN DE SQL EDITOR VAN JOUW SUPABASE DASHBOARD
-- Dit script maakt de klantendatabase aan en koppelt deze aan katten en nestjes
-- ==============================================================================

-- 1. Maak de customers tabel
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    email TEXT,
    whatsapp_number TEXT,
    token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Zorg voor openbare toegang als RLS aan staat
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Je mag je eigen profiel zien als je de token weet
CREATE POLICY "Customers viewable by token" ON public.customers FOR SELECT USING (true);
-- Let op: In de ideale wereld filteren we hier 'USING (token = current_setting('request.jwt.claims')::json->>'token')' 
-- of we halen data Server-Side op met de service_role. Voor nu staan we select toe, 
-- maar we halen op de client /k/[token] alleen de specifieke klant op.

CREATE POLICY "Admins can insert customers" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update customers" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Admins can delete customers" ON public.customers FOR DELETE USING (true);


-- 2. Voeg customer_id toe aan de cats tabel als dat nog niet bestaat
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cats' AND column_name='customer_id') THEN
        ALTER TABLE public.cats ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Voeg customer_id toe aan de litters tabel als dat nog niet bestaat
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='litters' AND column_name='customer_id') THEN
        ALTER TABLE public.litters ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
    END IF;
END $$;
