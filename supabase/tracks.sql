-- GPX-Tracks von Nutzern. Einmal im Supabase SQL Editor ausführen (New query → einfügen → Run); kann gefahrlos wiederholt werden.
-- Setzt gipfelbuch.sql und statistik.sql voraus (Tabellen profil und admins).

-- 1. Tracks: vereinfachter Verlauf ohne Zeitstempel, sichtbar für alle, solange nicht ausgeblendet
create table if not exists public.tracks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade default auth.uid(),
  autor      text not null default '',
  gipfel     bigint not null,                                   -- OpenStreetMap-Knoten des Gipfels
  name       text not null check (char_length(name) between 3 and 80),
  art        smallint not null check (art between 0 and 3),     -- 0 Wandern, 1 Hochalpin, 2 Klettersteig, 3 Skitour
  kommentar  text not null default '' check (char_length(kommentar) <= 500),
  km         real not null check (km > 0 and km < 100),
  hm_auf     integer not null check (hm_auf >= 0 and hm_auf < 10000),
  hm_ab      integer not null default 0 check (hm_ab >= 0 and hm_ab < 10000),
  punkte     jsonb not null check (jsonb_typeof(punkte) = 'array' and jsonb_array_length(punkte) between 2 and 3000),   -- [[lat, lon, höhe], ...]
  sichtbar   boolean not null default true,                     -- auf false setzen, um neue Tracks erst nach Freigabe zu zeigen
  created_at timestamptz not null default now()
);
create index if not exists tracks_gipfel on public.tracks (gipfel);
alter table public.tracks enable row level security;
drop policy if exists "sichtbare Tracks lesen" on public.tracks;
drop policy if exists "eigene Tracks lesen" on public.tracks;
drop policy if exists "eigene Tracks anlegen" on public.tracks;
drop policy if exists "eigene Tracks löschen" on public.tracks;
create policy "sichtbare Tracks lesen" on public.tracks for select to anon, authenticated using (sichtbar);
create policy "eigene Tracks lesen" on public.tracks for select to authenticated using ((select auth.uid()) = user_id);
create policy "eigene Tracks anlegen" on public.tracks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "eigene Tracks löschen" on public.tracks for delete to authenticated using ((select auth.uid()) = user_id);
grant select on public.tracks to anon, authenticated;
grant insert (gipfel, name, art, kommentar, km, hm_auf, hm_ab, punkte) on public.tracks to authenticated;
grant delete on public.tracks to authenticated;

-- Der Autor wird aus dem Profil übernommen, nicht vom Browser; höchstens 20 Tracks je Nutzer und Tag
create or replace function public.track_autor() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.tracks where user_id = new.user_id and created_at > now() - interval '1 day') >= 20 then
    raise exception 'Zu viele Tracks heute';
  end if;
  new.autor := coalesce((select username from public.profil where user_id = new.user_id), '');
  new.sichtbar := true;
  return new;
end $$;
drop trigger if exists track_autor on public.tracks;
create trigger track_autor before insert on public.tracks for each row execute function public.track_autor();

-- 2. Meldungen: jeder (auch ohne Konto) kann einen Track mit Grund melden
create table if not exists public.track_meldungen (
  id         bigint generated always as identity primary key,
  track_id   uuid not null references public.tracks (id) on delete cascade,
  grund      text not null check (char_length(grund) between 3 and 500),
  created_at timestamptz not null default now()
);
alter table public.track_meldungen enable row level security;   -- keine Richtlinien: nur über die Funktionen
create or replace function public.track_melden(track uuid, text_grund text) returns void
language sql security definer set search_path = '' as $$
  insert into public.track_meldungen (track_id, grund)
  select track, left(trim(text_grund), 500) where exists (select 1 from public.tracks where id = track)
    and (select count(*) from public.track_meldungen where created_at > now() - interval '1 hour') < 200;
$$;
revoke all on function public.track_melden(uuid, text) from public;
grant execute on function public.track_melden(uuid, text) to anon, authenticated;

-- 3. Für Admins (public.admins): gemeldete Tracks ansehen, Tracks löschen
create or replace function public.track_meldungen_liste() returns table (track_id uuid, gipfel bigint, name text, autor text, grund text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select m.track_id, t.gipfel, t.name, t.autor, m.grund, m.created_at from public.track_meldungen m join public.tracks t on t.id = m.track_id
  where exists (select 1 from public.admins where user_id = (select auth.uid())) order by m.created_at desc limit 100;
$$;
create or replace function public.track_entfernen(track uuid) returns void
language sql security definer set search_path = '' as $$
  delete from public.tracks where id = track and (user_id = (select auth.uid()) or exists (select 1 from public.admins where user_id = (select auth.uid())));
$$;
create or replace function public.meldung_erledigt(track uuid) returns void
language sql security definer set search_path = '' as $$
  delete from public.track_meldungen where track_id = track and exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.track_meldungen_liste() from public, anon;
revoke all on function public.track_entfernen(uuid) from public, anon;
revoke all on function public.meldung_erledigt(uuid) from public, anon;
grant execute on function public.track_meldungen_liste() to authenticated;
grant execute on function public.track_entfernen(uuid) to authenticated;
grant execute on function public.meldung_erledigt(uuid) to authenticated;
