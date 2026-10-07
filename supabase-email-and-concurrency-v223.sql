-- URBAM Frotas v223: confirmação de e-mail e proteção contra atualização simultânea.
-- Execute uma vez no SQL Editor do Supabase.

create table if not exists public.fleet_email_deliveries (
  id text primary key,
  inspection_id text not null,
  status text not null default 'encaminhado' check (status in ('encaminhado','enviado','falhou')),
  recipient text,
  error_message text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

alter table public.fleet_email_deliveries enable row level security;
drop policy if exists "Aplicativo cria rastreio de e-mail" on public.fleet_email_deliveries;
create policy "Aplicativo cria rastreio de e-mail" on public.fleet_email_deliveries for insert to anon, authenticated with check (true);

create or replace function public.fleet_confirm_email_delivery(p_delivery_id text, p_status text, p_error text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.fleet_email_deliveries
     set status = case when p_status in ('enviado','falhou') then p_status else 'falhou' end,
         error_message = nullif(trim(coalesce(p_error,'')), ''), confirmed_at = now()
   where id = p_delivery_id;
end; $$;
-- Não reabrir o callback legado ao reaplicar esta migração.
-- Use supabase-email-confirmation-secure.sql e a chave privada no Apps Script.
revoke execute on function public.fleet_confirm_email_delivery(text,text,text) from public, anon, authenticated;

alter table public.fleet_issues add column if not exists revision integer not null default 1;

create or replace function public.fleet_update_issue_if_current(p_issue_id text, p_expected_revision integer, p_status text, p_data jsonb)
returns table(revision integer) language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.fleet_is_manager() then
    raise exception 'Acesso restrito à gestão autorizada.' using errcode = '42501';
  end if;
  return query
  update public.fleet_issues
     set status = p_status, data = p_data, revision = public.fleet_issues.revision + 1, updated_at = now()
   where id = p_issue_id and public.fleet_issues.revision = p_expected_revision
   returning public.fleet_issues.revision;
end; $$;
revoke execute on function public.fleet_update_issue_if_current(text,integer,text,jsonb) from public, anon;
grant execute on function public.fleet_update_issue_if_current(text,integer,text,jsonb) to authenticated;
