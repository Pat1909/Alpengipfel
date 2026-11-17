-- Benachrichtigungen, Profilbilder und Auszeichnungen.
-- Einmal im Supabase SQL Editor ausführen (New query → einfügen → Run); kann gefahrlos wiederholt werden.
-- Setzt suche.sql voraus.

-- 1. Profilbild (Datei im Speicher "fotos", eigener Ordner) und erreichte Auszeichnungen
alter table public.profil add column if not exists bild text;
alter table public.profil add column if not exists abzeichen text[] not null default '{}';

create or replace function public.profil_bild_setzen(pfad text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if pfad is not null and pfad !~ ('^' || auth.uid()::text || '/[A-Za-z0-9_-]{6,60}\.(jpg|webp)$') then raise exception 'Ungültiger Pfad'; end if;
  update public.profil set bild = pfad where user_id = auth.uid();
end $$;
revoke all on function public.profil_bild_setzen(text) from public, anon;
grant execute on function public.profil_bild_setzen(text) to authenticated;

create or replace function public.abzeichen_setzen(liste text[]) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  if cardinality(liste) > 300 or exists (select 1 from unnest(liste) a where a !~ '^[a-z0-9_:.-]{1,40}$') then raise exception 'Ungültig'; end if;
  update public.profil set abzeichen = liste where user_id = auth.uid();
end $$;
revoke all on function public.abzeichen_setzen(text[]) from public, anon;
grant execute on function public.abzeichen_setzen(text[]) to authenticated;

-- Profilbilder zu einer Liste von Benutzernamen (für Touren, Kommentare, Likes, Suche)
create or replace function public.profilbilder(namen text[]) returns table (username text, bild text)
language sql stable security definer set search_path = '' as $$
  select p.username, p.bild from public.profil p
  where p.bild is not null and lower(p.username) = any (select lower(x) from unnest(namen[1:300]) x);
$$;
revoke all on function public.profilbilder(text[]) from public;
grant execute on function public.profilbilder(text[]) to anon, authenticated;

-- Profil: jetzt mit Bild und Auszeichnungen
create or replace function public.nutzer_profil(name text) returns json
language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'user_id', p.user_id, 'username', p.username, 'seit', p.created_at, 'privat', p.privat, 'bild', p.bild, 'abzeichen', p.abzeichen,
    'follower', (select count(*) from public.folgen where folgt = p.user_id and bestaetigt),
    'folgt', (select count(*) from public.folgen where follower = p.user_id and bestaetigt),
    'touren', (select count(*) from public.beitraege where user_id = p.user_id and sichtbar),
    'gipfel', coalesce((select count(*) from public.gipfelbuch g, jsonb_object_keys(coalesce(g.data -> 'done', '{}'::jsonb)) k where g.user_id = p.user_id), 0),
    'status', (select case when f.bestaetigt then 'folgt' else 'angefragt' end from public.folgen f where f.follower = (select auth.uid()) and f.folgt = p.user_id),
    'sichtbar', public.darf_sehen(p.user_id),
    'anfragen', case when p.user_id = (select auth.uid()) then (select count(*) from public.folgen where folgt = p.user_id and not bestaetigt) else 0 end)
  from public.profil p where lower(p.username) = lower(name);
$$;
revoke all on function public.nutzer_profil(text) from public;
grant execute on function public.nutzer_profil(text) to anon, authenticated;

-- 2. Benachrichtigungen: Like, Kommentar, neuer Follower, Follower-Anfrage, Anfrage angenommen
create table if not exists public.benachrichtigungen (
  id         bigint generated always as identity primary key,
  empfaenger uuid not null references auth.users (id) on delete cascade,
  von        uuid references auth.users (id) on delete cascade,
  art        text not null check (art in ('like', 'kommentar', 'folgt', 'anfrage', 'angenommen')),
  beitrag_id uuid references public.beitraege (id) on delete cascade,
  text       text not null default '',
  gelesen    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists benachrichtigungen_empfaenger on public.benachrichtigungen (empfaenger, created_at desc);
alter table public.benachrichtigungen enable row level security;   -- Zugriff nur über die Funktionen unten

create or replace function public.benachrichtigen(an uuid, wer uuid, was text, beitrag uuid, txt text) returns void
language sql security definer set search_path = '' as $$
  insert into public.benachrichtigungen (empfaenger, von, art, beitrag_id, text)
  select an, wer, was, beitrag, left(coalesce(txt, ''), 140) where an is not null and an <> wer;
$$;
revoke all on function public.benachrichtigen(uuid, uuid, text, uuid, text) from public, anon, authenticated;

create or replace function public.bn_like() returns trigger
language plpgsql security definer set search_path = '' as $$
declare b record;
begin
  select user_id, titel into b from public.beitraege where id = new.beitrag_id;
  delete from public.benachrichtigungen where art = 'like' and von = new.user_id and beitrag_id = new.beitrag_id;   -- kein Spam durch an/aus
  perform public.benachrichtigen(b.user_id, new.user_id, 'like', new.beitrag_id, b.titel);
  return null;
end $$;
drop trigger if exists bn_like on public.beitrag_likes;
create trigger bn_like after insert on public.beitrag_likes for each row execute function public.bn_like();

create or replace function public.bn_kommentar() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.benachrichtigen((select user_id from public.beitraege where id = new.beitrag_id), new.user_id, 'kommentar', new.beitrag_id, new.text);
  return null;
end $$;
drop trigger if exists bn_kommentar on public.kommentare;
create trigger bn_kommentar after insert on public.kommentare for each row execute function public.bn_kommentar();

create or replace function public.bn_folgen() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    delete from public.benachrichtigungen where art in ('folgt', 'anfrage') and von = new.follower and empfaenger = new.folgt;
    perform public.benachrichtigen(new.folgt, new.follower, case when new.bestaetigt then 'folgt' else 'anfrage' end, null, '');
  elsif tg_op = 'UPDATE' and new.bestaetigt and not old.bestaetigt then
    delete from public.benachrichtigungen where art = 'anfrage' and von = new.follower and empfaenger = new.folgt;
    perform public.benachrichtigen(new.follower, new.folgt, 'angenommen', null, '');
  elsif tg_op = 'DELETE' then                          -- entfolgt oder Anfrage abgelehnt/zurückgezogen
    delete from public.benachrichtigungen where art in ('folgt', 'anfrage') and von = old.follower and empfaenger = old.folgt;
  end if;
  return null;
end $$;
drop trigger if exists bn_folgen on public.folgen;
create trigger bn_folgen after insert or update or delete on public.folgen for each row execute function public.bn_folgen();

-- Lesen (neueste 60, mit Name und Bild des Absenders und Tour-Titel), Zahl der ungelesenen, alle als gelesen markieren
create or replace function public.benachrichtigungen_liste() returns table (id bigint, art text, username text, bild text, beitrag_id uuid, gipfel bigint, text text, gelesen boolean, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select n.id, n.art, p.username, p.bild, n.beitrag_id, b.gipfel, n.text, n.gelesen, n.created_at
  from public.benachrichtigungen n left join public.profil p on p.user_id = n.von left join public.beitraege b on b.id = n.beitrag_id
  where n.empfaenger = (select auth.uid()) order by n.created_at desc limit 60;
$$;
create or replace function public.benachrichtigungen_neu() returns integer
language sql stable security definer set search_path = '' as $$
  select count(*)::integer from public.benachrichtigungen where empfaenger = (select auth.uid()) and not gelesen;
$$;
create or replace function public.benachrichtigungen_gelesen() returns void
language sql security definer set search_path = '' as $$
  update public.benachrichtigungen set gelesen = true where empfaenger = (select auth.uid()) and not gelesen;
  delete from public.benachrichtigungen where empfaenger = (select auth.uid()) and created_at < now() - interval '90 days';
$$;
revoke all on function public.benachrichtigungen_liste() from public, anon;
revoke all on function public.benachrichtigungen_neu() from public, anon;
revoke all on function public.benachrichtigungen_gelesen() from public, anon;
grant execute on function public.benachrichtigungen_liste() to authenticated;
grant execute on function public.benachrichtigungen_neu() to authenticated;
grant execute on function public.benachrichtigungen_gelesen() to authenticated;
