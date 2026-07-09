-- Rolonderscheid rechtzetten: alleen de platform-eigenaar is superadmin.
-- (Bij de fundering-migratie werden alle bestaande accounts superadmin gezet.)

UPDATE public.profiles SET is_superadmin = FALSE;

UPDATE public.profiles p
SET is_superadmin = TRUE
FROM auth.users u
WHERE p.user_id = u.id
  AND lower(u.email) = 'tomjo118735@gmail.com';

-- Zorg dat de superadmin sowieso een profiel heeft (ook zonder eigen cattery).
INSERT INTO public.profiles (user_id, tenant_id, role, is_superadmin, name)
SELECT u.id, NULL, 'superadmin', TRUE, 'Superadmin'
FROM auth.users u
WHERE lower(u.email) = 'tomjo118735@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET is_superadmin = TRUE;
