import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Link2, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { shortenUrl } from '../services/api';
import CopyButton from './CopyButton';
import ShareButton from './ShareButton';

export default function UrlForm({ onSuccess }) {
  const inputRef = useRef(null);
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessResult(null);

    if (!url.trim()) {
      setError('Please enter a URL to shorten.');
      return;
    }

    setLoading(true);
    try {
      const data = await shortenUrl({
        url: url.trim(),
        customAlias: customAlias.trim() || undefined,
      });

      setSuccessResult(data);
      setUrl('');
      setCustomAlias('');

      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#2563eb', '#3b82f6', '#60a5fa', '#16a34a'],
      });

      onSuccess?.(data);
    } catch (err) {
      setError(err.message || 'Failed to shorten URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shortener-card shortener-card--dashboard">
      <form onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="error-banner error-banner--compact" style={{ margin: '0 0 12px 0' }}>
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
              placeholder="Paste URL — e.g. google.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              className="shortener-input"
              aria-label="URL to shorten"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-shorten">
            {loading ? <div className="spinner" aria-hidden="true" /> : 'Shorten'}
          </button>
        </div>

        <div className="extra-options-row extra-options-row--dashboard">
          <div className="custom-alias-input-wrapper">
            <label htmlFor="url-form-alias">Custom alias</label>
            <input
              id="url-form-alias"
              type="text"
              placeholder="optional"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              className="custom-alias-field"
              disabled={loading}
              spellCheck={false}
            />
          </div>
        </div>
      </form>

      {successResult && (
        <div className="success-box success-box--dashboard" style={{ marginTop: '12px' }}>
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
              Original: {successResult.originalUrl}
            </div>
            <div className="result-actions">
              <CopyButton text={successResult.shortUrl} />
              <ShareButton url={successResult.shortUrl} />
              <a
                href={successResult.shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <ExternalLink size={16} />
                Open
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
