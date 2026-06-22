import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Link2, Copy, Check, QrCode, AlertCircle, Download } from 'lucide-react';
import { drawQrCanvas, getQrSvgString, downloadFile } from './qrCodeUtils.jsx';

<<<<<<< HEAD
export default function ShortenerForm({ onShortenSuccess, onViewQr, apiBaseUrl, domains = ['drovashop.com'], settings = { redirectType: 302, shortCodeLength: 6 } }) {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [domain, setDomain] = useState(domains[0] || 'drovashop.com');
=======
export default function ShortenerForm({ onShortenSuccess, onViewQr, apiBaseUrl }) {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
>>>>>>> c49193b20b300406eb3aeea420f9305225b431b0
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [successQrSvg, setSuccessQrSvg] = useState('');
  const [successQrLoading, setSuccessQrLoading] = useState(false);

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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      // We override data.shortUrl base domain if user selected a custom domain in the select box!
      // This is purely visual to match the dropdown selection: e.g. replacing 'localhost:5000' with selected domain.
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
        <div className="success-box feature-card-surface" style={{ marginTop: '16px' }}>
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
