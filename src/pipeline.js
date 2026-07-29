'use strict';

const fs = require('fs');
const path = require('path');
const { runCheck } = require('./checks');
const { buildGraph, findOrphans, findCycles, reconcileAssurance } = require('./graph');

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function run({ vendorClaimPath, assurancePath, telemetryPath }) {
  const vendorClaim = loadJson(vendorClaimPath);
  const assurance = loadJson(assurancePath);
  const telemetry = loadJson(telemetryPath);

  const findings = [];
  const push = (check_id, input, artefact, locator) => {
    const result = runCheck(check_id, input);
    findings.push({ check_id, ...result, artefact, locator });
    return result;
  };

  // --- TLS ---
  for (const obs of telemetry.tls.observations) {
    push(
      'tls.minimum',
      { minimum: `TLSv${telemetry.tls.minimum_version_claimed}`, observed: obs.protocol },
      path.basename(telemetryPath),
      `tls.observations[endpoint=${obs.endpoint}]@${obs.observed_at}`
    );
  }

  // --- Privileged access: MFA, hash chain, duplicates ---
  const eventIds = telemetry.privileged_access.map((e) => e.event_id);
  push('access.duplicate', { event_ids: eventIds }, path.basename(telemetryPath), 'privileged_access[*].event_id');

  let prevHash = 'ROOT';
  telemetry.privileged_access.forEach((evt, i) => {
    push(
      'access.mfa',
      { privileged: true, mfa: evt.mfa },
      path.basename(telemetryPath),
      `privileged_access[${i}].event_id=${evt.event_id}`
    );
    push(
      'access.hash_chain',
      { expected_previous_hash: prevHash, previous_hash: evt.previous_hash },
      path.basename(telemetryPath),
      `privileged_access[${i}].event_id=${evt.event_id}`
    );
    prevHash = evt.hash;
  });

  // --- Deletion jobs ---
  telemetry.deletion_jobs.forEach((job, i) => {
    push(
      'deletion.order',
      { reported_at: job.reported_at, completed_at: job.completed_at },
      path.basename(telemetryPath),
      `deletion_jobs[${i}].job_id=${job.job_id}`
    );
    push(
      'deletion.backup',
      { status: job.status, backup_purge_at: job.backup_purge_at },
      path.basename(telemetryPath),
      `deletion_jobs[${i}].job_id=${job.job_id}`
    );
  });

  // --- Location claim (LOC-02) vs telemetry subprocessor regions ---
  const nonUsRegions = telemetry.subprocessors.filter((s) => s.region !== 'us-east-1');
  for (const sp of nonUsRegions) {
    push(
      'location.claim',
      { claimed: 'us-east-1', observed: sp.region },
      path.basename(telemetryPath),
      `subprocessors[id=${sp.id}].region`
    );
  }

  // --- Notification clock (IR-08) — contract-level, not telemetry ---
  push(
    'notification.clock',
    {
      clock_basis: assurance.contract.incident_notice.basis,
      customer_awareness_dependency: assurance.contract.incident_notice.basis === 'vendor_confirmation',
    },
    path.basename(assurancePath),
    'contract.incident_notice'
  );

  // --- Subprocessor assurance presence (contract list) ---
  for (const sp of assurance.subprocessors) {
    push(
      'subprocessor.assurance',
      { assurance: sp.assurance ?? null, subprocessor: sp.id },
      path.basename(assurancePath),
      `subprocessors[id=${sp.id}].assurance`
    );
  }

  // --- Graph validation ---
  const nodes = buildGraph(telemetry.subprocessors);
  const idSet = new Set(nodes.keys());
  const nameToId = new Map(telemetry.subprocessors.map((s) => [s.name, s.id]));

  const graph_findings = [];
  for (const node of nodes.values()) {
    if (node.synthetic) continue;
    if (!node.parent) continue;
    if (idSet.has(node.parent)) continue; // resolves cleanly by id
    if (nameToId.has(node.parent)) {
      graph_findings.push({
        node: node.id,
        status: 'malformed',
        code: 'PARENT_REFERENCE_INCONSISTENT_IDENTIFIER',
        detail: `${node.id} references parent "${node.parent}" by name, not by id (resolves to ${nameToId.get(node.parent)}). Export uses inconsistent identifier scheme.`,
      });
    } else {
      graph_findings.push({ node: node.id, parent: node.parent, status: 'malformed', code: 'ORPHAN_NODE' });
    }
  }
  graph_findings.push(...findCycles(nodes));
  graph_findings.push(...reconcileAssurance(nodes, assurance.subprocessors));

  const summary = { pass: 0, fail: 0, insufficient: 0, malformed: 0 };
  for (const f of findings) summary[f.status] = (summary[f.status] || 0) + 1;
  for (const g of graph_findings) summary[g.status] = (summary[g.status] || 0) + 1;

  return {
    generated_at: new Date().toISOString(),
    findings,
    graph_findings,
    summary,
  };
}

module.exports = { run };

if (require.main === module) {
  const out = run({
    vendorClaimPath: path.join(__dirname, '..', 'data', 'vendor-claim.json'),
    assurancePath: path.join(__dirname, '..', 'data', 'assurance-and-contract.json'),
    telemetryPath: path.join(__dirname, '..', 'data', 'vendor-telemetry.json'),
  });
  fs.mkdirSync(path.join(__dirname, '..', 'out'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, '..', 'out', 'findings.json'), JSON.stringify(out, null, 2));
  console.log(JSON.stringify(out.summary, null, 2));
}
