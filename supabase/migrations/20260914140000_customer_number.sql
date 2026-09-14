-- Elke klant krijgt een eigen, oplopend nummer binnen de fokkerij.
-- Het nummer wordt in de database zelf toegekend, zodat er nooit twee
-- klanten hetzelfde nummer kunnen krijgen — ook niet als je twee tabbladen
-- tegelijk open hebt staan.
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS customer_no INTEGER;

-- Bestaande klanten krijgen met terugwerkende kracht een nummer,
-- op volgorde van aanmaken, per fokkerij.
WITH genummerd AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY tenant_id ORDER BY created_at, id) AS nr
  FROM public.customers
  WHERE customer_no IS NULL
)
UPDATE public.customers c
SET customer_no = g.nr
FROM genummerd g
WHERE c.id = g.id;

-- Nieuwe klanten krijgen het eerstvolgende vrije nummer binnen hun fokkerij.
CREATE OR REPLACE FUNCTION public.set_customer_no()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.customer_no IS NULL THEN
    SELECT COALESCE(MAX(customer_no), 0) + 1
      INTO NEW.customer_no
      FROM public.customers
     WHERE tenant_id IS NOT DISTINCT FROM NEW.tenant_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_customer_no ON public.customers;
CREATE TRIGGER trg_customer_no
  BEFORE INSERT ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_customer_no();

-- Binnen één fokkerij mag een nummer maar één keer voorkomen.
CREATE UNIQUE INDEX IF NOT EXISTS customers_tenant_no_uniq
  ON public.customers (tenant_id, customer_no)
  WHERE customer_no IS NOT NULL;
