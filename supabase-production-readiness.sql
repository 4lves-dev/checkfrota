-- PRONTIDÃO PARA PRODUÇÃO — URBAM FROTAS
-- Execute no SQL Editor do Supabase.
-- Preserva os dados existentes. Não use comandos de DELETE, DROP TABLE ou TRUNCATE.

-- O aplicativo utiliza identificadores próprios: v1446, MAN-..., UUID etc.
-- Convertê-los para texto evita erro ao gravar vehicle_id e chamados antigos.
alter table public.fleet_inspections alter column id drop default;
alter table public.fleet_inspections alter column id type text using id::text;
alter table public.fleet_issues alter column id drop default;
alter table public.fleet_issues alter column id type text using id::text;
alter table public.fleet_issues alter column inspection_id type text using inspection_id::text;
alter table public.fleet_issues alter column vehicle_id type text using vehicle_id::text;

alter table public.fleet_inspections enable row level security;
alter table public.fleet_issues enable row level security;

drop policy if exists "Aplicativo lê inspeções" on public.fleet_inspections;
create policy "Aplicativo lê inspeções" on public.fleet_inspections
for select to anon, authenticated using (true);
drop policy if exists "Aplicativo registra inspeções" on public.fleet_inspections;
create policy "Aplicativo registra inspeções" on public.fleet_inspections
for insert to anon, authenticated with check (true);

drop policy if exists "Aplicativo lê chamados" on public.fleet_issues;
create policy "Aplicativo lê chamados" on public.fleet_issues
for select to anon, authenticated using (true);
drop policy if exists "Aplicativo registra chamados" on public.fleet_issues;
create policy "Aplicativo registra chamados" on public.fleet_issues
for insert to anon, authenticated with check (true);
drop policy if exists "Aplicativo atualiza chamados" on public.fleet_issues;
create policy "Aplicativo atualiza chamados" on public.fleet_issues
for update to anon, authenticated using (true) with check (true);

alter table public.fleet_issues drop constraint if exists fleet_issues_status_check;
alter table public.fleet_issues add constraint fleet_issues_status_check
check (status in ('aberta','aprovada','retificacao','recusada','reenviada','resolvida'));

create index if not exists fleet_issues_created_at_idx on public.fleet_issues (created_at desc);
create index if not exists fleet_issues_status_idx on public.fleet_issues (status);

-- Necessária para o colaborador receber retificação ou recusa no próprio app.
create or replace function public.fleet_driver_returns(p_registration text, p_phone text)
returns table (data jsonb)
language sql security definer set search_path = public
as $$
  select issue.data
  from public.fleet_issues issue
  where coalesce(issue.data ->> 'driverRegistration','') = coalesce(p_registration,'')
    and regexp_replace(coalesce(issue.data ->> 'driverPhone',''), '\\D', '', 'g')
        = regexp_replace(coalesce(p_phone,''), '\\D', '', 'g')
    and coalesce(issue.data -> 'leaderApproval' ->> 'status','')
        in ('Retificação solicitada','Recusada')
  order by issue.created_at desc
  limit 30;
$$;
revoke all on function public.fleet_driver_returns(text,text) from public;
grant execute on function public.fleet_driver_returns(text,text) to anon, authenticated;

select
  (select count(*) from public.fleet_issues) as total_issues,
  (select count(*) from public.fleet_inspections) as total_inspections,
  to_regprocedure('public.fleet_driver_returns(text,text)') is not null as driver_returns_ready;
