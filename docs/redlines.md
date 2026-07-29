# Contract / DPA Redlines — PeopleFlow Inc.

## R1 — Incident notification clock (addresses CX-05)
**Current:** *"PeopleFlow will notify the customer without undue delay and no later than 72 hours after
PeopleFlow confirms a security incident affects customer data."*

**Redline:** *"PeopleFlow will notify the customer without undue delay and no later than 72 hours after the
earlier of (a) PeopleFlow's actual confirmation, or (b) the point at which PeopleFlow, exercising reasonable
diligence and its own monitoring capability, should have confirmed the incident."*

**Rationale:** removes the vendor's unilateral ability to control the disclosure clock by delaying its own
confirmation step.

## R2 — Data residency (addresses CX-02, CX-08)
**Current:** *"Customer data will be hosted in the United States."* (silent on support/backup subprocessors)

**Redline:** add — *"PeopleFlow shall maintain and provide on request a complete, current list of all
subprocessors and the region(s) in which each processes or stores Customer Data, including backup and support
functions. Any processing or storage outside the United States requires a Customer-approved transfer mechanism
and ten (10) days' prior written notice, delivered to a named contact, before the change takes effect."*

**Rationale:** closes the gap where LOC-02 claimed exclusivity while SP-02/SP-03 already touch non-US regions,
and where SP-01/SP-03 aren't in the disclosed subprocessor list at all.

## R3 — Subprocessor assurance floor (addresses CX-06)
**Redline:** add — *"Any subprocessor with access to unmasked personal or financial data classes (including
but not limited to bank details, tax identifiers, or support attachments containing such data) must maintain
independent third-party assurance (SOC 2 Type II, ISO 27001, or equivalent). Self-assessment alone is
insufficient. PeopleFlow shall cure any subprocessor falling below this floor within 60 days or suspend that
subprocessor's access to Customer Data."*

## R4 — Evidence delivery / audit assistance (addresses the general evidence-standard gap)
**Current:** *"Audit assistance beyond one annual questionnaire is billable."*

**Redline:** *"PeopleFlow will provide, at no additional charge and within 10 business days of request, the
underlying technical evidence (access logs, deletion telemetry, configuration exports) reasonably necessary to
substantiate any claim made in a Security Information Gathering questionnaire or equivalent. Billable audit
assistance applies only to on-site audits or work exceeding 8 hours of vendor staff time per year."*

**Rationale:** the current clause makes the exact evidence this verification pipeline needs (and found missing
for 4 of 6 claims) a paid extra, which is inconsistent with relying on the SIG as a basis for a security
sign-off.

## R5 — Termination-access SLA (addresses CX-01)
**Redline:** convert IAM-04's narrative answer into a binding SLA: *"PeopleFlow will revoke all system access
for a terminated CloudScale-affiliated user within 24 hours of termination notice. Failure measured over any
rolling 90-day window in excess of a 5% exception rate constitutes a material breach and entitles Customer to
a service credit of [X]% of the annual fee and a 30-day cure period before termination for cause."*

**Rationale:** SOC 2 exception EX-CC6.2 shows a 16% exception rate (4/25) with no contractual consequence today.

## R6 — TLS minimum standard (addresses CX-03)
**Redline:** add — *"PeopleFlow shall maintain TLS 1.2 or higher on all customer-facing endpoints and provide
quarterly attestation of endpoint TLS configuration."*
