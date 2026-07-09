-- Algemene (interne) notities per kat — voor de administrator.
CREATE TABLE IF NOT EXISTS public.cat_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cat_id UUID REFERENCES public.cats(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    note_date DATE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.cat_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_all" ON public.cat_notes;
CREATE POLICY "public_all" ON public.cat_notes FOR ALL USING (true) WITH CHECK (true);

-- Vul tenant_id automatisch in (indien de trigger-functie bestaat).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_tenant_id') THEN
    DROP TRIGGER IF EXISTS trg_set_tenant ON public.cat_notes;
    CREATE TRIGGER trg_set_tenant BEFORE INSERT ON public.cat_notes
      FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
  END IF;
END $$;
