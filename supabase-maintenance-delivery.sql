-- ENTREGA DO VEÍCULO À MANUTENÇÃO — URBAM FROTAS
-- Execute uma única vez no SQL Editor do Supabase.
-- O colaborador só pode marcar a entrega dos próprios chamados agendados.

create or replace function public.fleet_driver_mark_maintenance_delivery(p_registration text, p_phone text, p_issue_id text)
returns table (data jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  delivered_at timestamptz := now();
begin
  if p_registration !~ '^[0-9]{3,}$' or length(normalized_phone) not between 10 and 13 then
    raise exception 'Identificação do colaborador inválida.';
  end if;
  return query
  update public.fleet_issues as issue
  set data = jsonb_set(issue.data, '{maintenance}', coalesce(issue.data -> 'maintenance', '{}'::jsonb) || jsonb_build_object('status', 'Em manutenção', 'deliveryAt', delivered_at, 'supplierDeadlineAt', delivered_at + interval '6 hours', 'updatedAt', delivered_at), true)
  where issue.id::text = p_issue_id
    and coalesce(issue.data ->> 'driverRegistration', '') = p_registration
    and regexp_replace(coalesce(issue.data ->> 'driverPhone', ''), '\D', '', 'g') = normalized_phone
    and coalesce(issue.data -> 'maintenance' ->> 'status', '') = 'Agendada'
    and coalesce(issue.status, '') <> 'resolvida'
  returning issue.data;
  if not found then raise exception 'Agendamento não encontrado ou já confirmado.'; end if;
end;
$$;

revoke all on function public.fleet_driver_mark_maintenance_delivery(text, text, text) from public;
grant execute on function public.fleet_driver_mark_maintenance_delivery(text, text, text) to anon, authenticated;
select to_regprocedure('public.fleet_driver_mark_maintenance_delivery(text,text,text)') is not null as delivery_ready;

-- A Liderança confirma a retirada somente depois de a Gestão liberar o veículo.
-- A comparação id::text funciona tanto quando o identificador é UUID quanto text.
create or replace function public.fleet_leader_confirm_maintenance_pickup(
  p_registration text, p_pin text, p_issue_id text
)
returns table (data jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  employee public.fleet_employees%rowtype;
  issue public.fleet_issues%rowtype;
  picked_up_at timestamptz := now();
  next_data jsonb;
begin
  if p_registration !~ '^[0-9]+$' or p_pin !~ '^[0-9]+$' or length(p_issue_id) > 80 then
    raise exception 'Identificação inválida.';
  end if;

  select * into employee
  from public.fleet_employees
  where registration = p_registration
    and active = true
    and access_level in ('lider','coordenador','gestor');

  if not found or employee.access_pin_hash is null
     or extensions.crypt(p_pin, employee.access_pin_hash) <> employee.access_pin_hash then
    raise exception 'Sessão de liderança inválida. Entre novamente.';
  end if;

  select * into issue
  from public.fleet_issues
  where id::text = p_issue_id
  for update;

  if not found then raise exception 'Chamado não encontrado.'; end if;
  if employee.access_level = 'lider'
     and coalesce(issue.data ->> 'baseName','') <> coalesce(employee.leader_base,'') then
    raise exception 'Este chamado pertence a outra base.';
  end if;
  if coalesce(issue.data -> 'maintenance' ->> 'status','') <> 'Veículo pronto para retirada' then
    raise exception 'O veículo ainda não foi liberado para retirada.';
  end if;

  next_data := jsonb_set(
    jsonb_set(
      issue.data,
      '{maintenance}',
      coalesce(issue.data -> 'maintenance','{}'::jsonb) || jsonb_build_object(
        'status','Concluída',
        'pickupAt',picked_up_at,
        'pickupBy',employee.name,
        'updatedAt',picked_up_at
      ),
      true
    ),
    '{resolvedAt}',
    to_jsonb(picked_up_at),
    true
  );

  update public.fleet_issues
  set status = 'resolvida', data = next_data
  where id::text = p_issue_id;

  insert into public.fleet_audit_events (issue_id, vehicle_id, action, detail, actor_name, snapshot)
  values (issue.id::text, issue.vehicle_id::text, 'veiculo_retirado', 'Retirada confirmada pela Liderança.', employee.name, next_data);

  return query select next_data;
end;
$$;

revoke all on function public.fleet_leader_confirm_maintenance_pickup(text,text,text) from public;
grant execute on function public.fleet_leader_confirm_maintenance_pickup(text,text,text) to anon, authenticated;

select to_regprocedure('public.fleet_leader_confirm_maintenance_pickup(text,text,text)') is not null as pickup_ready;
