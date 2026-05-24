-- =====================================================================
-- Studio Studjoow · Archivage des projets (sécurité suppression)
-- Archivé = sort de la liste, le client/collaborateur n'y a plus accès.
-- Suppression définitive seulement depuis les archives (côté UI).
-- À coller dans l'éditeur SQL Supabase. Idempotent.
-- =====================================================================

alter table public.projects add column if not exists archived_at timestamptz;

-- Un projet archivé n'est visible que par un admin global ou un « studjoow » du projet.
drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects for select
  using (
    public.is_member(id)
    and (archived_at is null or public.is_admin() or public.member_role(id) = 'studjoow')
  );
