-- ==============================================================================
-- RUN DIT SCRIPT IN DE SQL EDITOR VAN JOUW SUPABASE DASHBOARD
-- ==============================================================================

-- 1. Zorg dat pgcrypto is ingeschakeld (dit is nodig om het wachtwoord veilig te hashen)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Voeg het admin account toe
-- LET OP: Verander 'admin@cattery.nl' en 'JouwVeiligeWachtwoord123!' naar je eigen voorkeur!
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'admin@cattery.nl',
  crypt('JouwVeiligeWachtwoord123!', gen_salt('bf')),
  current_timestamp,
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}',
  current_timestamp,
  current_timestamp
);

-- 3. Maak de bijbehorende authenticatie-identiteit aan (vereist door Supabase)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT 
  uuid_generate_v4(), 
  id, 
  id, 
  format('{"sub":"%s","email":"%s"}', id::text, email)::jsonb, 
  'email', 
  current_timestamp, 
  current_timestamp, 
  current_timestamp 
FROM auth.users WHERE email = 'admin@cattery.nl';
