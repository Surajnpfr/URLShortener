import { useEffect, useState } from 'react';
import { fetchAnalyticsSummary } from '../services/api';
import UrlForm from '../components/UrlForm';
import UrlTable from '../components/UrlTable';
import AnalyticsCards from '../components/AnalyticsCards';
import AnalyticsChart from '../components/AnalyticsChart';

function formatNumber(value) {
  return new Intl.NumberFormat().format(value ?? 0);
}

export default function Dashboard({
  activeTab,
  urls = [],
  urlsLoading = false,
  urlsError = null,
  onShortenSuccess,
  onDelete,
  onViewQr,
}) {
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  useEffect(() => {
    if (activeTab !== 'dashboard' && activeTab !== 'analytics') {
      return undefined;
    }

    let cancelled = false;

    const loadAnalytics = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      try {
        const data = await fetchAnalyticsSummary('7d');
        if (!cancelled) {
          setAnalyticsSummary(data);
        }
      } catch (error) {
        if (!cancelled) {
          setAnalyticsError(error.message || 'Failed to load analytics.');
          setAnalyticsSummary(null);
        }
      } finally {
        if (!cancelled) {
          setAnalyticsLoading(false);
        }
      }
    };

    void loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [activeTab, urls.length]);

  const handleShortenSuccess = (data) => {
    onShortenSuccess?.(data);
  };

  if (activeTab === 'links') {
    return (
      <UrlTable
        urls={urls}
        onDelete={onDelete}
        loading={urlsLoading}
        error={urlsError}
      />
    );
  }

  if (activeTab === 'analytics') {
    return (
      <div className="dashboard-panel-body">
        <AnalyticsCards summary={analyticsSummary} loading={analyticsLoading} error={analyticsError} />
        <h3 className="settings-flat-heading" style={{ marginBottom: '12px' }}>Clicks over time</h3>
        <AnalyticsChart clicksByDay={analyticsSummary?.clicksByDay || analyticsSummary?.clicksByDate || []} />
        {analyticsSummary?.topUrls?.length > 0 || analyticsSummary?.topLinks?.length > 0 ? (
          <div style={{ marginTop: '24px' }}>
            <h3 className="settings-flat-heading" style={{ marginBottom: '12px' }}>Top URLs</h3>
            <ul className="top-links-list">
              {(analyticsSummary.topUrls || analyticsSummary.topLinks).map((link) => (
                <li key={link.urlId || link.shortCode} className="top-link-item">
                  <span className="top-link-code">{link.shortCode}</span>
                  <span className="top-link-clicks">{formatNumber(link.clicks)} clicks</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="dashboard-panel-body">
      <div id="shortener-section" className="dashboard-shortener-wrap">
        <UrlForm onSuccess={handleShortenSuccess} onViewQr={onViewQr} />
      </div>

      <div style={{ marginTop: '24px' }}>
        <h3 className="settings-flat-heading" style={{ marginBottom: '12px' }}>Overview</h3>
        <AnalyticsCards summary={analyticsSummary} loading={analyticsLoading} error={analyticsError} />
        <AnalyticsChart clicksByDay={analyticsSummary?.clicksByDay || analyticsSummary?.clicksByDate || []} />
      </div>

      <div style={{ marginTop: '32px' }}>
        <h3 className="settings-flat-heading" style={{ marginBottom: '12px' }}>My URLs</h3>
        <UrlTable
          urls={urls.slice(0, 10)}
          onDelete={onDelete}
          loading={urlsLoading}
          error={urlsError}
        />
      </div>
    </div>
  );
}
