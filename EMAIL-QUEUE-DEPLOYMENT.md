# Ativação da fila de formulários

O aplicativo publicado permanece na versão 242 durante a preparação. A fila
usa o mesmo destinatário, `urbamfrota@gmail.com`, e o gerador de PDF existente.
O acesso do colaborador por matrícula permanece conforme solicitado.

## Instalação

1. Executar `supabase-email-confirmation-secure.sql` se ainda não instalado e
   configurar a credencial privada já utilizada. Nunca colocar a credencial no repositório.
2. Executar `supabase-email-queue.sql`. A instalação inicial deixa a fila desligada;
   reexecutar a migração preserva o estado de ativação e os dados.
3. No mesmo projeto do Apps Script, manter `email-automation.gs` e
   `email-queue-worker.gs`. Preservar eventuais funções auxiliares existentes.
4. Criar um único acionador de `processarFilaEmails`, implantação Teste (código
   salvo), Baseado no tempo, Contador de minutos, A cada 1 minuto. É possível criar
   pelo painel sem acrescentar o escopo `script.scriptapp`.
5. Executar `validarFilaEmailsInativa` antes da ativação. A credencial é consultada
   nas propriedades privadas e não aparece no resultado.

## Troca do envio

Durante uma breve pausa nos novos checklists, atualizar a implantação /exec
existente para o código salvo. No editor executar `ativarModoFilaServidor`, então
executar no SQL Editor:

```sql
update checkfrota_private.email_queue_control set enabled=true where singleton;
select enabled from checkfrota_private.email_queue_control where singleton;
```

Esses dois passos precisam ser concluídos juntos: a propriedade do Apps Script
controla o envio pelo navegador; o banco controla a criação das tarefas.
Após a troca, telefones com código antigo continuam sincronizando checklists,
mas o endpoint ignora o formulário fornecido pelo navegador e o servidor cria
apenas um rastreio canônico. Não há reenvio automático dos registros históricos.

## Verificação obrigatória

Enviar um checklist técnico identificado, conferir a fila `sent`, o rastreio
`enviado` e `confirmed_at`, além do recebimento do PDF na caixa de entrada.
`sent` indica aceitação pelo MailApp e gravação no banco; não comprova leitura nem
entrega na caixa de entrada. Falha depois de iniciar o envio fica `uncertain` e
exige conferência antes de qualquer novo envio. Preparação do PDF pode tentar
novamente até cinco vezes. Checklists com ocorrências aguardam todas as gravações.

A ativação da fila não equivale à homologação de GPS, push, funcionamento offline
e etapas de aprovação/agendamento/entrega/retirada nos celulares.
