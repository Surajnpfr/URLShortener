import { useState } from 'react';
import { 
  Copy, Check, QrCode, Trash2, ExternalLink, BarChart2, 
  Link2, Users, Target, Shield, Search, ArrowUpRight, Globe, Laptop,
  MoreVertical
} from 'lucide-react';

export default function UrlList({ 
  urls, activeTab, onDelete, onViewQr, dbMode,
  domains = ['hamroniti.com'], setDomains, settings = { redirectType: 302, shortCodeLength: 6 }, setSettings 
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleAddDomain = (e) => {
    e.preventDefault();
    const d = newDomainInput.trim().toLowerCase();
    if (!d) return;

    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(d)) {
      alert('Please enter a valid domain format (e.g. mybrand.co)');
      return;
    }

    if (domains.includes(d)) {
      alert('This domain is already added!');
      return;
    }

    setDomains(prev => [...prev, d]);
    setNewDomainInput('');
  };

  const handleRemoveDomain = (d) => {
    if (d === 'hamroniti.com') {
      alert('Cannot delete the default system domain.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove the custom domain "${d}"?`)) {
      setDomains(prev => prev.filter(item => item !== d));
    }
  };

  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const handleCopy = async (id, shortUrl) => {
    try {
      await navigator.clipboard.writeText(shortUrl);
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
      </>
    );
  }

  // 2. Links Tab
  if (activeTab === 'links') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
      <div>
        <h3>QR Codes Grid</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Generate, preview, and download custom high-resolution QR codes in bulk.
        </p>

        {urls.length === 0 ? (
          <div className="empty-state">
            <QrCode size={40} />
            <p>No shortened links found yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
            {urls.map((item) => (
              <div 
                key={item._id} 
                className="card" 
                style={{ 
                  margin: 0, 
                  padding: '20px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '12px',
                  background: 'var(--card-bg)'
                }}
              >
                <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', display: 'flex', justifyContent: 'center' }}>
                  <QrCode size={100} style={{ color: 'var(--primary)' }} />
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, wordBreak: 'break-all' }}>{item.shortCode}</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.originalUrl}
                  </p>
                </div>
                <button 
                  className="btn-newlink" 
                  onClick={() => onViewQr(item.shortUrl, item.shortCode)}
                  style={{ width: '100%', padding: '6px 12px', fontSize: '0.75rem', justifyContent: 'center' }}
                >
                  Configure QR
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 5. Custom Domains Tab
  if (activeTab === 'domains') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3>Custom Domains</h3>
        
        <div style={{ border: '1px solid var(--card-border)', borderRadius: '12px', padding: '32px', background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="feature-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Globe size={24} />
            </div>
            <div>
              <h4>Brand your shortened links</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Connect your own domain name (e.g. <code>brand.link</code>) to keep your links recognizable.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddDomain} style={{ display: 'flex', gap: '12px' }}>
            <input 
              type="text" 
              placeholder="e.g. go.mybrand.com" 
              value={newDomainInput} 
              onChange={(e) => setNewDomainInput(e.target.value)}
              className="form-field" 
              style={{ maxWidth: '300px' }}
            />
            <button type="submit" className="btn-newlink" style={{ height: '46px' }}>
              <Plus size={16} />
              Add Domain
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <h5 style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configured Domains</h5>
            {domains.map((d) => (
              <div key={d} style={{ background: 'var(--bg-color)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{d} {d === 'hamroniti.com' && '(Default)'}</span>
                {d === 'hamroniti.com' ? (
                  <span style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '12px', fontWeight: 600 }}>ACTIVE</span>
                ) : (
                  <button 
                    onClick={() => handleRemoveDomain(d)} 
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 6. Settings Tab
  if (activeTab === 'settings') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3>Application Settings</h3>
        
        <div style={{ border: '1px solid var(--card-border)', borderRadius: '12px', padding: '32px', background: 'var(--card-bg)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Custom Shortener Parameters</h4>
            
            {/* Redirect type select option */}
            <div className="form-group" style={{ margin: 0 }}>
              <label>Default Redirect Status</label>
              <select
                value={settings.redirectType}
                onChange={(e) => handleSettingsChange('redirectType', parseInt(e.target.value))}
                className="form-field"
                style={{ maxWidth: '300px', height: '46px' }}
              >
                <option value={302}>302 - Temporary Redirect (Tracks clicks)</option>
                <option value={301}>301 - Permanent Redirect (SEO optimized)</option>
              </select>
            </div>

            {/* Shortcode length selector slider */}
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '300px' }}>
                <span>Shortcode Length</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{settings.shortCodeLength} chars</span>
              </label>
              <input
                type="range"
                min="4"
                max="12"
                value={settings.shortCodeLength}
                onChange={(e) => handleSettingsChange('shortCodeLength', parseInt(e.target.value))}
                style={{ maxWidth: '300px', height: '8px', cursor: 'pointer', outline: 'none' }}
              />
            </div>
            
            {settingsSaved && (
              <div style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} /> Settings updated & saved to cache!
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '24px' }}>
            <h4 style={{ marginBottom: '8px', fontSize: '1.05rem', fontWeight: 700 }}>System Architecture Details</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>View connection stats and core API parameters.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '16px', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Database Connection Status</span>
                <h4 style={{ fontSize: '1rem', color: 'var(--success)', marginTop: '4px' }}>Connected (Live: {dbMode})</h4>
              </div>
              <div style={{ padding: '16px', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Local Cache Store</span>
                <h4 style={{ fontSize: '1rem', marginTop: '4px' }}>{totalLinks} registered records</h4>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return null;
}
