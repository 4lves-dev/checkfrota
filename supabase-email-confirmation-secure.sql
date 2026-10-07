-- Run after configuring the same random secret in Apps Script properties.
-- Never commit the secret or a filled provisioning query to GitHub.
begin;
create schema if not exists checkfrota_private;
revoke all on schema checkfrota_private from public, anon, authenticated;
create table if not exists checkfrota_private.email_confirmation_config (
  singleton boolean primary key default true check (singleton),
  secret_hash text not null check (length(secret_hash) = 64)
);
alter table checkfrota_private.email_confirmation_config enable row level security;
revoke all on checkfrota_private.email_confirmation_config from public, anon, authenticated;

create or replace function public.fleet_confirm_email_delivery_secure(
  p_delivery_id text, p_inspection_id text, p_status text, p_token text, p_error text default null
) returns boolean language plpgsql security definer set search_path = pg_catalog as $$
declare expected_hash text;
begin
  select secret_hash into expected_hash from checkfrota_private.email_confirmation_config where singleton;
  if expected_hash is null or length(coalesce(p_token,'')) < 32
     or encode(sha256(convert_to(p_token, 'UTF8')), 'hex') is distinct from expected_hash then
    raise exception 'Confirmação não autorizada.' using errcode = '42501';
  end if;
  if p_status is null or p_status not in ('enviado','falhou') then
    raise exception 'Status inválido.' using errcode = '22023';
  end if;
  update public.fleet_email_deliveries set status = p_status,
    error_message = case when p_status = 'enviado' then null else left(p_error, 500) end,
    confirmed_at = now()
  where id = p_delivery_id and inspection_id = p_inspection_id
    and (status <> 'enviado' or p_status = 'enviado');
  return found;
end; $$;
revoke all on function public.fleet_confirm_email_delivery_secure(text,text,text,text,text) from public;
grant execute on function public.fleet_confirm_email_delivery_secure(text,text,text,text,text) to anon, authenticated;

-- Restrictive policy also constrains permissive policies installed previously.
drop policy if exists "Email starts pending only" on public.fleet_email_deliveries;
create policy "Email starts pending only" on public.fleet_email_deliveries as restrictive
  for insert to anon, authenticated
  with check (status = 'encaminhado' and confirmed_at is null and error_message is null);
revoke update, delete on public.fleet_email_deliveries from anon, authenticated;
commit;

-- Activation is deliberately separate. Only run the following AFTER configuring
-- the secret, deploying Apps Script and verifying its authenticated callback:
-- revoke execute on function public.fleet_confirm_email_delivery(text,text,text)
--   from public, anon, authenticated;
