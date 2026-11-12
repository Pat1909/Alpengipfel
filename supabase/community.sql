-- Community: geteilte Touren mit Bericht, Fotos und optionalem GPX-Track, Likes, Meldungen.
-- Einmal im Supabase SQL Editor ausführen (New query → einfügen → Run); kann gefahrlos wiederholt werden.
-- Setzt gipfelbuch.sql und statistik.sql voraus (Tabellen profil und admins).

-- 1. Beiträge
create table if not exists public.beitraege (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  autor      text not null default '',
  gipfel     bigint not null,                                   -- OpenStreetMap-Knoten des Gipfels
  datum      date not null check (datum > date '1950-01-01' and datum <= current_date + 1),
  titel      text not null check (char_length(titel) between 3 and 80),
  text       text not null default '' check (char_length(text) <= 3000),
  art        smallint not null check (art between 0 and 3),     -- 0 Wandern, 1 Hochalpin, 2 Klettersteig, 3 Skitour
  dauer_min  integer check (dauer_min is null or dauer_min between 10 and 3000),
  km         real check (km is null or (km > 0 and km < 100)),
  hm_auf     integer check (hm_auf is null or (hm_auf >= 0 and hm_auf < 10000)),
  hm_ab      integer check (hm_ab is null or (hm_ab >= 0 and hm_ab < 10000)),
  punkte     jsonb check (punkte is null or (jsonb_typeof(punkte) = 'array' and jsonb_array_length(punkte) between 2 and 3000)),
  fotos      text[] not null default '{}' check (cardinality(fotos) <= 4),
  likes      integer not null default 0,
  sichtbar   boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists beitraege_neu on public.beitraege (created_at desc);
create index if not exists beitraege_gipfel on public.beitraege (gipfel);
alter table public.beitraege enable row level security;
drop policy if exists "sichtbare Beiträge lesen" on public.beitraege;
drop policy if exists "eigene Beiträge lesen" on public.beitraege;
drop policy if exists "eigene Beiträge anlegen" on public.beitraege;
drop policy if exists "eigene Beiträge löschen" on public.beitraege;
create policy "sichtbare Beiträge lesen" on public.beitraege for select to anon, authenticated using (sichtbar);
create policy "eigene Beiträge lesen" on public.beitraege for select to authenticated using ((select auth.uid()) = user_id);
create policy "eigene Beiträge anlegen" on public.beitraege for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "eigene Beiträge löschen" on public.beitraege for delete to authenticated using ((select auth.uid()) = user_id);
grant select on public.beitraege to anon, authenticated;
grant insert (gipfel, datum, titel, text, art, dauer_min, km, hm_auf, hm_ab, punkte, fotos) on public.beitraege to authenticated;
grant delete on public.beitraege to authenticated;

-- Autor aus dem Profil, Fotos nur aus dem eigenen Ordner, höchstens 10 Beiträge je Nutzer und Tag
create or replace function public.beitrag_pruefen() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.beitraege where user_id = new.user_id and created_at > now() - interval '1 day') >= 10 then
    raise exception 'Zu viele Beiträge heute';
  end if;
  if exists (select 1 from unnest(new.fotos) f where f !~ ('^' || new.user_id::text || '/[A-Za-z0-9_-]{6,60}\.(jpg|webp)$')) then
    raise exception 'Ungültiger Fotopfad';
  end if;
  new.autor := coalesce((select username from public.profil where user_id = new.user_id), '');
  new.likes := 0; new.sichtbar := true;
  return new;
end $$;
drop trigger if exists beitrag_pruefen on public.beitraege;
create trigger beitrag_pruefen before insert on public.beitraege for each row execute function public.beitrag_pruefen();

-- 2. Likes: je Nutzer und Beitrag einer, umschalten über eine Funktion
create table if not exists public.beitrag_likes (
  beitrag_id uuid not null references public.beitraege (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  primary key (beitrag_id, user_id)
);
alter table public.beitrag_likes enable row level security;
drop policy if exists "eigene Likes lesen" on public.beitrag_likes;
create policy "eigene Likes lesen" on public.beitrag_likes for select to authenticated using ((select auth.uid()) = user_id);
grant select on public.beitrag_likes to authenticated;
create or replace function public.like_umschalten(beitrag uuid) returns json
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); hat boolean; n integer;
begin
  if uid is null then raise exception 'Nicht angemeldet'; end if;
  delete from public.beitrag_likes where beitrag_id = beitrag and user_id = uid;
  hat := not found;
  if hat then insert into public.beitrag_likes (beitrag_id, user_id) values (beitrag, uid); end if;
  update public.beitraege set likes = (select count(*) from public.beitrag_likes where beitrag_id = beitrag) where id = beitrag returning likes into n;
  return json_build_object('likes', coalesce(n, 0), 'liked', hat);
end $$;
revoke all on function public.like_umschalten(uuid) from public, anon;
grant execute on function public.like_umschalten(uuid) to authenticated;

-- 3. Meldungen (auch ohne Konto) und Verwaltung für Admins
create table if not exists public.beitrag_meldungen (
  id         bigint generated always as identity primary key,
  beitrag_id uuid not null references public.beitraege (id) on delete cascade,
  grund      text not null check (char_length(grund) between 3 and 500),
  created_at timestamptz not null default now()
);
alter table public.beitrag_meldungen enable row level security;
create or replace function public.beitrag_melden(beitrag uuid, text_grund text) returns void
language sql security definer set search_path = '' as $$
  insert into public.beitrag_meldungen (beitrag_id, grund)
  select beitrag, left(trim(text_grund), 500) where exists (select 1 from public.beitraege where id = beitrag)
    and (select count(*) from public.beitrag_meldungen where created_at > now() - interval '1 hour') < 200;
$$;
create or replace function public.beitrag_meldungen_liste() returns table (beitrag_id uuid, gipfel bigint, titel text, autor text, grund text, fotos text[], created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select m.beitrag_id, b.gipfel, b.titel, b.autor, m.grund, b.fotos, m.created_at from public.beitrag_meldungen m join public.beitraege b on b.id = m.beitrag_id
  where exists (select 1 from public.admins where user_id = (select auth.uid())) order by m.created_at desc limit 100;
$$;
create or replace function public.beitrag_entfernen(beitrag uuid) returns void
language sql security definer set search_path = '' as $$
  delete from public.beitraege where id = beitrag and (user_id = (select auth.uid()) or exists (select 1 from public.admins where user_id = (select auth.uid())));
$$;
create or replace function public.beitrag_meldung_erledigt(beitrag uuid) returns void
language sql security definer set search_path = '' as $$
  delete from public.beitrag_meldungen where beitrag_id = beitrag and exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.beitrag_melden(uuid, text) from public;
grant execute on function public.beitrag_melden(uuid, text) to anon, authenticated;
revoke all on function public.beitrag_meldungen_liste() from public, anon;
revoke all on function public.beitrag_entfernen(uuid) from public, anon;
revoke all on function public.beitrag_meldung_erledigt(uuid) from public, anon;
grant execute on function public.beitrag_meldungen_liste() to authenticated;
grant execute on function public.beitrag_entfernen(uuid) to authenticated;
grant execute on function public.beitrag_meldung_erledigt(uuid) to authenticated;

-- 4. Fotos: öffentlicher Speicher "fotos", höchstens 1,5 MB je Bild, nur JPEG/WebP; jeder schreibt nur in seinen eigenen Ordner
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', true, 1572864, array['image/jpeg', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 1572864, allowed_mime_types = array['image/jpeg', 'image/webp'];
drop policy if exists "Fotos in eigenen Ordner hochladen" on storage.objects;
drop policy if exists "eigene Fotos löschen" on storage.objects;
drop policy if exists "Admins löschen Fotos" on storage.objects;
create policy "Fotos in eigenen Ordner hochladen" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "eigene Fotos löschen" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Admins löschen Fotos" on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and exists (select 1 from public.admins where user_id = (select auth.uid())));
drop policy if exists "Fotos lesen" on storage.objects;
create policy "Fotos lesen" on storage.objects for select using (bucket_id = 'fotos');
