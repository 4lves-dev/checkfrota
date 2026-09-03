-- PRONTIDÃO PARA IMPLANTAÇÃO — URBAM FROTAS
-- Execute este arquivo uma única vez no SQL Editor do Supabase.
-- Não apaga veículos, colaboradores, inspeções ou chamados existentes.

create table if not exists public.fleet_inspections (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.fleet_issues (
  id text primary key,
  inspection_id text,
  vehicle_id text,
  status text not null default 'aberta',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.fleet_inspections add column if not exists data jsonb not null default '{}'::jsonb;
alter table public.fleet_issues add column if not exists inspection_id text;
alter table public.fleet_issues add column if not exists vehicle_id text;
alter table public.fleet_issues add column if not exists status text not null default 'aberta';
alter table public.fleet_issues add column if not exists data jsonb not null default '{}'::jsonb;

alter table public.fleet_inspections enable row level security;
alter table public.fleet_issues enable row level security;

drop policy if exists "Aplicativo lê inspeções" on public.fleet_inspections;
create policy "Aplicativo lê inspeções" on public.fleet_inspections for select to anon, authenticated using (true);
drop policy if exists "Aplicativo registra inspeções" on public.fleet_inspections;
create policy "Aplicativo registra inspeções" on public.fleet_inspections for insert to anon, authenticated with check (true);
drop policy if exists "Aplicativo lê chamados" on public.fleet_issues;
create policy "Aplicativo lê chamados" on public.fleet_issues for select to anon, authenticated using (true);
drop policy if exists "Aplicativo registra chamados" on public.fleet_issues;
create policy "Aplicativo registra chamados" on public.fleet_issues for insert to anon, authenticated with check (true);
drop policy if exists "Aplicativo atualiza chamados" on public.fleet_issues;
create policy "Aplicativo atualiza chamados" on public.fleet_issues for update to anon, authenticated using (true) with check (true);

alter table public.fleet_issues drop constraint if exists fleet_issues_status_check;
alter table public.fleet_issues add constraint fleet_issues_status_check
check (status in ('aberta','aprovada','retificacao','recusada','reenviada','resolvida'));
create index if not exists fleet_issues_created_at_idx on public.fleet_issues (created_at desc);
create index if not exists fleet_issues_status_idx on public.fleet_issues (status);

select
  to_regclass('public.fleet_inspections') is not null as inspections_table_ready,
  to_regclass('public.fleet_issues') is not null as issues_table_ready;
