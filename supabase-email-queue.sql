-- Staged migration: disabled until the Apps Script worker is deployed and tested.
-- Requires supabase-email-confirmation-secure.sql. No historical backfill.
begin;
create table if not exists checkfrota_private.email_queue_control (
  singleton boolean primary key default true check(singleton),
  enabled boolean not null default false
);
insert into checkfrota_private.email_queue_control(singleton) values(true) on conflict do nothing;
create table if not exists checkfrota_private.email_queue (
  inspection_id text primary key references public.fleet_inspections(id) on delete cascade,
  delivery_id text not null unique default gen_random_uuid()::text,
  state text not null default 'pending' check(state in ('pending','preparing','sending','sent','uncertain','failed')),
  lease text,
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_error text
);
alter table checkfrota_private.email_queue_control enable row level security;
alter table checkfrota_private.email_queue enable row level security;
revoke all on checkfrota_private.email_queue_control, checkfrota_private.email_queue from public, anon, authenticated;

create or replace function checkfrota_private.require_email_worker(p_token text)
returns void language plpgsql security definer set search_path=pg_catalog as $$
declare expected text;
begin
  select secret_hash into expected from checkfrota_private.email_confirmation_config where singleton;
  if expected is null or length(coalesce(p_token,'')) < 32
    or encode(sha256(convert_to(p_token,'UTF8')),'hex') is distinct from expected then
    raise exception 'Integração não autorizada.' using errcode='42501';
  end if;
end; $$;
revoke all on function checkfrota_private.require_email_worker(text) from public, anon, authenticated;

create or replace function checkfrota_private.enqueue_inspection_email()
returns trigger language plpgsql security definer set search_path=pg_catalog as $$
begin
  if exists(select 1 from checkfrota_private.email_queue_control where singleton and enabled) then
    insert into checkfrota_private.email_queue(inspection_id) values(new.id) on conflict do nothing;
    insert into public.fleet_email_deliveries(id,inspection_id,status,recipient)
      select delivery_id,inspection_id,'encaminhado','urbamfrota@gmail.com'
      from checkfrota_private.email_queue where inspection_id=new.id on conflict do nothing;
  end if;
  return new;
end; $$;
revoke all on function checkfrota_private.enqueue_inspection_email() from public, anon, authenticated;
drop trigger if exists enqueue_inspection_email on public.fleet_inspections;
create trigger enqueue_inspection_email after insert on public.fleet_inspections
  for each row execute function checkfrota_private.enqueue_inspection_email();

-- Older phones still create a tracking ID. Keep the canonical server ID only.
create or replace function checkfrota_private.guard_queue_delivery_id()
returns trigger language plpgsql security definer set search_path=pg_catalog as $$
begin
  if exists(select 1 from checkfrota_private.email_queue_control where singleton and enabled)
    and not exists(select 1 from checkfrota_private.email_queue where inspection_id=new.inspection_id and delivery_id=new.id) then
    return null;
  end if;
  return new;
end; $$;
revoke all on function checkfrota_private.guard_queue_delivery_id() from public,anon,authenticated;
drop trigger if exists guard_queue_delivery_id on public.fleet_email_deliveries;
create trigger guard_queue_delivery_id before insert on public.fleet_email_deliveries
  for each row execute function checkfrota_private.guard_queue_delivery_id();

create or replace function public.fleet_claim_email(p_token text)
returns jsonb language plpgsql security definer set search_path=pg_catalog as $$
declare job checkfrota_private.email_queue%rowtype; inspection jsonb; issues jsonb;
begin
  perform checkfrota_private.require_email_worker(p_token);
  if not exists(select 1 from checkfrota_private.email_queue_control where singleton and enabled) then
    return null;
  end if;
  -- A crash after the send gate cannot safely be retried automatically.
  update checkfrota_private.email_queue set state='uncertain',last_error='Resultado do envio requer conferência.',updated_at=now()
    where state='sending' and updated_at < now()-interval '15 minutes';
  update checkfrota_private.email_queue set state='failed',last_error='Limite de preparação atingido.',updated_at=now()
    where state='preparing' and attempts>=5 and updated_at<now()-interval '15 minutes';
  update public.fleet_email_deliveries d set status='falhou',error_message=q.last_error,confirmed_at=now()
    from checkfrota_private.email_queue q where d.id=q.delivery_id and q.state='failed' and d.status<>'enviado';
  select q.* into job from checkfrota_private.email_queue q
    join public.fleet_inspections i on i.id=q.inspection_id
    where ((q.state='pending' and q.available_at<=now()) or
      (q.state='preparing' and q.updated_at<now()-interval '15 minutes'))
      and q.attempts<5
      -- Wait for occurrence writes; never send a partial checklist as complete.
      and (select count(*) from public.fleet_issues x where x.inspection_id=i.id) >=
        (select count(*) from jsonb_array_elements(case when jsonb_typeof(i.data->'items')='array' then i.data->'items' else '[]'::jsonb end) item where item->>'status'='issue')
        + case when i.data->>'washRequested'='true' then 1 else 0 end
    order by q.available_at for update of q skip locked limit 1;
  if not found then return null; end if;
  update checkfrota_private.email_queue set state='preparing',lease=gen_random_uuid()::text,
    attempts=attempts+1,updated_at=now() where inspection_id=job.inspection_id returning * into job;
  select data||jsonb_build_object('id',id) into inspection from public.fleet_inspections where id=job.inspection_id;
  select coalesce(jsonb_agg(data||jsonb_build_object('id',id)),'[]'::jsonb) into issues
    from public.fleet_issues where inspection_id=job.inspection_id;
  return jsonb_build_object('inspection',inspection,'issues',issues,'lease',job.lease,'emailDeliveryId',job.delivery_id,
    'vehicle',jsonb_build_object('prefix',inspection->>'vehiclePrefix','plate',inspection->>'vehiclePlate',
      'type',inspection->>'vehicleType','model',inspection->>'vehicleModel'));
end; $$;

create or replace function public.fleet_email_transition(p_token text,p_inspection_id text,p_lease text,p_action text,p_error text default '')
returns boolean language plpgsql security definer set search_path=pg_catalog as $$
declare job checkfrota_private.email_queue%rowtype;
begin
  perform checkfrota_private.require_email_worker(p_token);
  select * into job from checkfrota_private.email_queue where inspection_id=p_inspection_id and lease=p_lease for update;
  if not found then return false; end if;
  if p_action='sending' and job.state='preparing' and job.updated_at>now()-interval '15 minutes' then
    update checkfrota_private.email_queue set state='sending',updated_at=now() where inspection_id=p_inspection_id;
  elsif p_action='sent' and job.state in ('sending','uncertain','sent') then
    update checkfrota_private.email_queue set state='sent',last_error=null,updated_at=now() where inspection_id=p_inspection_id;
    update public.fleet_email_deliveries set status='enviado',confirmed_at=now(),error_message=null where id=job.delivery_id and inspection_id=p_inspection_id;
  elsif p_action='retry' and job.state='preparing' then
    update checkfrota_private.email_queue set state=case when attempts>=5 then 'failed' else 'pending' end,
      available_at=now()+interval '5 minutes',last_error=left(p_error,500),updated_at=now() where inspection_id=p_inspection_id;
    if job.attempts>=5 then
      update public.fleet_email_deliveries set status='falhou',error_message=left(p_error,500),confirmed_at=now()
        where id=job.delivery_id and inspection_id=p_inspection_id and status<>'enviado';
    end if;
  elsif p_action='uncertain' and job.state='sending' then
    update checkfrota_private.email_queue set state='uncertain',last_error=left(p_error,500),updated_at=now() where inspection_id=p_inspection_id;
  else return false;
  end if;
  return true;
end; $$;
revoke all on function public.fleet_claim_email(text),public.fleet_email_transition(text,text,text,text,text) from public;
grant execute on function public.fleet_claim_email(text),public.fleet_email_transition(text,text,text,text,text) to anon, authenticated;
commit;
