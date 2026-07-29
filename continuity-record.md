# Continuity Record — Advanced Project 2 (GRC-A2)

1. **Prior-stage component reused:** Stage 5's typed control/evidence model (claim → check_id → status/code →
   locator) is the interface this pipeline implements against. [Candidate: insert the actual Stage 5 commit
   hash and component name/path here once merged from your Stage 5 repository.]

2. **Interface consumed:** the check-result contract `{status, code, artefact, locator}` with the four-way
   status enum (`pass | fail | insufficient | malformed`) and the "insufficient never promotes to pass"
   invariant, both defined in `src/checks.js` and enforced by `test/fixtures.test.js`. No breaking changes were
   made to this interface; it was extended (see below) rather than replaced.

3. **Provenance preserved:** every finding retains an `artefact` (source filename) and `locator` (exact path
   within that artefact) back to the raw export it was derived from — see `out/findings.json`. No raw export
   under `data/` was edited in place; derived output lives only under `out/`.

4. **Migration record for incompatible changes:** none required. This stage adds new check_ids
   (`tls.minimum`, `access.mfa`, `access.hash_chain`, `access.duplicate`, `deletion.order`, `deletion.backup`,
   `location.claim`, `subprocessor.assurance`, `notification.clock`, `graph.orphan`) and a graph-validation
   layer (`src/graph.js`) additively; nothing from Stage 5's interface was removed or renamed.

5. **Handoff to Stage 7:** `out/findings.json` (verified evidence graph + all check results), the nine open
   conditions with owners/dates in `docs/decision-memo.md` (§ Conditions precedent to launch), and the
   evidence grades in `docs/evidence-index.csv` (High/Medium confidence per claim) are the handoff artifacts.
   Stage 7 audit should treat any condition still open past its due date as a standing finding, not a closed
   item.

> Candidate note: sections 1 and parts of 5 require your actual Stage 5 repository details (commit hash,
> component path) which are not available in this environment — fill those in before submission.
