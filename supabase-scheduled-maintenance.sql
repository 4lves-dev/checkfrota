-- AGENDAMENTOS PARA COLABORADOR — URBAM FROTAS
-- Execute uma única vez no SQL Editor do Supabase.
-- Permite ao colaborador acompanhar os próprios chamados desde a abertura.

create or replace function public.fleet_driver_appointments(p_registration text, p_phone text)
returns table (data jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
begin
  if p_registration !~ '^[0-9]{3,}$' or length(normalized_phone) not between 10 and 13 then
    raise exception 'Identificação do colaborador inválida.';
  end if;

  return query
  select issue.data
  from public.fleet_issues as issue
  where coalesce(issue.data ->> 'driverRegistration', '') = p_registration
    and regexp_replace(coalesce(issue.data ->> 'driverPhone', ''), '\D', '', 'g') = normalized_phone
    and issue.created_at >= now() - interval '120 days'
  order by issue.created_at desc;
  limit 100;
end;
$$;

revoke all on function public.fleet_driver_appointments(text, text) from public;
grant execute on function public.fleet_driver_appointments(text, text) to anon, authenticated;

select to_regprocedure('public.fleet_driver_appointments(text,text)') is not null as appointments_ready;

create or replace function public.fleet_driver_acknowledge_schedule(p_registration text, p_phone text, p_issue_id text)
returns table (data jsonb)
language plpgsql security definer set search_path = public
as $$
declare normalized_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'); acknowledged_at timestamptz := now();
begin
  if p_registration !~ '^[0-9]{3,}$' or length(normalized_phone) not between 10 and 13 or length(p_issue_id) > 80 then raise exception 'Identificação inválida.'; end if;
  return query update public.fleet_issues as issue
    set data = jsonb_set(issue.data, '{maintenance}', coalesce(issue.data->'maintenance','{}'::jsonb) || jsonb_build_object('driverAcknowledgedAt',acknowledged_at,'updatedAt',acknowledged_at), true)
    where issue.id::text=p_issue_id and coalesce(issue.data->>'driverRegistration','')=p_registration
      and regexp_replace(coalesce(issue.data->>'driverPhone',''),'\D','','g')=normalized_phone
      and coalesce(issue.data->'maintenance'->>'status','')='Agendada'
    returning issue.data;
  if not found then raise exception 'Agendamento não encontrado.'; end if;
end; $$;
revoke all on function public.fleet_driver_acknowledge_schedule(text,text,text) from public;
grant execute on function public.fleet_driver_acknowledge_schedule(text,text,text) to anon, authenticated;
