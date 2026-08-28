# Backup mensal

1. No Google Apps Script, crie um projeto e cole o conteúdo de `backup-mensal.gs`.
2. Em **Configurações do projeto > Propriedades do script**, registre `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `BACKUP_RECIPIENT`.
3. Em `BACKUP_RECIPIENT`, informe o e-mail da Gestão.
4. Execute uma vez `criarAgendamentoBackupMensal` e autorize o envio de e-mail.

O backup será enviado no dia 1 de cada mês, às 6h. A chave service_role é confidencial: não a copie para o GitHub ou para o aplicativo.
