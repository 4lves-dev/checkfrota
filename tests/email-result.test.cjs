const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'email-automation.gs'), 'utf8');
const code = source.slice(source.indexOf('function doPost(e)'), source.indexOf('// Executar manualmente'));
function run({ mailFails = false, confirmationFails = false } = {}) {
  const confirmations = [], mails = [];
  const context = vm.createContext({
    URBAM_FROTAS_EMAIL: 'test@example.invalid', console: { error() {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => '' }) },
    Utilities: { formatDate: () => 'test' }, Session: { getScriptTimeZone: () => 'America/Sao_Paulo' },
    escapeHtml_: String, checklistRow_: () => '', issueBlock_: () => '', buildChecklistPdf_: () => ({}),
    MailApp: { sendEmail: value => { if (mailFails) throw new Error('Mail failed'); mails.push(value); } },
    confirmDelivery_: (...args) => { confirmations.push(args); if (confirmationFails) throw new Error('Network'); return true; },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: value => ({ setMimeType: () => JSON.parse(value) }) }
  });
  vm.runInContext(code, context);
  const result = context.doPost({ postData: { contents: JSON.stringify({ inspection: { id: 'test', odometer: 0 }, vehicle: { prefix: 'TEST' }, emailDeliveryId: 'delivery' }) } });
  return { result, mails, confirmations };
}
test('database failure after mail acceptance must not report email failure', () => {
  const r = run({ confirmationFails: true });
  assert.equal(r.result.ok, true);
  assert.equal(r.result.confirmationRecorded, false);
  assert.equal(r.mails.length, 1);
  assert.deepEqual(r.confirmations.map(x => x[1]), ['enviado']);
});
test('mail rejection reports failure and never success', () => {
  const r = run({ mailFails: true });
  assert.equal(r.result.ok, false);
  assert.deepEqual(r.confirmations.map(x => x[1]), ['falhou']);
});
test('accepted mail records confirmation and preserves zero mileage', () => {
  const r = run();
  assert.equal(r.result.confirmationRecorded, true);
  assert.match(r.mails[0].body, /Quilometragem: 0 km/);
});
