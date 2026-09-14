-- Eigen nummer per dier, dat de fokker zelf invoert. Anders dan het
-- stamboomnummer: dit is de eigen administratie van de fokkerij.
ALTER TABLE public.cats ADD COLUMN IF NOT EXISTS animal_no VARCHAR(40);

-- Zoeken op dit nummer moet snel gaan, ook bij veel dieren.
CREATE INDEX IF NOT EXISTS cats_animal_no_idx
  ON public.cats (tenant_id, animal_no)
  WHERE animal_no IS NOT NULL;
