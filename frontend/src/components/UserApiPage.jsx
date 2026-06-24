import { useState } from 'react';
import { CheckCircle2, XCircle, Terminal } from 'lucide-react';
import { getApiBaseUrl } from '../lib/api';
import { apiFetch, readJson } from '../services/api';
import CopyButton from './CopyButton';

function EndpointCard({ method, path, description, example, onTry }) {
  const [tryResult, setTryResult] = useState(null);
  const [trying, setTrying] = useState(false);

  const handleTry = async () => {
    if (!onTry) return;
    setTrying(true);
    setTryResult(null);
    try {
      const data = await onTry();
      setTryResult({ ok: true, data });
    } catch (error) {
      setTryResult({ ok: false, message: error.message || 'Request failed' });
    } finally {
      setTrying(false);
    }
  };

  return (
    <article className="api-endpoint-card">
      <div className="api-endpoint-header">
        <span className={`api-method api-method--${method.toLowerCase()}`}>{method}</span>
        <code className="api-endpoint-path">{path}</code>
      </div>
      <p className="api-endpoint-desc">{description}</p>
      <div className="api-code-block">
        <pre>{example}</pre>
        <div className="api-code-actions">
          <CopyButton text={example} className="settings-action-btn outlined" label="Copy" copiedLabel="Copied" />
          {onTry ? (
            <button type="button" className="settings-action-btn" onClick={handleTry} disabled={trying}>
              {trying ? 'Sending…' : 'Try with my session'}
            </button>
          ) : null}
        </div>
      </div>
      {tryResult ? (
        <div className={`api-try-result ${tryResult.ok ? 'api-try-result--ok' : 'api-try-result--err'}`}>
          {tryResult.ok ? (
            <>
              <CheckCircle2 size={16} />
              <pre>{JSON.stringify(tryResult.data, null, 2)}</pre>
            </>
          ) : (
            <>
              <XCircle size={16} />
              <span>{tryResult.message}</span>
            </>
          )}
        </div>
      ) : null}
    </article>
  );
}

export default function UserApiPage({ user, urls = [] }) {
  const apiBase = getApiBaseUrl().replace(/\/$/, '');
  const userId = user?._id || user?.id || 'your-user-id';
  const sampleUrlId = urls[0]?.id || urls[0]?._id || 'url-id';
  const sampleShortCode = urls[0]?.shortCode || 'abc123';

  const fetchExample = `fetch('${apiBase}/api/urls', {
  credentials: 'include',
})
  .then((res) => res.json())
  .then(console.log);`;

  const createExample = `fetch('${apiBase}/api/urls', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    originalUrl: 'https://example.com/page',
  }),
})
  .then((res) => res.json())
  .then(console.log);`;

  const getOneExample = `fetch('${apiBase}/api/urls/${sampleUrlId}', {
  credentials: 'include',
})
  .then((res) => res.json())
  .then(console.log);`;

  const analyticsExample = `fetch('${apiBase}/api/analytics/summary?range=7d', {
  credentials: 'include',
})
  .then((res) => res.json())
  .then(console.log);`;

  const meExample = `fetch('${apiBase}/api/auth/me', {
  credentials: 'include',
})
  .then((res) => res.json())
  .then(console.log);`;

  const tryGet = (path) => async () => {
    const response = await apiFetch(path);
    return readJson(response);
  };

  return (
    <div className="dashboard-panel-body dashboard-panel-body--settings">
      <div className="settings-flat api-docs-panel">
        <section className="settings-flat-section">
          <h3 className="settings-flat-heading">
            <Terminal size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Your API access
          </h3>
          <p className="api-intro">
            These endpoints return <strong>your</strong> links and analytics only. Authentication uses your
            current browser session — include <code>credentials: &apos;include&apos;</code> on every request.
          </p>
          <dl className="detail-list detail-list--settings api-meta-list">
            <div className="detail-list-row">
              <dt>API base URL</dt>
              <dd>
                <code>{apiBase}</code>
                <CopyButton text={apiBase} className="settings-action-btn outlined" label="Copy" copiedLabel="Copied" />
              </dd>
            </div>
            <div className="detail-list-row">
              <dt>Account</dt>
              <dd>{user?.email || '—'}</dd>
            </div>
            <div className="detail-list-row">
              <dt>User ID</dt>
              <dd>
                <code>{userId}</code>
                {userId !== 'your-user-id' ? (
                  <CopyButton text={userId} className="settings-action-btn outlined" label="Copy" copiedLabel="Copied" />
                ) : null}
              </dd>
            </div>
            {sampleShortCode !== 'abc123' ? (
              <div className="detail-list-row">
                <dt>Sample short code</dt>
                <dd><code>{sampleShortCode}</code></dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="settings-flat-section">
          <h3 className="settings-flat-heading">Authentication</h3>
          <p className="api-intro">
            Sign in through this dashboard first. The API sets an <code>appSession</code> cookie on{' '}
            <code>{apiBase.replace(/^https?:\/\//, '')}</code>. Cross-origin calls from{' '}
            <code>{window.location.origin}</code> must use <code>credentials: &apos;include&apos;</code>.
            Server-side scripts need a logged-in session cookie — API keys are not used.
          </p>
        </section>

        <section className="settings-flat-section settings-flat-section--last">
          <h3 className="settings-flat-heading">Endpoints</h3>
          <div className="api-endpoints-list">
            <EndpointCard
              method="GET"
              path="/api/auth/me"
              description="Your profile (same account as this dashboard)."
              example={meExample}
              onTry={tryGet('/api/auth/me')}
            />
            <EndpointCard
              method="GET"
              path="/api/urls"
              description="List all shortened URLs you own."
              example={fetchExample}
              onTry={tryGet('/api/urls')}
            />
            <EndpointCard
              method="POST"
              path="/api/urls"
              description="Create a new short link. Body: originalUrl, optional shortCode and redirectType."
              example={createExample}
            />
            <EndpointCard
              method="GET"
              path={`/api/urls/${sampleUrlId}`}
              description="Get one link by ID (must belong to your account)."
              example={getOneExample}
              onTry={urls.length > 0 ? tryGet(`/api/urls/${sampleUrlId}`) : undefined}
            />
            <EndpointCard
              method="DELETE"
              path={`/api/urls/${sampleUrlId}`}
              description="Delete a link you own. Returns 403 if the link belongs to another user."
              example={`fetch('${apiBase}/api/urls/${sampleUrlId}', {
  method: 'DELETE',
  credentials: 'include',
});`}
            />
            <EndpointCard
              method="GET"
              path="/api/analytics/summary?range=7d"
              description="Dashboard analytics for your account (7d, 30d, or 90d)."
              example={analyticsExample}
              onTry={tryGet('/api/analytics/summary?range=7d')}
            />
            <EndpointCard
              method="GET"
              path={`/api/analytics/links/${sampleUrlId}`}
              description="Click analytics for a single link you own."
              example={`fetch('${apiBase}/api/analytics/links/${sampleUrlId}', {
  credentials: 'include',
})
  .then((res) => res.json())
  .then(console.log);`}
              onTry={urls.length > 0 ? tryGet(`/api/analytics/links/${sampleUrlId}`) : undefined}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
