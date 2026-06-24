import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

export default function ShareButton({
  url,
  title = 'Linkly short link',
  className = 'btn btn-secondary',
  label = 'Share',
  copiedLabel = 'Shared!',
  iconOnly = false,
}) {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    if (!url) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: title,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch (error) {
      if (error?.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(url);
        setShared(true);
        window.setTimeout(() => setShared(false), 2000);
      } catch (copyError) {
        console.error('Failed to share link:', copyError);
      }
    }
  };

  return (
    <button type="button" onClick={handleShare} className={className} title="Share link">
      {shared ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Share2 size={14} />}
      {!iconOnly ? (shared ? copiedLabel : label) : null}
    </button>
  );
}
