-- ==============================================================================
-- RUN DIT SCRIPT IN DE SQL EDITOR VAN JOUW SUPABASE DASHBOARD
-- ==============================================================================

-- 1. Create the cat_weights table
CREATE TABLE IF NOT EXISTS public.cat_weights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE,
    weigh_date DATE NOT NULL,
    weight_grams INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.cat_weights ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for cat_weights
-- Everyone can view (so customers can see the graph in the portal)
CREATE POLICY "Public can view cat weights"
ON public.cat_weights FOR SELECT
USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can insert cat weights"
ON public.cat_weights FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update cat weights"
ON public.cat_weights FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete cat weights"
ON public.cat_weights FOR DELETE
USING (auth.role() = 'authenticated');
