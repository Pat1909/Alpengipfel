-- Private Profile: Touren nur für bestätigte Follower, Follower-Anfragen annehmen oder ablehnen.
-- Profilzahl „Gipfel erreicht“ aus dem Gipfelbuch.
-- Einmal im Supabase SQL Editor ausführen (New query → einfügen → Run); kann gefahrlos wiederholt werden.
-- Setzt social.sql voraus.

alter table public.profil add column if not exists privat boolean not null default false;
alter table public.folgen add column if not exists bestaetigt boolean not null default true;

-- Darf der angemeldete Besucher die Inhalte dieses Nutzers sehen?
create or replace function public.darf_sehen(autor uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select autor = (select auth.uid())
    or not coalesce((select privat from public.profil where user_id = autor), false)
    or exists (select 1 from public.folgen where folgt = autor and follower = (select auth.uid()) and bestaetigt)
    or exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.darf_sehen(uuid) from public;
grant execute on function public.darf_sehen(uuid) to anon, authenticated;

drop policy if exists "sichtbare Beiträge lesen" on public.beitraege;
create policy "sichtbare Beiträge lesen" on public.beitraege for select to anon, authenticated
  using (sichtbar and public.darf_sehen(user_id));
-- Kommentare: die Regel prüft den Beitrag, der damit ebenfalls nur für Berechtigte sichtbar ist

-- Öffentlich oder privat schalten; beim Wechsel auf öffentlich werden offene Anfragen angenommen
create or replace function public.profil_privat_setzen(p boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Nicht angemeldet'; end if;
  update public.profil set privat = p where user_id = auth.uid();
  if not p then update public.folgen set bestaetigt = true where folgt = auth.uid() and not bestaetigt; end if;
end $$;
revoke all on function public.profil_privat_setzen(boolean) from public, anon;
grant execute on function public.profil_privat_setzen(boolean) to authenticated;

-- Folgen: bei privaten Profilen wird daraus eine Anfrage. Ergebnis: status 'folgt', 'angefragt' oder 'keine'
drop function if exists public.folgen_umschalten(uuid);
create function public.folgen_umschalten(ziel uuid) returns json
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); st text;
begin
  if uid is null then raise exception 'Nicht angemeldet'; end if;
  if ziel = uid then raise exception 'Sich selbst folgen geht nicht'; end if;
  delete from public.folgen where follower = uid and folgt = ziel;
  if found then st := 'keine';
  else
    if (select count(*) from public.folgen where follower = uid) >= 2000 then raise exception 'Zu viele'; end if;
    insert into public.folgen (follower, folgt, bestaetigt)
      select uid, ziel, not p.privat from public.profil p where p.user_id = ziel;
    st := case when (select privat from public.profil where user_id = ziel) then 'angefragt' else 'folgt' end;
  end if;
  return json_build_object('status', st, 'follower', (select count(*) from public.folgen where folgt = ziel and bestaetigt));
end $$;
revoke all on function public.folgen_umschalten(uuid) from public, anon;
grant execute on function public.folgen_umschalten(uuid) to authenticated;

-- Offene Anfragen an mich, und annehmen / ablehnen; Follower entfernen
create or replace function public.anfragen_liste() returns table (user_id uuid, username text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select f.follower, p.username, f.created_at from public.folgen f join public.profil p on p.user_id = f.follower
  where f.folgt = (select auth.uid()) and not f.bestaetigt order by f.created_at desc limit 200;
$$;
create or replace function public.anfrage_beantworten(von uuid, annehmen boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if annehmen then update public.folgen set bestaetigt = true where follower = von and folgt = auth.uid();
  else delete from public.folgen where follower = von and folgt = auth.uid(); end if;
end $$;
revoke all on function public.anfragen_liste() from public, anon;
revoke all on function public.anfrage_beantworten(uuid, boolean) from public, anon;
grant execute on function public.anfragen_liste() to authenticated;
grant execute on function public.anfrage_beantworten(uuid, boolean) to authenticated;

-- Profil: Zahlen (Gipfel aus dem Gipfelbuch), privat, Beziehung des Besuchers, ob die Touren sichtbar sind
create or replace function public.nutzer_profil(name text) returns json
language sql stable security definer set search_path = '' as $$
  select json_build_object(
    'user_id', p.user_id, 'username', p.username, 'seit', p.created_at, 'privat', p.privat,
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
