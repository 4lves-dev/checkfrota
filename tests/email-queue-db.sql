-- Transactional smoke test: no mail, no persisted test records or setting change.
begin;
do $$
declare test_id text := 'queue-smoke-'||gen_random_uuid()::text;
begin
  begin
    perform public.fleet_claim_email('invalid-test-token');
    raise exception 'FAIL: anonymous queue access was accepted';
  exception when insufficient_privilege then null;
  end;
  if exists(select 1 from checkfrota_private.email_queue_control where singleton and enabled) then
    raise exception 'Run this staged smoke test before activation only';
  end if;
  update checkfrota_private.email_queue_control set enabled=true where singleton;
  insert into public.fleet_email_deliveries(id,inspection_id,status,recipient)
    values('legacy-before-'||test_id,test_id,'encaminhado','urbamfrota@gmail.com');
  insert into public.fleet_inspections(id,data) values(test_id,jsonb_build_object('id',test_id,'vehiclePrefix','TEST','items','[]'::jsonb));
  insert into public.fleet_inspections(id,data) values(test_id,'{}') on conflict do nothing;
  insert into public.fleet_email_deliveries(id,inspection_id,status,recipient)
    values('legacy-after-'||test_id,test_id,'encaminhado','urbamfrota@gmail.com');
  if (select count(*) from checkfrota_private.email_queue where inspection_id=test_id) <> 1 then
    raise exception 'FAIL: inspection did not create exactly one queue job';
  end if;
  if (select count(*) from public.fleet_email_deliveries where inspection_id=test_id and recipient='urbamfrota@gmail.com' and status='encaminhado') <> 1 then
    raise exception 'FAIL: canonical delivery record missing';
  end if;
end; $$;
select 'PASS: invalid token denied; one job and delivery per inspection; rollback follows' as resultado;
rollback;
