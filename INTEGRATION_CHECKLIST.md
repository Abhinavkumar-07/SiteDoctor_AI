# SiteDoctor AI — Integration Checklist

This document is the single source of truth for assembling the project.
Follow every step in order. Do not skip steps.
At the end you will have a running Next.js application at localhost:3000.

---

## Prerequisites

Install these before starting if you don't already have them:

```bash
node --version   # must be 18.18.0 or higher
npm --version    # 10+ recommended
git --version
```

---

## Step 1 — Create the project folder

```bash
mkdir sitedoctor-ai
cd sitedoctor-ai
git init
```

This folder is your project root. Everything below is relative to it.
There is no monorepo wrapper for now — the Next.js app lives directly here.

---

## Step 2 — Add the config files

Copy these files from the scaffold zip into your project root (`sitedoctor-ai/`):

```
package.json
next.config.ts
tsconfig.json
postcss.config.mjs
components.json
.env.example
.gitignore
middleware.ts
```

After copying, your root should look like this:

```
sitedoctor-ai/
├── .env.example
├── .gitignore
├── components.json
├── middleware.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## Step 3 — Install dependencies

```bash
npm install
```

Expected: no errors. If you see peer dependency warnings about React 19,
they are safe to ignore — all packages in this project are React 19 compatible.

---

## Step 4 — Create your environment file

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics → Admin → Data Streams |
| `GOOGLE_CLOUD_PROJECT` | GCP Console → Project selector |
| `WORKER_SERVICE_URL` | Leave as placeholder for now — worker doesn't exist yet |

For local development, `WORKER_SERVICE_URL` and `CLOUD_TASKS_*` variables
are only needed when you test the actual audit submission flow.
The frontend will run without them.

---

## Step 5 — Create the app directory structure

Create these empty folders:

```bash
mkdir -p app/(marketing)/_components
mkdir -p app/analyze/_components
mkdir -p "app/audit/[auditId]/_components"
mkdir -p app/report
mkdir -p components/ui
mkdir -p components/layout
mkdir -p components/forms
mkdir -p hooks
mkdir -p lib/types
mkdir -p lib/validations
mkdir -p public
```

---

## Step 6 — Place the generated source files

Copy every generated source file from the scaffold zip into the paths listed
below. The scaffold zip has files under `apps/web/` — strip that prefix.
Everything that was at `apps/web/X` goes to `X` in your project root.

### `app/` files

| Source path in zip | Destination in project |
|---|---|
| `apps/web/app/layout.tsx` | `app/layout.tsx` |
| `apps/web/app/globals.css` | `app/globals.css` |
| `apps/web/app/(marketing)/page.tsx` | `app/(marketing)/page.tsx` |
| `apps/web/app/(marketing)/_components/hero.tsx` | `app/(marketing)/_components/hero.tsx` |
| `apps/web/app/(marketing)/_components/features.tsx` | `app/(marketing)/_components/features.tsx` |
| `apps/web/app/(marketing)/_components/example-audit.tsx` | `app/(marketing)/_components/example-audit.tsx` |
| `apps/web/app/(marketing)/_components/how-it-works.tsx` | `app/(marketing)/_components/how-it-works.tsx` |
| `apps/web/app/(marketing)/_components/faq.tsx` | `app/(marketing)/_components/faq.tsx` |
| `apps/web/app/analyze/page.tsx` | `app/analyze/page.tsx` |
| `apps/web/app/analyze/_components/url-submission-form.tsx` | `app/analyze/_components/url-submission-form.tsx` |
| `apps/web/app/audit/[auditId]/page.tsx` | `app/audit/[auditId]/page.tsx` |
| `apps/web/app/audit/[auditId]/_components/audit-processing-client.tsx` | `app/audit/[auditId]/_components/audit-processing-client.tsx` |
| `apps/web/app/audit/[auditId]/_components/audit-progress-card.tsx` | `app/audit/[auditId]/_components/audit-progress-card.tsx` |
| `apps/web/app/audit/[auditId]/_components/audit-stage-list.tsx` | `app/audit/[auditId]/_components/audit-stage-list.tsx` |
| `apps/web/app/audit/[auditId]/_components/audit-error-state.tsx` | `app/audit/[auditId]/_components/audit-error-state.tsx` |

**IMPORTANT:** Use the `app/layout.tsx` from the scaffold zip (this folder),
NOT the one from `apps/web/app/layout.tsx`. The scaffold version uses
Plus Jakarta Sans instead of the unlicensed Söhne font and will compile
without errors.

### `components/` files

| Source path in zip | Destination in project |
|---|---|
| `apps/web/components/layout/navbar.tsx` | `components/layout/navbar.tsx` |
| `apps/web/components/layout/footer.tsx` | `components/layout/footer.tsx` |
| `apps/web/components/layout/theme-provider.tsx` | `components/layout/theme-provider.tsx` |
| `apps/web/components/layout/pulse-line.tsx` | `components/layout/pulse-line.tsx` |
| `apps/web/components/forms/url-input-form.tsx` | `components/forms/url-input-form.tsx` |

### `hooks/` files

| Source path in zip | Destination in project |
|---|---|
| `apps/web/hooks/use-audit-status.ts` | `hooks/use-audit-status.ts` |

### `lib/` files

| Source path in zip | Destination in project |
|---|---|
| `apps/web/lib/utils.ts` | `lib/utils.ts` |
| `apps/web/lib/types/audit.ts` | `lib/types/audit.ts` |
| `apps/web/lib/types/audit-status.ts` | `lib/types/audit-status.ts` |
| `apps/web/lib/validations/audit-url.schema.ts` | `lib/validations/audit-url.schema.ts` |

---

## Step 7 — Initialize shadcn

Run shadcn's init command. When prompted, accept all defaults — the
`components.json` you placed in Step 2 already has the right configuration,
so shadcn will read it and not ask configuration questions interactively.

```bash
npx shadcn@latest init
```

If it asks whether to overwrite `globals.css` — answer **No**.
Our `globals.css` already contains both our design tokens and the shadcn
CSS variables that would otherwise be generated. Overwriting it would
break our design system tokens.

If it asks whether to overwrite `lib/utils.ts` — answer **Yes**.
The content is identical.

---

## Step 8 — Add shadcn components

Run these one at a time. Each adds a component to `components/ui/`:

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
npx shadcn@latest add accordion
npx shadcn@latest add badge
npx shadcn@latest add form
npx shadcn@latest add skeleton
```

If any command asks to overwrite an existing file, answer **Yes**.

---

## Step 9 — Verify the TypeScript compiles

```bash
npm run typecheck
```

Expected output: no errors, no output at all (tsc exits silently on success).

**If you see errors:**

`Cannot find module '@/components/ui/button'`
→ shadcn add didn't run correctly. Re-run Step 8.

`Cannot find module 'framer-motion'`
→ `npm install` didn't complete cleanly. Run `npm install` again.

`Type error in use-audit-status.ts`
→ Check that `lib/types/audit-status.ts` was placed correctly in Step 6.

---

## Step 10 — Start the dev server

```bash
npm run dev
```

Open http://localhost:3000.

**Expected results:**

| Route | What you should see |
|---|---|
| `localhost:3000` | Landing page — hero, features, example audit, how it works, FAQ |
| `localhost:3000/analyze` | Analyze page — URL input card |
| `localhost:3000/audit/test-id` | Processing page — skeleton loading state (no real polling yet) |

The analyze page's form submit will fail with a network error because
`POST /api/v1/audits` doesn't exist yet — that's expected. Backend is Step 8.

---

## Step 11 — First git commit

```bash
git add .
git commit -m "feat: frontend foundation — layout, landing page, analyze, processing pages"
```

---

## Final directory structure

After completing all steps, your project should look exactly like this:

```
sitedoctor-ai/
├── app/
│   ├── (marketing)/
│   │   ├── _components/
│   │   │   ├── example-audit.tsx
│   │   │   ├── faq.tsx
│   │   │   ├── features.tsx
│   │   │   ├── hero.tsx
│   │   │   └── how-it-works.tsx
│   │   └── page.tsx
│   ├── analyze/
│   │   ├── _components/
│   │   │   └── url-submission-form.tsx
│   │   └── page.tsx
│   ├── audit/
│   │   └── [auditId]/
│   │       ├── _components/
│   │       │   ├── audit-error-state.tsx
│   │       │   ├── audit-processing-client.tsx
│   │       │   ├── audit-progress-card.tsx
│   │       │   └── audit-stage-list.tsx
│   │       └── page.tsx
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── forms/
│   │   └── url-input-form.tsx
│   ├── layout/
│   │   ├── footer.tsx
│   │   ├── navbar.tsx
│   │   ├── pulse-line.tsx
│   │   └── theme-provider.tsx
│   └── ui/                        ← generated by shadcn, do not edit manually
│       ├── accordion.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       ├── input.tsx
│       └── skeleton.tsx
├── hooks/
│   └── use-audit-status.ts
├── lib/
│   ├── types/
│   │   ├── audit.ts
│   │   └── audit-status.ts
│   ├── validations/
│   │   └── audit-url.schema.ts
│   └── utils.ts
├── public/
├── .env.example
├── .env.local                     ← gitignored, your real values
├── .gitignore
├── components.json
├── middleware.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## What's next after this checklist

Once the dev server is running and all three routes load:

**Step 7.6 — Report Page (`/report/[slug]`)**
The most component-dense page in the product — score cards, screenshot
panels, recommendations accordion, AI insight blocks, share/export actions.
This is ready to generate now that the foundation is verified.

**Step 8 — Backend (API Routes)**
`POST /api/v1/audits`, `GET /api/v1/audits/[id]/status`,
`GET /api/v1/reports/[slug]`. Connects the frontend to Supabase and
the Cloud Tasks queue.

**Step 9 — Audit Engine (Worker)**
Playwright, Lighthouse, SEO/security/accessibility checks running in a
separate Cloud Run service.

---

## Common problems and fixes

**`Module not found: can't resolve 'next-themes'`**
→ `npm install` didn't run after package.json was added. Run it again.

**Tailwind classes not applying (page renders unstyled)**
→ Confirm `postcss.config.mjs` is in the project root (not inside `app/`).
→ Confirm `globals.css` has `@import "tailwindcss";` as its first line.
→ Confirm `layout.tsx` imports `./globals.css`.

**`--font-display` CSS variable not resolving**
→ Confirm `layout.tsx` spreads `jakartaSans.variable` onto the `<html>` element.
→ Open DevTools → Elements and check that `--font-display` appears in the
  computed styles on `<html>`.

**shadcn components render with wrong colors**
→ Confirm `globals.css` has both the `@theme {}` block AND the `:root {}`
  block with the shadcn HSL variables. If only one exists, the file from
  the scaffold zip was not used — re-copy it.

**`NEXT_PUBLIC_SUPABASE_URL` is undefined at runtime**
→ The `.env.local` file must be in the project root, not inside `app/`.
→ Restart the dev server after adding/changing env vars — Next.js reads
  them at startup, not at request time.
