/**
 * URBAM Frotas — envio automático de formulários por e-mail.
 *
 * Cole este arquivo em um projeto do Google Apps Script e publique como
 * Aplicativo da Web, com acesso para "Qualquer pessoa". Copie a URL /exec
 * para a configuração "URL de envio do formulário" do CheckFrota.
 */
const URBAM_FROTAS_EMAIL = 'urbamfrota@gmail.com';
const SUPABASE_URL = 'https://lkorooafivaxdykpssjz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_yLJvwIAxkQ6j4epa_hfccw_Jz1Uu2g-';

function confirmDelivery_(deliveryId, status, errorMessage) {
  if (!deliveryId) return;
  UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/rpc/fleet_confirm_email_delivery`, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    payload: JSON.stringify({ p_delivery_id: deliveryId, p_status: status, p_error: errorMessage || '' })
  });
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'URBAM Frotas e-mail', updatedAt: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  let payload = {};
  try {
    payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const inspection = payload.inspection || {};
    const vehicle = payload.vehicle || {};
    const issues = Array.isArray(payload.issues) ? payload.issues : [];
    if (!inspection.id || !vehicle.prefix) throw new Error('Formulário incompleto.');

    const date = Utilities.formatDate(new Date(inspection.createdAt || new Date()), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
    const issueText = issues.length
      ? issues.map(issue => `• ${issue.itemName || 'Ocorrência'} — ${issue.severity || 'Não informada'}\n  ${issue.description || 'Sem descrição'}`).join('\n\n')
      : 'Checklist concluído sem ocorrências.';
    const subject = `[URBAM Frotas] Formulário ${inspection.id} · Prefixo ${vehicle.prefix}`;
    const body = [
      'URBAM Frotas — formulário de inspeção', '',
      `Protocolo: ${inspection.id}`,
      `Data: ${date}`,
      `Colaborador: ${inspection.driver || 'Não informado'} · Matrícula: ${inspection.driverRegistration || '—'}`,
      `Veículo: Prefixo ${vehicle.prefix} · Placa ${vehicle.plate || '—'} · ${vehicle.model || vehicle.type || ''}`,
      `Quilometragem: ${inspection.odometer || '—'} km`,
      `Base: ${inspection.baseName || 'Não informada'}`, '',
      'Ocorrências:', issueText,
      inspection.notes ? `\nObservação geral: ${inspection.notes}` : ''
    ].filter(Boolean).join('\n');

    MailApp.sendEmail({ to: URBAM_FROTAS_EMAIL, subject, body, name: 'URBAM Frotas' });
    confirmDelivery_(payload.emailDeliveryId, 'enviado');
    return ContentService.createTextOutput(JSON.stringify({ ok: true, protocol: inspection.id }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    try { confirmDelivery_(payload && payload.emailDeliveryId, 'falhou', String(error.message || error)); } catch (_) {}
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(error.message || error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
