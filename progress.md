# ArthSetu — Development Progress Tracker

> ### 📌 Instructions for Teammates
> 1. **Do not mark tasks `Completed` merely because code was written.** Only mark `Completed` after acceptance criteria and manual/automated verification pass.
> 2. **Never overwrite another teammate's section or rows.** Only update your assigned rows and append to the Development Log.
> 3. **Keep blockers visible immediately.** If blocked by another teammate's module or database migration, update your status to `Blocked` and note the blocking Task ID.
> 4. **Use exact Task IDs** matching [IMPLEMENTATION_PLAN.md](file:///c:/Users/ashut/OneDrive/Desktop/Das/arthsetu/IMPLEMENTATION_PLAN.md).
> 5. **Accepted Status vocabulary:** `Not Started` | `In Progress` | `Blocked` | `Completed`.

---

## 1. Project Status

- **Current Phase:** Phase 1 — Architecture & Foundation Setup
- **Overall Status:** In Progress (Planning completed, scaffolding in place, entering backend foundation & frontend setup)
- **Last Updated:** 2026-10-31 00:15 IST
- **Current Blockers:** None currently. Teammate 2 starting database models and authentication.

---

## 2. Team Progress Summary

| Teammate | Responsibility | Status | Completed Tasks | Current Task | Blockers |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Teammate 1** | Frontend UI & API Integration | In Progress | None | T1-01 (Deps & Tailwind Setup) | None |
| **Teammate 2** | Backend Foundation & Security | In Progress | T2-01, T2-02 | T2-03 (SQLAlchemy Models) | None |
| **Teammate 3** | Data Ingestion & Reconciliation | In Progress | None | T3-01 (CSV Upload & Parser Unit Tests) | None |
| **Teammate 4** | Financial Analytics & Passport | In Progress | None | T4-01 (Pure Metric Calculation Functions) | None |

---

## 3. Phase-Wise Progress

### Phase 1 — Architecture and Team Coordination
- [x] **P1-01** — Agree on unified database schema & relationship model (`T2 Lead`, All Teammates) — *Completed 2026-10-31* (See [IMPLEMENTATION_PLAN.md](file:///c:/Users/ashut/OneDrive/Desktop/Das/arthsetu/IMPLEMENTATION_PLAN.md))
- [x] **P1-02** — Define transaction structure, field definitions & prohibited terms (`T2 Lead`, `T4`) — *Completed 2026-10-31*
- [x] **P1-03** — Agree on `/api/v1` base route and standard JSON response/error envelopes (`T2 Lead`, `T1`) — *Completed 2026-10-31*
- [x] **P1-04** — Establish JWT authentication & user-level multi-tenant security standard (`T2`) — *Completed 2026-10-31*
- [x] **P1-05** — Define Git branching model (`feat/t1-frontend`, `feat/t2-backend-core`, etc.) (`All`) — *Completed 2026-10-31*

---

### Phase 2 — Backend Foundation and Security (Teammate 2 Lead)
- [x] **T2-01** — Update `backend/requirements.txt` with missing libraries (`reportlab`, `python-multipart`, etc.) | **Teammate:** T2 | **Status:** Completed | **Completion Date:** 2026-10-31 | **Notes:** Compatible dependencies added and verified via pip install.
- [x] **T2-02** — Configure database connection, session engine (`session.py`, `config.py`) | **Teammate:** T2 | **Status:** Completed | **Completion Date:** 2026-10-31 | **Notes:** Configured settings, SQLAlchemy 2.x sessionmaker, get_db dependency, Base, and isolated SQLite test factory.
- [ ] **T2-03** — Implement complete SQLAlchemy Models with relations & foreign keys | **Teammate:** T2 | **Status:** Not Started | **Completion Date:** — | **Notes:** Blocks T3 & T4 DB persistence.
- [ ] **T2-04** — Setup Alembic and generate initial migration script | **Teammate:** T2 | **Status:** Not Started | **Completion Date:** — | **Notes:** Prerequisite for live database testing.
- [ ] **T2-05** — Implement Auth services (JWT generation, Bcrypt hash, `get_current_user`) | **Teammate:** T2 | **Status:** Not Started | **Completion Date:** — | **Notes:** Delivers `/auth/register` and `/auth/login`.
- [ ] **T2-06** — Implement Business profile CRUD with tenant ownership verification | **Teammate:** T2 | **Status:** Not Started | **Completion Date:** — | **Notes:** Delivers `/businesses` endpoints.
- [ ] **T2-07** — Implement Transaction CRUD with tenant ownership verification | **Teammate:** T2 | **Status:** Not Started | **Completion Date:** — | **Notes:** Delivers `/transactions` paginated endpoints.
- [ ] **T2-08** — Automated tests for two-tenant security isolation & unauthorized access | **Teammate:** T2 | **Status:** Not Started | **Completion Date:** — | **Notes:** Validates cross-tenant data leakage is blocked.

---

### Phase 3 — Parallel Module Development

#### Frontend (Teammate 1)
- [ ] **T1-01** — Install Tailwind CSS, PostCSS, Recharts & configure configs | **Teammate:** T1 | **Status:** In Progress | **Completion Date:** — | **Notes:** UI styling foundation.
- [ ] **T1-02** — Configure React Router, App Shell, & AuthContext with protected routes | **Teammate:** T1 | **Status:** Not Started | **Completion Date:** — | **Notes:** Layout and navigation ready.
- [ ] **T1-03** — Build Login & Registration page UI | **Teammate:** T1 | **Status:** Not Started | **Completion Date:** — | **Notes:** Connects to `/auth/login` and `/auth/register`.
- [ ] **T1-04** — Build Business Profile Onboarding interface | **Teammate:** T1 | **Status:** Not Started | **Completion Date:** — | **Notes:** Legal details and GSTIN/PAN fields.
- [ ] **T1-05** — Build Transactions Table with filters & manual entry modal | **Teammate:** T1 | **Status:** Not Started | **Completion Date:** — | **Notes:** Interacts with `/transactions`.
- [ ] **T1-06** — Build CSV Import UI (File dropzone, column mapper, row preview) | **Teammate:** T1 | **Status:** Not Started | **Completion Date:** — | **Notes:** Interacts with `/imports/upload` & `/map-columns`.
- [ ] **T1-07** — Build Reconciliation matching interface | **Teammate:** T1 | **Status:** Not Started | **Completion Date:** — | **Notes:** Shows candidates and resolution controls.
- [ ] **T1-08** — Build Financial Insights Dashboard with Recharts | **Teammate:** T1 | **Status:** Not Started | **Completion Date:** — | **Notes:** KPIs, cash vs. digital chart, evidence radar.
- [ ] **T1-09** — Build Passport Preview screen & PDF Download trigger | **Teammate:** T1 | **Status:** Not Started | **Completion Date:** — | **Notes:** Tamper-evident token display & download.

#### Data Processing & Reconciliation (Teammate 3)
- [ ] **T3-01** — Implement CSV storage handler & SHA-256 duplicate batch detector | **Teammate:** T3 | **Status:** In Progress | **Completion Date:** — | **Notes:** Saves raw files into `storage/imports/`.
- [ ] **T3-02** — Build CSV Parser with auto-header detection (Date, Amount, UPI Ref) | **Teammate:** T3 | **Status:** Not Started | **Completion Date:** — | **Notes:** Tested against `sample_transactions.csv`.
- [ ] **T3-03** — Implement Column Mapping & Row Validation service | **Teammate:** T3 | **Status:** Not Started | **Completion Date:** — | **Notes:** Emits valid/invalid row counts with error messages.
- [ ] **T3-04** — Implement Duplicate Transaction detection logic | **Teammate:** T3 | **Status:** Not Started | **Completion Date:** — | **Notes:** Compares date, amount, reference number.
- [ ] **T3-05** — Implement Batch Commit endpoint writing rows to `transactions` table | **Teammate:** T3 | **Status:** Not Started | **Completion Date:** — | **Notes:** Requires T2-03 (Models) & T2-07 (Transactions).
- [ ] **T3-06** — Implement Reconciliation candidate identification engine | **Teammate:** T3 | **Status:** Not Started | **Completion Date:** — | **Notes:** Evaluates cross-source transactions within date window.
- [ ] **T3-07** — Implement Reconciliation resolve endpoint (`ACCEPT`/`REJECT`) | **Teammate:** T3 | **Status:** Not Started | **Completion Date:** — | **Notes:** Updates verification status on transactions.

#### Financial Analysis & Passport (Teammate 4)
- [ ] **T4-01** — Implement pure Financial Metric calculator functions | **Teammate:** T4 | **Status:** In Progress | **Completion Date:** — | **Notes:** Unit-tested with synthetic transactions.
- [ ] **T4-02** — Implement Operating-Day Coverage & Data Continuity analysis | **Teammate:** T4 | **Status:** Not Started | **Completion Date:** — | **Notes:** Analyzes date gaps in trading history.
- [ ] **T4-03** — Implement Rule-Based Anomaly & IQR Outlier detector ($\ge 30$ txns) | **Teammate:** T4 | **Status:** Not Started | **Completion Date:** — | **Notes:** Labels outliers as unusual activity, not fraud.
- [ ] **T4-04** — Implement 5-Dimension Evidence Quality scoring | **Teammate:** T4 | **Status:** Not Started | **Completion Date:** — | **Notes:** Evaluates Provenance, Source, Completeness, Consistency, Traceability.
- [ ] **T4-05** — Implement `/analysis/*` API routes | **Teammate:** T4 | **Status:** Not Started | **Completion Date:** — | **Notes:** Integrates with T2 business ownership dependency.
- [ ] **T4-06** — Implement Financial Visibility Passport PDF Generator | **Teammate:** T4 | **Status:** Not Started | **Completion Date:** — | **Notes:** Clean 2-page ReportLab PDF with SHA-256 seal.
- [ ] **T4-07** — Implement `/passports/*` generation & download routes | **Teammate:** T4 | **Status:** Not Started | **Completion Date:** — | **Notes:** Stores snapshot in DB and serves secure file stream.

---

### Phase 4 — Integration
- [ ] **P4-01** — Integrate Frontend Auth with Backend JWT (`T1`, `T2`) | **Status:** Not Started | **Completion Date:** — | **Notes:** End-to-end login flow verified.
- [ ] **P4-02** — Integrate Business & Transaction CRUD UI with API (`T1`, `T2`) | **Status:** Not Started | **Completion Date:** — | **Notes:** Manual entry appears in table immediately.
- [ ] **P4-03** — Integrate CSV Ingestion Pipeline (Upload $\rightarrow$ Preview $\rightarrow$ Commit) (`T1`, `T3`) | **Status:** Not Started | **Completion Date:** — | **Notes:** Sample CSV imported into database.
- [ ] **P4-04** — Verify Ingested Records reflect in Analysis & Dashboard (`T3`, `T4`, `T1`) | **Status:** Not Started | **Completion Date:** — | **Notes:** Uploaded CSV updates KPIs in real-time.
- [ ] **P4-05** — Integrate Reconciliation Review UI with Engine (`T1`, `T3`) | **Status:** Not Started | **Completion Date:** — | **Notes:** Resolving match updates transaction badge.
- [ ] **P4-06** — End-to-end Passport generation and PDF download (`T1`, `T4`) | **Status:** Not Started | **Completion Date:** — | **Notes:** PDF accurately displays ingested business data.

---

### Phase 5 — Testing, Security and Finalisation
- [ ] **P5-01** — Two-User cross-tenant security test pass (`T2`) | **Status:** Not Started | **Completion Date:** — | **Notes:** Verify User B cannot view User A's data.
- [ ] **P5-02** — Data parsing edge cases test (Malformed CSV, non-numeric amount) (`T3`) | **Status:** Not Started | **Completion Date:** — | **Notes:** Graceful error messages on invalid lines.
- [ ] **P5-03** — Metric calculation precision test against zero sales & single transaction (`T4`) | **Status:** Not Started | **Completion Date:** — | **Notes:** Avoid divide-by-zero crashes.
- [ ] **P5-04** — Cross-browser & responsive mobile UI verification (`T1`) | **Status:** Not Started | **Completion Date:** — | **Notes:** Kirana shopkeeper mobile view test.
- [ ] **P5-05** — Final demonstration rehearsal & timing run (`All Teammates`) | **Status:** Not Started | **Completion Date:** — | **Notes:** Seamless 5-minute hackathon pitch flow.

---

## 4. API Integration Status

| API / Module | Owner | Implementation | Tested | Integrated | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST /auth/register` | T2 | Not Started | No | No | Returns user object |
| `POST /auth/login` | T2 | Not Started | No | No | Returns JWT access token |
| `GET /auth/me` | T2 | Not Started | No | No | Validates bearer token |
| `GET /businesses` | T2 | Not Started | No | No | Returns user's business profiles |
| `POST /businesses` | T2 | Not Started | No | No | Creates business profile |
| `GET /transactions` | T2 | Not Started | No | No | Paginated & filtered list |
| `POST /transactions` | T2 | Not Started | No | No | Manual transaction create |
| `POST /imports/upload` | T3 | Not Started | No | No | Multipart file upload |
| `POST /imports/{id}/map`| T3 | Not Started | No | No | Submits column mappings |
| `POST /imports/{id}/commit`| T3| Not Started | No | No | Atomically inserts valid transactions |
| `GET /reconciliation/candidates` | T3 | Not Started | No | No | Identifies cross-source matches |
| `POST /reconciliation/resolve` | T3 | Not Started | No | No | Accepts or rejects match |
| `GET /analysis/summary` | T4 | Not Started | No | No | Recorded sales, expenses, digital share |
| `GET /analysis/completeness` | T4 | Not Started | No | No | Operating-day coverage % |
| `GET /analysis/anomalies` | T4 | Not Started | No | No | Rule-based and IQR outlier list |
| `GET /analysis/evidence-quality` | T4 | Not Started | No | No | 5-dimension score breakdown |
| `POST /passports/generate` | T4 | Not Started | No | No | Freezes snapshot and builds PDF |
| `GET /passports/{token}/download` | T4 | Not Started | No | No | Serves tamper-evident PDF stream |

---

## 5. Database Status

| Model / Table | Owner | Created | Migration Applied | Tested | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `users` | T2 | Not Started | No | No | UUID PK, email, hashed_password |
| `businesses` | T2 | Not Started | No | No | Links to owner_user_id |
| `sources` | T2 | Not Started | No | No | Cashbook, Bank CSV, UPI Export |
| `import_batches` | T2 | Not Started | No | No | Tracks upload file, sha256, status |
| `import_rows` | T2 | Not Started | No | No | Raw data, parsed data, validation error |
| `transactions` | T2 | Not Started | No | No | Core transaction ledger |
| `reconciliations` | T2 | Not Started | No | No | Primary & matched transaction pairs |
| `passports` | T2 | Not Started | No | No | Frozen snapshot, token UK, sha256 |

---

## 6. Testing Status

| Test Suite | Owner | Status | Result | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `test_auth.py` (JWT & Passwords) | T2 | Not Started | — | Tests token issuance and expiry |
| `test_ownership.py` (Tenant Isolation) | T2 | Not Started | — | Proves User B cannot access User A's data |
| `test_transactions.py` (CRUD) | T2 | Not Started | — | Tests pagination, filters, and totals |
| `test_imports.py` (CSV Parsing) | T3 | Not Started | — | Tests PhonePe & Bank CSV parsing |
| `test_validation.py` (Row Validation) | T3 | Not Started | — | Tests invalid dates, empty amounts |
| `test_reconciliation.py` (Matching) | T3 | Not Started | — | Tests candidate matching rules |
| `test_analysis.py` (Metrics & IQR) | T4 | Not Started | — | Tests formulas & sample size guards |

---

## 7. Blockers and Decisions

### 7.1 Current Blockers
- **None currently:** All teammates unblocked with initial mock-friendly specifications.

### 7.2 Technical Decisions Made
- **Decision 1 (2026-10-31):** Consolidated single backend architecture. Teammates 3 and 4 write routers and services directly inside `backend/app/` rather than creating separate microservices.
- **Decision 2 (2026-10-31):** Strict semantic terminology enforced across backend and UI: "Recorded Sales", "Recorded Expenses", and "Net Recorded Cash Movement". The term "Profit" is prohibited.
- **Decision 3 (2026-10-31):** Outlier detection uses statistical IQR only when sample size $\ge 30$ records. Outliers are explicitly labeled as *"Unusual Activity Requiring Owner Verification"*, never *"Fraud"*.
- **Decision 4 (2026-10-31):** Tenant isolation enforced at the database query level via authenticated `owner_user_id` context. Client-supplied IDs in request bodies are ignored.
- **Decision 5 (2026-10-31):** PDF generation will use `reportlab` inside the FastAPI backend, storing signed files in `storage/passports/` with SHA-256 integrity verification.

### 7.3 Pending Decisions
- *Pending:* Selection between SQLite for rapid zero-config local testing vs. Dockerized PostgreSQL for staging. (Recommendation: Support PostgreSQL by default with automatic fallback to SQLite for local teammate unit tests).

### 7.4 Integration Issues
- *None recorded yet.*

### 7.5 Resolved Issues
- *None recorded yet.*

---

## 8. Development Log

| Timestamp (IST) | Teammate | Work Completed | Files Created / Modified | Tests Performed | Current Blockers | Next Task |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-10-31 00:15** | Teammate 2 (Lead) | Completed repository inspection, established master implementation plan, and initialized progress tracker. | `IMPLEMENTATION_PLAN.md`, `progress.md` | Verified structure and dependencies | None | Begin T2-01 (requirements.txt update) & T2-02 (Database configuration). |
| **2026-10-31 00:30** | Teammate 2 (Lead) | Implemented T2-01 (dependencies) & T2-02 (database configuration). Added psycopg2-binary, bcrypt, PyJWT, reportlab, openpyxl. Configured BaseSettings, SQLAlchemy 2.x DeclarativeBase, sessionmaker, get_db dependency, and test engine factory. Verified with in-memory SQLite and tested Postgres connectivity status. | `backend/requirements.txt`, `backend/.env.example`, `backend/app/core/config.py`, `backend/app/db/session.py`, `backend/app/db/base.py`, `backend/app/db/init_db.py`, `progress.md` | Ran test script verifying Base metadata (0 tables), SQLite test connection, session lifecycle, and Postgres port check | None | Proceed to T2-03 (SQLAlchemy Models). |
| *Template Row* | *T1/T2/T3/T4* | *Describe work done* | *Files changed* | *Tests executed* | *Blocker or None* | *Next scheduled task* |
