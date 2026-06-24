import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Link2, Copy, Check, AlertCircle } from 'lucide-react';
import { shortenUrl } from '../lib/urlApi';
import ShareButton from './ShareButton';

export default function ShortenerForm({
  onShortenSuccess,
  onLoginRequired,
  variant = 'landing',
  requiresAuth = false,
  className = '',
}) {
  const isDashboard = variant === 'dashboard';
  const inputRef = useRef(null);
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isDashboard && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isDashboard]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessResult(null);
    setCopied(false);

    if (!url.trim()) {
      setError('Please enter a URL to shorten.');
      return;
    }

    if (requiresAuth) {
      setError('Sign in to shorten your link.');
      onLoginRequired?.();
      return;
    }

    setLoading(true);

    try {
      const data = await shortenUrl({
        url: url.trim(),
        customAlias: customAlias.trim() || undefined,
      });

      setSuccessResult({ ...data });
      setUrl('');
      setCustomAlias('');

      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#2563eb', '#3b82f6', '#60a5fa', '#16a34a'],
      });

      onShortenSuccess?.();
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

  const cardClassName = [
    'shortener-card',
    isDashboard ? 'shortener-card--dashboard' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClassName}>
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className={`error-banner${isDashboard ? ' error-banner--compact' : ''}`} style={{ margin: '0 0 12px 0' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="shortener-bar">
          <div className="input-field-wrapper">
            <Link2 size={20} />
            <input
              ref={inputRef}
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="e.g. google.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="shortener-input"
              aria-label="URL to shorten"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-shorten">
            {loading ? (
              <div className="spinner" aria-hidden="true" />
            ) : (
              'Shorten URL'
            )}
          </button>
        </div>

        <div className={`extra-options-row${isDashboard ? ' extra-options-row--dashboard' : ''}`}>
          <div className="custom-alias-input-wrapper">
            <label htmlFor="alias-field">Custom alias</label>
            <input
              id="alias-field"
              type="text"
              placeholder="optional"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              className="custom-alias-field"
              disabled={loading}
              spellCheck={false}
            />
          </div>

          {!isDashboard && (
            <div className="terms-text">
              <Check size={14} style={{ background: '#d1fae5', padding: '1px', borderRadius: '50%' }} />
              <span>By creating a short link, you agree to our <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>.</span>
            </div>
          )}
        </div>
      </form>

      {successResult && (
        <div className={`success-box${isDashboard ? ' success-box--dashboard' : ' feature-card-surface'}`} style={{ marginTop: isDashboard ? '12px' : '16px' }}>
          <div className="success-header">
            <Check size={18} />
            <span>Link shortened successfully!</span>
          </div>
          <div className="success-card-copy">
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
            <div className="result-actions">
              <button
                onClick={handleCopy}
                className="btn btn-secondary"
                title="Copy short link"
                type="button"
              >
                {copied ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <ShareButton url={successResult.shortUrl} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
