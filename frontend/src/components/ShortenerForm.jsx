import { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Link2, Copy, Check, QrCode, AlertCircle, Download } from 'lucide-react';
import { drawQrCanvas, getQrSvgString, downloadFile } from './qrCodeUtils.jsx';
import { shortenUrl } from '../lib/urlApi';

export default function ShortenerForm({
  onShortenSuccess,
  onViewQr,
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
  const [successQrSvg, setSuccessQrSvg] = useState('');
  const [successQrLoading, setSuccessQrLoading] = useState(false);

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

      const formattedResult = { ...data };

      setSuccessResult(formattedResult);
      setUrl('');
      setCustomAlias('');
      setSuccessQrSvg('');
      setSuccessQrLoading(true);

      const svg = await getQrSvgString(formattedResult.shortUrl);
      if (svg) {
        setSuccessQrSvg(svg);
      }
      setSuccessQrLoading(false);
      
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#2563eb', '#3b82f6', '#60a5fa', '#16a34a'],
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

  const handleDownloadSuccessPng = async () => {
    if (!successResult) return;
    const canvas = document.createElement('canvas');
    await drawQrCanvas(canvas, successResult.shortUrl);
    downloadFile(canvas.toDataURL('image/png'), `qr-code-${successResult.shortCode}.png`, 'image/png');
  };

  const handleDownloadSuccessSvg = () => {
    if (!successResult || !successQrSvg) return;
    downloadFile(successQrSvg, `qr-code-${successResult.shortCode}.svg`, 'image/svg+xml');
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
          <div className="success-card-grid">
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
              <div className="success-download-row">
                <button type="button" className="success-download-link" onClick={handleDownloadSuccessPng}>
                  <Download size={14} /> Download QR
                </button>
                <button type="button" className="success-download-link" onClick={handleDownloadSuccessPng}>
                  PNG
                </button>
                <button type="button" className="success-download-link" onClick={handleDownloadSuccessSvg}>
                  SVG
                </button>
              </div>
            </div>
            <div className="success-qr-preview">
              {successQrLoading ? (
                <div className="success-qr-placeholder">Loading QR...</div>
              ) : (
                <div className="success-qr-svg" dangerouslySetInnerHTML={{ __html: successQrSvg }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
