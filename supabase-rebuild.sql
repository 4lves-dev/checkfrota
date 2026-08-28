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
('v1456','1456','SHR7128','{"id":"v1456","prefix":"1456","plate":"SHR7128","type":"Utilitário","model":"Furgão Peugeot","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"58/23","urbamContract":"44/23","odometer":""}'::jsonb),
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
('v1082','1082','GAS8B76','{"id":"v1082","prefix":"1082","plate":"GAS8B76","type":"Caminhão","model":"Caminhão guindauto cesto","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"096/25","urbamContract":"482/22","odometer":""}'::jsonb),
('v1084','1084','FVY2G68','{"id":"v1084","prefix":"1084","plate":"FVY2G68","type":"Caminhão","model":"Caminhão guindauto cesto","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"096/25","urbamContract":"620/24","odometer":""}'::jsonb),
('v1577','1577','FVQ8C09','{"id":"v1577","prefix":"1577","plate":"FVQ8C09","type":"Caminhão","model":"Caminhão 3/4 com cabine suplementar","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"095/25","urbamContract":"620/24","odometer":""}'::jsonb),
('v1967','1967','UET6G08','{"id":"v1967","prefix":"1967","plate":"UET6G08","type":"Carro","model":"Strada","base":"Base Horizontal","ownerName":"Responsável a cadastrar","ownerPhone":"","email":"","contract":"059/26","urbamContract":"620/24","odometer":""}'::jsonb),
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

