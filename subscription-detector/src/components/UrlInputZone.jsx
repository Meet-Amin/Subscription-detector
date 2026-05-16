import { useState } from 'react';

const EXAMPLES = ['netflix.com/signup', 'spotify.com/us/premium', 'adobe.com/creativecloud/plans.html'];

export default function UrlInputZone({ onUrlReady }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  function isValidUrl(value) {
    try {
      const u = value.startsWith('http') ? value : `https://${value}`;
      new URL(u);
      return true;
    } catch {
      return false;
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a URL.');
      return;
    }
    if (!isValidUrl(trimmed)) {
      setError('That doesn\'t look like a valid URL. Try something like netflix.com/pricing.');
      return;
    }
    setError('');
    const normalized = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    onUrlReady(normalized);
  }

  return (
    <div style={styles.wrap}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={{ ...styles.inputRow, borderColor: error ? 'rgba(255,77,77,0.4)' : '#222' }}>
          <span style={styles.globe}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </span>
          <input
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            placeholder="https://example.com/pricing"
            style={styles.input}
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" style={styles.btn}>Analyze</button>
        </div>
        {error && <p style={styles.errorText}>{error}</p>}
      </form>

      <div style={styles.examples}>
        <span style={styles.examplesLabel}>Try:</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            style={styles.exampleChip}
            onClick={() => { setUrl(`https://${ex}`); setError(''); }}
            type="button"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    width: '100%',
    maxWidth: '540px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#0c0c0c',
    border: '1.5px solid',
    borderRadius: '14px',
    padding: '10px 12px',
    transition: 'border-color 0.2s ease',
  },
  globe: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#c0c0c0',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.9rem',
    minWidth: 0,
  },
  btn: {
    flexShrink: 0,
    background: 'rgba(99,255,178,0.1)',
    border: '1px solid rgba(99,255,178,0.25)',
    color: '#63ffb2',
    borderRadius: '8px',
    padding: '0.4rem 1rem',
    fontSize: '0.82rem',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.15s ease',
    whiteSpace: 'nowrap',
  },
  errorText: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.8rem',
    color: '#ff4d4d99',
    margin: '0 4px',
  },
  examples: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
  },
  examplesLabel: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: '0.75rem',
    color: '#333',
    marginRight: '2px',
  },
  exampleChip: {
    background: '#111',
    border: '1px solid #1e1e1e',
    borderRadius: '6px',
    padding: '3px 8px',
    fontSize: '0.72rem',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: '#555',
    cursor: 'pointer',
    transition: 'color 0.15s ease, border-color 0.15s ease',
  },
};
