'use strict';

/**
 * Each check function takes a plain-object `input` (schema matches the
 * public/hidden fixture `input` field) and returns:
 *   { status: 'pass'|'fail'|'insufficient'|'malformed', code: string|null }
 *
 * `insufficient` must NEVER be promoted to `pass` — callers must not
 * collapse these two states.
 */

function parseTlsVersion(v) {
  // Accepts "TLSv1.0", "1.0", "TLSv1.2" etc.
  const m = String(v).match(/(\d+)\.(\d+)/);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10)];
}

function cmpVersion(a, b) {
  if (a[0] !== b[0]) return a[0] - b[0];
  return a[1] - b[1];
}

const checks = {
  'tls.minimum': (input) => {
    const min = parseTlsVersion(input.minimum);
    const obs = parseTlsVersion(input.observed);
    if (!min || !obs) return { status: 'malformed', code: 'TLS_VERSION_UNPARSEABLE' };
    if (cmpVersion(obs, min) < 0) return { status: 'fail', code: 'TLS_BELOW_MINIMUM' };
    return { status: 'pass', code: null };
  },

  'access.mfa': (input) => {
    if (input.privileged === true && input.mfa === false) {
      return { status: 'fail', code: 'PRIVILEGED_MFA_MISSING' };
    }
    if (input.privileged == null || input.mfa == null) {
      return { status: 'insufficient', code: 'MFA_STATUS_UNKNOWN' };
    }
    return { status: 'pass', code: null };
  },

  'access.hash_chain': (input) => {
    if (input.expected_previous_hash == null || input.previous_hash == null) {
      return { status: 'insufficient', code: 'HASH_CHAIN_UNVERIFIABLE' };
    }
    if (input.expected_previous_hash !== input.previous_hash) {
      return { status: 'fail', code: 'HASH_CHAIN_BROKEN' };
    }
    return { status: 'pass', code: null };
  },

  'access.duplicate': (input) => {
    const ids = input.event_ids || [];
    const seen = new Set();
    for (const id of ids) {
      if (seen.has(id)) return { status: 'malformed', code: 'DUPLICATE_EVENT_ID' };
      seen.add(id);
    }
    return { status: 'pass', code: null };
  },

  'deletion.order': (input) => {
    if (!input.reported_at || !input.completed_at) {
      return { status: 'insufficient', code: 'DELETION_TIMESTAMPS_MISSING' };
    }
    const reported = new Date(input.reported_at).getTime();
    const completed = new Date(input.completed_at).getTime();
    if (reported < completed) return { status: 'fail', code: 'SUCCESS_BEFORE_COMPLETION' };
    return { status: 'pass', code: null };
  },

  'deletion.backup': (input) => {
    if (input.status === 'success' && !input.backup_purge_at) {
      return { status: 'insufficient', code: 'BACKUP_PURGE_UNPROVEN' };
    }
    if (input.status !== 'success') {
      return { status: 'fail', code: 'DELETION_NOT_SUCCESSFUL' };
    }
    return { status: 'pass', code: null };
  },

  'location.claim': (input) => {
    if (!input.claimed || !input.observed) {
      return { status: 'insufficient', code: 'REGION_EVIDENCE_MISSING' };
    }
    const claimed = String(input.claimed).toLowerCase();
    const observed = String(input.observed).toLowerCase();
    if (claimed !== observed) return { status: 'fail', code: 'REGION_CLAIM_CONTRADICTED' };
    return { status: 'pass', code: null };
  },

  'subprocessor.assurance': (input) => {
    if (input.assurance == null) return { status: 'insufficient', code: 'ASSURANCE_MISSING' };
    return { status: 'pass', code: null };
  },

  'notification.clock': (input) => {
    if (input.clock_basis === 'vendor_confirmation' && input.customer_awareness_dependency === true) {
      return { status: 'fail', code: 'CUSTOMER_CLOCK_DELAYED' };
    }
    return { status: 'pass', code: null };
  },

  'graph.orphan': (input) => {
    if (!input.parent || input.parent === 'MISSING') {
      return { status: 'malformed', code: 'ORPHAN_NODE' };
    }
    return { status: 'pass', code: null };
  },
};

function runCheck(checkId, input) {
  const fn = checks[checkId];
  if (!fn) return { status: 'malformed', code: 'UNKNOWN_CHECK_ID' };
  return fn(input);
}

module.exports = { checks, runCheck };
