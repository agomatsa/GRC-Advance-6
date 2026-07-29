# GRC Advanced 2 — Vendor Risk Verification Pipeline (PeopleFlow / CloudScale Dynamics)

## Tool / OS versions used in this build
- Node.js: `v22.22.2` (built/tested here; `engines.node >= 18` required)
- npm: `10.9.7`
- OS: Ubuntu (container build environment) — **candidate must confirm and record their own defense-environment
  OS/CPU/memory in `assessment-manifest.json` before submission; do not copy this line verbatim.**

## Assigned variant / evidence marker
- Intern code: `UBI-2026-0038`
- Evidence marker: `UBI-A6-28E98839836C`
- Variant: **[candidate to insert — not present in the supplied materials]**

## Exact reproduction order
```bash
git clone <your-repo-url> && cd <repo>
make provision   # prints Node version; no external deps to install
make build       # sanity-loads src/checks.js and src/pipeline.js
make test        # runs 20 public fixtures + 12 pipeline tests (32 total) via node --test
make run         # runs the pipeline against data/*.json, writes out/findings.json
```
Then read `docs/decision-memo.md`, `docs/contradiction-matrix.csv`, and `docs/evidence-index.csv` for the
decision, contradiction analysis, and evidence trail respectively.

## Directory layout
```
data/                 raw exports (read-only inputs; do not edit)
src/checks.js          pure check functions, one per check_id
src/graph.js            subprocessor graph builder + orphan/cycle/assurance reconciliation
src/pipeline.js         orchestrator: ingests data/, runs checks, writes out/findings.json
src/schemas.js          input/output JSON Schemas
fixtures/public-fixtures.json   the 20 supplied public fixtures (verbatim)
test/fixtures.test.js   runs every public fixture against src/checks.js
test/pipeline.test.js   positive, negative, malformed-input, and clean-state tests
docs/decision-memo.md          the decision + conditions + redlines summary
docs/contradiction-matrix.csv  CX-01..CX-08 contradiction matrix
docs/evidence-index.csv        EV-01..EV-09 evidence index
docs/redlines.md               R1..R6 contract redlines
continuity-record.md           Stage 5→7 continuity per the portfolio contract
```

## Adding a hidden/new fixture without editing core logic
Append an entry to `fixtures/public-fixtures.json` (or point `test/fixtures.test.js` at a second file) with
the same `{case_id, check_id, expected_code, expected_status, input, record_id}` shape. `test/fixtures.test.js`
iterates the file generically — no change to `src/checks.js` is needed unless the new fixture introduces a
genuinely new `check_id`, in which case `runCheck` will correctly return `UNKNOWN_CHECK_ID` / `malformed`
rather than silently passing it.

## Known limitations / candidate action items before submission
- `manifest.sha256`, `assessment-manifest.json`'s `assigned_pack`/`commit` fields, and
  `integrity-attestation.md`'s signature blocks require information only you have (your assigned pack hash,
  your frozen commit, your signed name/date). Templates are provided; **do not submit with placeholders still
  in them.**
- `docs/evidence-index.csv`'s `SHA256` column is marked `PENDING-HASH` — run the hash command below once your
  final `data/` files are frozen and fill in real hashes.
- This pipeline is dependency-free (Node core + `node:test` only), so `make provision` has nothing to install.
  If your assigned pack requires additional tooling, add it to `provision` and pin versions.

## Hash command (Linux/macOS)
```bash
find . -type f ! -name manifest.sha256 -print0 \
  | sort -z \
  | xargs -0 shasum -a 256 > manifest.sha256
```
