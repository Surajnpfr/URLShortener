import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { Modal } from './antd.jsx';
import { copyToClipboard, downloadFile, drawQrCanvas, getQrSvgString } from './qrCodeUtils.jsx';

export default function QrModal({ isOpen, onClose, url, shortCode }) {
  const canvasRef = useRef(null);
  const [svgMarkup, setSvgMarkup] = useState('');
  const [copyState, setCopyState] = useState(false);

  const filenameBase = useMemo(() => {
    if (shortCode) return shortCode;
    if (!url) return 'qr-code';
    try {
      return new URL(url).pathname.replace(/\//g, '-').replace(/^-+|-+$/g, '') || 'qr-code';
    } catch {
      return 'qr-code';
    }
  }, [shortCode, url]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!isOpen || !url) {
        setSvgMarkup('');
        return;
      }

      await drawQrCanvas(canvasRef.current, url);
      const svg = await getQrSvgString(url);
      if (active) {
        setSvgMarkup(svg);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!url) return;
    await copyToClipboard(url);
    setCopyState(true);
    window.setTimeout(() => setCopyState(false), 1800);
  };

  const handleDownloadPng = async () => {
    if (!canvasRef.current || !url) return;
    await drawQrCanvas(canvasRef.current, url);
    downloadFile(canvasRef.current.toDataURL('image/png'), `${filenameBase}.png`, 'image/png');
  };

  const handleDownloadSvg = () => {
    if (!svgMarkup) return;
    downloadFile(svgMarkup, `${filenameBase}.svg`, 'image/svg+xml');
  };

  const footer = (
    <div className="qr-modal-actions">
      <button type="button" className="settings-action-btn outlined" onClick={handleCopy}>
        {copyState ? <Check size={14} /> : <Copy size={14} />}
        {copyState ? 'Copied' : 'Copy Link'}
      </button>
      <button type="button" className="settings-action-btn outlined" onClick={handleDownloadPng}>
        <Download size={14} />
        Download PNG
      </button>
      <button type="button" className="settings-action-btn" onClick={handleDownloadSvg}>
        <Download size={14} />
        Download SVG
      </button>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      title="QR Code"
      onCancel={onClose}
      width={720}
      footer={footer}
      bodyStyle={{ paddingTop: 12 }}
    >
      <div className="qr-modal-content">
        <div className="qr-modal-preview">
          <canvas ref={canvasRef} />
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="qr-modal-link">
          {url}
        </a>
        <p className="qr-modal-note">Scan to open the shortened link instantly.</p>
      </div>
    </Modal>
  );
}
