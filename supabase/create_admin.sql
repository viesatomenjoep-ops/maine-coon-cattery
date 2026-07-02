-- ==============================================================================
-- RUN DIT SCRIPT IN DE SQL EDITOR VAN JOUW SUPABASE DASHBOARD
-- ==============================================================================

-- Omdat het account 'tomjo118735@gmail.com' al bestaat in Supabase, 
-- hoeven we deze niet meer aan te maken (dat geeft een error). 
-- We hoeven dit bestaande account alleen de 'admin' rol te geven!

UPDATE auth.users
SET raw_user_meta_data = '{"role":"admin"}'
WHERE email = 'tomjo118735@gmail.com';
