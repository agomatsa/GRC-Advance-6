'use strict';

// Minimal hand-rolled JSON Schemas (draft-07 style) for the pipeline's
// input and output contracts. Kept dependency-free.

const inputSchema = {
  $id: 'grc-a2/input.schema.json',
  type: 'object',
  required: ['vendorClaim', 'assuranceAndContract', 'telemetry'],
  properties: {
    vendorClaim: {
      type: 'object',
      required: ['vendor', 'claims'],
      properties: {
        vendor: { type: 'string' },
        claims: {
          type: 'array',
          items: {
            type: 'object',
            required: ['claim_id', 'control'],
          },
        },
      },
    },
    assuranceAndContract: {
      type: 'object',
      required: ['assurance_report', 'contract', 'subprocessors'],
    },
    telemetry: {
      type: 'object',
      required: ['tls', 'privileged_access', 'deletion_jobs', 'subprocessors'],
    },
  },
};

const outputSchema = {
  $id: 'grc-a2/output.schema.json',
  type: 'object',
  required: ['generated_at', 'findings', 'graph_findings', 'summary'],
  properties: {
    generated_at: { type: 'string', format: 'date-time' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        required: ['check_id', 'status', 'code', 'artefact', 'locator'],
        properties: {
          check_id: { type: 'string' },
          status: { enum: ['pass', 'fail', 'insufficient', 'malformed'] },
          code: { type: ['string', 'null'] },
          artefact: { type: 'string' },
          locator: { type: 'string' },
        },
      },
    },
    graph_findings: { type: 'array' },
    summary: {
      type: 'object',
      required: ['pass', 'fail', 'insufficient', 'malformed'],
    },
  },
};

module.exports = { inputSchema, outputSchema };
