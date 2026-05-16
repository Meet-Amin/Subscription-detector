import { useState, useEffect, useRef } from 'react';
import UrlInputZone from './components/UrlInputZone';
import ChargeCard from './components/ChargeCard';
import LoadingScreen from './components/LoadingScreen';
import { analyzeUrl } from './lib/analyzeUrl';
import './App.css';

const DEMO_MODE = false;

export default function App() {
  const [stage, setStage] = useState('upload'); // 'upload' | 'loading' | 'results' | 'error'
  const [findings, setFindings] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [loadStep, setLoadStep] = useState(0);
  const [apiError, setApiError] = useState('');
  const lastUrlRef = useRef('');
  const timerRef = useRef(null);

  function runUrlAnalysis(url) {
    setLoadStep(0);
    setStage('loading');

    timerRef.current = setInterval(() => {
      setLoadStep((s) => Math.min(s + 1, 4));
    }, 2000);

    analyzeUrl(url)
      .then((result) => {
        clearInterval(timerRef.current);
        setFindings(result);
        setStage('results');
      })
      .catch((err) => {
        clearInterval(timerRef.current);
        setApiError(err.message ?? 'Something went wrong. Please try again.');
        setStage('error');
      });
  }

  function handleUrlReady(url) {
    lastUrlRef.current = url;
    setDismissed(new Set());
    setFindings([]);
    setApiError('');
    runUrlAnalysis(url);
  }

  function handleRetry() {
    setApiError('');
    runUrlAnalysis(lastUrlRef.current);
  }

  function handleKeep(id) {
    setDismissed((prev) => { const next = new Set(prev); next.delete(id); return next; });
  }

  function handleDismiss(id) {
    setDismissed((prev) => new Set([...prev, id]));
  }

  function reset() {
    clearInterval(timerRef.current);
    setStage('upload');
    setFindings([]);
    setDismissed(new Set());
    setLoadStep(0);
    setApiError('');
    lastUrlRef.current = '';
  }

  useEffect(() => () => clearInterval(timerRef.current), []);

  if (stage === 'loading') {
    return <LoadingScreen currentStep={loadStep} />;
  }

  if (stage === 'error') {
    return (
      <div style={styles.bg}>
        <div className="page-container" style={styles.container}>
          <div style={styles.errorScreen}>
            <div style={styles.errorIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 style={styles.errorTitle}>Analysis failed</h2>
            <p style={styles.errorMsg}>{apiError}</p>
            <div style={styles.errorActions}>
              <button style={styles.retryBtn} onClick={handleRetry}>Try again</button>
              <button style={styles.resetBtn} onClick={reset}>Check a different URL</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'results') {
    const domain = (() => { try { return new URL(lastUrlRef.current).hostname.replace(/^www\./, ''); } catch { return lastUrlRef.current; } })();
    const visible = findings.filter((f) => !dismissed.has(f.id));

    return (
      <div style={styles.bg}>
        {DEMO_MODE && <DemoBanner />}
        <div className="page-container" style={styles.container}>
          <div className="results-header" style={styles.header}>
            <h1 style={styles.h1}>Pricing analysis</h1>
            {domain && <span style={styles.domain}>{domain}</span>}
          </div>

          <div className="stats-row" style={styles.statsRow}>
            <StatCard
              label="Verdict"
              value={findings.length === 0 ? 'Clean' : 'Watch out'}
              accent={findings.length === 0 ? '#63ffb2' : '#ff4d4d'}
            />
            <StatCard label="Issues found" value={findings.length} />
            <StatCard label="Categories" value={new Set(findings.map((f) => f.category)).size} />
          </div>

          {findings.length > 0 ? (
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Potential Issues</h2>
              <div style={styles.cardList}>
                {visible.map((item, i) => (
                  <div key={item.id} className="charge-card-row" style={{ animationDelay: `${i * 40}ms` }}>
                    <ChargeCard
                      item={item}
                      isDismissed={dismissed.has(item.id)}
                      onKeep={handleKeep}
                      onDismiss={handleDismiss}
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <div style={styles.cleanBadge}>
              <span style={styles.cleanIcon}>✓</span>
              <div>
                <p style={styles.cleanTitle}>No hidden fees detected</p>
                <p style={styles.cleanSub}>The pricing page appears transparent. Always read the full terms before subscribing.</p>
              </div>
            </div>
          )}

          <button style={styles.resetBtn} onClick={reset}>Check another platform</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      {DEMO_MODE && <DemoBanner />}
      <div className="page-container" style={styles.container}>
        <div style={styles.page}>
          <div style={styles.wordmark}>Hidden Fee Detector</div>
          <p style={styles.sub}>Paste any platform URL and we'll check their pricing for hidden fees, auto-renewals, and fine print.</p>
          <UrlInputZone onUrlReady={handleUrlReady} />
          <p style={styles.privacy}>Pricing pages are fetched via Jina Reader. No data is stored.</p>
        </div>
      </div>
    </div>
  );
}

function DemoBanner() {
  return (
    <div style={bannerStyles.bar}>
      <span style={bannerStyles.dot} />
      Demo mode — no API key set. Showing sample data.
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card" style={styles.statCard}>
      <span style={{ ...styles.statValue, ...(accent ? { color: accent } : {}) }}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

const styles = {
  bg: {
    minHeight: '100vh',
    background: '#080808',
  },
  container: {
    maxWidth: '820px',
    margin: '0 auto',
    padding: '0 24px 60px',
  },
  page: {
    paddingTop: '80px',
    paddingBottom: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    textAlign: 'center',
  },
  wordmark: {
    fontFamily: "'Syne', system-ui, sans-serif",
    fontSize: '1.05rem',
    fontWeight: 800,
    letterSpacing: '0.04em',
    color: '#f0f0f0',
    textTransform: 'uppercase',
  },
  sub: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.92rem',
    color: '#555',
    maxWidth: '400px',
    lineHeight: 1.6,
    marginBottom: '8px',
  },
  privacy: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.75rem',
    color: '#333',
    marginTop: '8px',
  },
  header: {
    paddingTop: '48px',
    paddingBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  h1: {
    fontFamily: "'Syne', system-ui, sans-serif",
    fontSize: '2rem',
    fontWeight: 700,
    color: '#f0f0f0',
    margin: 0,
  },
  domain: {
    fontSize: '0.82rem',
    color: '#555',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '32px',
  },
  statCard: {
    background: '#0e0e0e',
    border: '1px solid #1e1e1e',
    borderRadius: '14px',
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  statValue: {
    fontFamily: "'Syne', system-ui, sans-serif",
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#f0f0f0',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '0.72rem',
    fontWeight: 500,
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily: "'DM Sans', system-ui, sans-serif",
  },
  section: {
    marginBottom: '28px',
  },
  sectionTitle: {
    fontFamily: "'Syne', system-ui, sans-serif",
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#444',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    margin: '0 0 12px',
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cleanBadge: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    background: 'rgba(99,255,178,0.05)',
    border: '1px solid rgba(99,255,178,0.15)',
    borderRadius: '14px',
    padding: '1.25rem 1.5rem',
    marginBottom: '12px',
  },
  cleanIcon: {
    flexShrink: 0,
    width: '32px',
    height: '32px',
    background: 'rgba(99,255,178,0.12)',
    border: '1px solid rgba(99,255,178,0.25)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#63ffb2',
    fontSize: '1rem',
    fontWeight: 700,
    lineHeight: '32px',
    textAlign: 'center',
  },
  cleanTitle: {
    fontFamily: "'Syne', system-ui, sans-serif",
    fontSize: '1rem',
    fontWeight: 700,
    color: '#63ffb2',
    margin: '0 0 4px',
  },
  cleanSub: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.82rem',
    color: '#555',
    margin: 0,
    lineHeight: 1.55,
  },
  resetBtn: {
    marginTop: '32px',
    background: 'transparent',
    border: '1px solid #2a2a2a',
    color: '#666',
    borderRadius: '10px',
    padding: '0.6rem 1.4rem',
    fontSize: '0.85rem',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
  },
  errorScreen: {
    paddingTop: '120px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    textAlign: 'center',
  },
  errorIcon: {
    width: '64px',
    height: '64px',
    background: 'rgba(255,77,77,0.08)',
    border: '1px solid rgba(255,77,77,0.15)',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  errorTitle: {
    fontFamily: "'Syne', system-ui, sans-serif",
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#f0f0f0',
    margin: 0,
  },
  errorMsg: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.88rem',
    color: '#666',
    maxWidth: '420px',
    lineHeight: 1.6,
    margin: 0,
  },
  errorActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  retryBtn: {
    background: 'rgba(99,255,178,0.08)',
    border: '1px solid rgba(99,255,178,0.25)',
    color: '#63ffb2',
    borderRadius: '10px',
    padding: '0.6rem 1.4rem',
    fontSize: '0.85rem',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
  },
};

const bannerStyles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '9px 16px',
    background: 'rgba(245,166,35,0.07)',
    borderBottom: '1px solid rgba(245,166,35,0.15)',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.78rem',
    fontWeight: 500,
    color: '#f5a623',
    letterSpacing: '0.01em',
  },
  dot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#f5a623',
    flexShrink: 0,
  },
};
