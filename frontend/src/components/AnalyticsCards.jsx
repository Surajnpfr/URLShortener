function formatNumber(value) {
  return new Intl.NumberFormat().format(value ?? 0);
}

export default function AnalyticsCards({ summary, loading, error }) {
  if (loading) {
    return <div className="settings-loading-state">Loading analytics…</div>;
  }

  if (error) {
    return (
      <div className="error-banner error-banner--compact">
        <span>{error}</span>
      </div>
    );
  }

  const totalUrls = summary?.totalUrls ?? summary?.linkCount ?? 0;
  const totalClicks = summary?.totalClicks ?? 0;

  return (
    <div className="dashboard-metrics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '16px' }}>
      <div className="metric-item">
        <span className="metric-label">Total URLs</span>
        <span className="metric-value">{formatNumber(totalUrls)}</span>
      </div>
      <div className="metric-item">
        <span className="metric-label">Total Clicks</span>
        <span className="metric-value">{formatNumber(totalClicks)}</span>
      </div>
    </div>
  );
}
