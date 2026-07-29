'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { run } = require('../src/pipeline');

const DATA = path.join(__dirname, '..', 'data');

test('positive: pipeline runs end-to-end on the assigned export set', () => {
  const out = run({
    vendorClaimPath: path.join(DATA, 'vendor-claim.json'),
    assurancePath: path.join(DATA, 'assurance-and-contract.json'),
    telemetryPath: path.join(DATA, 'vendor-telemetry.json'),
  });
  assert.ok(out.findings.length > 0);
  assert.ok(out.summary.fail > 0, 'expected real defects to surface as fail');
});

test('positive: catches the planted broken hash chain (PA-003)', () => {
  const out = run({
    vendorClaimPath: path.join(DATA, 'vendor-claim.json'),
    assurancePath: path.join(DATA, 'assurance-and-contract.json'),
    telemetryPath: path.join(DATA, 'vendor-telemetry.json'),
  });
  const hit = out.findings.find((f) => f.code === 'HASH_CHAIN_BROKEN');
  assert.ok(hit, 'expected a HASH_CHAIN_BROKEN finding');
});

test('positive: catches the duplicate PA-002 event', () => {
  const out = run({
    vendorClaimPath: path.join(DATA, 'vendor-claim.json'),
    assurancePath: path.join(DATA, 'assurance-and-contract.json'),
    telemetryPath: path.join(DATA, 'vendor-telemetry.json'),
  });
  const hit = out.findings.find((f) => f.code === 'DUPLICATE_EVENT_ID');
  assert.ok(hit);
});

test('positive: catches the success-before-completion deletion job (DEL-710)', () => {
  const out = run({
    vendorClaimPath: path.join(DATA, 'vendor-claim.json'),
    assurancePath: path.join(DATA, 'assurance-and-contract.json'),
    telemetryPath: path.join(DATA, 'vendor-telemetry.json'),
  });
  const hit = out.findings.find(
    (f) => f.code === 'SUCCESS_BEFORE_COMPLETION' && f.locator.includes('DEL-710')
  );
  assert.ok(hit);
});

test('positive: catches the inconsistent name/id parent reference (SP-03 -> "QueueNorth")', () => {
  const out = run({
    vendorClaimPath: path.join(DATA, 'vendor-claim.json'),
    assurancePath: path.join(DATA, 'assurance-and-contract.json'),
    telemetryPath: path.join(DATA, 'vendor-telemetry.json'),
  });
  const hit = out.graph_findings.find((f) => f.code === 'PARENT_REFERENCE_INCONSISTENT_IDENTIFIER');
  assert.ok(hit);
});

test('negative: region mismatch does not get silently treated as conforming', () => {
  const out = run({
    vendorClaimPath: path.join(DATA, 'vendor-claim.json'),
    assurancePath: path.join(DATA, 'assurance-and-contract.json'),
    telemetryPath: path.join(DATA, 'vendor-telemetry.json'),
  });
  const hit = out.findings.find((f) => f.check_id === 'location.claim' && f.status === 'pass');
  assert.equal(hit, undefined, 'no location.claim check should silently pass given non-US nodes');
});

test('malformed-input: missing required export file throws rather than fabricating a result', () => {
  assert.throws(() => {
    run({
      vendorClaimPath: path.join(DATA, 'vendor-claim.json'),
      assurancePath: path.join(DATA, 'assurance-and-contract.json'),
      telemetryPath: path.join(DATA, 'does-not-exist.json'),
    });
  });
});

test('malformed-input: unparsable JSON export throws rather than silently skipping', () => {
  const tmp = path.join(os.tmpdir(), `bad-${Date.now()}.json`);
  fs.writeFileSync(tmp, '{ not valid json');
  assert.throws(() => {
    run({
      vendorClaimPath: path.join(DATA, 'vendor-claim.json'),
      assurancePath: path.join(DATA, 'assurance-and-contract.json'),
      telemetryPath: tmp,
    });
  });
  fs.unlinkSync(tmp);
});

test('clean-state: two consecutive runs against the same inputs are deterministic apart from generated_at', () => {
  const args = {
    vendorClaimPath: path.join(DATA, 'vendor-claim.json'),
    assurancePath: path.join(DATA, 'assurance-and-contract.json'),
    telemetryPath: path.join(DATA, 'vendor-telemetry.json'),
  };
  const a = run(args);
  const b = run(args);
  assert.deepEqual(a.findings, b.findings);
  assert.deepEqual(a.graph_findings, b.graph_findings);
  assert.deepEqual(a.summary, b.summary);
});
