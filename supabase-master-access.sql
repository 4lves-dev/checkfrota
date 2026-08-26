-- Execute no SQL Editor do Supabase após confirmar as políticas existentes.
-- Restringe alterações da frota ao Administrador Master.
alter table public.fleet_vehicles enable row level security;

drop policy if exists "Administrador Master administra veículos" on public.fleet_vehicles;
create policy "Administrador Master administra veículos"
on public.fleet_vehicles for all to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'luciano.silva@urbam.com.br')
with check (lower(coalesce(auth.jwt() ->> 'email', '')) = 'luciano.silva@urbam.com.br');

