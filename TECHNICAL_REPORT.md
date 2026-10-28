Claude












Technical report · MD
# Technical Report: Free Website Audit for cynbit.in
 
Author: Aman Chouhan. Role applied for: Full Stack Developer Intern.
 
## 1. Problem statement
 
I reviewed the homepage as a visitor and as a developer.
 
As a visitor: the page explains Cynbit well (AI automation, custom software, cloud, technical SEO, three SaaS products), but every primary action routes to the same place. "Start discovery", "Get Started Now", "Start discovery phase" and the service cards all end up on the contact page or the services hub. A business owner who is only comparing vendors has no smaller step to take. The newsletter box in the footer is the only low-commitment option, and it doesn't show what Cynbit can do.
 
As a developer: Cynbit sells technical SEO and cloud performance work, and the tools for measuring both (Lighthouse, PageSpeed Insights) are free and public. The site doesn't use them to demonstrate that expertise.
 
**Goal:** add a low-friction, genuinely useful capability that demonstrates the services Cynbit sells and turns anonymous visitors into qualified leads.
 
## 2. Options considered
 
| Option | Impact | Effort | Why not chosen |
| --- | --- | --- | --- |
| Free website audit tool (chosen) | High | About 1 day | n/a |
| Instant project estimator (multi-step quote wizard) | High | About 1 day | Estimates need pricing data I don't have; numbers would be invented |
| AI chat assistant for service questions | Medium | About 1.5 days | Needs an LLM key and ongoing cost, and a chatbot is the most common "improvement" on any site |
 
The audit tool won because it works on real data, needs no secrets to demo, uses a third-party API, and gives the sales team a lead with the visitor's own scores attached.
 
## 3. Stack choices
 
- **Next.js App Router + TypeScript:** matches Cynbit's stated stack. Route handlers keep the API in the same repo, and Vercel deploys it with no config.
- **Tailwind CSS v4:** fast to build responsive, accessible UI; brand colours are CSS variables in `globals.css`, so swapping in Cynbit's real palette is a two-line change.
- **PageSpeed Insights API:** returns a full Lighthouse run without me hosting headless Chrome. It also means the tested page is fetched from Google's network, not from my server.
- **Supabase (Postgres):** hosted Postgres with a service-role key; matches the PostgreSQL/Supabase preference. Row-level security is on with no public policies.
- **Zod:** one schema per endpoint, shared validation errors.
## 4. Architecture
 
```
Browser (AuditTool)
   │ POST /api/audit {url, strategy}
   ▼
Route handler ── rate limit ── Zod + URL normalisation ── psi.ts ──► PageSpeed API
   │                                                          │
   │                               normalise: 4 scores, 5 metrics, top 3 failures / category
   ▼
JSON result ──► ScoreRings, metrics, FindingsList
   │
   │ POST /api/lead {email, url, scores}  (optional)
   ▼
Honeypot + rate limit + Zod ──► Supabase audit_leads
```
 
Data model: `audit_leads` (email, name, audited_url, strategy, scores jsonb) and `audit_runs` (host, strategy, scores, duration_ms). The second table stores no personal data and exists to measure usage.
 
## 5. Implementation notes
 
- **Ranking findings.** Accessibility, best-practices and SEO rank failing audits by `weight × (1 − score)`, top three each. Performance ranks Lighthouse opportunities and diagnostics by estimated savings instead, because the metric audits (LCP, FCP, Speed Index) are symptoms, not fixes. Ranking each category separately stops performance (weights up to 30) from burying SEO (weights of 1).
- **Input safety.** URLs are normalised, must be http(s), and must have a dotted public hostname; localhost, private ranges and IPv6 literals are rejected. The page is fetched by Google, not by this server, so there's no server-side request to an attacker-chosen host.
- **Abuse controls.** 5 audits and 5 lead submissions per IP per 10 minutes, a honeypot field on the lead form, and a 10 minute result cache so repeat audits of one URL don't burn API quota.
- **Timeouts.** The upstream call aborts at 55 s; the client aborts at 65 s; the route declares `maxDuration = 60`.
- **Errors.** Quota (429), unloadable page (422), timeout (504) and unknown failures each get a distinct, plain-language message.
- **Accessibility.** Native form controls, visible labels, radio group for device type, `aria-live` region for progress and results, focus moved to the results heading, text labels beside every colour-coded score.
## 6. Challenges
 
- Lighthouse runs take 20 to 40 seconds. That's too long for a silent spinner, so the UI rotates through four honest progress messages and the route is configured for a longer function duration.
- The shared anonymous PageSpeed quota is small. Result caching, per-IP limits and a recommended API key address that.
- Descriptions from Lighthouse contain Markdown links and "Learn more" tails. A small cleaner strips those so findings read as one or two plain sentences.
- TypeScript 7 broke Next 15's path-alias handling during setup, so the project pins TypeScript 5.
- The first live test showed the top performance "fixes" were the metrics themselves (LCP, FCP, Speed Index). I changed the performance ranking to use opportunities and diagnostics, so the list now says what to change (for example, reduce unused JavaScript).
- A browser extension (Dark Reader) injected attributes into `<html>` and triggered a React hydration warning in development. The root element now sets `suppressHydrationWarning`.
- One mobile audit timed out during local testing and succeeded on retry. Mobile runs are throttled and slower, which is why the upstream timeout is 55 s and the limitation is listed below.
## 7. Known limitations and next steps
 
- The rate limiter and cache are per-instance memory. For production, move both to Upstash Redis.
- Leads are stored but not emailed. The next step is a Resend/SES webhook that notifies sales and emails the visitor a PDF of their report.
- Audits are single-page. A crawl of the sitemap with a combined score would be a natural upgrade.
- Mobile audits of very slow sites can approach the 60 s serverless limit. A queue with client polling would remove that ceiling.
- No automated tests yet; `lib/validation.ts` and the normaliser in `lib/psi.ts` are pure and are the first candidates.
## 8. Results
 
Verified locally on the production build: typecheck and `next build` pass with no errors or warnings; the audit route rejects private and malformed URLs (400); the lead route rejects invalid emails (400) and accepts valid ones, falling back to console logging when Supabase isn't configured; upstream failures return a handled error message instead of a crash.
 
Also verified on the deployed site (https://cynbit-site-audit.vercel.app): audits of cynbit.in (mobile and desktop), example.com and wikipedia.org returned results; an unresolvable domain returned the "couldn't load that page" message; a test lead submitted from the live page appeared in the `audit_leads` table.
 
Measured on the deployed site, October 28, 2026, via PageSpeed Insights:
 
| Measure | Value |
| --- | --- |
| Lighthouse mobile, deployed prototype (Perf / A11y / BP / SEO) | 100 / 100 / 100 / 100 (FCP 1.1 s, LCP 1.5 s, TBT 30 ms, CLS 0, Speed Index 2.6 s) |
| Lighthouse desktop, deployed prototype | 100 / 100 / 100 / 100 (FCP 0.2 s, LCP 0.4 s, TBT 20 ms, CLS 0, Speed Index 0.2 s) |
| First Load JS, home route | 106 kB (from `next build`) |
| Median audit duration, uncached runs | Mobile 25.8 s (4 runs), desktop 34.2 s (3 runs), from `audit_runs.duration_ms` filtered to > 3 s |
| cynbit.in audited with this tool, mobile | 57 / 83 / 100 / 100 (LCP 10.7 s, FCP 8.0 s) |
| cynbit.in audited with this tool, desktop | 84 / 82 / 100 / 100 (LCP 2.0 s) |
 
The duration sample is small (7 runs) and Google's queue time varies, so the figures show that audits finish inside the 60 s function limit, not a precise benchmark. Lighthouse scores vary by about ±3 points between runs; the cynbit.in desktop performance score was 81 on one run and 84 on another.
 
What the tool found on cynbit.in: a mobile Largest Contentful Paint of 10.7 s against Google's 2.5 s "good" threshold, about 100 KiB of unused JavaScript, and accessibility failures in colour contrast, link distinguishability and list markup. These map to the Cloud systems & performance and Software development services.
 
Business impact can't be measured from a prototype. What to track once live: audits started per visitor, lead conversion rate (leads ÷ audits completed), and how many leads reach a discovery call.
 
Claude finished the response
