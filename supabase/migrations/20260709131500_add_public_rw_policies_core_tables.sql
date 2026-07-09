-- Voeg publieke lees/schrijf-policies toe aan de kern-tabellen.
-- Reden: RLS staat aan maar deze tabellen hadden geen policies, waardoor de app
-- (die via de anon key schrijft) een "row-level security policy" fout kreeg bij
-- het opslaan van o.a. nestjes, katten/kittens en documenten.
--
-- Let op: hiermee zijn deze tabellen publiek schrijfbaar via de anon key. De
-- bescherming zit in de /admin-routeguard. Wil je strenger beveiligen, beperk dan
-- de INSERT/UPDATE/DELETE-policies tot (auth.role() = 'authenticated').

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
