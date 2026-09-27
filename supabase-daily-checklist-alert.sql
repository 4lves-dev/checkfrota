-- ALERTA DIÁRIO DE CHECKLIST PENDENTE — URBAM Frotas
-- Execute uma vez no SQL Editor do Supabase. Não apaga ou modifica chamados.

alter table public.fleet_server_notifications drop constraint if exists fleet_server_notifications_notification_type_check;
alter table public.fleet_server_notifications add constraint fleet_server_notifications_notification_type_check
  check (notification_type in ('prazo-fornecedor','agendamento-vencido','checklist-diario'));

select 'Banco pronto para registrar o alerta diário das 08h.' as resultado;
