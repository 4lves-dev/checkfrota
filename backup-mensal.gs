/**
 * Backup mensal do URBAM Frota para Google Apps Script.
 * Configure as propriedades do projeto antes de executar:
 * SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e BACKUP_RECIPIENT.
 * A chave service_role nunca deve ser colocada no aplicativo nem no GitHub.
 */
function criarAgendamentoBackupMensal() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'enviarBackupMensal')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('enviarBackupMensal').timeBased().onMonthDay(1).atHour(6).create();
}

function enviarBackupMensal() {
  const props = PropertiesService.getScriptProperties();
  const url = props.getProperty('SUPABASE_URL');
  const key = props.getProperty('SUPABASE_SERVICE_ROLE_KEY');
  const recipient = props.getProperty('BACKUP_RECIPIENT');
  if (!url || !key || !recipient) throw new Error('Configure SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e BACKUP_RECIPIENT nas propriedades do script.');
  const tables = ['fleet_employees', 'fleet_vehicles', 'fleet_inspections', 'fleet_issues'];
  const backup = { generatedAt: new Date().toISOString(), source: 'URBAM Frota', tables: {} };
  tables.forEach(table => {
    const response = UrlFetchApp.fetch(`${url}/rest/v1/${table}?select=*`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, muteHttpExceptions: true });
    if (response.getResponseCode() >= 300) throw new Error(`Falha ao exportar ${table}: ${response.getResponseCode()}`);
    backup.tables[table] = JSON.parse(response.getContentText());
  });
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const file = Utilities.newBlob(JSON.stringify(backup, null, 2), 'application/json', `urbam-frota-backup-${stamp}.json`);
  MailApp.sendEmail({ to: recipient, subject: `Backup mensal — URBAM Frota — ${stamp}`, body: 'Segue o backup automático mensal do URBAM Frota.', attachments: [file] });
}
