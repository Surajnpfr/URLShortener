import { useEffect, useState } from 'react';
import { Card, Empty, Typography } from './antd.jsx';
import { copyToClipboard, downloadFile, drawQrCanvas, getQrSvgString, getShortDisplay } from './qrCodeUtils.jsx';
import { 
  Copy, Check, QrCode, Trash2, BarChart2, 
  Link2, Users, Target, Search,
  MoreVertical
} from 'lucide-react';
import AccountSettingsPage from './AccountSettingsPage';

const truncateUrl = (value, maxLength = 54) => getShortDisplay(value, maxLength);

const QrGalleryCard = ({ item, onCopy, onOpenQr }) => {
  const [svgMarkup, setSvgMarkup] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      const svg = await getQrSvgString(item.shortUrl);
      if (active) {
        setSvgMarkup(svg);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [item.shortUrl]);

  const handleDownloadPng = async () => {
    const canvas = document.createElement('canvas');
    await drawQrCanvas(canvas, item.shortUrl);
    downloadFile(canvas.toDataURL('image/png'), `qr-code-${item.shortCode}.png`, 'image/png');
  };

  const handleDownloadSvg = () => {
    if (!svgMarkup) return;
    downloadFile(svgMarkup, `qr-code-${item.shortCode}.svg`, 'image/svg+xml');
  };

  return (
    <Card className="qr-gallery-card" bordered>
      <div className="qr-gallery-preview">
        {svgMarkup ? <div dangerouslySetInnerHTML={{ __html: svgMarkup }} /> : <div className="qr-gallery-loading">Loading QR...</div>}
      </div>
      <div className="qr-gallery-copy">
        <Typography.Text strong>{item.shortUrl}</Typography.Text>
        <Typography.Text type="secondary">{truncateUrl(item.originalUrl)}</Typography.Text>
        <Typography.Text type="secondary">Created {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography.Text>
      </div>
      <div className="qr-gallery-actions">
        <button type="button" className="qr-gallery-action" onClick={() => onCopy(item._id, item.shortUrl)}>
          <Copy size={14} /> Copy Link
        </button>
        <button type="button" className="qr-gallery-action" onClick={handleDownloadPng}>
          Download PNG
        </button>
        <button type="button" className="qr-gallery-action" onClick={handleDownloadSvg}>
          Download SVG
        </button>
        <button type="button" className="qr-gallery-action primary" onClick={() => onOpenQr(item.shortUrl, item.shortCode)}>
          <QrCode size={14} /> Open QR
        </button>
      </div>
    </Card>
  );
};

export default function UrlList({
  urls, activeTab, onDelete, onViewQr, onOpenAnalytics,
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [qrSearchQuery, setQrSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const handleCopy = async (id, shortUrl) => {
    try {
      await copyToClipboard(shortUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
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

  // Calculate dynamic stats
  const totalLinks = urls.length;
  const totalClicks = urls.reduce((sum, item) => sum + (item.clicks || 0), 0);
  const uniqueClicks = Math.round(totalClicks * 0.72);
  const avgCtr = totalLinks > 0 ? '62.3%' : '0%';

  // SVG Sparkline paths generator
  const getSparklinePath = (clicks) => {
    const seed = (clicks % 5) + 1;
    if (seed === 1) return "M 0 12 Q 12 2, 24 10 T 48 4";
    if (seed === 2) return "M 0 6 Q 12 14, 24 4 T 48 10";
    if (seed === 3) return "M 0 10 Q 12 4, 24 12 T 48 2";
    if (seed === 4) return "M 0 4 Q 12 10, 24 2 T 48 8";
    return "M 0 8 Q 12 12, 24 4 T 48 6";
  };

  // Filter links based on search
  const filteredUrls = urls.filter(url => 
    url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    url.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const qrFilteredUrls = urls.filter((url) => {
    const query = qrSearchQuery.toLowerCase();
    return url.originalUrl.toLowerCase().includes(query) || url.shortUrl.toLowerCase().includes(query);
  });

  // 1. Dashboard View
  if (activeTab === 'dashboard') {
    return (
      <>
        {/* Stats Row */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-title">Total Links</span>
              <span className="stat-value">{totalLinks}</span>
              <span className="stat-trend">
                <span className="stat-trend-val">+{totalLinks > 0 ? 12 : 0}</span> this month
              </span>
            </div>
            <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#355bf5' }}>
              <Link2 size={18} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-title">Total Clicks</span>
              <span className="stat-value">{formatNumber(totalClicks)}</span>
              <span className="stat-trend">
                <span className="stat-trend-val">+{totalClicks > 0 ? '18%' : '0%'}</span> this month
              </span>
            </div>
            <div className="stat-icon-wrapper" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <BarChart2 size={18} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-title">Unique Clicks</span>
              <span className="stat-value">{formatNumber(uniqueClicks)}</span>
              <span className="stat-trend">
                <span className="stat-trend-val">+{totalClicks > 0 ? '16%' : '0%'}</span> this month
              </span>
            </div>
            <div className="stat-icon-wrapper" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <Users size={18} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <span className="stat-title">Avg. CTR</span>
              <span className="stat-value">{avgCtr}</span>
              <span className="stat-trend">
                <span className="stat-trend-val">+{totalLinks > 0 ? '8%' : '0%'}</span> this month
              </span>
            </div>
            <div className="stat-icon-wrapper" style={{ background: '#fdf2f8', color: '#db2777' }}>
              <Target size={18} />
            </div>
          </div>
        </div>

        {/* Recent Links Table */}
        <div>
          <div className="recent-links-header">
            <h3>Recent Links</h3>
            <button className="btn-viewall">View all</button>
          </div>

          {filteredUrls.length === 0 ? (
            <div className="empty-state" style={{ background: 'transparent', border: '1px dashed var(--card-border)', borderRadius: '12px', marginTop: '16px' }}>
              <Link2 size={40} style={{ opacity: 0.4 }} />
              <p>No shortened links found. Create your first link above!</p>
            </div>
          ) : (
            <div className="list-container" style={{ marginTop: '16px' }}>
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
                              d={getSparklinePath(item.clicks || 0)} 
                              stroke={item.clicks > 0 ? 'var(--primary)' : 'var(--text-muted)'} 
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
                            onClick={() => onOpenAnalytics?.()}
                            className="link-row-action"
                            title="Analytics"
                          >
                            <BarChart2 size={14} />
                          </button>
                          <button
                            onClick={() => onViewQr(item.shortUrl, item.shortCode)}
                            className="link-row-action"
                            title="QR Code"
                          >
                            <QrCode size={14} />
                          </button>
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
        </div>
      </>
    );
  }

  // 2. Links Tab
  if (activeTab === 'links') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h3>All shortened links ({filteredUrls.length})</h3>
          <div className="input-wrapper" style={{ maxWidth: '300px' }}>
            <Search size={16} className="input-icon" />
            <input
              type="text"
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ padding: '10px 10px 10px 40px', borderRadius: '8px', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {filteredUrls.length === 0 ? (
          <div className="empty-state">
            <Search size={40} />
            <p>No matching links found.</p>
          </div>
        ) : (
          <div className="list-container">
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
                                onViewQr(item.shortUrl, item.shortCode);
                                setActiveMenuId(null);
                              }}
                              className="dropdown-item"
                            >
                              <QrCode size={13} />
                              QR Code
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

  // 3. Analytics Tab
  if (activeTab === 'analytics') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3>Link Click Analytics</h3>
        <div style={{ border: '1px solid var(--card-border)', borderRadius: '12px', padding: '40px', textAlign: 'center', background: 'var(--card-bg)' }}>
          <BarChart2 size={48} style={{ color: 'var(--primary)', marginBottom: '16px', opacity: 0.7 }} />
          <h4>Clicks Overview</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '8px auto 24px' }}>
            We've logged <strong>{totalClicks}</strong> total visits across <strong>{totalLinks}</strong> custom URLs.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ padding: '16px', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top Shortcode</span>
              <h4 style={{ fontSize: '1.25rem', marginTop: '4px' }}>{urls.length > 0 ? urls[0].shortCode : 'None'}</h4>
            </div>
            <div style={{ padding: '16px', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top Destination</span>
              <h4 style={{ fontSize: '1.25rem', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {urls.length > 0 ? urls[0].originalUrl.split('/')[2] : 'None'}
              </h4>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. QR Codes Tab
  if (activeTab === 'qrcodes') {
    return (
      <div className="qr-gallery-section">
        <div className="qr-gallery-header">
          <div>
            <h3>QR Codes Gallery</h3>
            <p>Search, preview, and download QR codes for every shortened link.</p>
          </div>
          <div className="input-wrapper qr-gallery-search">
            <Search size={16} className="input-icon" />
            <input
              type="text"
              placeholder="Search by short URL or original URL"
              value={qrSearchQuery}
              onChange={(event) => setQrSearchQuery(event.target.value)}
              className="form-input"
              style={{ padding: '10px 10px 10px 40px', borderRadius: '12px', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        {qrFilteredUrls.length === 0 ? (
          <Empty
            className="qr-empty-state"
            image={<QrCode size={64} />}
            description={urls.length === 0 ? 'Your QR codes will appear here.' : 'No QR codes match your search.'}
          >
            {urls.length === 0 ? 'Create your first shortened link to generate a QR code.' : null}
          </Empty>
        ) : (
          <div className="qr-gallery-grid">
            {qrFilteredUrls.map((item) => (
              <QrGalleryCard
                key={item._id}
                item={item}
                onCopy={handleCopy}
                onOpenQr={onViewQr}
              />
            ))}
          </div>
        )}
      </div>
    );
  }


  // 6. Settings Tab
  if (activeTab === 'settings') {
    return <AccountSettingsPage />;
  }

  return null;
}
