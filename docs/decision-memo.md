# Vendor Risk Decision Memo — PeopleFlow Inc. (CloudScale Dynamics)

**Case date:** 13 July 2026 · **Planned launch:** 20 July 2026 · **Contract value:** USD 180,000/yr
**Data classes in scope:** employee names, addresses, **bank details, tax IDs**, performance notes, support attachments
**Prepared under:** GRC-A2 verification pipeline, `out/findings.json` (generated_at recorded in file)

## Decision: **DEFER**

Launch does not proceed on 20 July 2026. The rule set is approve / conditional approve / defer / reject, and
procurement's date is pressure, not a control (per brief). This case does not clear the bar for outright reject
(the vendor is remediable and several controls are sound — encryption key management, AWS hosting assurance,
one of two deletion jobs), but it also cannot be conditional-approved-to-launch because a **materiality-crossing
contradiction exists on the control that gates access to the most sensitive data class in scope** (IAM-04),
and four of six SIG claims (IAM-04, LOG-07, DEL-05, IR-08) were signed with **no evidence supplied at all**.
Defer means: launch is blocked until the Section "Conditions precedent to launch" below are closed; conditional
approval becomes available only after those specific items close.

## Why not conditional-approve-to-launch

Conditional approval assumes the residual gaps are monitorable-in-production risks. Two facts push this case past
that line:

1. **IAM-04 is not merely unverified — it is contradicted by the vendor's own SOC 2 report.** The SIG claims
   termination access removal within 24 hours. Exception EX-CC6.2 shows 4 of 25 sampled terminated accounts stayed
   enabled 6–19 days. That is the control gating access to bank details and tax IDs for a workforce of unknown
   size — a stale/enabled account is a live exfiltration path, not a paperwork gap.
2. **The evidence needed to size the residual risk doesn't exist yet.** LOG-07, DEL-05, and IR-08 carry
   `evidence_supplied: false` in `vendor-claim.json`. Without evidence there is no basis to bound the exposure,
   so it cannot be priced into a conditional-approval risk acceptance.

## Material contradictions (see `contradiction-matrix.csv` for full locator detail)

| # | Claim | Evidence for | Evidence against | Verdict |
|---|---|---|---|---|
| 1 | IAM-04: access removed ≤24h | SIG response, signed 2026-07-02 | SOC 2 EX-CC6.2: 4/25 accounts enabled 6–19 days | **Contradicted** — high confidence (auditor-tested sample) |
| 2 | LOC-02: data exclusively in us-east-1 | SIG response | `vendor-telemetry.json` subprocessors SP-02 (Philippines) and SP-03 (eu-west-1) process/store employee_id, support_case, and backup data | **Contradicted** — high confidence (raw telemetry, self-consistent) |
| 3 | ENC-03: encrypted in transit and at rest | SIG response | `vendor-telemetry.json` tls.observations: `files.peopleflow.invalid` observed at TLSv1.0, below the vendor's own claimed TLSv1.2 minimum | **Partially contradicted** — high confidence on the one endpoint sampled; unknown for endpoints not observed |
| 4 | DEL-05: data deleted promptly after termination | SIG response; DPA 180+90 day terms | `vendor-telemetry.json` DEL-710 reports `success` at 12:00:00Z but its own `completed_at` is 12:14:00Z (success reported *before* completion) | **Evidence integrity failure** — the vendor's own deletion telemetry cannot be trusted as stated; medium confidence this reflects a pipeline defect rather than fabrication, but unproven either way |
| 5 | IR-08: notify within 72h of confirming a breach | SIG response; DPA incident-notice clause | DPA clock basis is `vendor_confirmation`, not customer awareness or objective discovery — vendor controls when the clock starts | **Structural risk, not a factual contradiction** — the claim is technically true but the mechanism lets the vendor delay disclosure indefinitely by delaying its own "confirmation" |

## Evidence and audit-quality caveats (per brief: a SOC 2 is not a certification)

- The SOC 2 Type II report covers **1 Jan–31 Dec 2024** and issued **28 Feb 2025**. At case date it is ~16.5
  months old with no evidence a 2025 report exists. It is being relied on to support representations made in a
  **July 2026** SIG. The auditor's own language requires exceptions to be evaluated by user entities in light of
  their use — CloudScale has not documented that evaluation until this memo.
- **EX-CC7.2** (alert-review evidence absent 7/40 sampled days, ~17.5%) directly undercuts LOG-07's "reviewed
  daily, evidence retained one year" claim, independent of the telemetry gap.
- **EX-CC8.1** (3/20 emergency changes lacking retrospective approval within 5 business days) is not tied to a
  specific SIG claim but is relevant change-control risk background.
- Subservice organizations are carved out of the SOC 2 opinion. HelpSphere (Philippines, ticket/attachment access)
  and MailRelay are **not** covered by PeopleFlow's SOC 2 at all — their assurance is whatever they separately
  provide (self-assessment for HelpSphere; ISO 27001 for MailRelay, expiring 30 Sep 2026).

## Access-log and integrity findings (`out/findings.json`)

- **PA-002** (support-19, region ap-southeast-1 — a third region matching neither the SIG's claimed us-east-1
  nor HelpSphere's Philippines base): privileged access with `mfa: false` and no approved ticket. **Fail —
  PRIVILEGED_MFA_MISSING.**
- **PA-002 is also duplicated** verbatim in the export (`DUPLICATE_EVENT_ID`, malformed) — the export itself
  fails basic integrity hygiene before any risk judgment is even applied.
- **PA-003**'s `previous_hash` does not match PA-002's `hash` (**HASH_CHAIN_BROKEN**). From PA-003 forward, the
  privileged-access log's integrity cannot be verified — it is not possible to rule out an undetected or
  unlogged event between PA-002 and PA-003.
- **Graph defect:** SP-03 (`ArchiveLane`) lists its parent as `"QueueNorth"` — a *name*, not the `SP-01` id used
  everywhere else in the export. Resolved manually this is not an orphan, but it demonstrates the export mixes
  identifier schemes, which is itself a data-quality finding (`PARENT_REFERENCE_INCONSISTENT_IDENTIFIER`) worth
  raising with the vendor's export pipeline owner.
- **Neither SP-01 (QueueNorth) nor SP-03 (ArchiveLane)** appears in the contractual subprocessor list at all —
  only AWS, HelpSphere, and MailRelay are contractually disclosed. QueueNorth and ArchiveLane are **undisclosed
  subprocessors** touching `employee_id`, `email`, `support_case`, and `backup` data classes.
  (`SUBPROCESSOR_NOT_IN_CONTRACT_LIST`, insufficient — this is a DPA compliance gap in its own right: the DPA
  requires 10 days' notice of subprocessor changes, and there is no record CloudScale received it.)

## Conditions precedent to launch (all must close before Defer converts to Approve/Conditional Approve)

| ID | Condition | Owner | Due | Evidence of closure | Consequence if unmet |
|---|---|---|---|---|---|
| C1 | Supply contemporaneous 2026 evidence that terminated-account access is removed ≤24h, or revise the SLA to the demonstrated range and add a compensating control (e.g., automated deprovisioning) | PeopleFlow IAM lead (vendor) | Pre-launch | Signed export of termination timestamps vs. deprovision timestamps, with locators, for a statistically valid post-SOC2-period sample | Defer persists; contract does not proceed |
| C2 | Reconcile LOC-02: either amend SIG/DPA to disclose all actual processing/storage regions with lawful transfer mechanism, or technically enforce exclusive us-east-1 processing and prove it | PeopleFlow Solutions Architect | Pre-launch | Reconciled subprocessor list matching telemetry; transfer mechanism (SCCs or equivalent) attached to DPA if regions are disclosed | Defer persists |
| C3 | Disclose QueueNorth and ArchiveLane as subprocessors per the DPA's 10-day notice clause; supply their assurance evidence | PeopleFlow Vendor Management | Pre-launch | Updated subprocessor list + assurance docs for SP-01/SP-03 | Defer persists; DPA breach otherwise |
| C4 | Remediate TLS on `files.peopleflow.invalid` to ≥TLS 1.2; rescan all customer-facing endpoints | PeopleFlow Infrastructure | Pre-launch | Rescanned telemetry export showing no endpoint below minimum | Defer persists |
| C5 | Close the HelpSphere assurance gap for ticket-attachment access to CloudScale employee bank/tax data: independent assurance, or enable session recording + verified attachment masking | PeopleFlow Vendor Mgmt + CloudScale Security | Pre-launch | Masking config sample + session-recording enablement confirmation | If unmet at launch, HelpSphere access to CloudScale attachments must be technically blocked pending closure |
| C6 | Investigate and close the PA-002→PA-003 hash-chain break; confirm no unauthorized access occurred in the gap; enforce MFA on all privileged access | PeopleFlow Security Ops | Pre-launch | Root-cause report + corrected/attested log chain + MFA-enforcement config | Defer persists; platform cannot be relied on for privileged-access assurance |
| C7 | Reconcile DEL-710's success-before-completion anomaly; supply backup-purge evidence for any job reporting `success` | PeopleFlow Data Engineering | Before first employee termination is processed | Corrected deletion telemetry + backup purge confirmation | If unmet by first termination, processing of terminated-employee data must pause |
| C8 | Redline IR-08's notification clock away from sole vendor self-confirmation (see redlines) | Legal/Contracts + CloudScale CISO | 30 days post-close of C1–C6, or pre-launch if Legal treats it as a launch blocker | Executed DPA amendment | Interim: compensating independent-detection monitoring control required |
| C9 | Renew MailRelay ISO 27001 certificate | PeopleFlow Vendor Management | 30 Sep 2026 | Renewed certificate | If unmet, suspend employee_id/email flow to MailRelay |

## Risks that remain even after every condition above is met

- The SOC 2 opinion will still only cover 2024; no contractual guarantee exists that a 2025/2026 report will be
  produced or shared before the next renewal cycle. CloudScale is structurally dependent on PeopleFlow's audit
  cadence.
- HelpSphere's assurance, even after C5 closes, may remain self-reported unless independent assurance is
  obtained — recording/masking reduces exposure but doesn't substitute for third-party verification.
- IR-08's clock still originates at the vendor's own confirmation unless the contract itself is amended (C8);
  a compensating monitoring control mitigates but does not eliminate the structural dependency.
- The DPA's 180+90 day deletion window is a long residual-data tail by design — an accepted feature of this DPA
  type, not something any condition removes.
- Any future subprocessor added under the 10-day notice clause can reintroduce the exact class of gap found
  here. This is why quarterly re-verification (below) is a standing requirement, not a one-time gate.

## Quarterly verification (executable)

```bash
make provision && make build && make test && make run
```

Run each quarter against freshly pulled exports (replace files under `data/`). Diff `out/findings.json` against
the prior quarter's file; any new `fail` or new `insufficient` on checks tied to IAM-04, LOC-02, ENC-03, or
HelpSphere assurance auto-escalates to Security + Vendor Management for review within 5 business days.

## Artifact-check note

Per the mandatory artifact check, when staff replace one export the pipeline, graph findings, conditions, and
this memo must regenerate within 45 minutes without validator-source edits. The pipeline supports this: drop the
replacement file in `data/` under its existing filename and re-run `make run`; no file in `src/` needs to change
for any input-data change, since every check function is generic over its `input` shape (see `src/checks.js`).
Only if the replacement introduces a genuinely new check type would `src/checks.js` need a new entry — that is
a schema change, not a data change, and would be flagged by the pipeline throwing on an unrecognized shape rather
than silently passing it.
