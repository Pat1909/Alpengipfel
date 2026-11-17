-- Korrektur für planen.sql: Beim Anlegen liest die App den neuen Plan sofort zurück. Die Leseregel prüfte nur über
-- plan_mitglied(), und diese Funktion sieht einen Plan im selben Befehl, in dem er angelegt wird, noch nicht.
-- Jetzt darf der Besitzer seinen Plan immer direkt lesen.
-- Einmal im Supabase SQL Editor ausführen (New query → einfügen → Run); kann gefahrlos wiederholt werden.
drop policy if exists "Pläne lesen" on public.plaene;
create policy "Pläne lesen" on public.plaene for select to authenticated using (owner = (select auth.uid()) or public.plan_mitglied(id));
