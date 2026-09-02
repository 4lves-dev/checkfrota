-- SEGURANÇA DE ACESSO DA LIDERANÇA
-- Execute no SQL Editor do Supabase após publicar a versão 149 do aplicativo.
-- A primeira senha é a matrícula. No primeiro acesso, o aplicativo exige a troca
-- por uma senha numérica de 6 a 12 dígitos, diferente da matrícula.

create extension if not exists pgcrypto;

alter table public.fleet_employees add column if not exists access_pin_hash text;
alter table public.fleet_employees add column if not exists must_change_pin boolean not null default true;
alter table public.fleet_employees add column if not exists pin_updated_at timestamptz;

-- Define somente a senha provisória de quem possui acesso à Liderança.
update public.fleet_employees
set access_pin_hash = extensions.crypt(registration, extensions.gen_salt('bf')),
    must_change_pin = true,
    pin_updated_at = now()
where active = true
  and access_level in ('lider', 'coordenador', 'gestor')
  and access_pin_hash is null;

-- Diretório público: matrícula, nome e função para preencher o checklist.
-- Senha, status de troca e demais campos internos não são expostos.
create or replace view public.fleet_employee_directory as
select registration, name, role, active, leader, leader_base, access_level
from public.fleet_employees;

revoke all on public.fleet_employees from anon;
grant select on public.fleet_employee_directory to anon, authenticated;

drop policy if exists "Consulta pública de colaboradores ativos" on public.fleet_employees;
drop policy if exists "Administrador Master consulta colaboradores" on public.fleet_employees;
create policy "Administrador Master consulta colaboradores"
on public.fleet_employees for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'luciano.silva@urbam.com.br');

create or replace function public.fleet_leader_login(p_registration text, p_pin text)
returns table (registration text, name text, leader_base text, access_level text, must_change_pin boolean)
language plpgsql security definer set search_path = public
as $$
declare employee public.fleet_employees%rowtype;
begin
  if p_registration !~ '^[0-9]+$' or p_pin !~ '^[0-9]+$' then
    raise exception 'Matrícula e senha devem conter somente números.';
  end if;
  select * into employee from public.fleet_employees
  where fleet_employees.registration = p_registration and active = true
  limit 1;
  if not found or employee.access_level not in ('lider','coordenador','gestor')
     or employee.access_pin_hash is null
     or extensions.crypt(p_pin, employee.access_pin_hash) <> employee.access_pin_hash then
    raise exception 'Matrícula ou senha inválida.';
  end if;
  return query select employee.registration, employee.name, employee.leader_base,
    employee.access_level, employee.must_change_pin;
end;
$$;

create or replace function public.fleet_change_leader_pin(
  p_registration text, p_current_pin text, p_new_pin text
) returns void
language plpgsql security definer set search_path = public
as $$
declare employee public.fleet_employees%rowtype;
begin
  if p_new_pin !~ '^[0-9]{6,12}$' or p_new_pin = p_registration then
    raise exception 'A nova senha deve ter de 6 a 12 números e ser diferente da matrícula.';
  end if;
  select * into employee from public.fleet_employees where registration = p_registration and active = true;
  if not found or employee.access_pin_hash is null
     or extensions.crypt(p_current_pin, employee.access_pin_hash) <> employee.access_pin_hash then
    raise exception 'Senha atual inválida.';
  end if;
  update public.fleet_employees
  set access_pin_hash = extensions.crypt(p_new_pin, extensions.gen_salt('bf')), must_change_pin = false, pin_updated_at = now()
  where registration = p_registration;
end;
$$;

drop function if exists public.fleet_record_leader_decision(text, text, text, text);

create or replace function public.fleet_record_leader_decision(
  p_registration text,
  p_pin text,
  p_issue_id text,
  p_status text,
  p_note text default ''
) returns void
language plpgsql security definer set search_path = public
as $$
declare
  employee public.fleet_employees%rowtype;
  issue public.fleet_issues%rowtype;
  row_status text;
  decision jsonb;
begin
  if p_status not in ('Aprovada','Retificação solicitada') then
    raise exception 'Decisão inválida.';
  end if;
  if p_registration !~ '^[0-9]+$' or p_pin !~ '^[0-9]+$' then
    raise exception 'Matrícula e senha devem conter somente números.';
  end if;

  select * into employee from public.fleet_employees
  where registration = p_registration and active = true
    and access_level in ('lider','coordenador','gestor');
  if not found or employee.access_pin_hash is null
    or extensions.crypt(p_pin, employee.access_pin_hash) <> employee.access_pin_hash then
    raise exception 'Sessão de liderança inválida. Entre novamente.';
  end if;

  select * into issue from public.fleet_issues
  where id = p_issue_id::uuid
  for update;
  if not found then raise exception 'Chamado não encontrado.'; end if;

  if employee.access_level = 'lider'
    and coalesce(issue.data ->> 'baseName','') <> coalesce(employee.leader_base,'') then
    raise exception 'Este chamado pertence a outra base.';
  end if;

  row_status := case p_status
    when 'Aprovada' then 'aprovada'
    else 'retificacao'
  end;

  decision := jsonb_build_object(
    'status', p_status,
    'note', coalesce(p_note,''),
    'approvedAt', now(),
    'approvedBy', case employee.access_level
      when 'lider' then 'Líder: '
      when 'coordenador' then 'Coordenador: '
      else 'Gestor: '
    end || employee.name,
    'dispatchStatus', case p_status
      when 'Aprovada' then 'Aguardando gestor'
      else 'Aguardando colaborador'
    end
  );

  update public.fleet_issues set
    status = row_status,
    data = jsonb_set(issue.data, '{leaderApproval}', decision, true)
  where id = p_issue_id::uuid;

  insert into public.fleet_audit_events
    (issue_id, vehicle_id, action, detail, actor_name, snapshot)
  values
    (issue.id, issue.vehicle_id, lower(replace(p_status, ' ', '_')),
     coalesce(p_note,''), employee.name, decision);
end;
$$;

revoke all on function public.fleet_leader_login(text,text) from public;
revoke all on function public.fleet_change_leader_pin(text,text,text) from public;
revoke all on function public.fleet_record_leader_decision(text,text,text,text,text) from public;
grant execute on function public.fleet_leader_login(text,text) to anon, authenticated;
grant execute on function public.fleet_change_leader_pin(text,text,text) to anon, authenticated;
grant execute on function public.fleet_record_leader_decision(text,text,text,text,text) to anon, authenticated;
