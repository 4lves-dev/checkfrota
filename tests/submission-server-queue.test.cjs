const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'app.js'), 'utf8');
test('submission delegates PDF and tracking to server only', () => {
  const submit = source.slice(source.indexOf('async function submitChecklist'), source.indexOf('function setSubmissionBusy'));
  assert.ok(submit.length > 100);
  assert.match(submit, /cloudSyncSubmission/);
  assert.doesNotMatch(submit, /sendToIntegration\(|emailDeliveryId|cloudSave\("fleet_email_deliveries"/);
  assert.match(submit, /serverQueued: true/);
});
test('pending submission does not claim panel or e-mail delivery', () => {
  const completion = source.slice(source.indexOf('async function showCompletion'), source.indexOf('function renderManagementCommandCenter'));
  assert.match(completion, /Chamado salvo neste aparelho/);
  assert.match(completion, /Aguardando confirmação da sincronização/);
  assert.doesNotMatch(completion, /A integração de e-mail confirmou o recebimento/);
});

