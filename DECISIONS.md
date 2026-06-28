# Architectural Decisions

## Project Structure

* Single Next.js 15 application
* No Turborepo
* Worker extraction postponed until after MVP

---

## Frontend

Framework

* Next.js 15 App Router

Language

* TypeScript (strict)

Styling

* Tailwind CSS v4

UI

* shadcn/ui

Animation

* Framer Motion

Forms

* React Hook Form

Validation

* Zod

---

## Routing

Landing

```
/
```

Analyze

```
/analyze
```

Audit Processing

```
/audit/[auditId]
```

Report

```
/report/[auditId]
```

---

## Screenshots

Use Playwright

Capture only:

* Desktop
* Mobile

Do not capture tablet screenshots.

---

## Storage

Images

Google Cloud Storage

Database stores only URLs.

---

## Authentication

Supabase Auth

Currently disabled.

Authentication will be enabled during the Auth phase.

---

## Development Strategy

Frontend-first development.

Backend APIs are implemented only after frontend pages are completed.

404 responses from audit endpoints are expected until backend implementation begins.

---

## Completed Frontend Milestones

* Frontend Foundation
* Design System
* Landing Page
* Analyze Page
* Audit Processing Page
* Report Page

Frontend MVP is now complete.

---

## Next Development Phase

Backend API Development

Implement:

* POST /api/v1/audits
* GET /api/v1/audits/:id/status
* GET /api/v1/audits/:id/report

using mock responses before connecting production services.

---

## Git Workflow

After completing every milestone:

1. Test locally
2. Commit
3. Push to GitHub
4. Update PROJECT_MEMORY.md
5. Update CHANGELOG.md
6. Update DECISIONS.md (only if an architectural decision changed)

## Shareable Reports

Public reports will use a cryptographically secure share token instead of the internal audit ID.

Example:

/share/8GxP2KqN4Lm

Reason:

- Does not expose database IDs
- Share links can be revoked
- Supports expiration in the future
- Industry-standard approach
- Compatible with authenticated/private reports later

## Shareable Reports

Public share links use:

/share/[shareToken]

Search engines are instructed not to index shared reports by default using:

robots:
  index: false
  follow: false

Reason:

- Shared reports may contain user-specific or client-specific audit data.
- Reports should be accessible only to people with the link.
- Prevent accidental indexing by search engines.

## PDF Export

Frontend PDF export uses `@react-pdf/renderer`.

Reasons:

* Generates vector-based PDFs with selectable text.
* Produces consistent output across browsers.
* Reuses existing report components and data model.
* Supports a straightforward migration to server-side PDF generation in the future.

Future backend implementation will replace client-side PDF generation with a Route Handler while preserving the same UI and document structure.


## Decision 008 — Dependency Injection Architecture

Status

Accepted

Reason

Backend services should depend on interfaces rather than concrete implementations.

Decision

Introduce:

* Dependency Injection Container
* Repository Layer
* Pipeline Layer
* Interface Contracts

Benefits

* Easy replacement of mock services
* Better separation of concerns
* Simplified testing
* Stable API layer
* Production-ready architecture

Future Impact

Playwright, Lighthouse, Gemini, Supabase and Google Cloud Storage can be introduced by replacing container registrations rather than modifying API routes or services.

## ADR-008

Decision:
Introduce Playwright before Lighthouse.

Reason:
Screenshots and page navigation are reusable infrastructure.

Consequences:
Step 8.4 only replaces score generation.
Routes, services, repositories, interfaces and pipeline stages remain unchanged.

Temporary Tradeoff:
PlaywrightAuditEngine still consumes buildMockReport.

Removal Plan:
Delete buildMockReport export after LighthouseAuditEngine lands.

## ADR-009

Decision

Introduce Lighthouse after Playwright.

Status

Accepted

Reason

Playwright already provides reusable navigation, browser lifecycle management, metadata extraction and screenshot infrastructure.

Lighthouse consumes an isolated Chromium instance through chrome-launcher.

Consequences

Playwright responsibilities

* screenshots
* metadata extraction
* navigation

Lighthouse responsibilities

* category scores
* recommendations
* opportunities
* audit metadata

Temporary Tradeoff

UX and Conversion categories remain heuristic.

Removal Plan

GeminiRecommendationGenerator replaces static UX and Conversion scoring during Step 8.7.

---

## ADR-010

Decision

Keep screenshots stored locally during MVP.

Status

Accepted

Reason

Filesystem storage simplifies debugging and reduces cloud complexity.

Future Migration

LocalScreenshotStorage

↓

GCSStorageProvider

↓

Supabase persisted URLs

Routes remain unchanged.

Consumers remain unchanged.

Only container registrations change.

Benefits

* minimal migration cost
* dependency injection preserved
* API stability preserved


# Decisions

## Step 8.6 Decisions

### IReportStore is a separate interface from IAuditStore
Reason: Report data (JSONB blobs, ~50 KB) has a different lifecycle and size
profile from audit records (a few text fields). Merging them into IAuditStore
would force every IAuditStore implementation to also handle large blobs.
The separation keeps each interface focused and its implementations smaller.

### Report persistence is non-blocking (fire-and-forget)
ReportRepository.getReport() does `this.reportStore.save(report).catch(...)` —
it does not await the persist. The user gets their report immediately.
A Supabase persist failure is logged but doesn't surface as a 500.
Rationale: Lighthouse already ran, the report is ready — a DB write failure
should not degrade UX. The next request will re-run Lighthouse and re-persist.

### Supabase env-var guard in container
If SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are absent, the container falls
back to MockAuditStore + MockReportStore. This keeps local dev working without
a Supabase project configured. A console.warn is emitted to make it obvious.

### RLS disabled in Step 8.6
Row Level Security is explicitly disabled. It will be re-enabled in Step 9
(Authentication) with user_id columns and user-scoped policies.
Leaving it enabled now with no policies would block all service-role writes.

### Dashboard uses client-side SWR not server-side fetch
The dashboard list must refresh after deletes and new audits.
Server-side rendering would give stale data. SWR gives live pagination,
search, and instant re-validation after mutations.

### CASCADE DELETE on audit_reports
Deleting an audit record cascades to the audit_reports row.
The SupabaseReportStore.deleteByAuditId() deletes from the audits table —
the FK cascade handles the report row. Single operation, consistent state.

### GET /api/v1/dashboard is an open endpoint in Step 8.6
No auth guard yet. Step 9 adds Next.js middleware that requires a valid
session before any /dashboard/* or /api/v1/dashboard* request is processed.
The dashboard endpoint itself does not change in Step 9 — only middleware.

---

## Previous Decisions

### Single Next.js application — no Turborepo
### Supabase Auth disabled until Step 9
### Playwright for screenshots (desktop 1280×800, mobile 390×844)
### Lighthouse via CDP port bridging to shared BrowserManager Chrome instance
### LighthouseAuditEngine: best-practices → security category mapping
### UX + Conversion remain hash-seeded until Gemini (future step)
### LocalScreenshotStorage → GCS in Step 8.7
### Container is the single swap point — routes, services, repos never change per step