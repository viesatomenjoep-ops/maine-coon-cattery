-- ==============================================================================
-- RUN DIT SCRIPT IN DE SQL EDITOR VAN JOUW SUPABASE DASHBOARD
-- ==============================================================================

-- 1. Create the site_content table
CREATE TABLE IF NOT EXISTS public.site_content (
  key text PRIMARY KEY,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT current_timestamp,
  updated_at timestamp with time zone DEFAULT current_timestamp
);

-- 2. Enable Row Level Security
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Everyone can view site content (for the public frontend)
CREATE POLICY "Public can view site content"
ON public.site_content FOR SELECT
USING (true);

-- Only admins can update or insert site content
CREATE POLICY "Admins can insert site content"
ON public.site_content FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update site content"
ON public.site_content FOR UPDATE
USING (auth.role() = 'authenticated');

-- 4. Set up an initial empty JSON for the homepage if it doesn't exist
INSERT INTO public.site_content (key, content)
VALUES ('homepage_nl', '{}'::jsonb)
ON CONFLICT (key) DO NOTHING;
