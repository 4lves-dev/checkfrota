-- URBAM Frotas — correção de bloqueio no envio do colaborador.
-- Execute uma única vez no SQL Editor do Supabase.
-- A matrícula continua obrigatória; o telefone deixa de bloquear um chamado
-- já identificado quando o aparelho enviou o número em formato diferente.

drop policy if exists "Colaborador registra inspeções" on public.fleet_inspections;
create policy "Colaborador registra inspeções" on public.fleet_inspections
for insert to anon, authenticated
with check (
  coalesce(data ->> 'driverRegistration', '') ~ '^[0-9]{3,}$'
);

drop policy if exists "Colaborador registra chamados" on public.fleet_issues;
create policy "Colaborador registra chamados" on public.fleet_issues
for insert to anon, authenticated
with check (
  coalesce(data ->> 'driverRegistration', '') ~ '^[0-9]{3,}$'
);

