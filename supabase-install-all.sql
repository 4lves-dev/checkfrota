-- INSTALADOR ÚNICO DO BANCO — URBAM Frotas
-- Versão 205. Execute este arquivo completo no SQL Editor do Supabase.
-- É idempotente e preserva chamados, veículos, inspeções e colaboradores existentes.
-- Não execute arquivos SQL antigos separadamente depois deste instalador.

set statement_timeout = '120s';


-- ============================================================================
-- COMPONENTE: supabase-rebuild.sql
-- ============================================================================
-- RECONSTRUÇÃO SEGURA DO BANCO DO URBAM FROTA
-- Execute primeiro este arquivo no SQL Editor do Supabase.
-- Ele NÃO apaga ocorrências existentes. Foram encontrados 54 chamados na nuvem.
-- Depois execute o arquivo supabase-employees.sql para recriar a base de colaboradores.

create table if not exists public.fleet_vehicles (
  id text primary key,
  prefix text,
  plate text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fleet_inspections (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.fleet_issues (
  id text primary key,
  inspection_id text,
  vehicle_id text,
  status text not null default 'aberta',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Compatibilidade com tabelas antigas, sem alterar ou apagar os registros atuais.
alter table public.fleet_vehicles add column if not exists prefix text;
alter table public.fleet_vehicles add column if not exists plate text;
alter table public.fleet_vehicles add column if not exists data jsonb not null default '{}'::jsonb;
alter table public.fleet_inspections add column if not exists data jsonb not null default '{}'::jsonb;
alter table public.fleet_issues add column if not exists inspection_id text;
alter table public.fleet_issues add column if not exists vehicle_id text;
alter table public.fleet_issues add column if not exists status text not null default 'aberta';
alter table public.fleet_issues add column if not exists data jsonb not null default '{}'::jsonb;

-- A tabela antiga usa UUID em id, mas a frota do aplicativo usa códigos como
-- v1446. A conversão preserva o veículo já salvo e permite sincronizar a frota.
alter table public.fleet_vehicles alter column id drop default;
alter table public.fleet_vehicles alter column id type text using id::text;

alter table public.fleet_vehicles enable row level security;
alter table public.fleet_inspections enable row level security;
alter table public.fleet_issues enable row level security;

-- O aplicativo precisa ler a frota, chamados e inspeções sem exigir login do colaborador.
drop policy if exists "Aplicativo lê veículos" on public.fleet_vehicles;
create policy "Aplicativo lê veículos" on public.fleet_vehicles for select to anon, authenticated using (true);
drop policy if exists "Aplicativo lê inspeções" on public.fleet_inspections;
create policy "Aplicativo lê inspeções" on public.fleet_inspections for select to anon, authenticated using (true);
drop policy if exists "Aplicativo registra inspeções" on public.fleet_inspections;
create policy "Aplicativo registra inspeções" on public.fleet_inspections for insert to anon, authenticated with check (true);
drop policy if exists "Aplicativo lê chamados" on public.fleet_issues;
create policy "Aplicativo lê chamados" on public.fleet_issues for select to anon, authenticated using (true);
drop policy if exists "Aplicativo registra chamados" on public.fleet_issues;
create policy "Aplicativo registra chamados" on public.fleet_issues for insert to anon, authenticated with check (true);
drop policy if exists "Aplicativo atualiza chamados" on public.fleet_issues;
create policy "Aplicativo atualiza chamados" on public.fleet_issues for update to anon, authenticated using (true) with check (true);

-- Gestão de veículos continua exclusiva do Administrador Master.
drop policy if exists "Administrador Master administra veículos" on public.fleet_vehicles;
create policy "Administrador Master administra veículos"
on public.fleet_vehicles for all to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'luciano.silva@urbam.com.br')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'luciano.silva@urbam.com.br');

-- Frota padrão. Veículos já encontrados pela placa ou prefixo são preservados.
with fleet_seed (id, prefix, plate, data) as (values
('v1446','1446','SHR7161','{"id":"v1446","prefix":"1446","plate":"SHR7161","type":"Carro","model":"Onix","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"50/23","urbamContract":"620/24","odometer":""}'::jsonb),
('v1447','1447','SHL7J59','{"id":"v1447","prefix":"1447","plate":"SHL7J59","type":"Carro","model":"Onix","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"50/23","urbamContract":"482/22","odometer":""}'::jsonb),
('v1456','1456','SHR7I28','{"id":"v1456","prefix":"1456","plate":"SHR7I28","type":"Utilitário","model":"Furgão Peugeot","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"58/23","urbamContract":"44/23","odometer":""}'::jsonb),
('v1466','1466','SIA9F89','{"id":"v1466","prefix":"1466","plate":"SIA9F89","type":"Carro","model":"Orochi","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"115/23","urbamContract":"620/24","odometer":""}'::jsonb),
('v1894','1894','TKI5A73','{"id":"v1894","prefix":"1894","plate":"TKI5A73","type":"Carro","model":"Kwid","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"40/2025","urbamContract":"620/24","odometer":""}'::jsonb),
('v1922','1922','QSR4H49','{"id":"v1922","prefix":"1922","plate":"QSR4H49","type":"Utilitário","model":"Saveiro","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"100/25","urbamContract":"620/24","odometer":""}'::jsonb),
('v1484','1484','TEW4C59','{"id":"v1484","prefix":"1484","plate":"TEW4C59","type":"Caminhão","model":"VUC","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"066/25","urbamContract":"620/24","odometer":""}'::jsonb),
('v1485','1485','TEW4C66','{"id":"v1485","prefix":"1485","plate":"TEW4C66","type":"Caminhão","model":"VUC","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"066/25","urbamContract":"620/24","odometer":""}'::jsonb),
('v1486','1486','TEW4C63','{"id":"v1486","prefix":"1486","plate":"TEW4C63","type":"Caminhão","model":"VUC","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"066/25","urbamContract":"482/22","odometer":""}'::jsonb),
('v1799','1799','CZR0J46','{"id":"v1799","prefix":"1799","plate":"CZR0J46","type":"Utilitário","model":"Saveiro","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"178/23","urbamContract":"620/24","odometer":""}'::jsonb),
('v1969','1969','UDR0F38','{"id":"v1969","prefix":"1969","plate":"UDR0F38","type":"Caminhão","model":"Caminhão plataforma","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"172/25","urbamContract":"620/24","odometer":""}'::jsonb),
('v1126','1126','GHI9I25','{"id":"v1126","prefix":"1126","plate":"GHI9I25","type":"Caminhão","model":"Caminhão pequeno porte com cabine estendida","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"608/22","urbamContract":"482/22","odometer":""}'::jsonb),
('v1919','1919','TXF5B12','{"id":"v1919","prefix":"1919","plate":"TXF5B12","type":"Caminhão","model":"Caminhão 3/4 com cabine suplementar e cesto aéreo","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"075/25","urbamContract":"620/24","odometer":""}'::jsonb),
('v1082','1082','GAS6B76','{"id":"v1082","prefix":"1082","plate":"GAS6B76","type":"Caminhão","model":"Caminhão guindauto cesto","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"096/25","urbamContract":"482/22","odometer":""}'::jsonb),
('v1084','1084','FVY2G68','{"id":"v1084","prefix":"1084","plate":"FVY2G68","type":"Caminhão","model":"Caminhão guindauto cesto","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"096/25","urbamContract":"620/24","odometer":""}'::jsonb),
('v1577','1577','FVQ8C09','{"id":"v1577","prefix":"1577","plate":"FVQ8C09","type":"Caminhão","model":"Caminhão 3/4 com cabine suplementar","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"095/25","urbamContract":"620/24","odometer":""}'::jsonb),
('v1967','1967','UET6G08','{"id":"v1967","prefix":"1967","plate":"UET6G08","type":"Carro","model":"Strada","base":"Base Abrigo","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"059/26","urbamContract":"620/24","odometer":""}'::jsonb),
('v1968','1968','UED5G69','{"id":"v1968","prefix":"1968","plate":"UED5G69","type":"Carro","model":"Strada","manager":"Julio — Gestor de Contratos","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"059/26","urbamContract":"620/24","odometer":""}'::jsonb),
('v157','157','SVP0D79','{"id":"v157","prefix":"157","plate":"SVP0D79","type":"Caminhão","model":"Iveco/Tector 17-280","ownerName":"URBAM","ownerPhone":"","email":"","contract":"","urbamContract":"","odometer":""}'::jsonb)
)
insert into public.fleet_vehicles (id, prefix, plate, data)
select seed.id, seed.prefix, seed.plate, seed.data
from fleet_seed seed
where not exists (
  select 1 from public.fleet_vehicles current
  where current.id = seed.id or current.prefix = seed.prefix or current.plate = seed.plate
);


-- ============================================================================
-- COMPONENTE: supabase-employees.sql
-- ============================================================================
-- Execute este arquivo no SQL Editor do projeto Supabase do URBAM Frota.
-- A tabela centraliza matrícula, nome e função. Auxiliares de serviços gerais não foram incluídos.

create table if not exists public.fleet_employees (
  registration text primary key,
  name text not null,
  role text not null,
  active boolean not null default true,
  leader boolean not null default false,
  leader_base text,
  access_level text not null default 'colaborador',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fleet_employees add column if not exists leader boolean not null default false;
alter table public.fleet_employees add column if not exists leader_base text;
alter table public.fleet_employees add column if not exists access_level text not null default 'colaborador';

alter table public.fleet_employees drop constraint if exists fleet_employees_access_level_check;
alter table public.fleet_employees add constraint fleet_employees_access_level_check
  check (access_level in ('colaborador', 'lider', 'coordenador', 'gestor'));

update public.fleet_employees set access_level = 'lider'
where leader = true and access_level = 'colaborador';

alter table public.fleet_employees enable row level security;

drop policy if exists "Consulta pública de colaboradores ativos" on public.fleet_employees;
create policy "Consulta pública de colaboradores ativos"
on public.fleet_employees for select
using (active = true);

drop policy if exists "Gestão administra colaboradores" on public.fleet_employees;
drop policy if exists "Administrador Master administra colaboradores" on public.fleet_employees;
create policy "Administrador Master administra colaboradores"
on public.fleet_employees for all to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'luciano.silva@urbam.com.br')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'luciano.silva@urbam.com.br');

insert into public.fleet_employees (registration, name, role, active) values
  ('18593', 'JULIO CESAR VIEIRA DA SILVA', 'Engenheiro civil', true),
  ('17672', 'SILVIA CRISTINA TELES DE TOLEDO', 'Analista administrativo', true),
  ('18920', 'LUIS CARLOS ROMERO', 'Almoxarife', true),
  ('17208', 'CRISTINA NASTI TAVARES', 'Coordenadora', true),
  ('23761', 'BRUNA CRISTINA DE ABREU MACHADO', 'Escriturário', true),
  ('23764', 'FLAVIA MACHADO RIGOTTI', 'Escriturário', true),
  ('25310', 'LUIS ROBERTO COSTA', 'Escriturário', true),
  ('18919', 'ALEX MACHADO DA SILVA', 'Líder operacional', true),
  ('24846', 'EDMILSON EVANGELISTA DA CRUZ', 'Pintor predial', true),
  ('18365', 'EDSON DO AMARAL DE CARVALHO', 'Motorista', true),
  ('22748', 'RENATO TARTAGLIONE FONSECA', 'Motorista', true),
  ('23141', 'VIDAL FELIX DE SOUZA RIBEIRO', 'Pintor predial', true),
  ('18123', 'ALEXANDRE FERREIRA DA SILVA ARAUJO', 'Pintor predial', true),
  ('14246', 'RICARDO BATISTA DE ALMEIDA', 'Pintor predial', true),
  ('25082', 'ANDRE LUIZ DE ABREU', 'Pintor predial', true),
  ('14443', 'MOACIR PISARRO', 'Pintor predial', true),
  ('17096', 'MARCO ALEXANDRE DE OLIVEIRA', 'Motorista', true),
  ('17148', 'TIAGO PEREIRA DE MELO', 'Operador de máquinas leves', true),
  ('24567', 'CLAUDINEI LUIS CARDOSO', 'Pintor predial', true),
  ('22300', 'FRANCISCO RODRIGUES DA SILVA', 'Pintor predial', true),
  ('12928', 'LUIZ SERGIO NOGUEIRA', 'Pintor predial', true),
  ('18918', 'WESLEY POLICARPO GABRIEL DE MORAES', 'Pintor predial', true),
  ('23480', 'ITALO JORGE LEMES CARDOSO', 'Pintor predial', true),
  ('14361', 'ALEIXO DE OLIVEIRA CEZAR', 'Motorista', true),
  ('13534', 'ANTONIO CARLOS VIEIRA BORGO', 'Operador de máquinas leves', true),
  ('13111', 'MARCOS AURELIO FERREIRA DE LIMA', 'Líder operacional', true),
  ('24117', 'HELIO PEREIRA MAIA', 'Pintor predial', true),
  ('14381', 'JOSE RODOLFO TELES', 'Motorista', true),
  ('22445', 'ARIVALDO DOS SANTOS', 'Líder operacional', true),
  ('14119', 'ANDRE PEREIRA DO CARMO', 'Motorista', true),
  ('23806', 'BENEDITO PEDRO CARLOS DO COUTO FARIA', 'Pintor predial', true),
  ('24134', 'DANIEL MARTINS DA SILVA', 'Pintor predial', true),
  ('15239', 'ISAIAS RAFAEL DO NASCIMENTO', 'Líder operacional I', true),
  ('20869', 'EDMILSON SILVA SANTOS', 'Monitor de serviços gerais', true),
  ('17213', 'PEDRO PAULO CORREIA', 'Pedreiro I', true),
  ('17879', 'TIAGO APARECIDO DE MORAES', 'Motorista', true),
  ('17793', 'JOAO PAULO DA ROCHA', 'Motorista', true),
  ('14840', 'FERNANDO APARECIDO DOS SANTOS', 'Monitor de serviços gerais', true),
  ('18407', 'EDSON RODRIGUES DA SILVA APOLINARIO', 'Pintor predial', true),
  ('24040', 'EMERSON ALEXANDRE CHINA', 'Pintor predial', true),
  ('13948', 'CARLOS ALBERTO DE ABREU', 'Líder operacional II', true),
  ('22911', 'BRUNO GLAUCO FELICIO', 'Monitor de serviços gerais', true),
  ('18849', 'REINALDO ALESSANDRO GONCALVES', 'Pedreiro I', true),
  ('17695', 'LINDEMBERG UBIRAJARA DOS SANTOS', 'Monitor de serviços gerais', true),
  ('22773', 'FELIPE MATIAS DO CARMO', 'Pintor predial', true),
  ('18938', 'LUIZ DE MELO MARCAL', 'Pintor predial', true),
  ('16847', 'MARCELO MELO', 'Líder operacional', true),
  ('16299', 'JOSELINE APARECIDA DOS SANTOS', 'Monitor de serviços gerais', true),
  ('23957', 'RAFAEL ESTEVÃO TAVARES ALVES', 'Monitor de serviços gerais', true),
  ('16428', 'CARLOS ROBERTO DE MORAIS FILHO', 'Motorista', true),
  ('18095', 'ARNON DA SILVA CUNHA', 'Monitor de serviços gerais', true),
  ('18739', 'LINDOMAR CASTILHO PEREIRA ALVES', 'Pedreiro I', true),
  ('15077', 'SILVERIO RODRIGUES FILHO', 'Pedreiro I', true),
  ('13902', 'VANDERLEY VELOSO DE MIRANDA', 'Eletricista de manutenção', true),
  ('17255', 'DANIEL DOS SANTOS DE SA', 'Motorista', true),
  ('23135', 'LUCIANO ALVES DA SILVA', 'Escriturário', true),
  ('24321', 'JOSE CELSO DE LIMA JUNIOR', 'Serralheiro', true),
  ('13997', 'ADENILSON SILVA PEREIRA', 'Líder operacional', true),
  ('18873', 'CARLA CRISTINA COUTO FARIA SANTOS', 'Monitor de serviços gerais', true),
  ('18891', 'JOAO PAULO GUEDES', 'Monitor de serviços gerais', true),
  ('22244', 'JOAO SILVERIO DA SILVA', 'Motorista', true),
  ('24154', 'SILVIO LUIZ DOS SANTOS', 'Monitor de serviços gerais', true),
  ('16746', 'ELIZEU DO NASCIMENTO FALCAO', 'Pedreiro I', true),
  ('15516', 'ANDRE DE JESUS COUTINHO', 'Motorista', true),
  ('18539', 'ROMEU CLEMENTE DE OLIVEIRA', 'Motorista', true),
  ('12894', 'RODOLFO DONIZETTI DA ROSA', 'Eletricista de manutenção', true),
  ('16590', 'FRANCISCO VILAMAR FERNANDES DA SILVA', 'Motorista', true),
  ('18380', 'ROGERIO EDUARDO DE OLIVEIRA', 'Escriturário', true),
  ('18876', 'RODOLFO CARLOS DA SILVA', 'Serralheiro', true),
  ('18930', 'RAFAEL GERARDO DE OLIVEIRA JUNIOR', 'Serralheiro', true),
  ('25940', 'EDSON JOSIAS RODRIGUES', 'Líder de obras', true),
  ('22940', 'EDSON JOSIAS RODRIGUES', 'Líder de obras', true),
  ('15552', 'MARCELO CESAR MEDEIROS', 'Pedreiro I', true),
  ('18848', 'ROBSON ALEXANDRE DA SILVA', 'Pedreiro I', true),
  ('22666', 'SAULO DE CARVALHO SILVA', 'Motorista', true),
  ('14087', 'PAULO DE FREITAS CARDOSO', 'Eletricista de manutenção', true),
  ('15723', 'CARLOS ALEXANDRE APARECIDO RAMOS', 'Motorista', true),
  ('23584', 'CLAUDINEI FERNANDES TEIXEIRA', 'Motorista', true),
  ('15809', 'LUIS ANTONIO VICHI', 'Motorista', true),
  ('18472', 'RODOLFO APARECIDO DA SILVA', 'Motorista', true),
  ('25363', 'VALNEI APARECIDO LIMA', 'Motorista', true)
on conflict (registration) do update set
  name = excluded.name,
  role = excluded.role,
  active = excluded.active,
  updated_at = now();

-- ============================================================================
-- COMPONENTE: supabase-access-levels.sql
-- ============================================================================
-- Perfis de acesso do URBAM Frota.
-- Execute uma vez no SQL Editor do Supabase.
alter table public.fleet_employees
  add column if not exists access_level text not null default 'colaborador';

alter table public.fleet_employees
  drop constraint if exists fleet_employees_access_level_check;

alter table public.fleet_employees
  add constraint fleet_employees_access_level_check
  check (access_level in ('colaborador', 'lider', 'coordenador', 'gestor'));

-- Mantém os líderes já cadastrados no perfil correto.
update public.fleet_employees
set access_level = 'lider'
where leader = true and access_level = 'colaborador';

-- ============================================================================
-- COMPONENTE: supabase-leaders.sql
-- ============================================================================
-- Execute este arquivo uma única vez no SQL Editor do Supabase.
-- Ele adiciona o controle de acesso da Liderança à tabela de colaboradores.

alter table public.fleet_employees
  add column if not exists leader boolean not null default false,
  add column if not exists leader_base text,
  add column if not exists access_level text not null default 'colaborador';

alter table public.fleet_employees
  drop constraint if exists fleet_employees_access_level_check;

alter table public.fleet_employees
  add constraint fleet_employees_access_level_check
  check (access_level in ('colaborador', 'lider', 'coordenador', 'gestor'));

update public.fleet_employees set access_level = 'lider'
where leader = true and access_level = 'colaborador';

alter table public.fleet_employees
  drop constraint if exists fleet_employees_leader_base_check;

alter table public.fleet_employees
  add constraint fleet_employees_leader_base_check
  check (leader_base is null or leader_base in ('Vertical', 'Horizontal', 'Abrigo', 'SASC'));

-- Exemplo de conferência após cadastrar líderes pelo painel de Gestão:
-- select registration, name, role, leader, leader_base
-- from public.fleet_employees where leader = true order by name;

-- ============================================================================
-- COMPONENTE: supabase-governance.sql
-- ============================================================================
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
  -- Compatível tanto com IDs UUID quanto com IDs text no banco.
  select * into issue from public.fleet_issues where id::text = p_issue_id for update;
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
  where id::text = p_issue_id;
  insert into public.fleet_audit_events (issue_id, vehicle_id, action, detail, actor_name, snapshot)
  values (issue.id::text, issue.vehicle_id::text, lower(replace(p_status, ' ', '_')), coalesce(p_note,''), employee.name, decision);
end;
$$;

revoke all on function public.fleet_record_leader_decision(text,text,text,text,text) from public;
grant execute on function public.fleet_record_leader_decision(text,text,text,text,text) to anon, authenticated;

-- A função antiga não pode permanecer acessível, pois não pedia a senha.
drop function if exists public.fleet_record_leader_decision(text,text,text,text);

-- Limites complementares para o banco: campos de situação conhecidos e trilha de data.
alter table public.fleet_issues
  drop constraint if exists fleet_issues_status_check;
alter table public.fleet_issues
  add constraint fleet_issues_status_check
  check (status in ('aberta','aprovada','retificacao','recusada','reenviada','resolvida'));

-- ============================================================================
-- COMPONENTE: supabase-security-hardening-v157.sql
-- ============================================================================
-- CHECKFROTA — PERFIS, RLS E FLUXO SEGURO (v157)
-- Execute APÓS supabase-rebuild.sql, supabase-employees.sql e supabase-governance.sql.
-- Este script não apaga chamados, inspeções ou veículos.
-- Importante: o segundo gestor é cadastrado diretamente no SQL Editor, ao final,
-- para que o e-mail profissional dele não fique exposto no repositório público.

begin;

create table if not exists public.fleet_management_users (
  email text primary key check (email = lower(email)),
  role text not null check (role in ('master','gestor')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.fleet_management_users (email, role, active)
values ('luciano.silva@urbam.com.br', 'master', true)
on conflict (email) do update set role = 'master', active = true, updated_at = now();

alter table public.fleet_management_users enable row level security;

create or replace function public.fleet_current_management_role()
returns text
language sql stable security definer set search_path = public
as $$
  select role from public.fleet_management_users
  where email = lower(coalesce(auth.jwt() ->> 'email', '')) and active = true
  limit 1;
$$;

create or replace function public.fleet_is_master()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.fleet_current_management_role() = 'master', false); $$;

create or replace function public.fleet_is_manager()
returns boolean
language sql stable security definer set search_path = public
as $$ select coalesce(public.fleet_current_management_role() in ('master','gestor'), false); $$;

revoke all on function public.fleet_current_management_role() from public;
revoke all on function public.fleet_is_master() from public;
revoke all on function public.fleet_is_manager() from public;
grant execute on function public.fleet_current_management_role() to authenticated;
grant execute on function public.fleet_is_master() to authenticated;
grant execute on function public.fleet_is_manager() to authenticated;

drop policy if exists "Master administra perfis de gestão" on public.fleet_management_users;
create policy "Master administra perfis de gestão" on public.fleet_management_users for all to authenticated
using (public.fleet_is_master()) with check (public.fleet_is_master());

drop policy if exists "Aplicativo lê veículos" on public.fleet_vehicles;
drop policy if exists "Administrador Master administra veículos" on public.fleet_vehicles;
drop policy if exists "Gestão lê veículos" on public.fleet_vehicles;
drop policy if exists "Master administra veículos" on public.fleet_vehicles;
create policy "Gestão lê veículos" on public.fleet_vehicles for select to authenticated using (public.fleet_is_manager());
create policy "Master administra veículos" on public.fleet_vehicles for all to authenticated
using (public.fleet_is_master()) with check (public.fleet_is_master());

drop policy if exists "Aplicativo lê inspeções" on public.fleet_inspections;
drop policy if exists "Aplicativo registra inspeções" on public.fleet_inspections;
drop policy if exists "Gestão lê inspeções" on public.fleet_inspections;
drop policy if exists "Colaborador registra inspeções" on public.fleet_inspections;
create policy "Gestão lê inspeções" on public.fleet_inspections for select to authenticated using (public.fleet_is_manager());
create policy "Colaborador registra inspeções" on public.fleet_inspections for insert to anon, authenticated
with check (coalesce(data ->> 'driverRegistration','') ~ '^[0-9]{3,}$' and length(regexp_replace(coalesce(data ->> 'driverPhone',''), '\D', '', 'g')) between 10 and 13);

drop policy if exists "Aplicativo lê chamados" on public.fleet_issues;
drop policy if exists "Aplicativo registra chamados" on public.fleet_issues;
drop policy if exists "Aplicativo atualiza chamados" on public.fleet_issues;
drop policy if exists "Gestão lê chamados" on public.fleet_issues;
drop policy if exists "Gestão atualiza chamados" on public.fleet_issues;
drop policy if exists "Colaborador registra chamados" on public.fleet_issues;
create policy "Gestão lê chamados" on public.fleet_issues for select to authenticated using (public.fleet_is_manager());
create policy "Gestão atualiza chamados" on public.fleet_issues for update to authenticated
using (public.fleet_is_manager()) with check (public.fleet_is_manager());
create policy "Colaborador registra chamados" on public.fleet_issues for insert to anon, authenticated
with check (coalesce(data ->> 'driverRegistration','') ~ '^[0-9]{3,}$' and length(regexp_replace(coalesce(data ->> 'driverPhone',''), '\D', '', 'g')) between 10 and 13);

drop policy if exists "Gestão consulta auditoria" on public.fleet_audit_events;
drop policy if exists "Gestão registra auditoria" on public.fleet_audit_events;
create policy "Gestão consulta auditoria" on public.fleet_audit_events for select to authenticated using (public.fleet_is_manager());
create policy "Gestão registra auditoria" on public.fleet_audit_events for insert to authenticated with check (public.fleet_is_manager());

create or replace function public.fleet_driver_returns(p_registration text, p_phone text)
returns table (id text, status text, data jsonb, created_at timestamptz)
language plpgsql security definer set search_path = public
as $$
declare normalized_phone text := regexp_replace(coalesce(p_phone,''), '\D', '', 'g');
begin
  if p_registration !~ '^[0-9]{3,}$' or length(normalized_phone) not between 10 and 13 then raise exception 'Identificação do colaborador inválida.'; end if;
  return query select issue.id, issue.status, issue.data, issue.created_at from public.fleet_issues issue
  where issue.data ->> 'driverRegistration' = p_registration
    and regexp_replace(coalesce(issue.data ->> 'driverPhone',''), '\D', '', 'g') = normalized_phone
    and coalesce(issue.data -> 'leaderApproval' ->> 'status','') in ('Retificação solicitada','Recusada')
  order by issue.created_at desc;
end;
$$;

create or replace function public.fleet_driver_inspection(p_registration text, p_phone text, p_inspection_id text)
returns table (data jsonb)
language plpgsql security definer set search_path = public
as $$
declare normalized_phone text := regexp_replace(coalesce(p_phone,''), '\D', '', 'g');
begin
  if p_registration !~ '^[0-9]{3,}$' or length(normalized_phone) not between 10 and 13 then raise exception 'Identificação do colaborador inválida.'; end if;
  return query select inspection.data from public.fleet_inspections inspection
  where inspection.id = p_inspection_id and exists (
    select 1 from public.fleet_issues issue where issue.inspection_id = inspection.id
      and issue.data ->> 'driverRegistration' = p_registration
      and regexp_replace(coalesce(issue.data ->> 'driverPhone',''), '\D', '', 'g') = normalized_phone
  ) limit 1;
end;
$$;

create or replace function public.fleet_mark_driver_correction(p_registration text, p_phone text, p_issue_id text, p_inspection_id text, p_has_new_issues boolean)
returns void
language plpgsql security definer set search_path = public
as $$
declare normalized_phone text := regexp_replace(coalesce(p_phone,''), '\D', '', 'g');
declare issue public.fleet_issues%rowtype;
declare next_status text := case when coalesce(p_has_new_issues,false) then 'reenviada' else 'resolvida' end;
declare next_approval jsonb;
begin
  if p_registration !~ '^[0-9]{3,}$' or length(normalized_phone) not between 10 and 13 then raise exception 'Identificação do colaborador inválida.'; end if;
  select * into issue from public.fleet_issues where id = p_issue_id for update;
  if not found or issue.data ->> 'driverRegistration' <> p_registration
     or regexp_replace(coalesce(issue.data ->> 'driverPhone',''), '\D', '', 'g') <> normalized_phone then raise exception 'Chamado não encontrado para este colaborador.'; end if;
  next_approval := coalesce(issue.data -> 'leaderApproval','{}'::jsonb) || jsonb_build_object(
    'status', case when coalesce(p_has_new_issues,false) then 'Retificação reenviada' else 'Concluído sem observação' end,
    'correctedAt', now(), 'correctionInspectionId', p_inspection_id
  );
  update public.fleet_issues set status = next_status,
    data = jsonb_set(case when coalesce(p_has_new_issues,false) then issue.data else jsonb_set(issue.data, '{resolvedAt}', to_jsonb(now()), true) end, '{leaderApproval}', next_approval, true)
  where id = p_issue_id;
end;
$$;

create or replace function public.fleet_leader_issues(p_registration text, p_pin text)
returns table (data jsonb)
language plpgsql security definer set search_path = public
as $$
declare employee public.fleet_employees%rowtype;
begin
  if p_registration !~ '^[0-9]+$' or p_pin !~ '^[0-9]+$' then raise exception 'Sessão de liderança inválida.'; end if;
  select * into employee from public.fleet_employees where registration = p_registration and active = true and access_level in ('lider','coordenador','gestor');
  if not found or employee.access_pin_hash is null or extensions.crypt(p_pin, employee.access_pin_hash) <> employee.access_pin_hash then raise exception 'Sessão de liderança inválida.'; end if;
  return query select issue.data from public.fleet_issues issue
  where employee.access_level <> 'lider' or coalesce(issue.data ->> 'baseName','') = coalesce(employee.leader_base,'')
  order by issue.created_at desc;
end;
$$;

revoke all on function public.fleet_driver_returns(text,text) from public;
revoke all on function public.fleet_driver_inspection(text,text,text) from public;
revoke all on function public.fleet_mark_driver_correction(text,text,text,text,boolean) from public;
revoke all on function public.fleet_leader_issues(text,text) from public;
grant execute on function public.fleet_driver_returns(text,text) to anon, authenticated;
grant execute on function public.fleet_driver_inspection(text,text,text) to anon, authenticated;
grant execute on function public.fleet_mark_driver_correction(text,text,text,text,boolean) to anon, authenticated;
grant execute on function public.fleet_leader_issues(text,text) to anon, authenticated;

commit;

-- CADASTRO PRIVADO DO GESTOR SUBORDINADO (execute somente no SQL Editor):
-- insert into public.fleet_management_users (email, role, active)
-- values ('<e-mail-do-gestor>', 'gestor', true)
-- on conflict (email) do update set role = 'gestor', active = true, updated_at = now();

-- ============================================================================
-- COMPONENTE: supabase-leader-security.sql
-- ============================================================================
-- SEGURANÇA DE ACESSO DA LIDERANÇA
-- Execute no SQL Editor do Supabase após publicar a versão 149 do aplicativo.
-- A primeira senha é a matrícula. No primeiro acesso, o aplicativo exige a troca
-- por uma senha numérica de 6 a 12 dígitos, diferente da matrícula.

create extension if not exists pgcrypto;

alter table public.fleet_employees add column if not exists access_pin_hash text;
alter table public.fleet_employees add column if not exists must_change_pin boolean not null default true;
alter table public.fleet_employees add column if not exists pin_updated_at timestamptz;

-- Define somente a senha provisória de quem possui acesso à Liderança.
update public.fleet_employees
set access_pin_hash = extensions.crypt(registration, extensions.gen_salt('bf')),
    must_change_pin = true,
    pin_updated_at = now()
where active = true
  and access_level in ('lider', 'coordenador', 'gestor')
  and access_pin_hash is null;

-- Diretório público: matrícula, nome e função para preencher o checklist.
-- Senha, status de troca e demais campos internos não são expostos.
create or replace view public.fleet_employee_directory as
select registration, name, role, active, leader, leader_base, access_level
from public.fleet_employees;

revoke all on public.fleet_employees from anon;
grant select on public.fleet_employee_directory to anon, authenticated;

drop policy if exists "Consulta pública de colaboradores ativos" on public.fleet_employees;
drop policy if exists "Administrador Master consulta colaboradores" on public.fleet_employees;
create policy "Administrador Master consulta colaboradores"
on public.fleet_employees for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'luciano.silva@urbam.com.br');

create or replace function public.fleet_leader_login(p_registration text, p_pin text)
returns table (registration text, name text, leader_base text, access_level text, must_change_pin boolean)
language plpgsql security definer set search_path = public
as $$
declare employee public.fleet_employees%rowtype;
begin
  if p_registration !~ '^[0-9]+$' or p_pin !~ '^[0-9]+$' then
    raise exception 'Matrícula e senha devem conter somente números.';
  end if;
  select * into employee from public.fleet_employees
  where fleet_employees.registration = p_registration and active = true
  limit 1;
  if not found or employee.access_level not in ('lider','coordenador','gestor')
     or employee.access_pin_hash is null
     or extensions.crypt(p_pin, employee.access_pin_hash) <> employee.access_pin_hash then
    raise exception 'Matrícula ou senha inválida.';
  end if;
  return query select employee.registration, employee.name, employee.leader_base,
    employee.access_level, employee.must_change_pin;
end;
$$;

create or replace function public.fleet_change_leader_pin(
  p_registration text, p_current_pin text, p_new_pin text
) returns void
language plpgsql security definer set search_path = public
as $$
declare employee public.fleet_employees%rowtype;
begin
  if p_new_pin !~ '^[0-9]{6,12}$' or p_new_pin = p_registration then
    raise exception 'A nova senha deve ter de 6 a 12 números e ser diferente da matrícula.';
  end if;
  select * into employee from public.fleet_employees where registration = p_registration and active = true;
  if not found or employee.access_pin_hash is null
     or extensions.crypt(p_current_pin, employee.access_pin_hash) <> employee.access_pin_hash then
    raise exception 'Senha atual inválida.';
  end if;
  update public.fleet_employees
  set access_pin_hash = extensions.crypt(p_new_pin, extensions.gen_salt('bf')), must_change_pin = false, pin_updated_at = now()
  where registration = p_registration;
end;
$$;

drop function if exists public.fleet_record_leader_decision(text, text, text, text);

create or replace function public.fleet_record_leader_decision(
  p_registration text,
  p_pin text,
  p_issue_id text,
  p_status text,
  p_note text default ''
) returns void
language plpgsql security definer set search_path = public
as $$
declare
  employee public.fleet_employees%rowtype;
  issue public.fleet_issues%rowtype;
  row_status text;
  decision jsonb;
begin
  if p_status not in ('Aprovada','Retificação solicitada') then
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

  select * into issue from public.fleet_issues
  where id = p_issue_id::uuid
  for update;
  if not found then raise exception 'Chamado não encontrado.'; end if;

  if employee.access_level = 'lider'
    and coalesce(issue.data ->> 'baseName','') <> coalesce(employee.leader_base,'') then
    raise exception 'Este chamado pertence a outra base.';
  end if;

  row_status := case p_status
    when 'Aprovada' then 'aprovada'
    else 'retificacao'
  end;

  decision := jsonb_build_object(
    'status', p_status,
    'note', coalesce(p_note,''),
    'approvedAt', now(),
    'approvedBy', case employee.access_level
      when 'lider' then 'Líder: '
      when 'coordenador' then 'Coordenador: '
      else 'Gestor: '
    end || employee.name,
    'dispatchStatus', case p_status
      when 'Aprovada' then 'Aguardando gestor'
      else 'Aguardando colaborador'
    end
  );

  update public.fleet_issues set
    status = row_status,
    data = jsonb_set(issue.data, '{leaderApproval}', decision, true)
  where id = p_issue_id::uuid;

  insert into public.fleet_audit_events
    (issue_id, vehicle_id, action, detail, actor_name, snapshot)
  values
    (issue.id, issue.vehicle_id, lower(replace(p_status, ' ', '_')),
     coalesce(p_note,''), employee.name, decision);
end;
$$;

revoke all on function public.fleet_leader_login(text,text) from public;
revoke all on function public.fleet_change_leader_pin(text,text,text) from public;
revoke all on function public.fleet_record_leader_decision(text,text,text,text,text) from public;
grant execute on function public.fleet_leader_login(text,text) to anon, authenticated;
grant execute on function public.fleet_change_leader_pin(text,text,text) to anon, authenticated;
grant execute on function public.fleet_record_leader_decision(text,text,text,text,text) to anon, authenticated;

-- ============================================================================
-- COMPONENTE: supabase-fix-leader-uuid.sql
-- ============================================================================
-- CORREÇÃO: aprovar e retificar no painel da Liderança
-- Corrige a comparação entre o ID recebido como texto pelo aplicativo e a coluna UUID do banco.
-- Não apaga nem altera chamados existentes antes da decisão.

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

  select * into issue from public.fleet_issues
  where id::text = p_issue_id
  for update;
  if not found then raise exception 'Chamado não encontrado.'; end if;

  if employee.access_level = 'lider'
     and coalesce(issue.data ->> 'baseName','') <> coalesce(employee.leader_base,'') then
    raise exception 'Este chamado pertence a outra base.';
  end if;

  row_status := case p_status
    when 'Aprovada' then 'aprovada'
    when 'Retificação solicitada' then 'retificacao'
    else 'recusada'
  end;
  decision := jsonb_build_object(
    'status', p_status, 'note', coalesce(p_note,''), 'approvedAt', now(),
    'approvedBy', case employee.access_level
      when 'lider' then 'Líder: '
      when 'coordenador' then 'Coordenador: '
      else 'Gestor: '
    end || employee.name,
    'dispatchStatus', case p_status
      when 'Aprovada' then 'Aguardando gestor'
      when 'Retificação solicitada' then 'Aguardando colaborador'
      else 'Encerrado'
    end
  );

  update public.fleet_issues
  set status = row_status,
      data = jsonb_set(issue.data, '{leaderApproval}', decision, true)
  where id::text = p_issue_id;

  insert into public.fleet_audit_events
    (issue_id, vehicle_id, action, detail, actor_name, snapshot)
  values
    (issue.id::text, issue.vehicle_id::text, lower(replace(p_status, ' ', '_')),
     coalesce(p_note,''), employee.name, decision);
end;
$$;

revoke all on function public.fleet_record_leader_decision(text,text,text,text,text) from public;
grant execute on function public.fleet_record_leader_decision(text,text,text,text,text) to anon, authenticated;

select 'correção aplicada' as resultado;

-- ============================================================================
-- COMPONENTE: supabase-production-readiness.sql
-- ============================================================================
-- PRONTIDÃO PARA PRODUÇÃO — URBAM FROTAS
-- Execute no SQL Editor do Supabase.
-- Preserva os dados existentes. Não use comandos de DELETE, DROP TABLE ou TRUNCATE.

-- O aplicativo utiliza identificadores próprios: v1446, MAN-..., UUID etc.
-- Convertê-los para texto evita erro ao gravar vehicle_id e chamados antigos.
alter table public.fleet_inspections alter column id drop default;
alter table public.fleet_inspections alter column id type text using id::text;
alter table public.fleet_issues alter column id drop default;
alter table public.fleet_issues alter column id type text using id::text;
alter table public.fleet_issues alter column inspection_id type text using inspection_id::text;
alter table public.fleet_issues alter column vehicle_id type text using vehicle_id::text;

alter table public.fleet_inspections enable row level security;
alter table public.fleet_issues enable row level security;

drop policy if exists "Aplicativo lê inspeções" on public.fleet_inspections;
create policy "Aplicativo lê inspeções" on public.fleet_inspections
for select to anon, authenticated using (true);
drop policy if exists "Aplicativo registra inspeções" on public.fleet_inspections;
create policy "Aplicativo registra inspeções" on public.fleet_inspections
for insert to anon, authenticated with check (true);

drop policy if exists "Aplicativo lê chamados" on public.fleet_issues;
create policy "Aplicativo lê chamados" on public.fleet_issues
for select to anon, authenticated using (true);
drop policy if exists "Aplicativo registra chamados" on public.fleet_issues;
create policy "Aplicativo registra chamados" on public.fleet_issues
for insert to anon, authenticated with check (true);
drop policy if exists "Aplicativo atualiza chamados" on public.fleet_issues;
create policy "Aplicativo atualiza chamados" on public.fleet_issues
for update to anon, authenticated using (true) with check (true);

alter table public.fleet_issues drop constraint if exists fleet_issues_status_check;
alter table public.fleet_issues add constraint fleet_issues_status_check
check (status in ('aberta','aprovada','retificacao','recusada','reenviada','resolvida'));

create index if not exists fleet_issues_created_at_idx on public.fleet_issues (created_at desc);
create index if not exists fleet_issues_status_idx on public.fleet_issues (status);

-- Necessária para o colaborador receber retificação ou recusa no próprio app.
-- O DROP evita erro caso já exista uma versão antiga da função.
drop function if exists public.fleet_driver_returns(text,text);
create function public.fleet_driver_returns(p_registration text, p_phone text)
returns table (data jsonb)
language plpgsql
security definer
set search_path = public
as $fn$
begin
  return query
  select issue.data
  from public.fleet_issues as issue
  where coalesce(issue.data ->> 'driverRegistration','') = coalesce(p_registration,'')
    and regexp_replace(coalesce(issue.data ->> 'driverPhone',''), '[^0-9]', '', 'g') =
        regexp_replace(coalesce(p_phone,''), '[^0-9]', '', 'g')
    and coalesce(issue.data -> 'leaderApproval' ->> 'status','') in ('Retificação solicitada','Recusada')
  order by issue.created_at desc
  limit 30;
end;
$fn$;
revoke all on function public.fleet_driver_returns(text,text) from public;
grant execute on function public.fleet_driver_returns(text,text) to anon, authenticated;

select
  (select count(*) from public.fleet_issues) as total_issues,
  (select count(*) from public.fleet_inspections) as total_inspections,
  to_regprocedure('public.fleet_driver_returns(text,text)') is not null as driver_returns_ready;

-- ============================================================================
-- COMPONENTE: supabase-scheduled-maintenance.sql
-- ============================================================================
-- AGENDAMENTOS PARA COLABORADOR — URBAM FROTAS
-- Execute uma única vez no SQL Editor do Supabase.
-- Permite ao colaborador acompanhar os próprios chamados desde a abertura.

create or replace function public.fleet_driver_appointments(p_registration text, p_phone text)
returns table (data jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
begin
  if p_registration !~ '^[0-9]{3,}$' or length(normalized_phone) not between 10 and 13 then
    raise exception 'Identificação do colaborador inválida.';
  end if;

  return query
  select issue.data
  from public.fleet_issues as issue
  where coalesce(issue.data ->> 'driverRegistration', '') = p_registration
    and regexp_replace(coalesce(issue.data ->> 'driverPhone', ''), '\D', '', 'g') = normalized_phone
    and issue.created_at >= now() - interval '120 days'
  order by issue.created_at desc;
  limit 100;
end;
$$;

revoke all on function public.fleet_driver_appointments(text, text) from public;
grant execute on function public.fleet_driver_appointments(text, text) to anon, authenticated;

select to_regprocedure('public.fleet_driver_appointments(text,text)') is not null as appointments_ready;

create or replace function public.fleet_driver_acknowledge_schedule(p_registration text, p_phone text, p_issue_id text)
returns table (data jsonb)
language plpgsql security definer set search_path = public
as $$
declare normalized_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'); acknowledged_at timestamptz := now();
begin
  if p_registration !~ '^[0-9]{3,}$' or length(normalized_phone) not between 10 and 13 or length(p_issue_id) > 80 then raise exception 'Identificação inválida.'; end if;
  return query update public.fleet_issues as issue
    set data = jsonb_set(issue.data, '{maintenance}', coalesce(issue.data->'maintenance','{}'::jsonb) || jsonb_build_object('driverAcknowledgedAt',acknowledged_at,'updatedAt',acknowledged_at), true)
    where issue.id::text=p_issue_id and coalesce(issue.data->>'driverRegistration','')=p_registration
      and regexp_replace(coalesce(issue.data->>'driverPhone',''),'\D','','g')=normalized_phone
      and coalesce(issue.data->'maintenance'->>'status','')='Agendada'
    returning issue.data;
  if not found then raise exception 'Agendamento não encontrado.'; end if;
end; $$;
revoke all on function public.fleet_driver_acknowledge_schedule(text,text,text) from public;
grant execute on function public.fleet_driver_acknowledge_schedule(text,text,text) to anon, authenticated;

-- ============================================================================
-- COMPONENTE: supabase-maintenance-delivery.sql
-- ============================================================================
-- ENTREGA DO VEÍCULO À MANUTENÇÃO — URBAM FROTAS
-- Execute uma única vez no SQL Editor do Supabase.
-- O colaborador só pode marcar a entrega dos próprios chamados agendados.

create or replace function public.fleet_driver_mark_maintenance_delivery(p_registration text, p_phone text, p_issue_id text)
returns table (data jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_phone text := regexp_replace(coalesce(p_phone, ''), '\D', '', 'g');
  delivered_at timestamptz := now();
begin
  if p_registration !~ '^[0-9]{3,}$' or length(normalized_phone) not between 10 and 13 then
    raise exception 'Identificação do colaborador inválida.';
  end if;
  return query
  update public.fleet_issues as issue
  set data = jsonb_set(issue.data, '{maintenance}', coalesce(issue.data -> 'maintenance', '{}'::jsonb) || jsonb_build_object('status', 'Em manutenção', 'deliveryAt', delivered_at, 'supplierDeadlineAt', delivered_at + interval '6 hours', 'updatedAt', delivered_at), true)
  where issue.id::text = p_issue_id
    and coalesce(issue.data ->> 'driverRegistration', '') = p_registration
    and regexp_replace(coalesce(issue.data ->> 'driverPhone', ''), '\D', '', 'g') = normalized_phone
    and coalesce(issue.data -> 'maintenance' ->> 'status', '') = 'Agendada'
    and coalesce(issue.status, '') <> 'resolvida'
  returning issue.data;
  if not found then raise exception 'Agendamento não encontrado ou já confirmado.'; end if;
end;
$$;

revoke all on function public.fleet_driver_mark_maintenance_delivery(text, text, text) from public;
grant execute on function public.fleet_driver_mark_maintenance_delivery(text, text, text) to anon, authenticated;
select to_regprocedure('public.fleet_driver_mark_maintenance_delivery(text,text,text)') is not null as delivery_ready;

-- A Liderança confirma a retirada somente depois de a Gestão liberar o veículo.
-- A comparação id::text funciona tanto quando o identificador é UUID quanto text.
create or replace function public.fleet_leader_confirm_maintenance_pickup(
  p_registration text, p_pin text, p_issue_id text
)
returns table (data jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  employee public.fleet_employees%rowtype;
  issue public.fleet_issues%rowtype;
  picked_up_at timestamptz := now();
  next_data jsonb;
begin
  if p_registration !~ '^[0-9]+$' or p_pin !~ '^[0-9]+$' or length(p_issue_id) > 80 then
    raise exception 'Identificação inválida.';
  end if;

  select * into employee
  from public.fleet_employees
  where registration = p_registration
    and active = true
    and access_level in ('lider','coordenador','gestor');

  if not found or employee.access_pin_hash is null
     or extensions.crypt(p_pin, employee.access_pin_hash) <> employee.access_pin_hash then
    raise exception 'Sessão de liderança inválida. Entre novamente.';
  end if;

  select * into issue
  from public.fleet_issues
  where id::text = p_issue_id
  for update;

  if not found then raise exception 'Chamado não encontrado.'; end if;
  if employee.access_level = 'lider'
     and coalesce(issue.data ->> 'baseName','') <> coalesce(employee.leader_base,'') then
    raise exception 'Este chamado pertence a outra base.';
  end if;
  if coalesce(issue.data -> 'maintenance' ->> 'status','') <> 'Veículo pronto para retirada' then
    raise exception 'O veículo ainda não foi liberado para retirada.';
  end if;

  next_data := jsonb_set(
    jsonb_set(
      issue.data,
      '{maintenance}',
      coalesce(issue.data -> 'maintenance','{}'::jsonb) || jsonb_build_object(
        'status','Concluída',
        'pickupAt',picked_up_at,
        'pickupBy',employee.name,
        'updatedAt',picked_up_at
      ),
      true
    ),
    '{resolvedAt}',
    to_jsonb(picked_up_at),
    true
  );

  update public.fleet_issues
  set status = 'resolvida', data = next_data
  where id::text = p_issue_id;

  insert into public.fleet_audit_events (issue_id, vehicle_id, action, detail, actor_name, snapshot)
  values (issue.id::text, issue.vehicle_id::text, 'veiculo_retirado', 'Retirada confirmada pela Liderança.', employee.name, next_data);

  return query select next_data;
end;
$$;

revoke all on function public.fleet_leader_confirm_maintenance_pickup(text,text,text) from public;
grant execute on function public.fleet_leader_confirm_maintenance_pickup(text,text,text) to anon, authenticated;

select to_regprocedure('public.fleet_leader_confirm_maintenance_pickup(text,text,text)') is not null as pickup_ready;

-- ============================================================================
-- COMPONENTE: supabase-master-access.sql
-- ============================================================================
-- Execute no SQL Editor do Supabase após confirmar as políticas existentes.
-- Restringe alterações da frota ao Administrador Master.
alter table public.fleet_vehicles enable row level security;

drop policy if exists "Administrador Master administra veículos" on public.fleet_vehicles;
create policy "Administrador Master administra veículos"
on public.fleet_vehicles for all to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'luciano.silva@urbam.com.br')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'luciano.silva@urbam.com.br');


-- ============================================================================
-- COMPONENTE: supabase-storage-photo-hardening.sql
-- ============================================================================
-- URBAM Frotas: limite defensivo para fotos de ocorrencias.
-- Mantem o bucket publico para exibicao nos paineis, mas impede arquivos
-- excessivamente grandes e formatos que nao sejam imagens.
update storage.buckets
set
  file_size_limit = 2097152,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]
where id = 'issue-photos';

-- ============================================================================
-- COMPONENTE: supabase-server-alerts.sql
-- ============================================================================
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

-- VERIFICAÇÃO FINAL DO INSTALADOR
select 'URBAM Frotas v205' as instalacao, now() as concluida_em,
  to_regclass('public.fleet_issues') is not null as chamados,
  to_regclass('public.fleet_employees') is not null as colaboradores,
  to_regclass('public.fleet_server_notifications') is not null as alertas_servidor,
  to_regprocedure('public.fleet_leader_confirm_maintenance_pickup(text,text,text)') is not null as retirada_lider,
  to_regprocedure('public.fleet_driver_appointments(text,text)') is not null as agenda_colaborador;
