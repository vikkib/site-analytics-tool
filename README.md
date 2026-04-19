# Site Analytics Advisor

Paste GA4 data → get a prioritized, page-by-page fix list grounded in your actual content.

## What it does

1. You export a CSV from GA4 (Pages & screens report)
2. Enter your site name and URL
3. The tool flags underperforming pages (engagement rate <50% or avg time on page <60s)
4. It fetches each flagged page, reads the actual content, and sends everything to Claude
5. You get specific recommendations — not generic advice, but fixes referencing what's actually on your page

## How to use

1. Go to **GA4 → Reports → Engagement → Pages and screens**
2. Set your date range (last 30 or 90 days recommended)
3. Click the download icon → **Download CSV**
4. Open [site-analytics-tool.vercel.app](https://site-analytics-tool.vercel.app)
5. Enter your site name and URL
6. Paste the CSV contents
7. Click **Analyze My Site**

Works for any WordPress site with GA4 connected via Google Site Kit.

## Tech stack

- React 18 (Create React App)
- Vercel serverless functions
- Anthropic Claude API (`claude-sonnet-4-5`)

## Local development

```bash
npm install
# Add ANTHROPIC_API_KEY to .env.local
npm start
```

## Deploy

Deployed on Vercel. Push to `main` triggers automatic redeploy.

Requires one environment variable:

```
ANTHROPIC_API_KEY=sk-ant-...
```
