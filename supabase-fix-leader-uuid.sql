-- CORREÇÃO: aprovar e retificar no painel da Liderança
-- Corrige a comparação entre o ID recebido como texto pelo aplicativo e a coluna UUID do banco.
-- Não apaga nem altera chamados existentes antes da decisão.

create or replace function public.fleet_record_leader_decision(
  p_registration text, p_pin text, p_issue_id text, p_status text, p_note text default ''
) returns void
language plpgsql security definer set search_path = public
as $$
declare employee public.fleet_employees%rowtype;
declare issue public.fleet_issues%rowtype;
declare row_status text;
declare decision jsonb;
begin
  if p_status not in ('Aprovada','Retificação solicitada','Recusada') then
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
  where id::text = p_issue_id
  for update;
  if not found then raise exception 'Chamado não encontrado.'; end if;

  if employee.access_level = 'lider'
     and coalesce(issue.data ->> 'baseName','') <> coalesce(employee.leader_base,'') then
    raise exception 'Este chamado pertence a outra base.';
  end if;

  row_status := case p_status
    when 'Aprovada' then 'aprovada'
    when 'Retificação solicitada' then 'retificacao'
    else 'recusada'
  end;
  decision := jsonb_build_object(
    'status', p_status, 'note', coalesce(p_note,''), 'approvedAt', now(),
    'approvedBy', case employee.access_level
      when 'lider' then 'Líder: '
      when 'coordenador' then 'Coordenador: '
      else 'Gestor: '
    end || employee.name,
    'dispatchStatus', case p_status
      when 'Aprovada' then 'Aguardando gestor'
      when 'Retificação solicitada' then 'Aguardando colaborador'
      else 'Encerrado'
    end
  );

  update public.fleet_issues
  set status = row_status,
      data = jsonb_set(issue.data, '{leaderApproval}', decision, true)
  where id::text = p_issue_id;

  insert into public.fleet_audit_events
    (issue_id, vehicle_id, action, detail, actor_name, snapshot)
  values
    (issue.id::text, issue.vehicle_id::text, lower(replace(p_status, ' ', '_')),
     coalesce(p_note,''), employee.name, decision);
end;
$$;

revoke all on function public.fleet_record_leader_decision(text,text,text,text,text) from public;
grant execute on function public.fleet_record_leader_decision(text,text,text,text,text) to anon, authenticated;

select 'correção aplicada' as resultado;
