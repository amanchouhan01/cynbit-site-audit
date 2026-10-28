**Live demo:** https://cynbit-site-audit.vercel.app

# Cynbit Free Website Audit

A lead-generation tool for cynbit.in. A visitor pastes their URL, gets Lighthouse scores and a ranked fix list in about 30 seconds, and can leave an email to get a written plan from the Cynbit team.

Built for the Cynbit Full Stack Developer Intern assessment.

## Problem

Every call to action on cynbit.in ("Start discovery", "Get Started Now", "View work") leads to the contact page. That's a big ask for a first visit. Cynbit also sells technical SEO and cloud performance work, but the site has no way for a visitor to see what that work finds. This tool gives people something useful before they commit, and gives Cynbit a lead that already comes with context: the site, its scores, and what's broken.

## Features

- Audit any public URL, mobile or desktop, via Google's PageSpeed Insights API (Lighthouse)
- Four category scores, five load metrics, and the top three failing checks per category, ranked by weighted impact
- Each finding points to the Cynbit service that would normally own the fix
- Email capture saved to Postgres (Supabase), with a honeypot field and rate limiting
- Loading, error, empty (clean result) and success states
- Accessible: skip link, labelled inputs, `aria-live` status updates, focus moves to the results heading, score meaning never relies on colour alone, `prefers-reduced-motion` respected

## Stack

Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Zod, Supabase (Postgres), PageSpeed Insights API v5, Vercel.

## Setup

```bash
git clone <your-repo-url> && cd cynbit-site-audit
npm install
cp .env.example .env.local   # all values optional, see below
npm run dev                  # http://localhost:3000
```

| Variable | Needed? | Notes |
| --- | --- | --- |
| `PAGESPEED_API_KEY` | Recommended | Free from Google Cloud. Without it the shared anonymous quota returns 429 often. |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Optional | Without them leads are logged to the server console and not stored. Run `supabase/schema.sql` once in the SQL editor. |

Scripts: `npm run build`, `npm run start`, `npm run typecheck`.

## Project layout

```
app/api/audit/route.ts   POST: validate, rate-limit, run audit, log run
app/api/lead/route.ts    POST: validate, honeypot, store lead
lib/psi.ts               PageSpeed client + normalisation + 10 min cache
lib/validation.ts        URL normalisation (rejects private hosts) and Zod schemas
lib/rate-limit.ts        In-memory limiter, 5 requests / 10 min / IP
lib/leads.ts             Supabase writes (leads + anonymous run log)
components/              AuditTool, ScoreRing, FindingsList, LeadForm
supabase/schema.sql      Tables with RLS enabled, service-role access only
```

## Deployment notes

Deployed on Vercel. The audit route sets `maxDuration = 60` because Lighthouse runs take 20 to 40 seconds. Add the three environment variables in Project Settings, then redeploy. The rate limiter and result cache live in memory, so they reset per serverless instance; see the technical report for the production upgrade path.

## Fitting it into cynbit.in

Ship it as `/audit`, link it from the Technical SEO card on the Services page and from the homepage hero as a second CTA beside "Start discovery".
