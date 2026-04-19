# Site Analytics Advisor — Build Case Study

**Project:** Site Analytics Advisor  
**Built by:** Vikki Baptiste + Claude (Anthropic)  
**Live URL:** https://site-analytics-tool.vercel.app  
**Repo:** https://github.com/vikkib/site-analytics-tool  
**Date:** April 2026

---

## The Problem

Vikki manages approximately 10 WordPress websites. Each site has Google Analytics 4 (GA4) installed via Google Site Kit. The challenge: GA4 surfaces data but not direction. The question was never "what are my stats?" — it was always **"what do I do about them?"**

Existing tools (GA4 UI, Site Kit dashboard) show numbers. They don't say: *your programs page has 54 seconds of engagement but zero conversions because the CTA appears before the value proposition.* That gap — between data and action — was the problem to solve.

**Goal:** A tool that looks at GA4 stats AND the actual page content, and returns a specific, prioritised fix list. Not generic SEO advice. Actual sentences referencing actual content on actual pages.

---

## What We Built

A standalone web application:

1. User enters site name and URL
2. User exports a CSV from GA4's Pages & Screens report and pastes it in
3. The tool identifies underperforming pages (engagement rate < 50% or average time < 60 seconds)
4. For each flagged page, it fetches the live HTML, strips boilerplate (nav, footer, scripts), and extracts readable content
5. Page metrics + content excerpt are sent to Claude (Anthropic API)
6. Claude returns a prioritised JSON array: severity, issues found, specific fixes referencing actual copy on the page
7. Results display in a clean priority fix list with severity badges, coloured dots, and expandable fix lists

**Stack:** React 18 (Create React App) · Vercel serverless functions · Anthropic Claude API (`claude-sonnet-4-5`) · Deployed on Vercel with GitHub integration

---

## The Build Process

### Step 1: Scoping the right approach

The session started as a question about Google BigQuery for web analytics. After understanding the actual need — page views, sessions, engagement rates, session durations, across multiple WordPress sites — it became clear BigQuery was overkill. GA4 + Site Kit already covered the basics.

The real need was deeper: not just reading stats, but acting on them.

We scoped two versions:
- **Shallow:** identify underperforming pages + issue category only
- **Deep:** fetch actual page content, ground recommendations in what's really there

The user chose deep. Right call.

### Step 2: Standalone vs. embedded

The existing codebase was `drclaire-content-tool` — a social media repurposing app for a different client. Analytics for Nourish Lifestyle had no business living there.

Decision: new standalone app, site-agnostic, works for all 10 sites. One tool, any domain.

### Step 3: Architecture decisions

**Manual CSV paste vs. live GA4 API:** Live API requires Google OAuth setup (credentials, consent screen, token refresh). Manual paste requires nothing except a CSV file. We chose paste first — ship something usable immediately, upgrade to API later if warranted.

**Page content fetching:** Server-side (Vercel function) using native `fetch`. Strips scripts, styles, nav, footer, header from HTML before sending to Claude. Limits excerpt to avoid token overuse.

**Output format:** Structured JSON from Claude, parsed client-side into React components. Each recommendation includes `path`, `severity`, `engagementRate`, `avgTime`, `issues[]`, `fixes[]`, `priority`.

---

## Errors, Missteps, and Rewrites

These are the honest ones.

### 1. GA4 exports TSV, not CSV

**What happened:** First test run returned "Could not parse CSV." The parser expected comma-separated values. GA4 exports tab-separated values (TSV) with a `.csv` extension. The WCAG checker confirmed it when the user pasted raw data and we saw tab gaps between columns.

**Fix:** Auto-detect delimiter on the first data line — if it contains a tab character, split on tabs. Otherwise split on commas. Two-line fix.

**Lesson:** Never assume a `.csv` file is actually comma-separated. Especially from Google.

---

### 2. Vercel 504 timeout

**What happened:** After the CSV parsing fix, the tool ran but returned a JSON parse error: `"Unexpected token 'A', 'An error o'... is not valid JSON"`. The API endpoint was returning a plain-text Vercel error page, not JSON.

**Root cause:** 504 gateway timeout. The function was set to `maxDuration: 60` in `vercel.json`, but the account is on Vercel's Hobby plan, where the hard function limit is **10 seconds** regardless of config. Fetching 8 pages in parallel + a Claude API call was pushing 30–45 seconds.

**Fix:** Aggressive optimisation:
- Max flagged pages: 8 → 4
- Page fetch timeout: 8s → 3s
- Content excerpt: 3000 chars → 1500 chars
- Claude `max_tokens`: 8000 → 3000

This brought total execution under 10 seconds on most runs.

**Lesson:** `maxDuration` in `vercel.json` is a request, not a guarantee. On Hobby plan it's ignored above 10s. Always test against actual plan limits, not documentation maximums.

---

### 3. Google Sheets reformatting

**What happened:** User copied the CSV from Google Sheets (opened the file in Sheets by default on Mac). The parser failed again.

**Root cause:** Google Sheets reformats numeric values, adds its own quoting, and changes column ordering when you copy from it. The raw file was clean; the Sheets copy was not.

**Fix:** Updated instructions to explicitly say: open the `.csv` file in **TextEdit (Mac) or Notepad (Windows) — not Google Sheets**. Added this warning both in the collapsible instructions and in the earlier hint text.

**Lesson:** User-facing instructions need to anticipate the most likely wrong path, not just describe the right one.

---

### 4. False "broken page" alerts from content truncation

**What happened:** The recommendations for `/about/` flagged a "broken sentence" — "It also addresses the realities most programs skip," — as a real page bug. The `/programs/` page flagged content "ending abruptly with 'DN'."

**Root cause:** The page content excerpt was being truncated mid-sentence by the character limit (1500 chars). Claude was reading the truncated excerpt and correctly identifying incomplete sentences — but attributing them to the live page, not to the fetch.

**Fix (attempt 1):** Increased excerpt limit from 1500 to 2500 chars. Reduced frequency but didn't eliminate.

**Fix (attempt 2):** Added explicit instruction to the Claude prompt: *"Content excerpts are TRUNCATED — NEVER flag incomplete sentences, abrupt endings, or mid-sentence cuts as page issues. They are fetch artifacts, not real content problems."*

Both fixes together stopped the false alerts.

**Lesson:** When AI analyses partial data, it needs to be explicitly told the data is partial. "Truncated" is not implied by a sentence ending mid-word — Claude will assume the source is broken unless told otherwise.

---

### 5. Missing engagement rate column

**What happened:** Every page returned "Engagement rate: 0.0%" — suspicious across all pages on two different sites. Initial diagnosis was GA4 config issue (Enhanced Measurement not enabled). Turned out Enhanced Measurement was already on.

**Root cause:** The user was exporting from a **custom saved report** ("90 Day Page Engagement Audit") which had different columns than the default Pages & Screens report. The custom report excluded the `Engagement rate` and `Engaged sessions` columns entirely. The parser found no matching column, defaulted to 0, and flagged every page as CRITICAL.

**Fix:** Made engagement rate nullable. When the column is absent, the parser returns `null` (not `0`), and the tool:
- Flags pages on avg time alone
- Displays "N/A" instead of "0.0%"
- Tells Claude the column is absent

Also updated instructions to specify using the **default** Pages & Screens report, not saved custom reports.

**Lesson:** Validate that expected columns exist before computing derived metrics. Absent ≠ zero.

---

### 6. WCAG contrast failures

**What happened:** Multiple text elements failed WCAG AA (4.5:1 minimum for small text):
- Subtitle text: `#6b7280` on `#0f1114` = **~3.2:1** (fail)
- Form labels: same issue
- "How to export from GA4" collapsed summary: `#9aa0a6` on `#1a1d23` at 13px = **~3.49:1** (fail)
- "Load sample results" button: `#6b7280` on `#1a1d23` = **1.57:1** (fail)
- Collapsible instructions: too small, too hidden, easily missed

**Fixes:**
- Subtitle and labels: bumped from `muted` (#6b7280) to `textSecondary` (#9aa0a6)
- Instructions summary and list: bumped to `text` (#e8eaed), font size 14px
- "Load sample results": bumped to `textSecondary`, 13px
- Instructions: opened by default (`<details open>`) so they're visible on first load
- One remaining "failure" (disabled button at 1.57:1) is exempt under WCAG 1.4.3 — inactive UI components have no contrast requirement

**Lesson:** Design colour systems with WCAG in mind from the start. "Muted" and "secondary" text tokens need minimum contrast values baked in, not treated as purely aesthetic.

---

## What Worked Well

### The deep analysis approach

Fetching live page content before calling Claude was the right call. The difference shows:

- **Without content:** "Your contact page has low engagement. Add clearer CTAs."
- **With content:** "Your headline 'Contact us Ready to Take the next step?' is passive — replace with 'Book Your Free Consultation — Find Out If Nourish Is Right For You in 20 Minutes.' Remove the 'How did you hear about us' dropdown — it adds friction before the user has committed."

The second is actionable. The first is noise.

### Real findings on the first real run

The tool surfaced genuine, specific issues on thenourishlifestyle.com:

- `/programs/` — 54s avg time, zero conversions. CTA placed before value proposition. No pricing or timeline visible.
- `/` — "93% keep the weight off" statistic buried mid-page instead of in the hero.
- `/contact/` — two competing conversion paths fragmenting intent.
- `/about/` — opens with obesity statistics (fear-based) rather than Deb's 35-year credential + outcomes.

These are real conversion problems that a human CRO consultant would charge several thousand dollars to identify.

### The load sample button

Adding a "Load sample results (for UI preview)" button during the UI redesign phase was a small decision with a large workflow payoff. Every style change could be previewed instantly without re-running an analysis. This compressed the UI iteration cycle significantly.

---

## The UI Redesign

After functional validation, the UI went through a structured 7-section redesign moving from "hacker terminal dark mode" to "calm, modern analytics tool" (reference: Linear, Plausible Analytics, Vercel dashboard).

| Section | Change |
|---|---|
| 1 | New colour system: warm dark neutrals, blue accent (#3b82f6), semantic tokens |
| 2 | Typography and spacing: 1.6 line height, 32px card padding, 12px list gaps |
| 3 | Replaced bullet highlights with 8px coloured dots (red = issues, green = fixes) |
| 4 | Collapsible export instructions, clean textarea placeholder |
| 5 | Prominent summary bar with large count + severity breakdown |
| 6 | URL pill tags, badge icons, section label spacing |
| 7 | Fade-in animation, focus states, mobile responsive, 960px max-width |

Plus a WCAG compliance pass that resolved all but one exempt element.

---

## What Could Be Improved

1. **Live GA4 API integration** — eliminate the CSV export step entirely. Requires Google OAuth setup.
2. **Vercel Pro** — removing the 10s function limit would allow analysing more pages per run (currently capped at 4).
3. **Engagement rate column detection** — currently relies on column name matching. GA4 occasionally changes export column names between report types. A fuzzy-match approach would be more robust.
4. **Page content quality** — WordPress sites with heavy page builders (Elementor, Divi) produce messy HTML. The text extractor strips tags but can pick up widget labels, button text, and menu items as "content." A smarter extractor (looking for `<main>`, `<article>`, or `#content`) would improve recommendation quality.
5. **Result persistence** — results disappear on page refresh. Adding `localStorage` persistence would eliminate the need to re-run analysis just to review prior results.

---

## Key Takeaway

The tool works because it combines two things most analytics tools don't: **actual page content** and **AI reasoning**. GA4 tells you a page is underperforming. This tool tells you why, and what specifically to change.

Built in one session. Live the same day.
