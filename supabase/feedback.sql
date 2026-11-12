-- Feedback von Besuchern. Einmal im Supabase SQL Editor ausführen (New query → einfügen → Run); kann gefahrlos wiederholt werden.
-- Setzt statistik.sql voraus (Tabelle admins). Nur Admins können Feedback lesen.

create table if not exists public.feedback (
  id         bigint generated always as identity primary key,
  art        text not null check (art in ('idee', 'fehler', 'daten', 'sonstiges')),
  nachricht  text not null check (char_length(nachricht) between 5 and 2000),
  kontakt    text not null default '' check (char_length(kontakt) <= 200),
  seite      text not null default '' check (char_length(seite) <= 200),
  user_id    uuid references auth.users (id) on delete set null,
  erledigt   boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;   -- keine Richtlinien: Zugriff nur über die Funktionen unten

-- Senden: jeder Besucher, auch ohne Konto; höchstens 300 Nachrichten pro Stunde insgesamt (Schutz vor Spam)
create or replace function public.feedback_senden(art text, nachricht text, kontakt text default '', seite text default '') returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.feedback where created_at > now() - interval '1 hour') >= 300 then return false; end if;
  insert into public.feedback (art, nachricht, kontakt, seite, user_id)
    values (art, trim(nachricht), left(trim(coalesce(kontakt, '')), 200), left(coalesce(seite, ''), 200), (select auth.uid()));
  return true;
end $$;
revoke all on function public.feedback_senden(text, text, text, text) from public;
grant execute on function public.feedback_senden(text, text, text, text) to anon, authenticated;

-- Lesen, abhaken, löschen: nur Konten in public.admins
create or replace function public.feedback_liste() returns table (id bigint, art text, nachricht text, kontakt text, seite text, autor text, erledigt boolean, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select f.id, f.art, f.nachricht, f.kontakt, f.seite, coalesce(p.username, ''), f.erledigt, f.created_at
  from public.feedback f left join public.profil p on p.user_id = f.user_id
  where exists (select 1 from public.admins where user_id = (select auth.uid()))
  order by f.erledigt, f.created_at desc limit 200;
$$;
create or replace function public.feedback_erledigt(eintrag bigint, wert boolean) returns void
language sql security definer set search_path = '' as $$
  update public.feedback set erledigt = wert where id = eintrag and exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
create or replace function public.feedback_loeschen(eintrag bigint) returns void
language sql security definer set search_path = '' as $$
  delete from public.feedback where id = eintrag and exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.feedback_liste() from public, anon;
revoke all on function public.feedback_erledigt(bigint, boolean) from public, anon;
revoke all on function public.feedback_loeschen(bigint) from public, anon;
grant execute on function public.feedback_liste() to authenticated;
grant execute on function public.feedback_erledigt(bigint, boolean) to authenticated;
grant execute on function public.feedback_loeschen(bigint) to authenticated;
