import React, { useState } from 'react';

const COLORS = {
  bg: '#0f1114',
  surface: '#1a1d23',
  border: '#2a2e36',
  accent: '#3b82f6',
  critical: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  text: '#e8eaed',
  textSecondary: '#9aa0a6',
  muted: '#6b7280',
};

const styles = {
  app: {
    minHeight: '100vh',
    background: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    fontSize: 15,
    lineHeight: 1.6,
    padding: '48px 20px',
  },
  container: { maxWidth: 960, margin: '0 auto' },
  header: { marginBottom: 48 },
  h1: { fontSize: 28, fontWeight: 700, margin: 0, color: COLORS.text, lineHeight: 1.3 },
  subtitle: { color: COLORS.textSecondary, marginTop: 10, fontSize: 15, lineHeight: 1.6 },
  card: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: 32,
    marginBottom: 24,
  },
  label: { display: 'block', fontSize: 12, color: COLORS.textSecondary, marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em' },
  input: {
    width: '100%',
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    color: COLORS.text,
    fontSize: 15,
    padding: '11px 14px',
    boxSizing: 'border-box',
    outline: 'none',
    lineHeight: 1.6,
  },
  textarea: {
    width: '100%',
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    color: COLORS.text,
    fontSize: 13,
    padding: '12px 14px',
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'vertical',
    fontFamily: "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace",
    minHeight: 160,
    lineHeight: 1.6,
  },
  row: { display: 'flex', gap: 16, marginBottom: 24 },
  col: { flex: 1 },
  button: {
    background: COLORS.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '11px 28px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    marginTop: 8,
    lineHeight: 1.4,
  },
  buttonDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  sectionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20, marginTop: 0, lineHeight: 1.3 },
  badge: (severity) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: severity === 'CRITICAL' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
    color: severity === 'CRITICAL' ? COLORS.critical : COLORS.warning,
    border: `1px solid ${severity === 'CRITICAL' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
    whiteSpace: 'nowrap',
  }),
  pageCard: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 },
  pagePath: {
    fontFamily: "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace",
    fontSize: 14, color: COLORS.accent, fontWeight: 500,
    background: 'rgba(59,130,246,0.1)', padding: '4px 10px',
    borderRadius: 6, display: 'inline-block',
  },
  metaRow: { display: 'flex', gap: 24, marginBottom: 20 },
  metaStat: { fontSize: 14, lineHeight: 1.6 },
  metaLabel: { color: COLORS.textSecondary },
  issueList: { marginBottom: 16 },
  issueItem: { fontSize: 14, color: COLORS.text, marginBottom: 12, lineHeight: 1.6, display: 'flex', gap: 12, alignItems: 'flex-start' },
  issueDot: { width: 8, height: 8, borderRadius: '50%', background: COLORS.critical, flexShrink: 0, marginTop: 7 },
  fixList: {},
  fixItem: { fontSize: 14, color: COLORS.text, marginBottom: 12, lineHeight: 1.6, display: 'flex', gap: 12, alignItems: 'flex-start' },
  fixDot: { width: 8, height: 8, borderRadius: '50%', background: COLORS.success, flexShrink: 0, marginTop: 7 },
  divider: { color: COLORS.textSecondary, fontSize: 11, marginBottom: 12, marginTop: 20, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' },
  summary: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: '20px 24px',
    marginBottom: 32,
  },
  summaryHeadline: { fontSize: 22, fontWeight: 700, color: COLORS.text, lineHeight: 1.3, marginBottom: 10 },
  summaryMeta: { fontSize: 14, color: COLORS.textSecondary },
  summaryCounts: { display: 'flex', gap: 20, marginTop: 12, flexWrap: 'wrap' },
  summaryCount: (color) => ({ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: COLORS.textSecondary }),
  summaryDot: (color) => ({ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }),
  error: {
    background: 'rgba(239,68,68,0.08)',
    border: `1px solid rgba(239,68,68,0.4)`,
    borderRadius: 8,
    padding: '14px 18px',
    color: COLORS.critical,
    fontSize: 14,
    marginBottom: 20,
  },
  details: { marginTop: 10 },
  detailsSummary: { fontSize: 14, color: COLORS.text, cursor: 'pointer', userSelect: 'none', listStyle: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 },
  detailsBody: { marginTop: 12, paddingLeft: 4 },
  detailsOl: { margin: 0, paddingLeft: 20, fontSize: 14, color: COLORS.text, lineHeight: 2 },
  spinner: { display: 'inline-block', marginRight: 8 },
  loadingOverlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(15,17,20,0.88)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 100,
  },
  loadingBox: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    padding: '36px 48px',
    textAlign: 'center',
  },
  loadingTitle: { fontSize: 18, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 },
  loadingSteps: { color: COLORS.muted, fontSize: 14, lineHeight: 2, margin: 0 },
  pulse: {
    width: 48, height: 48, borderRadius: '50%',
    border: `3px solid ${COLORS.border}`,
    borderTop: `3px solid ${COLORS.accent}`,
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
};

const SAMPLE_RESULTS = {
  totalPagesAnalyzed: 18,
  flaggedCount: 4,
  recommendations: [
    {
      path: '/programs/',
      severity: 'CRITICAL',
      engagementRate: 'N/A',
      avgTime: '54s',
      priority: 1,
      issues: [
        "Opening copy 'We have designed our lifestyle program...' is abstract — doesn't show what client actually does",
        "CTA 'I'm Ready!' appears before explaining program structure or pricing — premature commitment ask",
        'No pricing transparency or program duration mentioned — major conversion barrier',
      ],
      fixes: [
        "Add program structure upfront: '12-Week Program: 3 Video Lessons/Week + Weekly 1:1 Coaching + Food Sensitivity Testing'",
        "Move 'I'm Ready!' CTA to bottom after full program explanation; add softer CTA at top: 'See Full Program Details'",
        "Replace abstract opening with specific outcome: 'The Nourish Program: 12 weeks of coaching that helped 93% of clients keep the weight off'",
        'Add a timeline section: what happens in week 1, week 4, week 12 — visitors need to know what they are committing to',
      ],
    },
    {
      path: '/',
      severity: 'CRITICAL',
      engagementRate: 'N/A',
      avgTime: '21s',
      priority: 2,
      issues: [
        "Headline 'McLean County's weight loss program for women who are done with diets' buries the unique value and limits geography",
        "First CTA 'Tell me more!' is vague — doesn't drive action or set expectations",
        "'93% keep the weight off' statistic is buried mid-page instead of in the hero",
      ],
      fixes: [
        "Rewrite hero headline: '93% of Our Clients Keep the Weight Off — Without Restrictive Diets or Meal Replacements'",
        "Replace 'Tell me more!' with 'Schedule Your Free Consultation' — use consistent language sitewide",
        'Move the 93% statistic into the hero section with visual emphasis, directly under the headline',
      ],
    },
    {
      path: '/contact/',
      severity: 'HIGH',
      engagementRate: 'N/A',
      avgTime: '16s',
      priority: 3,
      issues: [
        "Headline 'Contact us Ready to Take the next step?' is weak — no value proposition at the decision moment",
        "Two competing CTAs ('Schedule your consultation' vs 'Send a Message') fragment conversion intent",
        "'How did you hear about us' field adds friction before the user has committed",
      ],
      fixes: [
        "Replace headline with: 'Book Your Free Consultation — Find Out If Nourish Is Right For You in 20 Minutes'",
        "Remove 'Send a Message' form entirely — commit to one conversion action: scheduling the consultation",
        "Remove 'How did you hear about the Nourish program?' — collect this after booking, not before",
      ],
    },
    {
      path: '/about/',
      severity: 'HIGH',
      engagementRate: 'N/A',
      avgTime: '31s',
      priority: 4,
      issues: [
        "Opens with healthcare crisis statistics ('73% of adults...') — fear-based, may alienate rather than inspire",
        "Phrase 'More frustration. More shame. More trying harder.' dwells on negative without quick pivot to hope",
        "Content focuses on what Nourish ISN'T rather than what it IS",
      ],
      fixes: [
        "Flip the opening: Start with 'After 35 years in healthcare, Deb created a program where 93% of clients keep the weight off' THEN explain why",
        "Cut the obesity statistics — visitors already know there's a problem. Replace with: 'Deb knew the answer wasn't another restrictive diet'",
        "Add a clear CTA at the end: 'Ready to work with Deb? Schedule your free consultation'",
      ],
    },
  ],
};

const EXPORT_INSTRUCTIONS = `How to export from GA4:
1. GA4 → Reports → Engagement → Pages and screens
2. Set date range (last 30 or 90 days)
3. Click Download icon → Download CSV
4. Open the .csv file in TextEdit (Mac) or Notepad (Windows) — not Google Sheets
5. Select all → Copy → Paste here`;

export default function App() {
  const [siteName, setSiteName] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  const canAnalyze = siteName.trim() && siteUrl.trim() && csvData.trim() && !loading;

  const analyze = async () => {
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName, siteUrl, csvData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResults(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (idx) => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  const loadSample = () => setResults(SAMPLE_RESULTS);

  return (
    <div style={styles.app} className="saa-app">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        input:focus, textarea:focus {
          outline: 2px solid ${COLORS.accent} !important;
          outline-offset: 1px;
          border-color: ${COLORS.accent} !important;
        }
        button:focus-visible {
          outline: 2px solid ${COLORS.accent};
          outline-offset: 2px;
        }
        details summary::-webkit-details-marker { display: none; }
        @media (max-width: 640px) {
          .saa-app { padding: 24px 16px !important; }
          .saa-card { padding: 20px 16px !important; }
          .saa-row { flex-direction: column !important; }
          .saa-page-card { padding: 16px !important; }
        }
      `}</style>
      {loading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingBox}>
            <style>{``}</style>
            <div style={styles.pulse} />
            <div style={styles.loadingTitle}>Analyzing your site...</div>
            <p style={styles.loadingSteps}>
              Fetching underperforming pages<br />
              Reading page content<br />
              Generating recommendations
            </p>
          </div>
        </div>
      )}
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.h1}>Site Analytics Advisor</h1>
          <p style={styles.subtitle}>Paste GA4 data → get specific, page-by-page improvement recommendations</p>
        </div>

        <div style={styles.card} className="saa-card">
          <div style={styles.row} className="saa-row">
            <div style={styles.col}>
              <label style={styles.label}>Site Name</label>
              <input
                style={styles.input}
                placeholder="The Nourish Lifestyle"
                value={siteName}
                onChange={e => setSiteName(e.target.value)}
              />
            </div>
            <div style={styles.col}>
              <label style={styles.label}>Site URL</label>
              <input
                style={styles.input}
                placeholder="https://thenourishlifestyle.com"
                value={siteUrl}
                onChange={e => setSiteUrl(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={styles.label}>GA4 CSV Export — Pages & Screens</label>
            <textarea
              style={styles.textarea}
              placeholder="Paste your GA4 CSV export here"
              value={csvData}
              onChange={e => setCsvData(e.target.value)}
            />
            <details style={styles.details} open>
              <summary style={styles.detailsSummary}>▸ How to export from GA4</summary>
              <div style={styles.detailsBody}>
                <ol style={styles.detailsOl}>
                  <li>GA4 → Reports → Engagement → Pages and screens</li>
                  <li>Set date range (last 90 days recommended)</li>
                  <li>Click the Download icon → Download CSV</li>
                  <li>Open the .csv file in TextEdit (Mac) or Notepad (Windows) — <strong>not Google Sheets</strong></li>
                  <li>Select all → Copy → Paste above</li>
                </ol>
              </div>
            </details>
          </div>

          <button
            style={{ ...styles.button, ...(canAnalyze ? {} : styles.buttonDisabled) }}
            onClick={analyze}
            disabled={!canAnalyze}
          >
            {loading ? '⏳ Analyzing pages...' : 'Analyze My Site'}
          </button>
          <button
            onClick={loadSample}
            style={{ background: 'none', border: 'none', color: COLORS.textSecondary, cursor: 'pointer', fontSize: 13, padding: '8px 0 0', display: 'block', width: '100%', textAlign: 'center' }}
          >
            Load sample results (for UI preview)
          </button>
        </div>

        {error && <div style={styles.error}>⚠ {error}</div>}

        {results && (
          <div style={{ animation: 'fadeInUp 200ms ease both' }}>
            {results.recommendations.length === 0 ? (
              <div style={styles.summary}>✓ All pages meet engagement thresholds. No urgent fixes needed.</div>
            ) : (
              <>
                <div style={styles.summary}>
                  <div style={styles.summaryHeadline}>
                    {results.flaggedCount} pages need attention
                  </div>
                  <div style={styles.summaryMeta}>
                    Out of {results.totalPagesAnalyzed} pages analyzed — fix these first
                  </div>
                  <div style={styles.summaryCounts}>
                    {(() => {
                      const critical = results.recommendations.filter(r => r.severity === 'CRITICAL').length;
                      const high = results.recommendations.filter(r => r.severity === 'HIGH').length;
                      const healthy = results.totalPagesAnalyzed - results.flaggedCount;
                      return (<>
                        <span style={styles.summaryCount(COLORS.critical)}><span style={styles.summaryDot(COLORS.critical)} />{critical} critical</span>
                        <span style={styles.summaryCount(COLORS.warning)}><span style={styles.summaryDot(COLORS.warning)} />{high} high</span>
                        <span style={styles.summaryCount(COLORS.success)}><span style={styles.summaryDot(COLORS.success)} />{healthy} healthy</span>
                      </>);
                    })()}
                  </div>
                </div>

                <h2 style={styles.sectionTitle}>Priority Fix List</h2>

                {results.recommendations.map((rec, idx) => (
                  <div key={idx} style={styles.pageCard} className="saa-page-card">
                    <div style={styles.pageHeader}>
                      <div>
                        <div style={styles.pagePath}>{rec.path}</div>
                      </div>
                      <span style={styles.badge(rec.severity)}>
                        {rec.severity === 'CRITICAL' ? '⚠' : '●'} {rec.severity}
                      </span>
                    </div>

                    <div style={styles.metaRow}>
                      <div style={styles.metaStat}>
                        <span style={styles.metaLabel}>Engagement rate </span>
                        <strong>{rec.engagementRate}</strong>
                      </div>
                      <div style={styles.metaStat}>
                        <span style={styles.metaLabel}>Avg time on page </span>
                        <strong>{rec.avgTime}</strong>
                      </div>
                    </div>

                    <div style={styles.divider}>Issues found</div>
                    <div style={styles.issueList}>
                      {rec.issues.map((issue, i) => (
                        <div key={i} style={styles.issueItem}>
                          <span style={styles.issueDot} />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>

                    <div style={styles.divider}>How to fix</div>
                    <div style={styles.fixList}>
                      {(expanded[idx] ? rec.fixes : rec.fixes.slice(0, 3)).map((fix, i) => (
                        <div key={i} style={styles.fixItem}>
                          <span style={styles.fixDot} />
                          <span>{fix}</span>
                        </div>
                      ))}
                      {rec.fixes.length > 3 && (
                        <button
                          onClick={() => toggleExpand(idx)}
                          style={{ background: 'none', border: 'none', color: COLORS.textSecondary, cursor: 'pointer', fontSize: 13, padding: '6px 0 0', marginTop: 2, textDecoration: 'underline', textDecorationColor: 'transparent' }}
                          onMouseEnter={e => e.target.style.color = COLORS.text}
                          onMouseLeave={e => e.target.style.color = COLORS.textSecondary}
                        >
                          {expanded[idx] ? '↑ Show less' : `↓ Show ${rec.fixes.length - 3} more fixes`}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
