-- Lista de espera de kalmaa.io
-- Proyecto de Supabase «Kalmaa» (ref apxiouzucdqkbfvcvsle, región eu-central-1, Fráncfort).
-- Aplicada el 10 nov 2026 como migración «create_waitlist».
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  instagram text,
  source text,
  template text,
  consent boolean not null default false,
  -- Versión del texto de la casilla que aceptó la persona (prueba del consentimiento, art. 7.1 RGPD).
  consent_version text
);

comment on table public.waitlist is 'Lista de espera de kalmaa.io. Se borra según la política de privacidad (baja, 12 meses tras el lanzamiento o 18 meses desde la inscripción).';

-- Sin acceso público: solo escribe el servidor con la service role key.
alter table public.waitlist enable row level security;
revoke all on public.waitlist from anon, authenticated;
