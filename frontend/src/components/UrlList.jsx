import { useEffect, useState } from 'react';
import { copyToClipboard, getShortDisplay } from './linkUtils';
import { 
  Copy, Check, Trash2, BarChart2, 
  Search,
  MoreVertical,
  Share2,
} from 'lucide-react';
import AccountSettingsPage from './AccountSettingsPage';
import ShareButton from './ShareButton';
import { pathForTab } from '../router';
import { fetchAnalyticsSummary, fetchLinkAnalytics } from '../lib/urlApi';

const truncateUrl = (value, maxLength = 54) => getShortDisplay(value, maxLength);

const Metric = ({ label, value }) => (
  <div className="metric-item">
    <span className="metric-label">{label}</span>
    <span className="metric-value">{value}</span>
  </div>
);

function buildSparklinePath(clicksByDay = []) {
  if (!clicksByDay.length) {
    return 'M 0 8 L 48 8';
  }

  const values = clicksByDay.map((day) => day.clicks || 0);
  const max = Math.max(...values, 1);

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 48;
      const y = 16 - (value / max) * 14 - 1;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

const AnalyticsChart = ({ clicksByDay }) => {
  if (!clicksByDay?.length) {
    return (
      <div className="empty-state empty-state--inline">
        <p>No click activity in this period yet.</p>
      </div>
    );
  }

  const maxClicks = Math.max(...clicksByDay.map((day) => day.clicks || 0), 1);

  return (
    <div className="analytics-chart">
      {clicksByDay.map((day) => (
        <div key={day.date} className="analytics-chart-bar-wrap" title={`${day.date}: ${day.clicks} clicks`}>
          <div
            className="analytics-chart-bar"
            style={{ height: `${Math.max(((day.clicks || 0) / maxClicks) * 100, 4)}%` }}
          />
          <span className="analytics-chart-label">{day.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
};

export default function UrlList({
  urls, activeTab, onDelete, onOpenAnalytics, onNavigate, onLogout,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [linkSparklines, setLinkSparklines] = useState({});
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [selectedLinkAnalytics, setSelectedLinkAnalytics] = useState(null);
  const [analyticsRange, setAnalyticsRange] = useState('7d');

  const handleCopy = async (id, shortUrl) => {
    try {
      await copyToClipboard(shortUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleShare = async (shortUrl) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Linkly short link', url: shortUrl });
      } else {
        await copyToClipboard(shortUrl);
      }
    } catch (error) {
      if (error?.name === 'AbortError') return;
      try {
        await copyToClipboard(shortUrl);
      } catch (copyError) {
        console.error('Failed to share link:', copyError);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num;
  };

  useEffect(() => {
    if (activeTab !== 'dashboard' && activeTab !== 'analytics') {
      return undefined;
    }

    let cancelled = false;

    const loadSummary = async () => {
      setAnalyticsLoading(true);
      try {
        const summary = await fetchAnalyticsSummary(analyticsRange);
        if (!cancelled) setAnalyticsSummary(summary);
      } catch (error) {
        console.error('Failed to load analytics summary:', error);
        if (!cancelled) setAnalyticsSummary(null);
      } finally {
        if (!cancelled) setAnalyticsLoading(false);
      }
    };

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, [activeTab, analyticsRange, urls.length]);

  useEffect(() => {
    if (activeTab !== 'dashboard' || urls.length === 0) {
      return undefined;
    }

    let cancelled = false;
    const recent = urls.slice(0, 5);

    const loadSparklines = async () => {
      const entries = await Promise.all(
        recent.map(async (item) => {
          try {
            const data = await fetchLinkAnalytics(item._id, '7d');
            return [item._id, data.clicksByDay || []];
          } catch {
            return [item._id, []];
          }
        }),
      );

      if (!cancelled) {
        setLinkSparklines(Object.fromEntries(entries));
      }
    };

    void loadSparklines();

    return () => {
      cancelled = true;
    };
  }, [activeTab, urls]);

  const openLinkAnalytics = async (urlId) => {
    setSelectedLinkId(urlId);
    try {
      const data = await fetchLinkAnalytics(urlId, '30d');
      setSelectedLinkAnalytics(data);
      onOpenAnalytics?.();
      onNavigate?.(pathForTab('analytics'));
    } catch (error) {
      console.error('Failed to load link analytics:', error);
      alert(error.message || 'Unable to load link analytics.');
    }
  };

  useEffect(() => {
    if (activeTab !== 'analytics' || !selectedLinkId) {
      return undefined;
    }

    let cancelled = false;

    const loadSelected = async () => {
      try {
        const data = await fetchLinkAnalytics(selectedLinkId, analyticsRange);
        if (!cancelled) setSelectedLinkAnalytics(data);
      } catch (error) {
        console.error('Failed to load selected link analytics:', error);
      }
    };

    void loadSelected();

    return () => {
      cancelled = true;
    };
  }, [activeTab, selectedLinkId, analyticsRange]);

  const totalLinks = analyticsSummary?.linkCount ?? urls.length;
  const totalClicks = analyticsSummary?.totalClicks ?? urls.reduce((sum, item) => sum + (item.clicks || 0), 0);
  const uniqueVisitors = analyticsSummary?.uniqueVisitors ?? 0;
  const avgClicksPerLink = totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : '0';
  const topLink = analyticsSummary?.topLinks?.[0] || (urls.length > 0
    ? [...urls].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))[0]
    : null);

  const filteredUrls = urls.filter(url => 
    url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    url.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rangeControls = (
    <div className="analytics-range-controls">
      {['7d', '30d', '90d', 'all'].map((range) => (
        <button
          key={range}
          type="button"
          className={`analytics-range-btn${analyticsRange === range ? ' is-active' : ''}`}
          onClick={() => setAnalyticsRange(range)}
        >
          {range === 'all' ? 'All' : range.toUpperCase()}
        </button>
      ))}
    </div>
  );

  if (activeTab === 'dashboard') {
    return (
      <div className="dashboard-panel-body">
        <div className="metrics-bar">
          <Metric label="Links" value={totalLinks} />
          <Metric label="Clicks" value={formatNumber(totalClicks)} />
          <Metric label="Unique" value={formatNumber(uniqueVisitors)} />
          <Metric label="Avg. clicks/link" value={avgClicksPerLink} />
        </div>

        <section className="panel-block">
          <div className="panel-block-header">
            <h3>Recent links</h3>
            <button
              type="button"
              className="btn-text"
              onClick={() => onNavigate?.(pathForTab('links'))}
            >
              View all
            </button>
          </div>

          {filteredUrls.length === 0 ? (
            <div className="empty-state empty-state--inline">
              <p>No links yet. Paste a URL above to create your first short link.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="urls-table">
                <thead>
                  <tr>
                    <th>Destination</th>
                    <th>Short Link</th>
                    <th>Clicks</th>
                    <th>Created</th>
                    <th style={{ width: '80px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUrls.slice(0, 5).map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="table-original-url" title={item.originalUrl} style={{ maxWidth: '280px', fontWeight: 500 }}>
                          {item.originalUrl}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <a
                            href={item.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="table-short-url"
                          >
                            {item.shortUrl.replace(/^https?:\/\//, '')}
                          </a>
                          <button
                            onClick={() => handleCopy(item._id, item.shortUrl)}
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                            title="Copy short link"
                          >
                            {copiedId === item._id ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="click-badge" style={{ background: 'var(--input-bg)', color: 'var(--text-secondary)' }}>
                            {formatNumber(item.clicks || 0)}
                          </span>
                          <svg className="sparkline-svg" width="48" height="16" viewBox="0 0 48 16">
                            <path
                              d={buildSparklinePath(linkSparklines[item._id])}
                              stroke={(item.clicks || 0) > 0 ? 'var(--primary)' : 'var(--text-muted)'}
                              fill="none"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>
                      </td>
                      <td>
                        <span className="date-text">{formatDate(item.createdAt)}</span>
                      </td>
                      <td>
                        <div className="link-row-actions">
                          <button
                            onClick={() => handleCopy(item._id, item.shortUrl)}
                            className="link-row-action"
                            title="Copy Link"
                          >
                            {copiedId === item._id ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                          </button>
                          <button
                            onClick={() => void openLinkAnalytics(item._id)}
                            className="link-row-action"
                            title="Analytics"
                          >
                            <BarChart2 size={14} />
                          </button>
                          <ShareButton
                            url={item.shortUrl}
                            className="link-row-action"
                            iconOnly
                            label=""
                          />
                          <div className="actions-menu-wrapper" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === item._id ? null : item._id)}
                              className="btn-dots"
                              title="More"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {activeMenuId === item._id && (
                              <div className="dots-dropdown">
                                <button
                                  onClick={() => {
                                    onDelete(item._id);
                                    setActiveMenuId(null);
                                  }}
                                  className="dropdown-item danger-item"
                                >
                                  <Trash2 size={13} />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  }

  if (activeTab === 'links') {
    return (
      <div className="dashboard-panel-body">
        <div className="panel-toolbar panel-toolbar--compact">
          <span className="panel-toolbar-meta">{filteredUrls.length} link{filteredUrls.length === 1 ? '' : 's'}</span>
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
            <p>{urls.length === 0 ? 'No links yet.' : 'No results for that search.'}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="urls-table">
              <thead>
                <tr>
                  <th>Destination</th>
                  <th>Short Link</th>
                  <th>Clicks</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUrls.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="table-original-url" title={item.originalUrl} style={{ maxWidth: '300px' }}>
                        {item.originalUrl}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <a
                          href={item.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="table-short-url"
                        >
                          {item.shortUrl.replace(/^https?:\/\//, '')}
                        </a>
                        <button
                          onClick={() => handleCopy(item._id, item.shortUrl)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                          {copiedId === item._id ? <Check size={13} style={{ color: 'var(--success)' }} /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className="click-badge">{formatNumber(item.clicks || 0)}</span>
                    </td>
                    <td>
                      <span className="date-text">{formatDate(item.createdAt)}</span>
                    </td>
                    <td>
                      <div className="actions-menu-wrapper" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === item._id ? null : item._id)}
                          className="btn-dots"
                          title="Actions"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {activeMenuId === item._id && (
                          <div className="dots-dropdown">
                            <button
                              onClick={() => {
                                handleCopy(item._id, item.shortUrl);
                                setActiveMenuId(null);
                              }}
                              className="dropdown-item"
                            >
                              <Copy size={13} />
                              Copy Link
                            </button>
                            <button
                              onClick={() => {
                                void openLinkAnalytics(item._id);
                                setActiveMenuId(null);
                              }}
                              className="dropdown-item"
                            >
                              <BarChart2 size={13} />
                              Analytics
                            </button>
                            <button
                              onClick={() => {
                                void handleShare(item.shortUrl);
                                setActiveMenuId(null);
                              }}
                              className="dropdown-item"
                            >
                              <Share2 size={13} />
                              Share Link
                            </button>
                            <button
                              onClick={() => {
                                onDelete(item._id);
                                setActiveMenuId(null);
                              }}
                              className="dropdown-item danger-item"
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'analytics') {
    return (
      <div className="dashboard-panel-body">
        <div className="panel-toolbar panel-toolbar--compact">
          <span className="panel-toolbar-meta">Performance overview</span>
          {rangeControls}
        </div>

        <div className="metrics-bar">
          <Metric label="Total clicks" value={formatNumber(totalClicks)} />
          <Metric label="Unique visitors" value={formatNumber(uniqueVisitors)} />
          <Metric label="Links" value={totalLinks} />
          <Metric label="Top shortcode" value={topLink?.shortCode || '—'} />
        </div>

        {analyticsLoading ? (
          <div className="settings-loading-state">Loading analytics…</div>
        ) : (
          <>
            <section className="panel-block">
              <div className="panel-block-header">
                <h3>Clicks over time</h3>
              </div>
              <AnalyticsChart clicksByDay={analyticsSummary?.clicksByDay || []} />
            </section>

            {analyticsSummary?.topLinks?.length > 0 && (
              <section className="panel-block">
                <div className="panel-block-header">
                  <h3>Top links</h3>
                </div>
                <dl className="detail-list">
                  {analyticsSummary.topLinks.map((link) => (
                    <div className="detail-list-row" key={link.urlId || link.shortCode}>
                      <dt>{link.shortCode}</dt>
                      <dd>
                        {formatNumber(link.clicks)} clicks · {formatNumber(link.unique)} unique
                        <button
                          type="button"
                          className="btn-text"
                          style={{ marginLeft: '12px' }}
                          onClick={() => {
                            setSelectedLinkId(link.urlId);
                            setSelectedLinkAnalytics(null);
                          }}
                        >
                          View details
                        </button>
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {selectedLinkAnalytics && (
              <section className="panel-block">
                <div className="panel-block-header">
                  <h3>Link details: {selectedLinkAnalytics.shortCode}</h3>
                </div>
                <dl className="detail-list">
                  <div className="detail-list-row">
                    <dt>Destination</dt>
                    <dd title={selectedLinkAnalytics.originalUrl}>{truncateUrl(selectedLinkAnalytics.originalUrl, 64)}</dd>
                  </div>
                  <div className="detail-list-row">
                    <dt>Clicks</dt>
                    <dd>{formatNumber(selectedLinkAnalytics.totalClicks)}</dd>
                  </div>
                  <div className="detail-list-row">
                    <dt>Unique visitors</dt>
                    <dd>{formatNumber(selectedLinkAnalytics.uniqueVisitors)}</dd>
                  </div>
                </dl>
                <AnalyticsChart clicksByDay={selectedLinkAnalytics.clicksByDay || []} />
                {selectedLinkAnalytics.topReferrers?.length > 0 && (
                  <dl className="detail-list" style={{ marginTop: '16px' }}>
                    <div className="detail-list-row">
                      <dt>Top referrers</dt>
                      <dd>
                        {selectedLinkAnalytics.topReferrers.map((ref) => (
                          <div key={ref.referrer}>{truncateUrl(ref.referrer, 48)} — {ref.clicks}</div>
                        ))}
                      </dd>
                    </div>
                  </dl>
                )}
              </section>
            )}

            {!topLink && !analyticsLoading && (
              <div className="empty-state empty-state--inline">
                <p>Analytics will appear once you have links with clicks.</p>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  if (activeTab === 'settings') {
    return (
      <div className="dashboard-panel-body dashboard-panel-body--settings">
        <AccountSettingsPage onNavigate={onNavigate} onLogout={onLogout} />
      </div>
    );
  }

  return null;
}
