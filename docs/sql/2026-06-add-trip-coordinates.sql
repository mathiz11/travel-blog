-- Ajoute la localisation précise (lat/lng) aux voyages, pour le globe 3D de l'accueil.
-- À exécuter dans Supabase → SQL Editor.
alter table public.trips
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;
