-- Community, Teil 2: mehrere Gipfel je Tour mit „erreicht“-Haken, Nutzerprofile, Folgen, Kommentare.
-- Einmal im Supabase SQL Editor ausführen (New query → einfügen → Run); kann gefahrlos wiederholt werden.
-- Setzt community.sql voraus.

-- 1. Mehrere Gipfel je Tour: gipfel = erster Gipfel, gipfel_weitere = die übrigen, erreicht = die tatsächlich bestiegenen
alter table public.beitraege add column if not exists gipfel_weitere bigint[] not null default '{}';
alter table public.beitraege add column if not exists erreicht bigint[] not null default '{}';
alter table public.beitraege add column if not exists kommentare integer not null default 0;
alter table public.beitraege drop constraint if exists beitraege_gipfel_weitere_anzahl;
alter table public.beitraege add constraint beitraege_gipfel_weitere_anzahl check (cardinality(gipfel_weitere) <= 9);
create index if not exists beitraege_weitere on public.beitraege using gin (gipfel_weitere);
create index if not exists beitraege_nutzer on public.beitraege (user_id, created_at desc);
grant insert (gipfel_weitere, erreicht) on public.beitraege to authenticated;

create or replace function public.beitrag_pruefen() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.beitraege where user_id = new.user_id and created_at > now() - interval '1 day') >= 10 then
    raise exception 'Zu viele Beiträge heute';
  end if;
  if exists (select 1 from unnest(new.fotos) f where f !~ ('^' || new.user_id::text || '/[A-Za-z0-9_-]{6,60}\.(jpg|webp)$')) then
    raise exception 'Ungültiger Fotopfad';
  end if;
  new.gipfel_weitere := coalesce(array(select distinct g from unnest(new.gipfel_weitere) g where g <> new.gipfel), '{}');
  new.erreicht := coalesce(array(select distinct e from unnest(new.erreicht) e where e = new.gipfel or e = any(new.gipfel_weitere)), '{}');
  new.autor := coalesce((select username from public.profil where user_id = new.user_id), '');
  new.likes := 0; new.kommentare := 0; new.sichtbar := true;
  return new;
end $$;

-- 2. Folgen: wer wem folgt; jeder sieht, wem er selbst folgt, die Zahlen stehen im öffentlichen Profil
create table if not exists public.folgen (
  follower   uuid not null default auth.uid() references auth.users (id) on delete cascade,
  folgt      uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower, folgt),
  check (follower <> folgt)
);
create index if not exists folgen_folgt on public.folgen (folgt);
alter table public.folgen enable row level security;
drop policy if exists "eigenes Folgen lesen" on public.folgen;
create policy "eigenes Folgen lesen" on public.folgen for select to authenticated using ((select auth.uid()) = follower);
grant select on public.folgen to authenticated;
create or replace function public.folgen_umschalten(ziel uuid) returns json
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); jetzt boolean;
begin
  if uid is null then raise exception 'Nicht angemeldet'; end if;
  if ziel = uid then raise exception 'Sich selbst folgen geht nicht'; end if;
  delete from public.folgen where follower = uid and folgt = ziel;
  jetzt := not found;
  if jetzt then
    if (select count(*) from public.folgen where follower = uid) >= 2000 then raise exception 'Zu viele'; end if;
    insert into public.folgen (follower, folgt) select uid, ziel where exists (select 1 from public.profil where user_id = ziel);
  end if;
  return json_build_object('folge', jetzt, 'follower', (select count(*) from public.folgen where folgt = ziel));
end $$;
revoke all on function public.folgen_umschalten(uuid) from public, anon;
grant execute on function public.folgen_umschalten(uuid) to authenticated;

-- 3. Öffentliches Profil: Benutzername, dabei seit, Zahlen (das Gipfelbuch selbst bleibt privat)
create or replace function public.nutzer_profil(name text) returns json
language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'user_id', p.user_id, 'username', p.username, 'seit', p.created_at,
    'follower', (select count(*) from public.folgen where folgt = p.user_id),
    'folgt', (select count(*) from public.folgen where follower = p.user_id),
    'touren', (select count(*) from public.beitraege where user_id = p.user_id and sichtbar),
    'gipfel', (select count(distinct e) from public.beitraege b, unnest(b.erreicht) e where b.user_id = p.user_id and b.sichtbar),
    'ich_folge', exists (select 1 from public.folgen where follower = (select auth.uid()) and folgt = p.user_id))
  from public.profil p where lower(p.username) = lower(name);
$$;
revoke all on function public.nutzer_profil(text) from public;
grant execute on function public.nutzer_profil(text) to anon, authenticated;

-- 4. Kommentare zu Touren
create table if not exists public.kommentare (
  id         bigint generated always as identity primary key,
  beitrag_id uuid not null references public.beitraege (id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  autor      text not null default '',
  text       text not null check (char_length(text) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists kommentare_beitrag on public.kommentare (beitrag_id, created_at);
alter table public.kommentare enable row level security;
drop policy if exists "Kommentare sichtbarer Beiträge lesen" on public.kommentare;
drop policy if exists "eigene Kommentare schreiben" on public.kommentare;
create policy "Kommentare sichtbarer Beiträge lesen" on public.kommentare for select to anon, authenticated
  using (exists (select 1 from public.beitraege b where b.id = beitrag_id and b.sichtbar));
create policy "eigene Kommentare schreiben" on public.kommentare for insert to authenticated with check ((select auth.uid()) = user_id);
grant select on public.kommentare to anon, authenticated;
grant insert (beitrag_id, text) on public.kommentare to authenticated;

create or replace function public.kommentar_pruefen() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.kommentare where user_id = new.user_id and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'Zu viele Kommentare';
  end if;
  new.text := trim(new.text);
  new.autor := coalesce((select username from public.profil where user_id = new.user_id), '');
  return new;
end $$;
drop trigger if exists kommentar_pruefen on public.kommentare;
create trigger kommentar_pruefen before insert on public.kommentare for each row execute function public.kommentar_pruefen();

create or replace function public.kommentare_zaehlen() returns trigger
language plpgsql security definer set search_path = '' as $$
declare b uuid := coalesce(new.beitrag_id, old.beitrag_id);
begin
  update public.beitraege set kommentare = (select count(*) from public.kommentare where beitrag_id = b) where id = b;
  return null;
end $$;
drop trigger if exists kommentare_zaehlen on public.kommentare;
create trigger kommentare_zaehlen after insert or delete on public.kommentare for each row execute function public.kommentare_zaehlen();

-- Löschen: wer ihn geschrieben hat, wem die Tour gehört, oder ein Admin
create or replace function public.kommentar_loeschen(k bigint) returns void
language sql security definer set search_path = '' as $$
  delete from public.kommentare c where c.id = k and (
    c.user_id = (select auth.uid())
    or exists (select 1 from public.beitraege b where b.id = c.beitrag_id and b.user_id = (select auth.uid()))
    or exists (select 1 from public.admins where user_id = (select auth.uid())));
$$;
revoke all on function public.kommentar_loeschen(bigint) from public, anon;
grant execute on function public.kommentar_loeschen(bigint) to authenticated;
