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

function confirmDelivery_(deliveryId, status, errorMessage, inspectionId) {
  if (!deliveryId) return;
  const token = PropertiesService.getScriptProperties().getProperty('CHECKFROTA_EMAIL_CONFIRMATION_SECRET') || '';
  if (token.length < 32 || !inspectionId) {
    console.error('Confirmação segura não configurada ou inspeção ausente.');
    return false;
  }
  const response = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/rpc/fleet_confirm_email_delivery_secure`, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    // Chaves publicáveis modernas do Supabase identificam a chamada somente
    // pelo cabeçalho apikey; elas não são JWTs válidos para Authorization.
    headers: { apikey: SUPABASE_ANON_KEY },
    payload: JSON.stringify({ p_delivery_id: deliveryId, p_inspection_id: inspectionId, p_status: status, p_token: token, p_error: errorMessage || '' })
  });
  if (response.getResponseCode() >= 300) {
    console.error(`Confirmação de e-mail recusada pelo banco: HTTP ${response.getResponseCode()}`);
    return false;
  }
  try { return JSON.parse(response.getContentText()) === true; }
  catch (_) { return false; }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'URBAM Frotas e-mail', updatedAt: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Checks the private credential without creating a call or sending an email.
function validarConfirmacaoSegura() {
  const token = PropertiesService.getScriptProperties().getProperty('CHECKFROTA_EMAIL_CONFIRMATION_SECRET') || '';
  if (token.length < 32) throw new Error('Chave ausente ou curta nas propriedades do script.');
  const response = UrlFetchApp.fetch(`${SUPABASE_URL}/rest/v1/rpc/fleet_confirm_email_delivery_secure`, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { apikey: SUPABASE_ANON_KEY },
    payload: JSON.stringify({ p_delivery_id: `validacao-${Utilities.getUuid()}`, p_inspection_id: 'validacao-sem-chamado', p_status: 'enviado', p_token: token, p_error: '' })
  });
  if (response.getResponseCode() !== 200 || response.getContentText().trim() !== 'false')
    throw new Error(`Validação recusada: HTTP ${response.getResponseCode()}. Confira a configuração dos dois serviços.`);
  console.log('CHAVE VALIDADA: integração autenticada; nenhum chamado ou e-mail criado.');
}

function escapeHtml_(value) {
  return String(value === undefined || value === null ? '—' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function checklistRow_(item, index) {
  const issue = item && item.status === 'issue';
  const title = escapeHtml_(item && item.name || `Item ${index + 1}`);
  const detail = issue
    ? `OCORRÊNCIA: ${escapeHtml_(item.issue && item.issue.description || item.description || 'Verificar apontamento')}`
    : 'EM ORDEM: Item em ordem';
  const color = issue ? '#b42318' : '#087443';
  const icon = issue ? '!' : '✓';
  return `<tr><td style="width:40px;padding:13px 10px;border-bottom:1px solid #dce6ee;text-align:center;color:${color};font-weight:800;font-size:18px">${icon}</td><td style="padding:11px 10px;border-bottom:1px solid #dce6ee"><div style="font-weight:700;color:#183a59">${index + 1}. ${title}</div><div style="margin-top:3px;font-size:11px;font-weight:700;color:${color}">${detail}</div></td></tr>`;
}

function issueBlock_(issue) {
  return `<div style="margin:10px 0;padding:13px 14px;border:1px solid #f1b7b1;border-left:4px solid #c63b32;border-radius:8px;background:#fff8f7"><b style="color:#8d241e">${escapeHtml_(issue.itemName || 'Ocorrência')}</b><span style="float:right;border-radius:12px;padding:3px 8px;background:#fde7e5;color:#9d251f;font-size:11px;font-weight:700">${escapeHtml_(issue.severity || 'Não informada')}</span><p style="margin:7px 0 0;color:#4b5560;font-size:13px;line-height:1.45">${escapeHtml_(issue.description || 'Sem descrição')}</p></div>`;
}

// Gera um anexo que pode ser arquivado, impresso ou encaminhado sem depender
// do layout do aplicativo. O documento temporário é enviado para a lixeira ao
// final, portanto não acumula arquivos no Drive.
function buildChecklistPdf_(inspection, vehicle, issues, date) {
  const documentName = `Formulario-URBAM-Frotas-${vehicle.prefix || 'veiculo'}-${String(inspection.id || '').slice(0, 8)}`;
  const document = DocumentApp.create(documentName);
  const body = document.getBody();
  body.setPageWidth(595.28).setPageHeight(841.89)
    .setMarginTop(32).setMarginBottom(32).setMarginLeft(36).setMarginRight(36);
  const valueText = value => value === null || value === undefined || value === '' ? '-' : String(value);
  const styleParagraph = (paragraph, size, color, bold) => {
    paragraph.setSpacingBefore(0).setSpacingAfter(3).setLineSpacing(1.1);
    paragraph.editAsText().setFontFamily('Arial').setFontSize(size)
      .setForegroundColor(color).setBold(bold);
    return paragraph;
  };
  const section = title => {
    const paragraph = body.appendParagraph(title);
    styleParagraph(paragraph, 12, '#183a59', true).setSpacingBefore(12).setSpacingAfter(6);
  };
  const table = (rows, widths) => {
    const result = body.appendTable(rows);
    result.setBorderColor('#dce6ee').setBorderWidth(0.5);
    widths.forEach((width, index) => result.setColumnWidth(index, width));
    rows.forEach((row, r) => row.forEach((_, c) => {
      const cell = result.getRow(r).getCell(c);
      cell.setPaddingTop(6).setPaddingBottom(6).setPaddingLeft(9).setPaddingRight(9);
      styleParagraph(cell.getChild(0).asParagraph(), 9, '#17324a', false);
    }));
    return result;
  };
  const banner = table([['URBAM FROTAS\nChecklist de inspeção']], [523.28]);
  banner.getRow(0).getCell(0).setBackgroundColor('#083b64');
  styleParagraph(banner.getRow(0).getCell(0).getChild(0).asParagraph(), 17, '#ffffff', true);
  styleParagraph(body.appendParagraph(`Protocolo: ${valueText(inspection.id)} | ${date}`), 8, '#526475', false);
  section('Dados do formulário');
  const data = table([
    ['Colaborador', valueText(inspection.driver)],
    ['Matrícula / Base', `${valueText(inspection.driverRegistration)} / ${valueText(inspection.baseName)}`],
    ['Veículo', `Prefixo ${valueText(vehicle.prefix)} | Placa ${valueText(vehicle.plate)} | ${valueText(vehicle.model || vehicle.type)}`],
    ['Quilometragem', `${valueText(inspection.odometer)} km`]
  ], [130, 393.28]);
  for (let r = 0; r < data.getNumRows(); r++) {
    data.getRow(r).getCell(0).setBackgroundColor('#f2f5f8');
    data.getRow(r).getCell(1).editAsText().setBold(true);
  }
  section('Checklist completo');
  const checklist = Array.isArray(inspection.items) ? inspection.items : [];
  if (checklist.length) {
    const grid = table(checklist.map((item, index) => {
      const issue = item && item.status === 'issue';
      const ok = item && item.status === 'ok';
      return [`${index + 1}. ${item && item.name || 'Item'}`, issue ? `OCORRÊNCIA\n${item.issue && item.issue.description || item.description || 'Verificar apontamento'}` : ok ? 'EM ORDEM' : 'NÃO INFORMADO'];
    }), [250, 273.28]);
    checklist.forEach((item, index) => {
      const cell = grid.getRow(index).getCell(1);
      const issue = item && item.status === 'issue';
      const ok = item && item.status === 'ok';
      cell.setBackgroundColor(issue ? '#fff1ef' : ok ? '#f0f8f3' : '#fff8e8');
      cell.editAsText().setForegroundColor(issue ? '#b42318' : ok ? '#087443' : '#805b10');
    });
  } else styleParagraph(body.appendParagraph('Detalhamento do checklist não informado.'), 9, '#526475', false);
  section('Ocorrências relatadas');
  (issues.length ? issues.map((issue, index) => `${index + 1}. ${issue.itemName || 'Ocorrência'} (${issue.severity || 'Não informada'}): ${issue.description || 'Sem descrição'}`) : ['Checklist concluído sem ocorrências.'])
    .forEach(text => styleParagraph(body.appendParagraph(text), 9, '#17324a', false));
  if (inspection.notes) {
    section('Observação geral');
    styleParagraph(body.appendParagraph(String(inspection.notes)), 9, '#17324a', false);
  }
  styleParagraph(document.addFooter().appendParagraph('URBAM Frotas | Registro de inspeção'), 8, '#617181', false);
  document.saveAndClose();
  const file = DriveApp.getFileById(document.getId());
  try {
    return file.getAs(MimeType.PDF).setName(`${documentName}.pdf`);
  } finally {
    file.setTrashed(true);
  }
}


function doPost(e) {
  let payload = {};
  let mailAccepted = false;
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
    const items = Array.isArray(inspection.items) ? inspection.items : [];
    const checklistRows = items.length
      ? items.map(checklistRow_).join('')
      : '<tr><td style="padding:13px;color:#526475">Detalhamento do checklist não foi informado.</td></tr>';
    const issueHtml = issues.length
      ? issues.map(issueBlock_).join('')
      : '<div style="padding:13px 14px;border:1px solid #b8dfc9;border-left:4px solid #087443;border-radius:8px;background:#f4fcf7;color:#087443;font-weight:700">✓ Checklist concluído sem ocorrências.</div>';
    const subject = `[URBAM Frotas] Checklist · Prefixo ${vehicle.prefix}`;
    const body = [
      'URBAM Frotas — formulário de inspeção', '',
      `Protocolo: ${inspection.id}`,
      `Data: ${date}`,
      `Colaborador: ${inspection.driver || 'Não informado'} · Matrícula: ${inspection.driverRegistration || '—'}`,
      `Veículo: Prefixo ${vehicle.prefix} · Placa ${vehicle.plate || '—'} · ${vehicle.model || vehicle.type || ''}`,
      `Quilometragem: ${inspection.odometer ?? '—'} km`,
      `Base: ${inspection.baseName || 'Não informada'}`, '',
      'Ocorrências:', issueText,
      inspection.notes ? `\nObservação geral: ${inspection.notes}` : ''
    ].filter(Boolean).join('\n');

    const htmlBody = `<!doctype html><html><body style="margin:0;padding:24px;background:#f2f5f8;font-family:Arial,sans-serif;color:#17324a"><main style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #dce6ee;border-radius:12px;overflow:hidden"><header style="padding:22px 28px;background:#083b64;color:#fff"><div style="font-size:11px;font-weight:700;letter-spacing:1px">URBAM FROTAS · FORMULÁRIO ENVIADO</div><h1 style="margin:7px 0 0;font-size:24px">Checklist de inspeção</h1></header><section style="padding:24px 28px"><p style="margin:0 0 18px;color:#075a91;font-size:12px;font-weight:700">PROTOCOLO: ${escapeHtml_(inspection.id)}</p><h2 style="font-size:17px;margin:0 0 12px;color:#183a59">Dados do formulário</h2><table style="width:100%;border-collapse:collapse;font-size:13px"><tr><td style="width:40%;padding:9px 7px;border-bottom:1px solid #dce6ee;color:#617181">Motorista</td><td style="padding:9px 7px;border-bottom:1px solid #dce6ee;font-weight:700">${escapeHtml_(inspection.driver)}</td></tr><tr><td style="padding:9px 7px;border-bottom:1px solid #dce6ee;color:#617181">Matrícula</td><td style="padding:9px 7px;border-bottom:1px solid #dce6ee;font-weight:700">${escapeHtml_(inspection.driverRegistration)}</td></tr><tr><td style="padding:9px 7px;border-bottom:1px solid #dce6ee;color:#617181">Base</td><td style="padding:9px 7px;border-bottom:1px solid #dce6ee;font-weight:700">${escapeHtml_(inspection.baseName)}</td></tr><tr><td style="padding:9px 7px;border-bottom:1px solid #dce6ee;color:#617181">Veículo</td><td style="padding:9px 7px;border-bottom:1px solid #dce6ee;font-weight:700">Prefixo ${escapeHtml_(vehicle.prefix)} · ${escapeHtml_(vehicle.plate)} · ${escapeHtml_(vehicle.model || vehicle.type)}</td></tr><tr><td style="padding:9px 7px;border-bottom:1px solid #dce6ee;color:#617181">Quilometragem</td><td style="padding:9px 7px;border-bottom:1px solid #dce6ee;font-weight:700">${escapeHtml_(inspection.odometer)} km</td></tr><tr><td style="padding:9px 7px;border-bottom:1px solid #dce6ee;color:#617181">Data e hora</td><td style="padding:9px 7px;border-bottom:1px solid #dce6ee;font-weight:700">${date}</td></tr></table><h2 style="font-size:17px;margin:25px 0 12px;color:#183a59">Checklist completo</h2><table style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #dce6ee;border-radius:8px;overflow:hidden">${checklistRows}</table><h2 style="font-size:17px;margin:25px 0 12px;color:#183a59">Ocorrências relatadas</h2>${issueHtml}${inspection.notes ? `<section style="margin-top:18px;padding:13px 14px;border-radius:8px;background:#f3f7fa"><b style="font-size:12px;color:#506274">OBSERVAÇÃO GERAL</b><p style="margin:6px 0 0;font-size:13px;line-height:1.45">${escapeHtml_(inspection.notes)}</p></section>` : ''}</section><footer style="padding:15px 28px;background:#f4f7f9;color:#607181;font-size:11px">URBAM Frotas · Registro automático de inspeção</footer></main></body></html>`;
    const pdfAttachment = buildChecklistPdf_(inspection, vehicle, issues, date);
    MailApp.sendEmail({
      to: URBAM_FROTAS_EMAIL,
      subject,
      body,
      htmlBody,
      attachments: [pdfAttachment],
      name: 'URBAM Frotas'
    });
    mailAccepted = true;
    const confirmationRecorded = confirmDelivery_(payload.emailDeliveryId, 'enviado', '', inspection.id) === true;
    return ContentService.createTextOutput(JSON.stringify({ ok: true, protocol: inspection.id, confirmationRecorded }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Uma falha no registro do banco não desfaz o envio já aceito pelo MailApp.
    // Não marcar como falhou nem incentivar um segundo envio do mesmo formulário.
    if (mailAccepted) {
      console.error('E-mail aceito, mas confirmação no banco pendente.');
      return ContentService.createTextOutput(JSON.stringify({ ok: true, confirmationRecorded: false, warning: 'confirmation_pending' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    console.error(`Falha no formulário: ${String(error.message || error)}`);
    try { confirmDelivery_(payload && payload.emailDeliveryId, 'falhou', String(error.message || error), payload.inspection && payload.inspection.id); } catch (_) {}
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(error.message || error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Executar manualmente no editor para autorizar Docs/Drive/Mail e validar PDF.
// Não cria chamados no banco nem notifica motoristas ou fornecedores.
function testarEmailComPdf() {
  const result = doPost({ postData: { contents: JSON.stringify({
    inspection: { id: `diagnostico-${Date.now()}`, createdAt: new Date().toISOString(),
      driver: 'TESTE TÉCNICO — NÃO É CHAMADO', driverRegistration: 'TESTE',
      baseName: 'Homologação', odometer: 0,
      items: [{ name: 'Validação do formulário PDF', status: 'ok' }],
      notes: 'Diagnóstico autorizado da integração. Não representa veículo real.' },
    vehicle: { prefix: 'TESTE', plate: 'TESTE', type: 'Diagnóstico' }, issues: []
  }) } });
  const response = JSON.parse(result.getContent());
  if (!response.ok) throw new Error(response.error || 'Falha no diagnóstico.');
  console.log('Provedor aceitou o e-mail com PDF. Conferir recebimento na caixa de entrada.');
}
