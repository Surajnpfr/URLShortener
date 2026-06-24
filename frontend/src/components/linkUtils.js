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

export const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};
