-- AGENDAMENTOS PARA COLABORADOR — URBAM FROTAS
-- Execute uma única vez no SQL Editor do Supabase.
-- Permite ao colaborador consultar somente os próprios chamados agendados.

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
    and coalesce(issue.data -> 'maintenance' ->> 'status', '') in ('Agendada', 'Em manutenção')
    and coalesce(issue.status, '') <> 'resolvida'
  order by coalesce(issue.data -> 'maintenance' ->> 'scheduledAt', '') asc;
end;
$$;

revoke all on function public.fleet_driver_appointments(text, text) from public;
grant execute on function public.fleet_driver_appointments(text, text) to anon, authenticated;

select to_regprocedure('public.fleet_driver_appointments(text,text)') is not null as appointments_ready;
