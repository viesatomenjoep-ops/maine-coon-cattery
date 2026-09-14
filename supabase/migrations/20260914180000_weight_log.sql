-- Het weeglogboek zoals Willem het op papier bijhoudt.
--
-- Op zijn blad staat meer dan alleen gewichten: wanneer de poes gedekt is,
-- en bij welke weegdag iets bijzonders gebeurde ("voeding extra", "eerste
-- ontworming"). Dat kon nergens heen; nu wel.

-- 1. De dekking. Het weegblad begint bij de dekdatum, want vanaf dat moment
--    wordt de moeder gewogen — het startgewicht van de dracht.
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS mating_date DATE;
ALTER TABLE public.litters ADD COLUMN IF NOT EXISTS mating_time VARCHAR(10);

-- 2. Notitie bij een weegdag. Geldt voor de hele weegronde van dat nestje,
--    net als de aantekening in de kantlijn van het papieren blad.
CREATE TABLE IF NOT EXISTS public.weight_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    litter_id UUID REFERENCES public.litters(id) ON DELETE CASCADE,
    note_date DATE NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Eén notitie per nestje per dag: opnieuw opslaan overschrijft de vorige.
CREATE UNIQUE INDEX IF NOT EXISTS weight_notes_litter_date_idx
  ON public.weight_notes (litter_id, note_date);

ALTER TABLE public.weight_notes ENABLE ROW LEVEL SECURITY;

-- Zelfde afscherming als de rest: je ziet alleen je eigen fokkerij.
DROP POLICY IF EXISTS "tenant_rw" ON public.weight_notes;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'current_tenant_id') THEN
    EXECUTE $p$
      CREATE POLICY "tenant_rw" ON public.weight_notes FOR ALL
        USING (tenant_id = public.current_tenant_id() OR public.is_superadmin())
        WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_superadmin())
    $p$;
  ELSE
    EXECUTE 'CREATE POLICY "tenant_rw" ON public.weight_notes FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- Vul tenant_id automatisch in (indien de trigger-functie bestaat).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_tenant_id') THEN
    DROP TRIGGER IF EXISTS trg_set_tenant ON public.weight_notes;
    CREATE TRIGGER trg_set_tenant BEFORE INSERT ON public.weight_notes
      FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
  END IF;
END $$;
