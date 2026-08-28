-- Execute este arquivo no SQL Editor do projeto Supabase do URBAM Frota.
-- A tabela centraliza matrícula, nome e função. Auxiliares de serviços gerais não foram incluídos.

create table if not exists public.fleet_employees (
  registration text primary key,
  name text not null,
  role text not null,
  active boolean not null default true,
  leader boolean not null default false,
  leader_base text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fleet_employees add column if not exists leader boolean not null default false;
alter table public.fleet_employees add column if not exists leader_base text;

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
