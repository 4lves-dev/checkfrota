const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'email-automation.gs'), 'utf8');
const sender = source.slice(source.indexOf('function doPost(e)'), source.indexOf('// Executar manualmente'));
const worker = fs.readFileSync(path.join(__dirname, '..', 'email-queue-worker.gs'), 'utf8');
function setup(options = {}) {
  const events = [];
  const job = { inspection: { id: 'synthetic', odometer: 0 }, vehicle: { prefix: 'TEST' }, lease: 'lease' };
  const context = vm.createContext({
    URBAM_FROTAS_EMAIL: 'test@example.invalid', console: { error() {} },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => 'server' }) },
    Utilities: { formatDate: () => 'test' }, Session: { getScriptTimeZone: () => 'America/Sao_Paulo' },
    escapeHtml_: String, checklistRow_: () => '', issueBlock_: () => '',
    buildChecklistPdf_: () => { events.push('pdf'); if(options.pdfFails) throw Error('PDF'); return {}; },
    MailApp: { sendEmail: () => { events.push('mail'); if(options.mailFails) throw Error('Transport'); } },
    emailQueueTransition_: (_, action) => {
      events.push(action);
      if(action === 'sent' && options.confirmFails) throw Error('Network');
      return !(action === 'sending' && options.gateFails);
    },
    confirmDelivery_: () => { throw Error('Legacy callback must not be used'); },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: value => ({ setMimeType: () => JSON.parse(value) }) }
  });
  vm.runInContext(sender, context);
  return { events, context, run: () => context.sendChecklist_({postData:{contents:JSON.stringify(job)}}, job) };
}
test('server mode never sends untrusted public POST payloads', () => {
  const r=setup(); assert.equal(r.context.doPost({}).queued,true); assert.deepEqual(r.events,[]);
});
test('queue send requires durable gate before MailApp', () => {
  const r=setup(); assert.equal(r.run().confirmationRecorded,true);
  assert.deepEqual(r.events,['pdf','sending','mail','sent']);
});
test('PDF preparation failure may retry, but sends no mail', () => {
  const r=setup({pdfFails:true}); assert.equal(r.run().ok,false); assert.deepEqual(r.events,['pdf','retry']);
});
test('rejected lease prevents email send', () => {
  const r=setup({gateFails:true}); r.run(); assert.ok(!r.events.includes('mail'));
});
test('ambiguous mail error requires review, never automatic retry', () => {
  const r=setup({mailFails:true}); r.run(); assert.deepEqual(r.events,['pdf','sending','mail','uncertain']);
});
test('accepted email with lost confirmation is not retried', () => {
  const r=setup({confirmFails:true}); assert.equal(r.run().ok,true);
  assert.deepEqual(r.events,['pdf','sending','mail','sent']);
});
test('worker checks quota before claiming, releases lock on failure', () => {
  const events=[];
  const c=vm.createContext({
    PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'server'})},
    LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>events.push('unlock')})},
    MailApp:{getRemainingDailyQuota:()=>0}
  });
  vm.runInContext(worker,c); c.processarFilaEmails(); assert.deepEqual(events,['unlock']);
  c.MailApp.getRemainingDailyQuota=()=>1;
  c.emailQueueRpc_=()=>{throw Error('offline');};
  assert.throws(()=>c.processarFilaEmails(),/offline/); assert.deepEqual(events,['unlock','unlock']);
});
