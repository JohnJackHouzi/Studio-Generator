-- =====================================================================
-- Studio Studjoow · schéma initial (V2 : auth + projets partagés)
-- À coller tel quel dans l'éditeur SQL Supabase du projet « studio ».
-- Idempotent : peut être ré-exécuté sans casser.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Types ----------
do $$ begin
  create type project_role as enum ('studjoow', 'collaborator', 'client');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_status as enum ('idée', 'à valider', 'prêt', 'publié');
exception when duplicate_object then null; end $$;

-- ---------- Tables ----------

-- Profils : extension de auth.users (créé automatiquement à l'inscription)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  is_admin boolean not null default false,   -- true = Studjoow (toi), voit tout
  created_at timestamptz not null default now()
);

-- Projets : un client = sa charte complète en JSON
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,                  -- slug stable (ex. « pause-feel-good »)
  name text not null,
  charte jsonb not null default '{}'::jsonb,  -- categories, ctas, voice, logo, postiz, fonts…
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Membres d'un projet (qui, quel rôle)
create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role project_role not null default 'collaborator',
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

-- Invitations par email (avant que la personne ait un compte)
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  email text not null,
  role project_role not null default 'collaborator',
  invited_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique (project_id, email)
);

-- Calendrier éditorial partagé
create table if not exists public.plan_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null default 'Post',
  day text,
  cat text,
  cta text,
  slides jsonb not null default '[]'::jsonb,
  caption text,
  date date,
  "time" text,
  status plan_status not null default 'à valider',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Carrousels sauvegardés
create table if not exists public.drafts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  cat text,
  slides jsonb not null default '[]'::jsonb,
  outputs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists plan_items_project_idx on public.plan_items(project_id);
create index if not exists drafts_project_idx on public.drafts(project_id);
create index if not exists project_members_user_idx on public.project_members(user_id);
create index if not exists invites_email_idx on public.invites(lower(email));

-- ---------- Fonctions d'aide (security definer = pas de récursion RLS) ----------

create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_member(p uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.project_members m
    where m.project_id = p and m.user_id = auth.uid()
  );
$$;

create or replace function public.member_role(p uuid)
returns project_role language sql security definer stable set search_path = public as $$
  select role from public.project_members
  where project_id = p and user_id = auth.uid();
$$;

-- ---------- Déclencheurs ----------

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Le créateur d'un projet en devient membre « studjoow »
create or replace function public.add_owner_membership()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.owner_id is not null then
    insert into public.project_members (project_id, user_id, role)
    values (new.id, new.owner_id, 'studjoow')
    on conflict do nothing;
  end if;
  return new;
end; $$;

drop trigger if exists projects_owner_member on public.projects;
create trigger projects_owner_member after insert on public.projects
  for each row execute function public.add_owner_membership();

-- updated_at automatique
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists plan_items_touch on public.plan_items;
create trigger plan_items_touch before update on public.plan_items
  for each row execute function public.touch_updated_at();

-- ---------- Row Level Security ----------

alter table public.profiles        enable row level security;
alter table public.projects        enable row level security;
alter table public.project_members enable row level security;
alter table public.invites         enable row level security;
alter table public.plan_items      enable row level security;
alter table public.drafts          enable row level security;

-- profiles : chacun voit/édite son profil ; admin voit tout
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid());

-- projects : visibles si membre ; modifiables par studjoow/admin
drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects for select
  using (public.is_member(id));
drop policy if exists projects_insert on public.projects;
create policy projects_insert on public.projects for insert
  with check (auth.uid() is not null);
drop policy if exists projects_update on public.projects;
create policy projects_update on public.projects for update
  using (public.is_admin() or public.member_role(id) = 'studjoow');
drop policy if exists projects_delete on public.projects;
create policy projects_delete on public.projects for delete
  using (public.is_admin() or owner_id = auth.uid());

-- project_members : visibles par les membres ; gérés par studjoow/admin
drop policy if exists members_select on public.project_members;
create policy members_select on public.project_members for select
  using (public.is_member(project_id));
drop policy if exists members_write on public.project_members;
create policy members_write on public.project_members for all
  using (public.is_admin() or public.member_role(project_id) = 'studjoow')
  with check (public.is_admin() or public.member_role(project_id) = 'studjoow');

-- invites : gérées par studjoow/admin du projet
drop policy if exists invites_manage on public.invites;
create policy invites_manage on public.invites for all
  using (public.is_admin() or public.member_role(project_id) = 'studjoow')
  with check (public.is_admin() or public.member_role(project_id) = 'studjoow');

-- plan_items : lecture + écriture pour les membres du projet
--   (le verrouillage « client = statut seulement » arrivera en Phase 4)
drop policy if exists plan_select on public.plan_items;
create policy plan_select on public.plan_items for select
  using (public.is_member(project_id));
drop policy if exists plan_write on public.plan_items;
create policy plan_write on public.plan_items for all
  using (public.is_member(project_id))
  with check (public.is_member(project_id));

-- drafts : idem
drop policy if exists drafts_select on public.drafts;
create policy drafts_select on public.drafts for select
  using (public.is_member(project_id));
drop policy if exists drafts_write on public.drafts;
create policy drafts_write on public.drafts for all
  using (public.is_member(project_id))
  with check (public.is_member(project_id));
