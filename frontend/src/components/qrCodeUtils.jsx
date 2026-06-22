import QRCode from 'qrcode';

export const QR_OPTIONS = {
  width: 256,
  margin: 1,
  color: {
    dark: '#18210f',
    light: '#ffffff',
  },
};

export const QR_SVG_OPTIONS = {
  type: 'svg',
  margin: 1,
  color: {
    dark: '#18210f',
    light: '#ffffff',
  },
};

export const getShortLabel = (value) => {
  if (!value) return 'Link';
  try {
    const parsed = new URL(value);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
};

export const getShortDisplay = (value, maxLength = 48) => {
  if (!value) return '—';
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
};

export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
};

export const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};

export const getQrSvgString = async (text) => {
  return QRCode.toString(text, QR_SVG_OPTIONS);
};

export const drawQrCanvas = async (canvas, text) => {
  if (!canvas) return;
  await QRCode.toCanvas(canvas, text, QR_OPTIONS);
};

export const getQrDataUrl = async (text) => {
  return QRCode.toDataURL(text, { ...QR_OPTIONS, margin: 1, width: 512 });
};
