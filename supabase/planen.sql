-- Touren planen: Plan mit Gipfel und Datum, Gruppe per Einladung, persönliche Packlisten, Gruppenausrüstung, Checkliste.
-- Einmal im Supabase SQL Editor ausführen (New query → einfügen → Run); kann gefahrlos wiederholt werden.
-- Setzt benachrichtigungen.sql voraus.

-- 1. Pläne
create table if not exists public.plaene (
  id         uuid primary key default gen_random_uuid(),
  owner      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titel      text not null check (char_length(titel) between 3 and 80),
  gipfel     bigint,                                            -- OpenStreetMap-Knoten des Gipfels (freiwillig)
  datum      date,
  art        smallint not null default 0 check (art between 0 and 3),   -- 0 Wandern, 1 Hochalpin, 2 Klettersteig, 3 Skitour
  treffpunkt text not null default '' check (char_length(treffpunkt) <= 200),
  notiz      text not null default '' check (char_length(notiz) <= 2000),
  created_at timestamptz not null default now()
);
create index if not exists plaene_owner on public.plaene (owner);

-- 2. Teilnehmer: der Besitzer und Eingeladene (eingeladen, zugesagt, abgesagt)
create table if not exists public.plan_teilnehmer (
  plan_id    uuid not null references public.plaene (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  status     text not null default 'eingeladen' check (status in ('eingeladen', 'zugesagt', 'abgesagt')),
  created_at timestamptz not null default now(),
  primary key (plan_id, user_id)
);
create index if not exists plan_teilnehmer_user on public.plan_teilnehmer (user_id);

-- 3. Einträge: persönliche Gegenstände (gehören einer Person), Gruppenausrüstung (mit Zuständigem), Checkliste
create table if not exists public.plan_eintraege (
  id         bigint generated always as identity primary key,
  plan_id    uuid not null references public.plaene (id) on delete cascade,
  art        text not null check (art in ('persoenlich', 'gruppe', 'check')),
  user_id    uuid references auth.users (id) on delete set null,   -- persönlich: wessen Liste; Gruppe: wer es mitbringt
  text       text not null check (char_length(text) between 1 and 120),
  erledigt   boolean not null default false,
  erledigt_von uuid references auth.users (id) on delete set null,
  pos        integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists plan_eintraege_plan on public.plan_eintraege (plan_id, art, pos);

-- Wer gehört zum Plan? (Besitzer oder eingeladen/zugesagt)
create or replace function public.plan_mitglied(p uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.plaene where id = p and owner = (select auth.uid()))
      or exists (select 1 from public.plan_teilnehmer where plan_id = p and user_id = (select auth.uid()) and status <> 'abgesagt');
$$;
revoke all on function public.plan_mitglied(uuid) from public, anon;
grant execute on function public.plan_mitglied(uuid) to authenticated;

alter table public.plaene enable row level security;
alter table public.plan_teilnehmer enable row level security;
alter table public.plan_eintraege enable row level security;
drop policy if exists "Pläne lesen" on public.plaene;
drop policy if exists "Pläne anlegen" on public.plaene;
drop policy if exists "Pläne ändern" on public.plaene;
drop policy if exists "Pläne löschen" on public.plaene;
create policy "Pläne lesen" on public.plaene for select to authenticated using (public.plan_mitglied(id));
create policy "Pläne anlegen" on public.plaene for insert to authenticated with check ((select auth.uid()) = owner);
create policy "Pläne ändern" on public.plaene for update to authenticated using ((select auth.uid()) = owner) with check ((select auth.uid()) = owner);
create policy "Pläne löschen" on public.plaene for delete to authenticated using ((select auth.uid()) = owner);
grant select, delete on public.plaene to authenticated;
grant insert (titel, gipfel, datum, art, treffpunkt, notiz) on public.plaene to authenticated;
grant update (titel, gipfel, datum, art, treffpunkt, notiz) on public.plaene to authenticated;

drop policy if exists "Teilnehmer lesen" on public.plan_teilnehmer;
create policy "Teilnehmer lesen" on public.plan_teilnehmer for select to authenticated using (public.plan_mitglied(plan_id) or user_id = (select auth.uid()));
grant select on public.plan_teilnehmer to authenticated;

drop policy if exists "Einträge lesen" on public.plan_eintraege;
drop policy if exists "Einträge anlegen" on public.plan_eintraege;
drop policy if exists "Einträge ändern" on public.plan_eintraege;
drop policy if exists "Einträge löschen" on public.plan_eintraege;
create policy "Einträge lesen" on public.plan_eintraege for select to authenticated using (public.plan_mitglied(plan_id));
-- persönliche Gegenstände nur in die eigene Liste; Gruppe und Checkliste darf jedes Mitglied pflegen
create policy "Einträge anlegen" on public.plan_eintraege for insert to authenticated
  with check (public.plan_mitglied(plan_id) and (art <> 'persoenlich' or user_id = (select auth.uid())));
create policy "Einträge ändern" on public.plan_eintraege for update to authenticated
  using (public.plan_mitglied(plan_id) and (art <> 'persoenlich' or user_id = (select auth.uid())))
  with check (public.plan_mitglied(plan_id) and (art <> 'persoenlich' or user_id = (select auth.uid())));
create policy "Einträge löschen" on public.plan_eintraege for delete to authenticated
  using (public.plan_mitglied(plan_id) and (art <> 'persoenlich' or user_id = (select auth.uid())));
grant select, delete on public.plan_eintraege to authenticated;
grant insert (plan_id, art, user_id, text, erledigt, pos) on public.plan_eintraege to authenticated;
grant update (user_id, text, erledigt, pos) on public.plan_eintraege to authenticated;

-- Wer etwas abhakt, wird vermerkt; höchstens 300 Einträge je Plan
create or replace function public.plan_eintrag_pruefen() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' and (select count(*) from public.plan_eintraege where plan_id = new.plan_id) >= 300 then raise exception 'Zu viele Einträge'; end if;
  if tg_op = 'INSERT' or new.erledigt is distinct from old.erledigt then new.erledigt_von := case when new.erledigt then auth.uid() end; end if;
  if new.art = 'gruppe' and new.user_id is not null and not exists (
       select 1 from public.plaene where id = new.plan_id and owner = new.user_id
       union all select 1 from public.plan_teilnehmer where plan_id = new.plan_id and user_id = new.user_id) then
    raise exception 'Nicht in der Gruppe';
  end if;
  return new;
end $$;
drop trigger if exists plan_eintrag_pruefen on public.plan_eintraege;
create trigger plan_eintrag_pruefen before insert or update on public.plan_eintraege for each row execute function public.plan_eintrag_pruefen();

-- 4. Einladen (nur der Besitzer, per Benutzername), antworten, verlassen / entfernen
alter table public.benachrichtigungen add column if not exists plan_id uuid references public.plaene (id) on delete cascade;
alter table public.benachrichtigungen drop constraint if exists benachrichtigungen_art_check;
alter table public.benachrichtigungen add constraint benachrichtigungen_art_check check (art in ('like', 'kommentar', 'folgt', 'anfrage', 'angenommen', 'plan', 'zusage'));

create or replace function public.plan_einladen(p uuid, name text) returns text
language plpgsql security definer set search_path = '' as $$
declare ziel uuid; t text;
begin
  select titel into t from public.plaene where id = p and owner = auth.uid();
  if t is null then raise exception 'Nur wer den Plan angelegt hat, kann einladen'; end if;
  select user_id into ziel from public.profil where lower(username) = lower(trim(name));
  if ziel is null then return 'unbekannt'; end if;
  if ziel = auth.uid() then return 'selbst'; end if;
  if (select count(*) from public.plan_teilnehmer where plan_id = p) >= 20 then return 'voll'; end if;
  if exists (select 1 from public.plan_teilnehmer where plan_id = p and user_id = ziel) then
    update public.plan_teilnehmer set status = 'eingeladen' where plan_id = p and user_id = ziel and status = 'abgesagt';
  else
    insert into public.plan_teilnehmer (plan_id, user_id) values (p, ziel);
  end if;
  delete from public.benachrichtigungen where art = 'plan' and plan_id = p and empfaenger = ziel;
  insert into public.benachrichtigungen (empfaenger, von, art, plan_id, text) values (ziel, auth.uid(), 'plan', p, left(t, 140));
  return 'ok';
end $$;
create or replace function public.plan_antworten(p uuid, zusage boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare o uuid; t text;
begin
  update public.plan_teilnehmer set status = case when zusage then 'zugesagt' else 'abgesagt' end where plan_id = p and user_id = auth.uid();
  if not found then raise exception 'Keine Einladung'; end if;
  select owner, titel into o, t from public.plaene where id = p;
  if zusage then insert into public.benachrichtigungen (empfaenger, von, art, plan_id, text) values (o, auth.uid(), 'zusage', p, left(t, 140)); end if;
  delete from public.benachrichtigungen where art = 'plan' and plan_id = p and empfaenger = auth.uid();
end $$;
create or replace function public.plan_entfernen(p uuid, wer uuid) returns void   -- Besitzer entfernt jemanden, oder man verlässt den Plan selbst
language sql security definer set search_path = '' as $$
  delete from public.plan_teilnehmer t where t.plan_id = p and t.user_id = wer
    and (wer = (select auth.uid()) or exists (select 1 from public.plaene where id = p and owner = (select auth.uid())));
  delete from public.plan_eintraege e where e.plan_id = p and e.art = 'persoenlich' and e.user_id = wer
    and not exists (select 1 from public.plan_teilnehmer where plan_id = p and user_id = wer);
$$;
-- Gruppe eines Plans mit Benutzernamen und Bildern
create or replace function public.plan_gruppe(p uuid) returns table (user_id uuid, username text, bild text, status text, besitzer boolean)
language sql stable security definer set search_path = '' as $$
  select pl.owner, pr.username, pr.bild, 'zugesagt', true from public.plaene pl join public.profil pr on pr.user_id = pl.owner where pl.id = p and public.plan_mitglied(p)
  union all
  select t.user_id, pr.username, pr.bild, t.status, false from public.plan_teilnehmer t join public.profil pr on pr.user_id = t.user_id where t.plan_id = p and public.plan_mitglied(p)
  order by 5 desc, 2;
$$;
-- Meine Pläne (eigene und die, zu denen ich eingeladen bin)
create or replace function public.meine_plaene() returns table (id uuid, titel text, gipfel bigint, datum date, art smallint, owner_name text, mein_status text, personen bigint)
language sql stable security definer set search_path = '' as $$
  select pl.id, pl.titel, pl.gipfel, pl.datum, pl.art, pr.username,
    case when pl.owner = (select auth.uid()) then 'besitzer' else (select status from public.plan_teilnehmer where plan_id = pl.id and user_id = (select auth.uid())) end,
    1 + (select count(*) from public.plan_teilnehmer where plan_id = pl.id and status <> 'abgesagt')
  from public.plaene pl join public.profil pr on pr.user_id = pl.owner
  where pl.owner = (select auth.uid()) or exists (select 1 from public.plan_teilnehmer where plan_id = pl.id and user_id = (select auth.uid()) and status <> 'abgesagt')
  order by pl.datum nulls last, pl.created_at desc limit 200;
$$;
revoke all on function public.plan_einladen(uuid, text) from public, anon;
revoke all on function public.plan_antworten(uuid, boolean) from public, anon;
revoke all on function public.plan_entfernen(uuid, uuid) from public, anon;
revoke all on function public.plan_gruppe(uuid) from public, anon;
revoke all on function public.meine_plaene() from public, anon;
grant execute on function public.plan_einladen(uuid, text) to authenticated;
grant execute on function public.plan_antworten(uuid, boolean) to authenticated;
grant execute on function public.plan_entfernen(uuid, uuid) to authenticated;
grant execute on function public.plan_gruppe(uuid) to authenticated;
grant execute on function public.meine_plaene() to authenticated;

-- Benachrichtigungen: jetzt auch mit Plan
drop function if exists public.benachrichtigungen_liste();
create function public.benachrichtigungen_liste() returns table (id bigint, art text, username text, bild text, beitrag_id uuid, gipfel bigint, plan_id uuid, text text, gelesen boolean, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select n.id, n.art, p.username, p.bild, n.beitrag_id, b.gipfel, n.plan_id, n.text, n.gelesen, n.created_at
  from public.benachrichtigungen n left join public.profil p on p.user_id = n.von left join public.beitraege b on b.id = n.beitrag_id
  where n.empfaenger = (select auth.uid()) order by n.created_at desc limit 60;
$$;
revoke all on function public.benachrichtigungen_liste() from public, anon;
grant execute on function public.benachrichtigungen_liste() to authenticated;
