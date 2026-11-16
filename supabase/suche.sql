-- Nutzer suchen und sehen, wer eine Tour geliked hat.
-- Einmal im Supabase SQL Editor ausführen (New query → einfügen → Run); kann gefahrlos wiederholt werden.
-- Setzt privat.sql voraus.

-- 1. Nutzer suchen: Benutzername enthält den Suchtext (mindestens 2 Zeichen), höchstens 20 Treffer
create or replace function public.nutzer_suchen(q text) returns table (username text, privat boolean, touren bigint)
language sql stable security definer set search_path = '' as $$
  select p.username, p.privat, (select count(*) from public.beitraege b where b.user_id = p.user_id and b.sichtbar)
  from public.profil p
  where char_length(trim(q)) >= 2
    and p.username ilike '%' || replace(replace(replace(trim(q), '\', '\\'), '%', '\%'), '_', '\_') || '%'
  order by (lower(p.username) = lower(trim(q))) desc, (p.username ilike replace(replace(replace(trim(q), '\', '\\'), '%', '\%'), '_', '\_') || '%') desc, p.username
  limit 20;
$$;
revoke all on function public.nutzer_suchen(text) from public;
grant execute on function public.nutzer_suchen(text) to anon, authenticated;

-- 2. Wer hat geliked: nur für Besucher, die den Beitrag sehen dürfen; neueste zuerst
alter table public.beitrag_likes add column if not exists created_at timestamptz not null default now();
create or replace function public.likes_liste(beitrag uuid) returns table (username text, created_at timestamptz)
language sql stable security definer set search_path = '' as $$
  select p.username, l.created_at from public.beitrag_likes l
  join public.beitraege b on b.id = l.beitrag_id
  join public.profil p on p.user_id = l.user_id
  where l.beitrag_id = beitrag and b.sichtbar and public.darf_sehen(b.user_id)
  order by l.created_at desc limit 500;
$$;
revoke all on function public.likes_liste(uuid) from public;
grant execute on function public.likes_liste(uuid) to anon, authenticated;
