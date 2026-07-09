-- "Fix alles": zorg dat elk account een profiel + juiste cattery heeft, zodat
-- opslaan (RLS) werkt. Idempotent en veilig herhaalbaar.

-- 1. Elk auth-account een profiel geven (indien nog niet aanwezig).
INSERT INTO public.profiles (user_id, tenant_id, role, is_superadmin, name)
SELECT u.id, NULL, 'owner', FALSE, COALESCE(u.raw_user_meta_data->>'name', 'Beheerder')
FROM auth.users u
ON CONFLICT (user_id) DO NOTHING;

-- 2. Superadmin = uitsluitend tomjo118735@gmail.com.
UPDATE public.profiles SET is_superadmin = FALSE;
UPDATE public.profiles p SET is_superadmin = TRUE
FROM auth.users u
WHERE p.user_id = u.id AND lower(u.email) = 'tomjo118735@gmail.com';

-- 3. Tweede klant (tomvanbiene) krijgt een eigen cattery.
INSERT INTO public.tenants (name, slug, plan, status)
SELECT 'Cattery tomvanbiene', 'tomvanbiene', 'trial', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.tenants WHERE slug = 'tomvanbiene');

UPDATE public.profiles p
SET tenant_id = (SELECT id FROM public.tenants WHERE slug = 'tomvanbiene' LIMIT 1)
FROM auth.users u
WHERE p.user_id = u.id AND lower(u.email) = 'tomvanbiene@gmail.com';

-- 4. Alle overige eigenaren zonder cattery (o.a. Willem) -> Wendy's Dream (eerste cattery).
UPDATE public.profiles
SET tenant_id = (SELECT id FROM public.tenants ORDER BY created_at LIMIT 1)
WHERE tenant_id IS NULL AND is_superadmin = FALSE;

-- 5. Iedereen krijgt de 'admin'-rol (elk account beheert zijn eigen cattery).
UPDATE auth.users
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb;
