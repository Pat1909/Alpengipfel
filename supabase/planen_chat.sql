-- Gruppenchat für geplante Touren (enthält auch die Korrektur aus planen_fix.sql).
-- Einmal im Supabase SQL Editor ausführen (New query → einfügen → Run); kann gefahrlos wiederholt werden.
-- Setzt planen.sql voraus.

-- Korrektur: der Besitzer darf seinen Plan immer lesen (sonst schlägt das Anlegen fehl)
drop policy if exists "Pläne lesen" on public.plaene;
create policy "Pläne lesen" on public.plaene for select to authenticated using (owner = (select auth.uid()) or public.plan_mitglied(id));

-- 1. Nachrichten
create table if not exists public.plan_nachrichten (
  id         bigint generated always as identity primary key,
  plan_id    uuid not null references public.plaene (id) on delete cascade,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  text       text not null check (char_length(text) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists plan_nachrichten_plan on public.plan_nachrichten (plan_id, created_at);
alter table public.plan_nachrichten enable row level security;
drop policy if exists "Nachrichten lesen" on public.plan_nachrichten;
drop policy if exists "Nachrichten schreiben" on public.plan_nachrichten;
drop policy if exists "eigene Nachrichten löschen" on public.plan_nachrichten;
create policy "Nachrichten lesen" on public.plan_nachrichten for select to authenticated using (public.plan_mitglied(plan_id));
create policy "Nachrichten schreiben" on public.plan_nachrichten for insert to authenticated with check (public.plan_mitglied(plan_id) and user_id = (select auth.uid()));
create policy "eigene Nachrichten löschen" on public.plan_nachrichten for delete to authenticated using (user_id = (select auth.uid()));
grant select, delete on public.plan_nachrichten to authenticated;
grant insert (plan_id, text) on public.plan_nachrichten to authenticated;

-- höchstens 60 Nachrichten je Person und Stunde; alle anderen der Gruppe bekommen eine Benachrichtigung (je Plan nur eine ungelesene)
alter table public.benachrichtigungen drop constraint if exists benachrichtigungen_art_check;
alter table public.benachrichtigungen add constraint benachrichtigungen_art_check check (art in ('like', 'kommentar', 'folgt', 'anfrage', 'angenommen', 'plan', 'zusage', 'nachricht'));
create or replace function public.plan_nachricht_neu() returns trigger
language plpgsql security definer set search_path = '' as $$
declare t text;
begin
  if (select count(*) from public.plan_nachrichten where user_id = new.user_id and created_at > now() - interval '1 hour') > 60 then raise exception 'Zu viele Nachrichten'; end if;
  select titel into t from public.plaene where id = new.plan_id;
  delete from public.benachrichtigungen where art = 'nachricht' and plan_id = new.plan_id and not gelesen and empfaenger <> new.user_id;
  insert into public.benachrichtigungen (empfaenger, von, art, plan_id, text)
    select m, new.user_id, 'nachricht', new.plan_id, left(t || ': ' || new.text, 140)
    from (select owner m from public.plaene where id = new.plan_id
          union select user_id from public.plan_teilnehmer where plan_id = new.plan_id and status = 'zugesagt') g
    where m <> new.user_id;
  return null;
end $$;
drop trigger if exists plan_nachricht_neu on public.plan_nachrichten;
create trigger plan_nachricht_neu after insert on public.plan_nachrichten for each row execute function public.plan_nachricht_neu();

-- 2. Live: neue Nachrichten erscheinen sofort (Supabase Realtime; die Leseregel oben gilt auch dort)
do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'plan_nachrichten') then
    alter publication supabase_realtime add table public.plan_nachrichten;
  end if;
end $$;
