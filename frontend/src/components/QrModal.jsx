import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Download } from 'lucide-react';

export default function QrModal({ isOpen, onClose, url, shortCode }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && canvasRef.current && url) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 240,
          margin: 1.5,
          color: {
            dark: '#0b0f19', // Dark navy to blend nicely
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('Error generating QR Code:', error);
        }
      );
    }
  }, [isOpen, url]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `qr-code-${shortCode}.png`;
    link.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={24} />
        </button>
        <h3>QR Code Link</h3>
        <p>Scan to redirect instantly</p>
        
        <div className="qr-container">
          <canvas ref={canvasRef} />
        </div>
        
        <p style={{ wordBreak: 'break-all', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {url}
        </p>

        <div className="modal-actions">
          <button className="btn" style={{ width: '100%' }} onClick={handleDownload}>
            <Download size={18} />
            Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
}
