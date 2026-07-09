-- Kogelvrije oplossing: vul tenant_id automatisch in op basis van de ingelogde
-- gebruiker (via een BEFORE INSERT trigger). Zo slaagt opslaan altijd, ook als
-- de frontend de tenant_id (nog) niet meestuurt.

CREATE OR REPLACE FUNCTION public.set_tenant_id()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.tenant_id IS NULL THEN
    NEW.tenant_id := public.current_tenant_id();
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['litters','cats','customers','documents','media','vaccinations','cat_weights','timeline_updates','kitten_interests','site_content']
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_tenant ON public.%I', t);
    EXECUTE format('CREATE TRIGGER trg_set_tenant BEFORE INSERT ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_tenant_id()', t);
  END LOOP;
END $$;
