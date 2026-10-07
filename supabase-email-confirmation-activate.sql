-- Execute somente após publicar o Apps Script com callback seguro e validar
-- um envio real com status enviado e confirmed_at preenchido no banco.
begin;
do $$
begin
  if to_regprocedure('public.fleet_confirm_email_delivery_secure(text,text,text,text,text)') is null then
    raise exception 'Instale e valide a confirmação segura antes de ativar.';
  end if;
  if not exists (select 1 from checkfrota_private.email_confirmation_config where singleton and length(secret_hash)=64) then
    raise exception 'Configure e valide a chave privada antes de ativar.';
  end if;
end; $$;
revoke execute on function public.fleet_confirm_email_delivery(text,text,text) from public, anon, authenticated;
commit;
select has_function_privilege('anon','public.fleet_confirm_email_delivery(text,text,text)','EXECUTE') as antigo_anon,
       has_function_privilege('authenticated','public.fleet_confirm_email_delivery(text,text,text)','EXECUTE') as antigo_autenticado;
