-- Schéma Supabase pour la table messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  content text not null,
  solution_md text,
  solution_pdf text,
  solution_audio text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table des utilisateurs
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  is_premium boolean default false,
  gemini_api_key text -- clé API Gemini par utilisateur
);

-- Table des jumeaux numériques (IA locale par utilisateur)
create table if not exists digital_twins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  config jsonb, -- configuration IA personnalisée
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Table de monitoring IA (usage, facturation)
create table if not exists ia_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  action text,
  tokens_used int,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
