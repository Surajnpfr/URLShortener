import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyButton({ text, className = 'btn btn-secondary', label = 'Copy', copiedLabel = 'Copied!' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <button type="button" onClick={handleCopy} className={className} title="Copy">
      {copied ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
      {copied ? copiedLabel : label}
    </button>
  );
}
