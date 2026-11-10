-- Lista de espera de kalmaa.io
-- Se ejecuta una vez en el proyecto de Supabase de Kalmaa (SQL editor).
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  instagram text,
  source text,
  template text,
  consent boolean not null default false
);

-- Sin acceso público: solo escribe el servidor con la service role key.
alter table public.waitlist enable row level security;
