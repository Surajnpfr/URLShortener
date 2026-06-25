import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, KeyRound, RefreshCw, Trash2 } from 'lucide-react';
import { createApiKey, fetchApiKey, revokeApiKey } from '../services/api';
import CopyButton from './CopyButton';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ApiKeyPanel() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [hasKey, setHasKey] = useState(false);
  const [revealedKey, setRevealedKey] = useState('');
  const [keyName, setKeyName] = useState('Default');

  const loadKey = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchApiKey();
      setHasKey(Boolean(data.hasKey));
      setMetadata(data.apiKey || null);
    } catch (err) {
      setError(err.message || 'Failed to load API key status.');
      setHasKey(false);
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadKey();
  }, [loadKey]);

  const handleGenerate = async () => {
    const message = hasKey
      ? 'Generating a new key will revoke your current key immediately. Continue?'
      : 'Generate a new API key for bots and scripts?';

    if (!window.confirm(message)) {
      return;
    }

    setActionLoading(true);
    setError('');
    setRevealedKey('');

    try {
      const data = await createApiKey(keyName.trim() || 'Default');
      setRevealedKey(data.key || '');
      setHasKey(true);
      setMetadata(data.apiKey || null);
    } catch (err) {
      setError(err.message || 'Failed to generate API key.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!window.confirm('Revoke your API key? Bots using it will stop working immediately.')) {
      return;
    }

    setActionLoading(true);
    setError('');
    setRevealedKey('');

    try {
      await revokeApiKey();
      setHasKey(false);
      setMetadata(null);
    } catch (err) {
      setError(err.message || 'Failed to revoke API key.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="settings-loading-state">Loading API key…</div>;
  }

  return (
    <section className="settings-flat-section api-key-panel">
      <h3 className="settings-flat-heading">
        <KeyRound size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
        API key
      </h3>
      <p className="api-intro">
        One active key per account. Use it as <code>Authorization: Bearer YOUR_KEY</code> in Telegram bots,
        Discord bots, curl, or any server script.
      </p>

      {error ? (
        <div className="error-banner error-banner--compact" style={{ marginBottom: '12px' }}>
          <span>{error}</span>
        </div>
      ) : null}

      <dl className="detail-list detail-list--settings api-meta-list">
        <div className="detail-list-row">
          <dt>Status</dt>
          <dd>{hasKey ? 'Active' : 'No key generated'}</dd>
        </div>
        {metadata ? (
          <>
            <div className="detail-list-row">
              <dt>Name</dt>
              <dd>{metadata.name}</dd>
            </div>
            <div className="detail-list-row">
              <dt>Prefix</dt>
              <dd><code>{metadata.prefix}…</code></dd>
            </div>
            <div className="detail-list-row">
              <dt>Created</dt>
              <dd>{formatDate(metadata.createdAt)}</dd>
            </div>
            <div className="detail-list-row">
              <dt>Last used</dt>
              <dd>{formatDate(metadata.lastUsedAt)}</dd>
            </div>
          </>
        ) : null}
      </dl>

      <div className="settings-edit-row" style={{ marginTop: '12px', marginBottom: '12px' }}>
        <label htmlFor="api-key-name">Key label</label>
        <input
          id="api-key-name"
          type="text"
          className="settings-input"
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
          placeholder="e.g. Telegram Bot"
          disabled={actionLoading}
        />
      </div>

      <div className="settings-action-row">
        <button
          type="button"
          className="settings-action-btn"
          onClick={handleGenerate}
          disabled={actionLoading}
        >
          <RefreshCw size={16} />
          {hasKey ? 'Regenerate key' : 'Generate key'}
        </button>
        {hasKey ? (
          <button
            type="button"
            className="settings-action-btn outlined danger"
            onClick={handleRevoke}
            disabled={actionLoading}
          >
            <Trash2 size={16} />
            Revoke key
          </button>
        ) : null}
      </div>

      {revealedKey ? (
        <div className="api-key-reveal" style={{ marginTop: '16px' }}>
          <div className="api-key-reveal-warning">
            <AlertTriangle size={16} />
            <span>Copy this key now. It will not be shown again.</span>
          </div>
          <code className="api-key-reveal-value">{revealedKey}</code>
          <div className="settings-action-row" style={{ marginTop: '10px' }}>
            <CopyButton
              text={revealedKey}
              className="settings-action-btn"
              label="Copy API key"
              copiedLabel="Copied"
            />
            <button
              type="button"
              className="settings-action-btn outlined"
              onClick={() => setRevealedKey('')}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
