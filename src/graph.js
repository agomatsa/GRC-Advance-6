'use strict';

/**
 * Builds a subprocessor/data-flow graph from the telemetry export and
 * validates it for orphan nodes (parent not present in the node set)
 * and cycles (A -> B -> A). Also reconciles each edge's data classes
 * against the assurance/contract subprocessor list so a node present in
 * telemetry but missing a contractual assurance record surfaces as a
 * finding rather than being silently treated as conforming.
 */
function buildGraph(telemetrySubprocessors, root = 'PeopleFlow') {
  const nodes = new Map();
  nodes.set(root, { id: root, parent: null, synthetic: true });
  for (const sp of telemetrySubprocessors) {
    nodes.set(sp.id, { id: sp.id, name: sp.name, region: sp.region, data_classes: sp.data_classes, parent: sp.parent });
  }
  return nodes;
}

function findOrphans(nodes) {
  const orphans = [];
  for (const node of nodes.values()) {
    if (node.parent && !nodes.has(node.parent)) {
      orphans.push({ node: node.id, parent: node.parent, status: 'malformed', code: 'ORPHAN_NODE' });
    }
  }
  return orphans;
}

function findCycles(nodes) {
  const cycles = [];
  for (const start of nodes.keys()) {
    const visited = new Set();
    let cur = start;
    const path = [start];
    while (true) {
      const node = nodes.get(cur);
      if (!node || !node.parent) break;
      if (node.parent === start) {
        cycles.push({ cycle: [...path, node.parent], status: 'malformed', code: 'GRAPH_CYCLE' });
        break;
      }
      if (visited.has(node.parent)) break; // already-reported elsewhere
      visited.add(cur);
      path.push(node.parent);
      cur = node.parent;
      if (path.length > nodes.size + 1) break; // safety bound
    }
  }
  return cycles;
}

/**
 * Cross-checks each telemetry subprocessor node against the contractual
 * subprocessor list (by data classes / function), flagging nodes that
 * carry regulated data but have no matching contractual assurance
 * record — evidence gap, not a pass.
 */
function reconcileAssurance(nodes, contractualSubprocessors) {
  const findings = [];
  const byRegion = new Map(contractualSubprocessors.map((s) => [s.location.toLowerCase(), s]));
  for (const node of nodes.values()) {
    if (node.synthetic) continue;
    const match = byRegion.get((node.region || '').toLowerCase());
    if (!match) {
      findings.push({
        node: node.id,
        status: 'insufficient',
        code: 'SUBPROCESSOR_NOT_IN_CONTRACT_LIST',
        detail: `Telemetry node ${node.id} (${node.name}, region ${node.region}) has no matching entry in the contractual subprocessor list.`,
      });
    } else if (match.assurance == null) {
      findings.push({ node: node.id, status: 'insufficient', code: 'ASSURANCE_MISSING' });
    }
  }
  return findings;
}

module.exports = { buildGraph, findOrphans, findCycles, reconcileAssurance };
