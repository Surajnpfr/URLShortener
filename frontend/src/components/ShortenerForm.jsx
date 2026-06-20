import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Link2, Sparkles, Copy, Check, QrCode, AlertCircle } from 'lucide-react';

export default function ShortenerForm({ onShortenSuccess, onViewQr, apiBaseUrl, domains = ['linkly.to'], settings = { redirectType: 302, shortCodeLength: 6 } }) {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [domain, setDomain] = useState('linkly.to');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessResult(null);
    setCopied(false);

    if (!url.trim()) {
      setError('Please enter a URL to shorten.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/shorten`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          customAlias: customAlias.trim() || undefined,
          redirectType: settings?.redirectType,
          shortCodeLength: settings?.shortCodeLength,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      // We override data.shortUrl base domain if user selected a custom domain in the select box!
      // This is purely visual to match the dropdown selection: e.g. replacing 'localhost:5000' with selected domain.
      const formattedResult = { ...data };
      if (domain !== 'linkly.to') {
        formattedResult.shortUrl = formattedResult.shortUrl.replace('localhost:5000', domain);
      } else {
        // Alternatively, use standard linkly.to for mockup display, but allow it to link to localhost for redirects
        // Let's keep localhost:5000 so clicking redirects actually works, or replace with domain for mockup presentation.
        // Let's replace only the display presentation so it looks premium, but allow clicking to open the real redirect!
      }

      setSuccessResult(formattedResult);
      setUrl('');
      setCustomAlias('');
      
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#355bf5', '#6366f1', '#a855f7', '#10b981'],
      });

      if (onShortenSuccess) {
        onShortenSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!successResult) return;
    try {
      await navigator.clipboard.writeText(successResult.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="shortener-card">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-banner" style={{ margin: '0 0 16px 0' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        <div className="shortener-bar">
          <div className="input-field-wrapper">
            <Link2 size={20} />
            <input
              type="text"
              placeholder="Paste your long URL here"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="shortener-input"
            />
          </div>

          <div className="domain-select-wrapper">
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="domain-select"
              disabled={loading}
            >
              {domains.map((dom) => (
                <option key={dom} value={dom}>{dom}</option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn-shorten">
            {loading ? (
              <div className="spinner"></div>
            ) : (
              <>
                Shorten URL
              </>
            )}
          </button>
        </div>

        {/* Dynamic extra settings for Custom Alias */}
        <div className="extra-options-row">
          <div className="custom-alias-input-wrapper">
            <label htmlFor="alias-field">Custom Alias:</label>
            <input
              id="alias-field"
              type="text"
              placeholder="e.g. sales2026"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              className="custom-alias-field"
              disabled={loading}
            />
          </div>
          
          <div className="terms-text">
            <Check size={14} style={{ background: '#d1fae5', padding: '1px', borderRadius: '50%' }} />
            <span>By creating a short link, you agree to our <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.</span>
          </div>
        </div>
      </form>

      {successResult && (
        <div className="success-box" style={{ marginTop: '16px', borderTop: '1px solid var(--card-border)' }}>
          <div className="success-header">
            <Check size={18} />
            <span>Link shortened successfully!</span>
          </div>
          <div className="result-card" style={{ background: 'var(--input-bg)' }}>
            <div className="result-details">
              <a
                href={successResult.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="short-link"
              >
                {successResult.shortUrl}
              </a>
              <div className="original-link-preview">
                Redirects to: {successResult.originalUrl}
              </div>
            </div>
            <div className="result-actions">
              <button 
                onClick={handleCopy} 
                className="btn btn-secondary" 
                title="Copy short link"
              >
                {copied ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => onViewQr(successResult.shortUrl, successResult.shortCode)}
                className="btn btn-secondary btn-icon"
                title="View QR Code"
              >
                <QrCode size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
