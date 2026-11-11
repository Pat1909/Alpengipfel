-- Einmal im Supabase-Projekt ausführen (SQL Editor → New query → einfügen → Run). Kann gefahrlos wiederholt werden.

-- 1. Gipfelbücher: eine Zeile je Nutzer, nur für diesen Nutzer les- und schreibbar
create table if not exists public.gipfelbuch (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{"done": {}, "wish": {}}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.gipfelbuch enable row level security;
drop policy if exists "eigenes Gipfelbuch lesen" on public.gipfelbuch;
drop policy if exists "eigenes Gipfelbuch anlegen" on public.gipfelbuch;
drop policy if exists "eigenes Gipfelbuch ändern" on public.gipfelbuch;
create policy "eigenes Gipfelbuch lesen" on public.gipfelbuch
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "eigenes Gipfelbuch anlegen" on public.gipfelbuch
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "eigenes Gipfelbuch ändern" on public.gipfelbuch
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select, insert, update on public.gipfelbuch to authenticated;

-- 2. Benutzernamen: je Konto einer, ohne Beachtung der Groß-/Kleinschreibung eindeutig
create table if not exists public.profil (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  username   text not null check (username ~ '^[A-Za-z0-9_.-]{3,20}$'),
  created_at timestamptz not null default now()
);
create unique index if not exists profil_username_eindeutig on public.profil (lower(username));
alter table public.profil enable row level security;
drop policy if exists "eigenes Profil lesen" on public.profil;
create policy "eigenes Profil lesen" on public.profil
  for select to authenticated using ((select auth.uid()) = user_id);
grant select on public.profil to authenticated;

-- Beim Anlegen eines Kontos wird der gewählte Benutzername eingetragen.
-- Ist er ungültig oder schon vergeben, scheitert die Registrierung als Ganzes.
create or replace function public.neues_konto() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profil (user_id, username) values (new.id, trim(new.raw_user_meta_data ->> 'username'));
  return new;
end $$;
drop trigger if exists neues_konto on auth.users;
create trigger neues_konto after insert on auth.users for each row execute function public.neues_konto();

-- Auskunft für das Registrierungsformular: Ist dieser Benutzername noch frei?
create or replace function public.username_frei(name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select not exists (select 1 from public.profil where lower(username) = lower(trim(name)));
$$;
revoke all on function public.username_frei(text) from public;
grant execute on function public.username_frei(text) to anon, authenticated;

-- 3. Konto löschen: Ein angemeldeter Nutzer kann sein eigenes Konto entfernen; Gipfelbuch und Profil werden mitgelöscht.
create or replace function public.konto_loeschen() returns void
language sql security definer set search_path = '' as $$
  delete from auth.users where id = (select auth.uid());
$$;
revoke all on function public.konto_loeschen() from public, anon;
grant execute on function public.konto_loeschen() to authenticated;
