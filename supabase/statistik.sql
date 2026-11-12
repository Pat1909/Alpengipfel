-- Besucherstatistik ohne Cookies und ohne IP-Adresse. Einmal im Supabase SQL Editor ausführen; kann gefahrlos wiederholt werden.

-- 1. Zähler: eine Zeile je Tag und Seite, nur die Anzahl
create table if not exists public.aufrufe (
  tag    date    not null,
  seite  text    not null,
  anzahl integer not null default 0,
  primary key (tag, seite)
);
alter table public.aufrufe enable row level security;   -- keine Richtlinien: niemand liest oder schreibt die Tabelle direkt

-- 2. Wer die Statistik sehen darf
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;
insert into public.admins (user_id)
  select id from auth.users where lower(raw_user_meta_data ->> 'username') = 'patrick'
  on conflict do nothing;

-- 3. Zählen: darf jeder Besucher aufrufen, nimmt nur einen kurzen Seitennamen an
create or replace function public.aufruf_zaehlen(seite text) returns void
language sql security definer set search_path = '' as $$
  insert into public.aufrufe (tag, seite, anzahl)
    select (now() at time zone 'Europe/Berlin')::date, seite, 1 where seite ~ '^[a-z0-9:_-]{1,40}$'
  on conflict (tag, seite) do update set anzahl = public.aufrufe.anzahl + 1;
$$;
revoke all on function public.aufruf_zaehlen(text) from public;
grant execute on function public.aufruf_zaehlen(text) to anon, authenticated;

-- 4. Auswerten: nur für Konten in public.admins
create or replace function public.ist_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
create or replace function public.aufrufe_statistik(tage integer default 30) returns table (tag date, seite text, anzahl integer)
language sql stable security definer set search_path = '' as $$
  select a.tag, a.seite, a.anzahl from public.aufrufe a
  where exists (select 1 from public.admins where user_id = (select auth.uid()))
    and a.tag > (now() at time zone 'Europe/Berlin')::date - tage
  order by a.tag;
$$;
revoke all on function public.ist_admin() from public, anon;
revoke all on function public.aufrufe_statistik(integer) from public, anon;
grant execute on function public.ist_admin() to authenticated;
grant execute on function public.aufrufe_statistik(integer) to authenticated;
