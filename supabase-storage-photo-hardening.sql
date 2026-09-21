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

-- O bucket público entrega a foto por URL sem precisar expor a listagem de
-- todos os nomes de arquivo. Remove políticas SELECT amplas antigas; o app
-- continua exibindo fotos conhecidas pelo caminho salvo no chamado.
do $photo_policies$
declare policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and cmd = 'SELECT'
      and (
        coalesce(qual, '') in ('true', '(true)')
        or coalesce(qual, '') ilike '%issue-photos%'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', policy_row.policyname);
  end loop;
end
$photo_policies$;
