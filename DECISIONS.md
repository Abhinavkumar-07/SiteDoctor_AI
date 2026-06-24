# Architecture Decisions

## Screenshots

Use Playwright.

Capture:

* Desktop
* Mobile

Do not capture:

* Tablet

## Storage

Store screenshots in Google Cloud Storage.

Do not store images in Supabase.

Database stores only URLs.

## Current Architecture

Single Next.js application.

Do not use Turborepo yet.

## Supabase

Temporarily disabled.

Do not re-enable until authentication phase.


## Frontend Integration Rule

Decision:
A frontend page is considered complete when:

* UI renders correctly
* Validation works
* Form submission works
* Correct API request is sent

The backend endpoint does not need to exist yet if it belongs to a later phase.

Reason:
Frontend and backend are being built in separate phases.
