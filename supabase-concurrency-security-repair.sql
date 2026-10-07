-- Segurança da atualização concorrente: não altera dados existentes.
begin;
create or replace function public.fleet_update_issue_if_current(p_issue_id text, p_expected_revision integer, p_status text, p_data jsonb)
returns table(revision integer) language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.fleet_is_manager() then
    raise exception 'Acesso restrito à gestão autorizada.' using errcode = '42501';
  end if;
  if p_expected_revision is null or p_expected_revision < 1 or jsonb_typeof(p_data) is distinct from 'object' then
    raise exception 'Dados ou revisão inválidos.' using errcode = '22023';
  end if;
  return query update public.fleet_issues
    set status = p_status, data = p_data, revision = public.fleet_issues.revision + 1, updated_at = now()
    where id = p_issue_id and public.fleet_issues.revision = p_expected_revision
    returning public.fleet_issues.revision;
end; $$;
revoke execute on function public.fleet_update_issue_if_current(text,integer,text,jsonb) from public, anon;
-- authenticated já possui EXECUTE; a função agora verifica o perfil no servidor.
commit;

