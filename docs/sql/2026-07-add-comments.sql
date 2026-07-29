-- Commentaires publics sur les articles de voyage.
-- Les visiteurs anonymes peuvent LIRE tous les commentaires, mais l'INSERTION
-- passe uniquement par la route serveur /api/comments (clé service role) après
-- vérification du captcha Turnstile — aucune policy INSERT pour anon.
-- La suppression est réservée aux admins connectés (modération a posteriori).
-- À exécuter dans Supabase → SQL Editor.

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_trip_id_idx on public.comments (trip_id);

alter table public.comments enable row level security;

-- Lecture publique (affichage immédiat des commentaires)
drop policy if exists "comments_select_public" on public.comments;
create policy "comments_select_public" on public.comments
  for select to anon, authenticated using (true);

-- Suppression réservée aux admins connectés
create policy "comments_delete_admin" on public.comments
  for delete to authenticated using (true);

-- (aucune policy INSERT pour anon → insertion seulement via service role côté serveur)
