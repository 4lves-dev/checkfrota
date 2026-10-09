-- Restringe acesso direto aos dados operacionais, mesmo com políticas legadas permissivas.
-- Não altera INSERT do colaborador nem RPCs SECURITY DEFINER da liderança.
begin;
do $$ declare t text; begin
  foreach t in array array['fleet_inspections','fleet_issues'] loop
    execute format('drop policy if exists management_select_guard on public.%I',t);
    execute format('create policy management_select_guard on public.%I as restrictive for select to authenticated using (public.fleet_is_manager())',t);
    execute format('drop policy if exists management_update_guard on public.%I',t);
    execute format('create policy management_update_guard on public.%I as restrictive for update to authenticated using (public.fleet_is_manager()) with check (public.fleet_is_manager())',t);
    execute format('drop policy if exists management_delete_guard on public.%I',t);
    execute format('create policy management_delete_guard on public.%I as restrictive for delete to authenticated using (public.fleet_is_manager())',t);
  end loop;
end $$;
commit;
select tablename,policyname,permissive,cmd from pg_policies
where schemaname='public' and policyname in ('management_select_guard','management_update_guard','management_delete_guard')
order by tablename,policyname;
