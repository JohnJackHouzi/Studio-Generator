-- =====================================================================
-- Studio Studjoow · Phase 4 : boucle de validation client
-- Annotations façon Figma, notifications, statut de validation, sécurité.
-- À coller dans l'éditeur SQL Supabase. Idempotent.
-- =====================================================================

-- Dimension « validation client », séparée du statut éditorial (status).
-- en_attente | valide | a_modifier
alter table public.plan_items add column if not exists validation text not null default 'en_attente';

-- Épingles d'annotation sur un post (position en % sur une slide donnée).
create table if not exists public.annotations (
  id uuid primary key default gen_random_uuid(),
  plan_item_id uuid not null references public.plan_items(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  slide_index int not null default 0,
  x real not null default 50,
  y real not null default 50,
  body text not null default '',
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

-- Notifications (cloche). Créées côté serveur (service_role).
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  plan_item_id uuid references public.plan_items(id) on delete set null,
  kind text not null default 'info',
  body text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists annotations_item_idx on public.annotations(plan_item_id);
create index if not exists notifications_user_unread_idx on public.notifications(user_id) where read = false;

-- ---------- RLS ----------
alter table public.annotations   enable row level security;
alter table public.notifications enable row level security;

drop policy if exists annot_select on public.annotations;
create policy annot_select on public.annotations for select using (public.is_member(project_id));
drop policy if exists annot_insert on public.annotations;
create policy annot_insert on public.annotations for insert with check (public.is_member(project_id));
drop policy if exists annot_update on public.annotations;
create policy annot_update on public.annotations for update using (public.is_member(project_id));
drop policy if exists annot_delete on public.annotations;
create policy annot_delete on public.annotations for delete using (public.is_admin() or public.member_role(project_id) = 'studjoow' or author_id = auth.uid());

-- Notifications : chacun ne voit/modifie que les siennes (création = service_role).
drop policy if exists notif_select on public.notifications;
create policy notif_select on public.notifications for select using (user_id = auth.uid());
drop policy if exists notif_update on public.notifications;
create policy notif_update on public.notifications for update using (user_id = auth.uid());

-- ---------- Sécurité : un client ne peut que valider / demander une modif ----------
-- Écriture plan_items resserrée : pas d'insert ni delete pour les clients.
drop policy if exists plan_write on public.plan_items;
drop policy if exists plan_insert on public.plan_items;
create policy plan_insert on public.plan_items for insert
  with check (public.is_member(project_id) and coalesce(public.member_role(project_id), '') <> 'client');
drop policy if exists plan_update on public.plan_items;
create policy plan_update on public.plan_items for update
  using (public.is_member(project_id));
drop policy if exists plan_delete on public.plan_items;
create policy plan_delete on public.plan_items for delete
  using (public.is_member(project_id) and (public.is_admin() or coalesce(public.member_role(project_id), '') <> 'client'));

-- Un client en UPDATE ne peut changer QUE la colonne validation.
create or replace function public.guard_plan_items()
returns trigger language plpgsql security definer set search_path = public as $$
declare r project_role;
begin
  if public.is_admin() then return new; end if;
  select role into r from public.project_members where project_id = new.project_id and user_id = auth.uid();
  if r = 'client' then
    if new.title is distinct from old.title
       or new.slides is distinct from old.slides
       or new.caption is distinct from old.caption
       or new.date is distinct from old.date
       or new."time" is distinct from old."time"
       or new.cat is distinct from old.cat
       or new.cta is distinct from old.cta
       or new.status is distinct from old.status then
      raise exception 'Un client ne peut que valider ou demander une modification.';
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists plan_items_guard on public.plan_items;
create trigger plan_items_guard before update on public.plan_items
  for each row execute function public.guard_plan_items();
