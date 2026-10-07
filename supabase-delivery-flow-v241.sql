-- Corrige entrega sem ampliar permissões existentes. Não remove registros.
begin;
create or replace function public.fleet_driver_mark_maintenance_delivery(p_registration text, p_phone text, p_issue_id text)
returns table(data jsonb) language plpgsql security definer set search_path = public
as $$
declare
  normalized_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  delivered_at timestamptz := now();
begin
  if p_registration is null or p_registration !~ '^[0-9]{3,}$' or length(normalized_phone) not between 10 and 13 then
    raise exception 'Identificação do colaborador inválida.';
  end if;
  return query update public.fleet_issues as issue
  set revision = issue.revision + 1,
      data = jsonb_set(issue.data, '{maintenance}', coalesce(issue.data->'maintenance', '{}'::jsonb) ||
        jsonb_build_object('status', 'Em manutenção', 'deliveryAt', delivered_at,
          'supplierDeadlineAt', delivered_at + interval '6 hours',
          'responsible', 'Gestão de Frota', 'nextActionAt', delivered_at + interval '6 hours',
          'updatedAt', delivered_at), true)
  where issue.id::text = p_issue_id
    and coalesce(issue.data->>'driverRegistration', '') = p_registration
    and regexp_replace(coalesce(issue.data->>'driverPhone', ''), '\D', '', 'g') = normalized_phone
    and coalesce(issue.data->'maintenance'->>'status', '') = 'Agendada'
    and coalesce(issue.status, '') not in ('resolvida', 'arquivada', 'recusada')
    and coalesce(issue.data->>'archivedAt', '') = ''
  returning issue.data;
  if not found then raise exception 'Agendamento não encontrado ou já confirmado.'; end if;
end;
$$;
commit;
