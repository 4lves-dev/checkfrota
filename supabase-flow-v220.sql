-- FLUXO OPERACIONAL V220 — URBAM Frotas
-- Execute uma única vez no SQL Editor do Supabase.
-- Não remove nem altera chamados existentes.

alter table public.fleet_issues
  add column if not exists updated_at timestamptz not null default now();

create index if not exists fleet_issues_updated_at_idx
  on public.fleet_issues (updated_at desc);

-- Mantém uma trilha de servidor mesmo quando a alteração vier de outro aparelho.
create or replace function public.fleet_register_issue_timeline()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_action text;
  event_detail text;
begin
  new.updated_at := now();

  if tg_op = 'INSERT' then
    event_action := 'chamado_aberto';
    event_detail := coalesce(new.data ->> 'itemName', 'Chamado aberto');
  elsif coalesce(new.data -> 'maintenance' ->> 'status', '')
        is distinct from coalesce(old.data -> 'maintenance' ->> 'status', '') then
    event_action := 'etapa_manutencao_atualizada';
    event_detail := 'Situação: ' || coalesce(new.data -> 'maintenance' ->> 'status', 'Solicitada');
  elsif new.status is distinct from old.status then
    event_action := 'status_atualizado';
    event_detail := 'Status: ' || new.status;
  else
    event_action := 'chamado_atualizado';
    event_detail := 'Dados operacionais atualizados.';
  end if;

  insert into public.fleet_audit_events (issue_id, vehicle_id, action, detail, actor_email, snapshot)
  values (new.id, new.vehicle_id, event_action, event_detail, auth.email(), new.data);
  return new;
end;
$$;

drop trigger if exists fleet_issue_timeline_trigger on public.fleet_issues;
create trigger fleet_issue_timeline_trigger
before insert or update on public.fleet_issues
for each row execute function public.fleet_register_issue_timeline();

-- Conferência final: deve exibir a coluna updated_at e o gatilho criado.
select
  exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'fleet_issues' and column_name = 'updated_at') as fluxo_pronto,
  exists (select 1 from pg_trigger where tgname = 'fleet_issue_timeline_trigger' and not tgisinternal) as trilha_pronta;
