GRC Advanced 2 — Vendor Risk Verification Pipeline
PeopleFlow / CloudScale Dynamics | System Documentation & Submission README

**1. Environment & System Specification**

Candidate Name Ebenezer Elikem Amankwah Ofori Dzam
Intern Code UBI-2026-0038
Evidence Marker UBI-A6-28E98839836C
Operating System Kali Linux 2026.x (x86_64)
Runtime &Version Node.js v24.18.0 (engines.node ;= 18 supported)
Package Manager npm 10.9.2

3. Directory Layout

data/ Raw vendor exports (Read-only inputs, locked via chmod 444)
├── assurance-and-contract.json
├── vendor-claim.json
└── vendor-telemetry.json
src/ Core pipeline logic
├── checks.js Pure check functions (one per check_id)
├── graph.js Subprocessor graph builder & reconciliation logic
├── pipeline.js Orchestrator: ingests data/, executes checks, outputs findings
└── schemas.js JSON schema definitions for inputs and outputs
test/ Test suite
├── fixtures.test.js Executes test fixtures against pure checks
└── pipeline.test.js End-to-end positive, negative, and edge-case pipeline tests
fixtures/ Test fixtures
└── public-fixtures.json Supplied public verification fixtures
docs/ GRC documentation & evidence matrix
├── decision-memo.md Final risk decision, conditions, and executive summary
├── contradiction-matrix.csv CX-01..CX-08 contradiction matrix
├── evidence-index.csv EV-01..EV-09 evidence index with verified SHA-256 digests
└── redlines.md R1..R6 contractual redlines
tools/ Automated verification, hashing, and structural audit scripts
├── update-hashes.js Computes and injects SHA-256 digests into CSV indexes
├── verify-csv.py Validates column layout uniformity across CSV tables
└── lock-data.sh Applies read-only permissions to raw evidence files
out/ Pipeline outputs
└── findings.json Generated assessment output report
assessment-manifest.json Submission manifest and repository commit tracking
continuity-record.md Stage 5→7 continuity tracking log
Makefile Pipeline automation interface

README.md Project documentation

**3. Quick Start & Reproduction Order**
This project is entirely dependency-free (built strictly using Node.js core modules and standard system
utilities). Execute the following commands from the repository root:
# 1. Provision and verify environment requirements
make provision
# 2. Perform build sanity checks on pipeline modules
make build
# 3. Execute test suite (runs 20 public fixtures + 12 pipeline tests via node --test)
make test
# 4. Run the verification pipeline against data/*.json and generate out/findings.json
make run
After running the pipeline, review the risk analysis artifacts in docs/:
 docs/decision-memo.md — Executive decision, risk conditions, and redlines.
 docs/contradiction-matrix.csv — Contradiction mapping (CX-01 to CX-08).
 docs/evidence-index.csv — Full evidence index (EV-01 to EV-09) with SHA-256 hashes.

4. Tools, Automation & Integrity Verification
To run repository maintenance scripts directly:

# Calculate and populate real SHA-256 hashes for raw data files into evidence-index.csv
node tools/update-hashes.js
# Verify structural uniformity across CSV indexes
python3 tools/verify-csv.py
# Enforce read-only file permissions on raw data inputs
./tools/lock-data.sh
Manifest Hash Generation
To update or re-verify manifest.sha256 across the frozen repository state:
find . -type f ! -name manifest.sha256 -print0 \
| sort -z \
| xargs -0 shasum -a 256 > manifest.sha256


**5. Assistance & Authorship Attestation**

**Assistance and tools used:**
I Ebenezer Elikem Amankwah Ofori Dzam –UBI-2026-0038 declare ownership and with assistance of Osei-Akoto Okyere, scaffolding project directory structures, writing automation scripts (including SHA-256 evidence hashing utilities and CSV column parsing), debugging Git authentication/configuration issues, and formatting markdown documentation. The development and runtime environment relied on Kali Linux (Terminal/Bash), Node.js (v24.x) with the native Node test runner (node --test), Git and GitHub for version control and remote synchronization, and core system utilities including sha256sum, jq, python3, find, chmod, and grep. All raw evidence files in data/ have been frozen (read-only), and all SHA-256 digests in docs/evidence-index.csv have been fully calculated and verified with no PENDING-HASH placeholders remaining.

**Declaration:**
I therefore declare the assessment's authorship and integrity clauses, I Ebenezer Elikem Amankwah Ofori Dzam – UBI-2026-0038 is fully responsible for every claim, test, fixture, and documentation file included in this submission; all generated scripts, hashes, and code logic have been locally executed, verified, and can be fully demonstrated and explained during defence.

