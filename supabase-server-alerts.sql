-- ALERTAS AUTOMÁTICOS DE ATRASO — URBAM Frotas
-- Execute pelo instalador unificado. Não apaga dados existentes.

create table if not exists public.fleet_server_notifications (
  notification_key text primary key,
  issue_id text not null,
  notification_type text not null check (notification_type in ('prazo-fornecedor','agendamento-vencido')),
  created_at timestamptz not null default now()
);
create index if not exists fleet_server_notifications_issue_idx
  on public.fleet_server_notifications (issue_id, created_at desc);
alter table public.fleet_server_notifications enable row level security;
revoke all on public.fleet_server_notifications from anon, authenticated;

-- Mantém somente o registro necessário para impedir avisos repetidos indefinidamente.
create or replace function public.fleet_cleanup_server_notifications()
returns void language sql security definer set search_path=public
as $$ delete from public.fleet_server_notifications where created_at < now() - interval '180 days'; $$;
revoke all on function public.fleet_cleanup_server_notifications() from public, anon, authenticated;

-- A Edge Function maintenance-alerts deve ser executada a cada 10 minutos no
-- Supabase Dashboard > Edge Functions > Schedules, com o cabeçalho:
-- x-cron-secret = mesmo valor do segredo MAINTENANCE_ALERTS_CRON_SECRET.
-- Ela funciona no servidor e envia push mesmo com todos os aplicativos fechados.

select to_regclass('public.fleet_server_notifications') is not null as server_alerts_ready;
