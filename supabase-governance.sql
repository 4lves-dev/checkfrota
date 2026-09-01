-- GOVERNANÇA, AUDITORIA E PROTEÇÃO DE DECISÕES
-- Execute este arquivo UMA VEZ no SQL Editor do projeto Supabase.
-- Não apaga registros existentes.

create table if not exists public.fleet_audit_events (
  id uuid primary key default gen_random_uuid(),
  issue_id text,
  vehicle_id text,
  action text not null,
  detail text not null default '',
  actor_email text,
  actor_name text,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists fleet_audit_events_issue_created_idx
  on public.fleet_audit_events (issue_id, created_at desc);
create index if not exists fleet_audit_events_vehicle_created_idx
  on public.fleet_audit_events (vehicle_id, created_at desc);

-- Correções cadastrais que também atingem registros já existentes no banco.
update public.fleet_vehicles
set prefix = case id when 'v1456' then '1456' else prefix end,
    plate = case id when 'v1456' then 'SHR7I28' when 'v1082' then 'GAS6B76' else plate end,
    data = case id
      when 'v1456' then jsonb_set(data, '{plate}', to_jsonb('SHR7I28'::text), true)
      when 'v1082' then jsonb_set(data, '{plate}', to_jsonb('GAS6B76'::text), true)
      when 'v1922' then jsonb_set(data, '{base}', to_jsonb('Base Abrigo'::text), true)
      when 'v1967' then jsonb_set(data, '{base}', to_jsonb('Base Abrigo'::text), true)
      else data
    end,
    updated_at = now()
where id in ('v1456','v1082','v1922','v1967');

alter table public.fleet_audit_events enable row level security;
drop policy if exists "Gestão consulta auditoria" on public.fleet_audit_events;
create policy "Gestão consulta auditoria"
on public.fleet_audit_events for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'luciano.silva@urbam.com.br');
drop policy if exists "Gestão registra auditoria" on public.fleet_audit_events;
create policy "Gestão registra auditoria"
on public.fleet_audit_events for insert to authenticated
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'luciano.silva@urbam.com.br');

-- A decisão passa a exigir a senha numérica confirmada no login.
-- Isso impede que a matrícula isolada seja usada para aprovar, recusar ou devolver chamados.
create or replace function public.fleet_record_leader_decision(
  p_registration text, p_pin text, p_issue_id text, p_status text, p_note text default ''
) returns void
language plpgsql security definer set search_path = public
as $$
declare employee public.fleet_employees%rowtype;
declare issue public.fleet_issues%rowtype;
declare row_status text;
declare decision jsonb;
begin
  if p_status not in ('Aprovada','Retificação solicitada','Recusada') then
    raise exception 'Decisão inválida.';
  end if;
  if p_registration !~ '^[0-9]+$' or p_pin !~ '^[0-9]+$' then
    raise exception 'Matrícula e senha devem conter somente números.';
  end if;
  select * into employee from public.fleet_employees
  where registration = p_registration and active = true
    and access_level in ('lider','coordenador','gestor');
  if not found or employee.access_pin_hash is null
     or extensions.crypt(p_pin, employee.access_pin_hash) <> employee.access_pin_hash then
    raise exception 'Sessão de liderança inválida. Entre novamente.';
  end if;
  select * into issue from public.fleet_issues where id = p_issue_id for update;
  if not found then raise exception 'Chamado não encontrado.'; end if;
  if employee.access_level = 'lider'
     and coalesce(issue.data ->> 'baseName','') <> coalesce(employee.leader_base,'') then
    raise exception 'Este chamado pertence a outra base.';
  end if;
  row_status := case p_status when 'Aprovada' then 'aprovada' when 'Retificação solicitada' then 'retificacao' else 'recusada' end;
  decision := jsonb_build_object(
    'status', p_status,
    'note', coalesce(p_note,''),
    'approvedAt', now(),
    'approvedBy', case employee.access_level when 'lider' then 'Líder: ' when 'coordenador' then 'Coordenador: ' else 'Gestor: ' end || employee.name,
    'dispatchStatus', case p_status when 'Aprovada' then 'Aguardando gestor' when 'Retificação solicitada' then 'Aguardando colaborador' else 'Encerrado' end
  );
  update public.fleet_issues
  set status = row_status, data = jsonb_set(issue.data, '{leaderApproval}', decision, true)
  where id = p_issue_id;
  insert into public.fleet_audit_events (issue_id, vehicle_id, action, detail, actor_name, snapshot)
  values (issue.id, issue.vehicle_id, lower(replace(p_status, ' ', '_')), coalesce(p_note,''), employee.name, decision);
end;
$$;

revoke all on function public.fleet_record_leader_decision(text,text,text,text,text) from public;
grant execute on function public.fleet_record_leader_decision(text,text,text,text,text) to anon, authenticated;

-- A função antiga não pode permanecer acessível, pois não pedia a senha.
revoke all on function public.fleet_record_leader_decision(text,text,text,text) from public;

-- Limites complementares para o banco: campos de situação conhecidos e trilha de data.
alter table public.fleet_issues
  drop constraint if exists fleet_issues_status_check;
alter table public.fleet_issues
  add constraint fleet_issues_status_check
  check (status in ('aberta','aprovada','retificacao','recusada','reenviada','resolvida'));

