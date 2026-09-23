-- ARQUIVAMENTO CONTROLADO DE CHAMADOS — URBAM FROTAS
-- Execute uma vez no SQL Editor do Supabase.
-- Não exclui dados: somente o Administrador Master pode arquivar/restaurar.

alter table public.fleet_issues drop constraint if exists fleet_issues_status_check;
alter table public.fleet_issues add constraint fleet_issues_status_check
check (status in ('aberta','aprovada','retificacao','recusada','reenviada','resolvida','arquivada'));

create or replace function public.fleet_archive_issue(p_issue_id text, p_reason text)
returns table (data jsonb)
language plpgsql security definer set search_path = public
as $$
declare archived_at timestamptz := now();
begin
  if not public.fleet_is_master() then raise exception 'Apenas o Administrador Master pode arquivar chamados.'; end if;
  if length(trim(coalesce(p_reason, ''))) < 5 then raise exception 'Informe o motivo do arquivamento.'; end if;
  return query
  update public.fleet_issues as issue
  set status = 'arquivada',
      data = jsonb_set(
        coalesce(issue.data, '{}'::jsonb), '{archive}',
        jsonb_build_object('archivedAt', archived_at, 'reason', trim(p_reason), 'archivedBy', auth.email()), true
      ) || jsonb_build_object('archivedAt', archived_at, 'archiveReason', trim(p_reason), 'archivedBy', auth.email())
  where issue.id::text = p_issue_id and issue.status <> 'arquivada'
  returning issue.data;
  if not found then raise exception 'Chamado não encontrado ou já arquivado.'; end if;
end;
$$;

create or replace function public.fleet_restore_archived_issue(p_issue_id text)
returns table (data jsonb)
language plpgsql security definer set search_path = public
as $$
declare restored_at timestamptz := now();
begin
  if not public.fleet_is_master() then raise exception 'Apenas o Administrador Master pode restaurar chamados.'; end if;
  return query
  update public.fleet_issues as issue
  set status = 'aberta',
      data = (coalesce(issue.data, '{}'::jsonb) - 'archivedAt' - 'archiveReason' - 'archivedBy') ||
        jsonb_build_object('archive', coalesce(issue.data->'archive','{}'::jsonb) || jsonb_build_object('restoredAt', restored_at, 'restoredBy', auth.email()))
  where issue.id::text = p_issue_id and issue.status = 'arquivada'
  returning issue.data;
  if not found then raise exception 'Chamado arquivado não encontrado.'; end if;
end;
$$;

revoke all on function public.fleet_archive_issue(text,text) from public;
revoke all on function public.fleet_restore_archived_issue(text) from public;
grant execute on function public.fleet_archive_issue(text,text) to authenticated;
grant execute on function public.fleet_restore_archived_issue(text) to authenticated;

select
  to_regprocedure('public.fleet_archive_issue(text,text)') is not null as arquivamento_ativo,
  to_regprocedure('public.fleet_restore_archived_issue(text)') is not null as restauracao_ativa;
