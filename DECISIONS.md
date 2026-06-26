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