-- Perfis de acesso do URBAM Frota.
-- Execute uma vez no SQL Editor do Supabase.
alter table public.fleet_employees
  add column if not exists access_level text not null default 'colaborador';

alter table public.fleet_employees
  drop constraint if exists fleet_employees_access_level_check;

alter table public.fleet_employees
  add constraint fleet_employees_access_level_check
  check (access_level in ('colaborador', 'lider', 'coordenador', 'gestor'));

-- Mantém os líderes já cadastrados no perfil correto.
update public.fleet_employees
set access_level = 'lider'
where leader = true and access_level = 'colaborador';
