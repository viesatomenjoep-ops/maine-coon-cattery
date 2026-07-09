-- Publieke deel-link per nestje + interesse-aanvragen van bezoekers.
-- Hiermee kan de fokker één advertentielink van een heel nestje delen (WhatsApp),
-- kan een geïnteresseerde een kitten kiezen, en verschijnt dat in het dashboard.

-- 1. Deel-token per nestje (uniek, publiek deelbaar).
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT uuid_generate_v4();
UPDATE public.litters SET share_token = uuid_generate_v4() WHERE share_token IS NULL;

-- 2. Interesse-aanvragen (leads) van bezoekers op de advertentiepagina.
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

-- 3. Publieke lees/schrijf-policy (app gebruikt de anon key; bescherming zit in de routeguard).
ALTER TABLE public.kitten_interests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select" ON public.kitten_interests;
DROP POLICY IF EXISTS "public_insert" ON public.kitten_interests;
DROP POLICY IF EXISTS "public_update" ON public.kitten_interests;
DROP POLICY IF EXISTS "public_delete" ON public.kitten_interests;
CREATE POLICY "public_select" ON public.kitten_interests FOR SELECT USING (true);
CREATE POLICY "public_insert" ON public.kitten_interests FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update" ON public.kitten_interests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public_delete" ON public.kitten_interests FOR DELETE USING (true);
