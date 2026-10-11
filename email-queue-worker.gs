/** Install in the SAME Apps Script project as email-automation.gs.
 * Staged: no trigger or activation on file load. Never store the secret here.
 */
function emailQueueRpc_(name, fields) {
  const token = PropertiesService.getScriptProperties().getProperty('CHECKFROTA_EMAIL_CONFIRMATION_SECRET') || '';
  if (token.length < 32) throw new Error('Credencial de integração ausente.');
  const response = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { apikey: SUPABASE_ANON_KEY }, payload: JSON.stringify(Object.assign({}, fields, { p_token: token }))
  });
  if (response.getResponseCode() !== 200) throw new Error(`Fila de e-mail: HTTP ${response.getResponseCode()}`);
  return JSON.parse(response.getContentText());
}

function emailQueueTransition_(job, action, error) {
  return emailQueueRpc_('fleet_email_transition', {
    p_inspection_id: job.inspection.id, p_lease: job.lease, p_action: action, p_error: error || ''
  }) === true;
}

function processarFilaEmails() {
  if (PropertiesService.getScriptProperties().getProperty('CHECKFROTA_EMAIL_QUEUE_MODE') !== 'server') return;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    // Small batches keep executions bounded. A later trigger handles the rest.
    for (let n = 0; n < 3; n++) {
      if (MailApp.getRemainingDailyQuota() < 1) return;
      const job = emailQueueRpc_('fleet_claim_email', {});
      if (!job) return;
      sendChecklist_({ postData: { contents: JSON.stringify(job) } }, job);
    }
  } finally { lock.releaseLock(); }
}

function instalarAcionadorFilaEmails() {
  const existing = ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'processarFilaEmails');
  if (!existing.length) ScriptApp.newTrigger('processarFilaEmails').timeBased().everyMinutes(1).create();
  // Do not delete other automation triggers or activate the SQL switch here.
  console.log('Acionador preparado. A ativação coordenada do banco e da implantação ainda é necessária.');
}

function validarFilaEmailsInativa() {
  if (PropertiesService.getScriptProperties().getProperty('CHECKFROTA_EMAIL_QUEUE_MODE') === 'server')
    throw new Error('Esta validação deve ocorrer antes da ativação.');
  const job = emailQueueRpc_('fleet_claim_email', {});
  if (job !== null) throw new Error('Fila já ativa: interromper validação e conferir estado.');
  console.log('FILA VALIDADA: acesso autenticado; nenhum formulário enviado.');
}

// Execute manually ONLY during the coordinated cutover, after deployment.
function ativarModoFilaServidor() {
  PropertiesService.getScriptProperties().setProperty('CHECKFROTA_EMAIL_QUEUE_MODE', 'server');
  console.log('Modo servidor ativado. Conferir ativação do banco e testar um envio real.');
}
