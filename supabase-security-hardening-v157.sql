-- CHECKFROTA — PERFIS, RLS E FLUXO SEGURO (v157)
-- Execute APÓS supabase-rebuild.sql, supabase-employees.sql e supabase-governance.sql.
-- Este script não apaga chamados, inspeções ou veículos.
-- Importante: o segundo gestor é cadastrado diretamente no SQL Editor, ao final,
-- para que o e-mail profissional dele não fique exposto no repositório público.

begin;

create table if not exists public.fleet_management_users (
  email text primary key check (email = lower(email)),
  role text not null check (role in ('master','gestor')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.fleet_management_users (email, role, active)
values ('luciano.silva@urbam.com.br', 'master', true)
on conflict (email) do update set role = 'master', active = true, updated_at = now();

alter table public.fleet_management_users enable row level security;

create or replace function public.fleet_current_management_role()
returns text
language sql stable security definer set search_path = public
as $$
  select role from public.fleet_management_users
  where email = lower(coalesce(auth.jwt() ->> 'email', '')) and active = true
  limit 1;
$$;

create or replace function public.fleet_is_master()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.fleet_current_management_role() = 'master', false); $$;

create or replace function public.fleet_is_manager()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.fleet_current_management_role() in ('master','gestor'), false); $$;

revoke all on function public.fleet_current_management_role() from public;
revoke all on function public.fleet_is_master() from public;
revoke all on function public.fleet_is_manager() from public;
grant execute on function public.fleet_current_management_role() to authenticated;
grant execute on function public.fleet_is_master() to authenticated;
grant execute on function public.fleet_is_manager() to authenticated;

drop policy if exists "Master administra perfis de gestão" on public.fleet_management_users;
create policy "Master administra perfis de gestão" on public.fleet_management_users for all to authenticated
using (public.fleet_is_master()) with check (public.fleet_is_master());

drop policy if exists "Aplicativo lê veículos" on public.fleet_vehicles;
drop policy if exists "Administrador Master administra veículos" on public.fleet_vehicles;
drop policy if exists "Gestão lê veículos" on public.fleet_vehicles;
drop policy if exists "Master administra veículos" on public.fleet_vehicles;
create policy "Gestão lê veículos" on public.fleet_vehicles for select to authenticated using (public.fleet_is_manager());
create policy "Master administra veículos" on public.fleet_vehicles for all to authenticated
using (public.fleet_is_master()) with check (public.fleet_is_master());

drop policy if exists "Aplicativo lê inspeções" on public.fleet_inspections;
drop policy if exists "Aplicativo registra inspeções" on public.fleet_inspections;
drop policy if exists "Gestão lê inspeções" on public.fleet_inspections;
drop policy if exists "Colaborador registra inspeções" on public.fleet_inspections;
create policy "Gestão lê inspeções" on public.fleet_inspections for select to authenticated using (public.fleet_is_manager());
create policy "Colaborador registra inspeções" on public.fleet_inspections for insert to anon, authenticated
with check (coalesce(data ->> 'driverRegistration','') ~ '^[0-9]{3,}$' and length(regexp_replace(coalesce(data ->> 'driverPhone',''), '\D', '', 'g')) between 10 and 13);

drop policy if exists "Aplicativo lê chamados" on public.fleet_issues;
drop policy if exists "Aplicativo registra chamados" on public.fleet_issues;
drop policy if exists "Aplicativo atualiza chamados" on public.fleet_issues;
drop policy if exists "Gestão lê chamados" on public.fleet_issues;
drop policy if exists "Gestão atualiza chamados" on public.fleet_issues;
drop policy if exists "Colaborador registra chamados" on public.fleet_issues;
create policy "Gestão lê chamados" on public.fleet_issues for select to authenticated using (public.fleet_is_manager());
create policy "Gestão atualiza chamados" on public.fleet_issues for update to authenticated
using (public.fleet_is_manager()) with check (public.fleet_is_manager());
create policy "Colaborador registra chamados" on public.fleet_issues for insert to anon, authenticated
with check (coalesce(data ->> 'driverRegistration','') ~ '^[0-9]{3,}$' and length(regexp_replace(coalesce(data ->> 'driverPhone',''), '\D', '', 'g')) between 10 and 13);

drop policy if exists "Gestão consulta auditoria" on public.fleet_audit_events;
drop policy if exists "Gestão registra auditoria" on public.fleet_audit_events;
create policy "Gestão consulta auditoria" on public.fleet_audit_events for select to authenticated using (public.fleet_is_manager());
create policy "Gestão registra auditoria" on public.fleet_audit_events for insert to authenticated with check (public.fleet_is_manager());

create or replace function public.fleet_driver_returns(p_registration text, p_phone text)
returns table (id text, status text, data jsonb, created_at timestamptz)
language plpgsql security definer set search_path = public
as $$
declare normalized_phone text := regexp_replace(coalesce(p_phone,''), '\D', '', 'g');
begin
  if p_registration !~ '^[0-9]{3,}$' or length(normalized_phone) not between 10 and 13 then raise exception 'Identificação do colaborador inválida.'; end if;
  return query select issue.id, issue.status, issue.data, issue.created_at from public.fleet_issues issue
  where issue.data ->> 'driverRegistration' = p_registration
    and regexp_replace(coalesce(issue.data ->> 'driverPhone',''), '\D', '', 'g') = normalized_phone
    and coalesce(issue.data -> 'leaderApproval' ->> 'status','') in ('Retificação solicitada','Recusada')
  order by issue.created_at desc;
end;
$$;

create or replace function public.fleet_driver_inspection(p_registration text, p_phone text, p_inspection_id text)
returns table (data jsonb)
language plpgsql security definer set search_path = public
as $$
declare normalized_phone text := regexp_replace(coalesce(p_phone,''), '\D', '', 'g');
begin
  if p_registration !~ '^[0-9]{3,}$' or length(normalized_phone) not between 10 and 13 then raise exception 'Identificação do colaborador inválida.'; end if;
  return query select inspection.data from public.fleet_inspections inspection
  where inspection.id = p_inspection_id and exists (
    select 1 from public.fleet_issues issue where issue.inspection_id = inspection.id
      and issue.data ->> 'driverRegistration' = p_registration
      and regexp_replace(coalesce(issue.data ->> 'driverPhone',''), '\D', '', 'g') = normalized_phone
  ) limit 1;
end;
$$;

create or replace function public.fleet_mark_driver_correction(p_registration text, p_phone text, p_issue_id text, p_inspection_id text, p_has_new_issues boolean)
returns void
language plpgsql security definer set search_path = public
as $$
declare normalized_phone text := regexp_replace(coalesce(p_phone,''), '\D', '', 'g');
declare issue public.fleet_issues%rowtype;
declare next_status text := case when coalesce(p_has_new_issues,false) then 'reenviada' else 'resolvida' end;
declare next_approval jsonb;
begin
  if p_registration !~ '^[0-9]{3,}$' or length(normalized_phone) not between 10 and 13 then raise exception 'Identificação do colaborador inválida.'; end if;
  select * into issue from public.fleet_issues where id = p_issue_id for update;
  if not found or issue.data ->> 'driverRegistration' <> p_registration
     or regexp_replace(coalesce(issue.data ->> 'driverPhone',''), '\D', '', 'g') <> normalized_phone then raise exception 'Chamado não encontrado para este colaborador.'; end if;
  next_approval := coalesce(issue.data -> 'leaderApproval','{}'::jsonb) || jsonb_build_object(
    'status', case when coalesce(p_has_new_issues,false) then 'Retificação reenviada' else 'Concluído sem observação' end,
    'correctedAt', now(), 'correctionInspectionId', p_inspection_id
  );
  update public.fleet_issues set status = next_status,
    data = jsonb_set(case when coalesce(p_has_new_issues,false) then issue.data else jsonb_set(issue.data, '{resolvedAt}', to_jsonb(now()), true) end, '{leaderApproval}', next_approval, true)
  where id = p_issue_id;
end;
$$;

create or replace function public.fleet_leader_issues(p_registration text, p_pin text)
returns table (data jsonb)
language plpgsql security definer set search_path = public
as $$
declare employee public.fleet_employees%rowtype;
begin
  if p_registration !~ '^[0-9]+$' or p_pin !~ '^[0-9]+$' then raise exception 'Sessão de liderança inválida.'; end if;
  select * into employee from public.fleet_employees where registration = p_registration and active = true and access_level in ('lider','coordenador','gestor');
  if not found or employee.access_pin_hash is null or extensions.crypt(p_pin, employee.access_pin_hash) <> employee.access_pin_hash then raise exception 'Sessão de liderança inválida.'; end if;
  return query select issue.data from public.fleet_issues issue
  where employee.access_level <> 'lider' or coalesce(issue.data ->> 'baseName','') = coalesce(employee.leader_base,'')
  order by issue.created_at desc;
end;
$$;

revoke all on function public.fleet_driver_returns(text,text) from public;
revoke all on function public.fleet_driver_inspection(text,text,text) from public;
revoke all on function public.fleet_mark_driver_correction(text,text,text,text,boolean) from public;
revoke all on function public.fleet_leader_issues(text,text) from public;
grant execute on function public.fleet_driver_returns(text,text) to anon, authenticated;
grant execute on function public.fleet_driver_inspection(text,text,text) to anon, authenticated;
grant execute on function public.fleet_mark_driver_correction(text,text,text,text,boolean) to anon, authenticated;
grant execute on function public.fleet_leader_issues(text,text) to anon, authenticated;

commit;

-- CADASTRO PRIVADO DO GESTOR SUBORDINADO (execute somente no SQL Editor):
-- insert into public.fleet_management_users (email, role, active)
-- values ('<e-mail-do-gestor>', 'gestor', true)
-- on conflict (email) do update set role = 'gestor', active = true, updated_at = now();
