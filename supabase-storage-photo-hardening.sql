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
