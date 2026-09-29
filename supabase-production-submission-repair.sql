-- URBAM Frotas — reparo definitivo do recebimento de chamados.
-- Execute uma única vez no SQL Editor do Supabase.
-- O aplicativo público pode somente INSERIR registros identificados; leitura e
-- alterações seguem restritas aos painéis autenticados de Liderança e Gestão.
-- Remove regras antigas duplicadas: elas podem fazer um envio novo ser tratado
-- como atualização quando o mesmo navegador já acessou a Gestão.

do $repair$
declare item record;
begin
  for item in
    select tablename, policyname
      from pg_policies
     where schemaname = 'public'
       and tablename in ('fleet_inspections', 'fleet_issues')
  loop
    execute format('drop policy if exists %I on public.%I', item.policyname, item.tablename);
  end loop;
end;
$repair$;

create policy "CheckFrota colaborador envia inspeções" on public.fleet_inspections
for insert to anon, authenticated
with check (coalesce(id, '') <> '' and coalesce(data ->> 'driverRegistration', '') ~ '^[0-9]{3,}$');

create policy "CheckFrota gestão lê inspeções" on public.fleet_inspections
for select to authenticated using (public.fleet_is_manager());

create policy "CheckFrota gestão administra inspeções" on public.fleet_inspections
for update to authenticated using (public.fleet_is_manager()) with check (public.fleet_is_manager());

create policy "CheckFrota colaborador envia chamados" on public.fleet_issues
for insert to anon, authenticated
with check (coalesce(id, '') <> '' and coalesce(data ->> 'driverRegistration', '') ~ '^[0-9]{3,}$');

create policy "CheckFrota gestão lê chamados" on public.fleet_issues
for select to authenticated using (public.fleet_is_manager());

create policy "CheckFrota gestão atualiza chamados" on public.fleet_issues
for update to authenticated using (public.fleet_is_manager()) with check (public.fleet_is_manager());

create table if not exists public.fleet_email_deliveries (
  id text primary key,
  inspection_id text not null,
  recipient text,
  status text not null default 'encaminhado' check (status in ('encaminhado','enviado','falhou')),
  error_message text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);
alter table public.fleet_email_deliveries enable row level security;
drop policy if exists "Aplicativo cria rastreio de e-mail" on public.fleet_email_deliveries;
create policy "Aplicativo cria rastreio de e-mail" on public.fleet_email_deliveries
for insert to anon, authenticated
with check (coalesce(id, '') <> '' and coalesce(inspection_id, '') <> '');

create or replace function public.fleet_confirm_email_delivery(
  p_delivery_id text, p_status text, p_error text default null
)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.fleet_email_deliveries
     set status = case when p_status in ('enviado','falhou') then p_status else 'falhou' end,
         error_message = nullif(trim(coalesce(p_error,'')), ''), confirmed_at = now()
   where id = p_delivery_id;
end; $$;
grant execute on function public.fleet_confirm_email_delivery(text,text,text) to anon, authenticated;
