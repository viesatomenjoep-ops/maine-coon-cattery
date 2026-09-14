-- Eigen afspraken op de agenda. Behandelingen, nestjes en verjaardagen komen
-- al uit bestaande tabellen; dit is voor alles wat een fokker zelf wil noteren
-- (dierenarts, show, bezichtiging, ophaalafspraak).
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    type VARCHAR(40) DEFAULT 'eigen',
    note TEXT,
    cat_id UUID REFERENCES public.cats(id) ON DELETE SET NULL,
    litter_id UUID REFERENCES public.litters(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS events_tenant_date_idx ON public.events (tenant_id, event_date);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Zelfde afscherming als de rest: je ziet alleen je eigen fokkerij.
DROP POLICY IF EXISTS "tenant_rw" ON public.events;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'current_tenant_id') THEN
    EXECUTE $p$
      CREATE POLICY "tenant_rw" ON public.events FOR ALL
        USING (tenant_id = public.current_tenant_id() OR public.is_superadmin())
        WITH CHECK (tenant_id = public.current_tenant_id() OR public.is_superadmin())
    $p$;
  ELSE
    EXECUTE 'CREATE POLICY "tenant_rw" ON public.events FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- Vul tenant_id automatisch in (indien de trigger-functie bestaat).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_tenant_id') THEN
    DROP TRIGGER IF EXISTS trg_set_tenant ON public.events;
    CREATE TRIGGER trg_set_tenant BEFORE INSERT ON public.events
      FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id();
  END IF;
END $$;
