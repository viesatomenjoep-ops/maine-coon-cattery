-- Geplande vervolgbehandeling (ontworming / inenting / check) per kat.
-- Zo kunnen we een agenda + herinneringen tonen in het dashboard en portaal.

ALTER TABLE public.vaccinations ADD COLUMN IF NOT EXISTS next_due_date DATE;
