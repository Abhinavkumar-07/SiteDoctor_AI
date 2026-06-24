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
