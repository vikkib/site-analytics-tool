import React, { useState } from 'react';

const COLORS = {
  bg: '#0f0f0f',
  surface: '#1a1a1a',
  border: '#2a2a2a',
  accent: '#4ade80',
  critical: '#f87171',
  high: '#fb923c',
  text: '#f5f5f5',
  muted: '#888',
};

const styles = {
  app: {
    minHeight: '100vh',
    background: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'Inter', -apple-system, sans-serif",
    padding: '40px 20px',
  },
  container: { maxWidth: 820, margin: '0 auto' },
  header: { marginBottom: 40 },
  h1: { fontSize: 28, fontWeight: 700, margin: 0, color: COLORS.text },
  subtitle: { color: COLORS.muted, marginTop: 8, fontSize: 15 },
  card: {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: 28,
    marginBottom: 20,
  },
  label: { display: 'block', fontSize: 13, color: COLORS.muted, marginBottom: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    width: '100%',
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    color: COLORS.text,
    fontSize: 15,
    padding: '10px 14px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    color: COLORS.text,
    fontSize: 13,
    padding: '10px 14px',
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'monospace',
    minHeight: 160,
  },
  row: { display: 'flex', gap: 16, marginBottom: 20 },
  col: { flex: 1 },
  button: {
    background: COLORS.accent,
    color: '#000',
    border: 'none',
    borderRadius: 8,
    padding: '12px 28px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  sectionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 20, marginTop: 0 },
  badge: (severity) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: severity === 'CRITICAL' ? '#3f0f0f' : '#3f1f0a',
    color: severity === 'CRITICAL' ? COLORS.critical : COLORS.high,
    border: `1px solid ${severity === 'CRITICAL' ? COLORS.critical : COLORS.high}`,
  }),
  pageCard: {
    background: COLORS.bg,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: 20,
    marginBottom: 14,
  },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  pagePath: { fontFamily: 'monospace', fontSize: 14, color: COLORS.accent, fontWeight: 600 },
  metaRow: { display: 'flex', gap: 20, marginBottom: 14 },
  metaStat: { fontSize: 13 },
  metaLabel: { color: COLORS.muted },
  issueList: { marginBottom: 12 },
  issueItem: { fontSize: 13, color: COLORS.critical, marginBottom: 4, paddingLeft: 16, position: 'relative' },
  fixList: {},
  fixItem: { fontSize: 13, color: COLORS.text, marginBottom: 6, paddingLeft: 16, position: 'relative', lineHeight: 1.5 },
  divider: { color: COLORS.muted, fontSize: 12, marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' },
  summary: {
    background: '#0f1f0f',
    border: `1px solid #1a3a1a`,
    borderRadius: 10,
    padding: '16px 20px',
    marginBottom: 24,
    fontSize: 14,
    color: COLORS.accent,
  },
  error: {
    background: '#1f0f0f',
    border: `1px solid ${COLORS.critical}`,
    borderRadius: 8,
    padding: '14px 18px',
    color: COLORS.critical,
    fontSize: 14,
    marginBottom: 20,
  },
  hint: { fontSize: 12, color: COLORS.muted, marginTop: 8 },
  spinner: { display: 'inline-block', marginRight: 8 },
};

const EXPORT_INSTRUCTIONS = `How to export from GA4:
1. GA4 → Reports → Engagement → Pages and screens
2. Set date range (last 30 or 90 days)
3. Click Download icon → Download CSV
4. Open the file, select all, paste here`;

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

  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.h1}>Site Analytics Advisor</h1>
          <p style={styles.subtitle}>Paste GA4 data → get specific, page-by-page improvement recommendations</p>
        </div>

        <div style={styles.card}>
          <div style={styles.row}>
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
              placeholder={EXPORT_INSTRUCTIONS}
              value={csvData}
              onChange={e => setCsvData(e.target.value)}
            />
            <p style={styles.hint}>{EXPORT_INSTRUCTIONS}</p>
          </div>

          <button
            style={{ ...styles.button, ...(canAnalyze ? {} : styles.buttonDisabled) }}
            onClick={analyze}
            disabled={!canAnalyze}
          >
            {loading ? '⏳ Analyzing pages...' : 'Analyze My Site'}
          </button>
        </div>

        {error && <div style={styles.error}>⚠ {error}</div>}

        {results && (
          <div>
            {results.recommendations.length === 0 ? (
              <div style={styles.summary}>✓ All pages meet engagement thresholds. No urgent fixes needed.</div>
            ) : (
              <>
                <div style={styles.summary}>
                  Found <strong>{results.flaggedCount}</strong> underperforming pages out of{' '}
                  <strong>{results.totalPagesAnalyzed}</strong> analyzed. Fix these first:
                </div>

                <h2 style={styles.sectionTitle}>Priority Fix List</h2>

                {results.recommendations.map((rec, idx) => (
                  <div key={idx} style={styles.pageCard}>
                    <div style={styles.pageHeader}>
                      <div>
                        <div style={styles.pagePath}>{rec.path}</div>
                      </div>
                      <span style={styles.badge(rec.severity)}>{rec.severity}</span>
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
                        <div key={i} style={styles.issueItem}>• {issue}</div>
                      ))}
                    </div>

                    <div style={styles.divider}>How to fix</div>
                    <div style={styles.fixList}>
                      {(expanded[idx] ? rec.fixes : rec.fixes.slice(0, 3)).map((fix, i) => (
                        <div key={i} style={styles.fixItem}>→ {fix}</div>
                      ))}
                      {rec.fixes.length > 3 && (
                        <button
                          onClick={() => toggleExpand(idx)}
                          style={{ background: 'none', border: 'none', color: COLORS.muted, cursor: 'pointer', fontSize: 13, padding: '4px 0', marginTop: 4 }}
                        >
                          {expanded[idx] ? '▲ Show less' : `▼ Show ${rec.fixes.length - 3} more fixes`}
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
