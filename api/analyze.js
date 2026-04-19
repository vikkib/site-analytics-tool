const Anthropic = require('@anthropic-ai/sdk');

function splitLine(line, delimiter) {
  if (delimiter === '\t') return line.split('\t').map(v => v.replace(/"/g, '').trim());
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '"') {
      inQuotes = !inQuotes;
    } else if (line[i] === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += line[i];
    }
  }
  result.push(current.trim());
  return result;
}

function parseGA4CSV(csvText) {
  const lines = csvText
    .split('\n')
    .filter(line => !line.startsWith('#') && line.trim() !== '');

  if (lines.length < 2) return [];

  // Auto-detect delimiter: tab or comma
  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = splitLine(lines[0], delimiter).map(h => h.replace(/"/g, '').trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i], delimiter);
    if (values.length < 2) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').replace(/"/g, '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseEngagementTime(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  }
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return parseFloat(timeStr) || 0;
}

function flagPages(rows) {
  const parsed = rows.map(row => {
    const path =
      row['Page path and screen class'] ||
      row['Page path'] ||
      row['Page'] ||
      '';
    const views = parseInt(row['Views'] || row['Pageviews'] || '0') || 0;
    const engagementRateRaw =
      row['Engagement rate'] ||
      row['Engaged sessions rate'] ||
      '0';
    const engagementRate = parseFloat(engagementRateRaw) || 0;
    const avgTimeRaw =
      row['Average engagement time per active user'] ||
      row['Avg. session duration'] ||
      row['Average engagement time'] ||
      '0';
    const avgTimeSec = parseEngagementTime(avgTimeRaw);

    return { path, views, engagementRate, avgTimeSec };
  }).filter(r => r.path && r.path !== '(not set)' && r.views >= 30);

  return parsed
    .filter(r => r.engagementRate < 0.5 || r.avgTimeSec < 60)
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
}

async function fetchPageContent(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SiteAnalyticsAdvisor/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    const html = await res.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);
    return text || null;
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { siteUrl, siteName, csvData } = req.body || {};

  if (!csvData) {
    return res.status(400).json({ error: 'No CSV data provided.' });
  }
  if (!siteUrl) {
    return res.status(400).json({ error: 'Site URL required.' });
  }

  const rows = parseGA4CSV(csvData);
  if (rows.length === 0) {
    return res.status(400).json({
      error: 'Could not parse CSV. Export from GA4 → Reports → Engagement → Pages and screens, then download CSV.',
    });
  }

  const flagged = flagPages(rows);
  if (flagged.length === 0) {
    return res.status(200).json({
      recommendations: [],
      totalPagesAnalyzed: rows.length,
      flaggedCount: 0,
    });
  }

  const base = siteUrl.replace(/\/$/, '');
  const pagesWithContent = await Promise.all(
    flagged.map(async page => {
      const fullUrl = `${base}${page.path}`;
      const content = await fetchPageContent(fullUrl);
      return { ...page, fullUrl, content };
    })
  );

  const pageBlocks = pagesWithContent
    .map(p => {
      const engPct = (p.engagementRate * 100).toFixed(1);
      const contentNote = p.content
        ? `CONTENT EXCERPT:\n${p.content}`
        : 'Content could not be fetched — give recommendations based on the URL and metrics alone.';
      return `PAGE: ${p.path}
URL: ${p.fullUrl}
Views: ${p.views} | Engagement rate: ${engPct}% | Avg time on page: ${p.avgTimeSec}s
${contentNote}`;
    })
    .join('\n\n---\n\n');

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 8000,
    messages: [
      {
        role: 'user',
        content: `You are a conversion rate optimization expert. Analyze these underperforming pages for ${siteName || siteUrl}.

For each page, read the actual content excerpt and metrics together to give SPECIFIC, grounded recommendations — not generic advice.

Rules:
- Reference real text from the content when possible (quote specific headlines, phrases, CTAs)
- Be concrete: "Your intro starts with 'Welcome...' — rewrite to open with the problem the reader is facing"
- Severity: CRITICAL = engagement below 30% OR avg time below 30s; HIGH = engagement 30-50% OR avg time 30-60s
- Return ONLY a valid JSON array, no other text

${pageBlocks}

Return a JSON array. Each item:
{
  "path": "/page-path",
  "severity": "CRITICAL" or "HIGH",
  "engagementRate": "31%",
  "avgTime": "42s",
  "issues": ["specific issue 1", "specific issue 2"],
  "fixes": ["specific actionable fix referencing actual content", "another fix"],
  "priority": 1
}

Sort by priority ascending (1 = fix first). Return ONLY the JSON array.`,
      },
    ],
  });

  let recommendations;
  try {
    const raw = message.content[0].text.trim();
    const match = raw.match(/\[[\s\S]*\]/);
    recommendations = JSON.parse(match ? match[0] : raw);
  } catch {
    return res.status(500).json({
      error: 'AI response could not be parsed. Try again.',
      raw: message.content[0].text,
    });
  }

  return res.status(200).json({
    recommendations,
    totalPagesAnalyzed: rows.length,
    flaggedCount: flagged.length,
  });
};
