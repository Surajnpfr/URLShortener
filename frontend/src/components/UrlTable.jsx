import { useMemo, useState } from 'react';
import { Search, Trash2, ExternalLink } from 'lucide-react';
import CopyButton from './CopyButton';

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value ?? 0);
}

export default function UrlTable({ urls = [], onDelete, loading, error }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUrls = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return urls;
    return urls.filter(
      (item) =>
        item.originalUrl?.toLowerCase().includes(q)
        || item.shortUrl?.toLowerCase().includes(q)
        || item.shortCode?.toLowerCase().includes(q),
    );
  }, [urls, searchQuery]);

  if (loading) {
    return <div className="settings-loading-state">Loading links…</div>;
  }

  if (error) {
    return (
      <div className="error-banner error-banner--compact">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <section className="dashboard-panel-body">
      <div className="panel-toolbar panel-toolbar--compact">
        <span className="panel-toolbar-meta">
          {filteredUrls.length} link{filteredUrls.length === 1 ? '' : 's'}
        </span>
        <div className="input-wrapper panel-search">
          <Search size={16} className="input-icon" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ padding: '10px 10px 10px 40px', borderRadius: '12px', fontSize: '0.875rem' }}
          />
        </div>
      </div>

      {filteredUrls.length === 0 ? (
        <div className="empty-state empty-state--inline">
          <p>{urls.length === 0 ? 'No links yet. Shorten your first URL above.' : 'No results for that search.'}</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="urls-table">
            <thead>
              <tr>
                <th>Short URL</th>
                <th>Original URL</th>
                <th>Clicks</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUrls.map((item) => (
                <tr key={item._id || item.id}>
                  <td>
                    <a
                      href={item.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="table-short-url"
                    >
                      {item.shortUrl?.replace(/^https?:\/\//, '')}
                    </a>
                  </td>
                  <td>
                    <div className="table-original-url" title={item.originalUrl}>
                      {item.originalUrl}
                    </div>
                  </td>
                  <td>
                    <span className="click-badge">{formatNumber(item.clicks || 0)}</span>
                  </td>
                  <td>
                    <span className="date-text">{formatDate(item.createdAt)}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <CopyButton
                        text={item.shortUrl}
                        className="btn btn-secondary"
                        label="Copy"
                        copiedLabel="Copied"
                      />
                      <a
                        href={item.shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        <ExternalLink size={14} />
                        Open
                      </a>
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(item._id || item.id)}
                          className="btn btn-secondary"
                          style={{ color: 'var(--danger, #ef4444)' }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
