const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'app.js'), 'utf8');
const code = source.slice(source.indexOf('let cloudSessionRefresh ='), source.indexOf('async function cloudRpc('));
function setup(refresh = true) {
  const stored = new Map([['checkfrota-supabase-token', 'old'], ...(refresh ? [['checkfrota-supabase-refresh', 'renew']] : [])]);
  let renewals = 0, reads = 0;
  const c = vm.createContext({ CLOUD: { url: 'https://example.invalid', publishableKey: 'public' }, AbortSignal,
    sessionStorage: { getItem: k => stored.get(k), setItem: (k,v) => stored.set(k,v) },
    cloudToken: () => stored.get('checkfrota-supabase-token'), cloudHeaders: () => ({ Authorization: stored.get('checkfrota-supabase-token') }),
    fetch: async (url, options) => {
      if (url.includes('refresh_token')) { renewals++; await new Promise(resolve => setTimeout(resolve, 5)); return { ok: true, json: async () => ({ access_token: 'new', refresh_token: 'rotated' }) }; }
      reads++; const ok = options.headers.Authorization === 'new';
      return { ok, status: ok ? 200 : 401, json: async () => [] };
    },
  });
  vm.runInContext(code, c);
  return { c, stored, counts: () => ({ renewals, reads }) };
}
test('parallel management reads renew session once and retry with rotated token', async () => {
  const { c, stored, counts } = setup();
  await Promise.all([c.cloudRequest('/issues'), c.cloudRequest('/inspections'), c.cloudRequest('/vehicles')]);
  assert.equal(counts().renewals, 1);
  assert.equal(counts().reads, 6);
  assert.equal(stored.get('checkfrota-supabase-refresh'), 'rotated');
});
test('legacy session without refresh reports re-login instead of endless renewal', async () => {
  const { c, counts } = setup(false);
  await assert.rejects(c.cloudRequest('/issues'), /Sessão expirada/);
  assert.equal(counts().renewals, 0);
});
