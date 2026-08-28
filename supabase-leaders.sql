-- Execute este arquivo uma única vez no SQL Editor do Supabase.
-- Ele adiciona o controle de acesso da Liderança à tabela de colaboradores.

alter table public.fleet_employees
  add column if not exists leader boolean not null default false,
  add column if not exists leader_base text,
  add column if not exists access_level text not null default 'colaborador';

alter table public.fleet_employees
  drop constraint if exists fleet_employees_access_level_check;

alter table public.fleet_employees
  add constraint fleet_employees_access_level_check
  check (access_level in ('colaborador', 'lider', 'coordenador', 'gestor'));

update public.fleet_employees set access_level = 'lider'
where leader = true and access_level = 'colaborador';

alter table public.fleet_employees
  drop constraint if exists fleet_employees_leader_base_check;

alter table public.fleet_employees
  add constraint fleet_employees_leader_base_check
  check (leader_base is null or leader_base in ('Vertical', 'Horizontal', 'Abrigo', 'SASC'));

-- Exemplo de conferência após cadastrar líderes pelo painel de Gestão:
-- select registration, name, role, leader, leader_base
-- from public.fleet_employees where leader = true order by name;
