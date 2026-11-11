-- Einmal im Supabase-Projekt ausführen (SQL Editor → New query → einfügen → Run).
-- Legt die Tabelle für die Gipfelbücher an: eine Zeile je Nutzer, nur für diesen Nutzer les- und schreibbar.
create table if not exists public.gipfelbuch (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{"done": {}, "wish": {}}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.gipfelbuch enable row level security;

create policy "eigenes Gipfelbuch lesen" on public.gipfelbuch
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "eigenes Gipfelbuch anlegen" on public.gipfelbuch
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "eigenes Gipfelbuch ändern" on public.gipfelbuch
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

grant select, insert, update on public.gipfelbuch to authenticated;
