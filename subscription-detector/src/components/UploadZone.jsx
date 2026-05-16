import { useState, useRef } from 'react';
import extractTextFromPdf from '../lib/extractPdf';
import UrlInputZone from './UrlInputZone';

const THIN_TEXT_THRESHOLD = 100;

export default function UploadZone({ onFileReady, onUrlReady }) {
  const [tab, setTab] = useState('statement'); // 'statement' | 'url'
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const inputRef = useRef(null);

  async function processFile(file) {
    if (!file) return;
    setError('');
    setWarning('');

    let text;
    try {
      text = await extractTextFromPdf(file);
    } catch (err) {
      const msg = err.message ?? '';
      if (msg.toLowerCase().includes('password') || msg.toLowerCase().includes('encrypted')) {
        setError('This PDF is password-protected. Remove the password and try again.');
      } else {
        setError(`Could not read this PDF. It may be corrupted or use an unsupported format. (${msg})`);
      }
      return;
    }

    if (text.trim().length < THIN_TEXT_THRESHOLD) {
      setWarning('This PDF may be a scanned image. Results may be limited.');
    }

    onFileReady(text, file.name);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  }

  function onDragOver(e) {
    e.preventDefault();
    setDragging(true);
  }

  function onDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragging(false);
    }
  }

  function onInputChange(e) {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  }

  function tryAnother() {
    setError('');
    setWarning('');
    inputRef.current?.click();
  }

  return (
    <div style={styles.page}>
      <div style={styles.wordmark}>Subscription Detector</div>
      <p style={styles.sub}>
        {tab === 'statement'
          ? "Drop your bank statement and we'll find what's quietly draining your account."
          : "Paste any platform URL and we'll check for hidden fees in their pricing."}
      </p>

      <div style={styles.tabs}>
        <button
          style={{ ...styles.tabBtn, ...(tab === 'statement' ? styles.tabActive : {}) }}
          onClick={() => { setTab('statement'); setError(''); setWarning(''); }}
          type="button"
        >
          Bank Statement
        </button>
        <button
          style={{ ...styles.tabBtn, ...(tab === 'url' ? styles.tabActive : {}) }}
          onClick={() => { setTab('url'); setError(''); setWarning(''); }}
          type="button"
        >
          Platform URL
        </button>
      </div>

      {tab === 'url' ? (
        <UrlInputZone onUrlReady={onUrlReady} />
      ) : (
      <div
        style={{
          ...styles.zone,
          borderColor: error
            ? 'rgba(255,77,77,0.4)'
            : dragging
            ? 'rgba(99,255,178,0.6)'
            : '#222',
          boxShadow: dragging
            ? '0 0 0 1px rgba(99,255,178,0.25), 0 0 32px rgba(99,255,178,0.08)'
            : 'none',
          background: dragging ? 'rgba(99,255,178,0.03)' : '#0c0c0c',
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={error ? undefined : () => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={onInputChange}
        />

        <div style={styles.iconWrap}>
          {error ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={dragging ? '#63ffb2' : '#444'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.2s ease' }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          )}
        </div>

        {error ? (
          <>
            <p style={styles.zoneHeading}>Upload failed</p>
            <p style={{ ...styles.zoneHint, color: '#ff4d4d99', maxWidth: '320px', lineHeight: 1.5 }}>{error}</p>
            <button style={styles.tryAnotherBtn} onClick={(e) => { e.stopPropagation(); tryAnother(); }}>
              Try another file
            </button>
          </>
        ) : (
          <>
            <p style={styles.zoneHeading}>
              {dragging ? 'Drop it here' : 'Drop your PDF statement'}
            </p>
            <p style={styles.zoneHint}>
              or <span style={styles.link}>browse files</span> · PDF only
            </p>
          </>
        )}
      </div>
      )}

      {tab === 'statement' && warning && (
        <div style={styles.warningBox}>
          <span style={styles.warningIcon}>⚠</span>
          {warning}
        </div>
      )}

      <p style={styles.privacy}>
        {tab === 'statement'
          ? 'Your file is processed locally — nothing is stored on our servers.'
          : 'Pricing pages are fetched via Jina Reader. No data is stored.'}
      </p>
    </div>
  );
}

const styles = {
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
    maxWidth: '380px',
    lineHeight: 1.6,
    marginBottom: '8px',
  },
  tabs: {
    display: 'flex',
    background: '#0c0c0c',
    border: '1px solid #1a1a1a',
    borderRadius: '10px',
    padding: '3px',
    gap: '2px',
    marginBottom: '4px',
  },
  tabBtn: {
    flex: 1,
    padding: '0.45rem 1.2rem',
    borderRadius: '7px',
    border: 'none',
    background: 'transparent',
    color: '#444',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.82rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s ease, color 0.15s ease',
  },
  tabActive: {
    background: '#181818',
    color: '#c0c0c0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  zone: {
    width: '100%',
    maxWidth: '480px',
    borderRadius: '20px',
    border: '1.5px dashed',
    padding: '3rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.55rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
    userSelect: 'none',
  },
  iconWrap: {
    marginBottom: '4px',
  },
  zoneHeading: {
    fontFamily: "'Syne', system-ui, sans-serif",
    fontSize: '1rem',
    fontWeight: 700,
    color: '#c0c0c0',
  },
  zoneHint: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.82rem',
    color: '#444',
  },
  link: {
    color: '#63ffb2',
    cursor: 'pointer',
  },
  tryAnotherBtn: {
    marginTop: '8px',
    background: 'rgba(255,77,77,0.1)',
    border: '1px solid rgba(255,77,77,0.3)',
    color: '#ff4d4d',
    borderRadius: '8px',
    padding: '0.45rem 1rem',
    fontSize: '0.82rem',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 500,
    cursor: 'pointer',
  },
  warningBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(245,166,35,0.08)',
    border: '1px solid rgba(245,166,35,0.2)',
    borderRadius: '10px',
    padding: '0.6rem 1rem',
    maxWidth: '480px',
    width: '100%',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.82rem',
    color: '#f5a623',
    textAlign: 'left',
  },
  warningIcon: {
    flexShrink: 0,
    fontSize: '0.9rem',
  },
  privacy: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.75rem',
    color: '#333',
    marginTop: '8px',
  },
};
