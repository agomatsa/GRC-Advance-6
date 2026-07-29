'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { runCheck } = require('../src/checks');

const fixturesPath = path.join(__dirname, '..', 'fixtures', 'public-fixtures.json');
const { fixtures } = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

test('public fixtures', async (t) => {
  for (const fx of fixtures) {
    await t.test(`${fx.case_id} :: ${fx.check_id}`, () => {
      const result = runCheck(fx.check_id, fx.input);
      assert.equal(result.status, fx.expected_status, `status mismatch for ${fx.case_id} (record ${fx.record_id})`);
      assert.equal(result.code, fx.expected_code, `code mismatch for ${fx.case_id} (record ${fx.record_id})`);
    });
  }
});

test('insufficient is never promoted to pass', () => {
  const r = runCheck('subprocessor.assurance', { assurance: null, subprocessor: 'X' });
  assert.notEqual(r.status, 'pass');
});

test('unknown check_id is malformed, not silently passed', () => {
  const r = runCheck('not.a.real.check', {});
  assert.equal(r.status, 'malformed');
  assert.equal(r.code, 'UNKNOWN_CHECK_ID');
});
