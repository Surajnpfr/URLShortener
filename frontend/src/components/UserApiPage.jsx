import { useState } from 'react';
import { CheckCircle2, Terminal, XCircle } from 'lucide-react';
import { getApiBaseUrl } from '../lib/api';
import { apiFetch, readJson } from '../services/api';
import ApiKeyPanel from './ApiKeyPanel';
import CopyButton from './CopyButton';

const EXAMPLE_LANGS = [
  { id: 'curl', label: 'cURL' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
];

const API_KEY_PLACEHOLDER = 'lk_live_YOUR_API_KEY';

function buildExamples(apiBase, path, method = 'GET', body = null) {
  const url = `${apiBase}${path}`;

  const curlBody = body
    ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body)}'`
    : '';

  const curl = `curl -X ${method} "${url}" \\\n  -H "Authorization: Bearer ${API_KEY_PLACEHOLDER}" \\\n  -H "X-API-Key: ${API_KEY_PLACEHOLDER}"${curlBody}`;

  const javascript = body
    ? `const res = await fetch('${url}', {
  method: '${method}',
  headers: {
    'Authorization': \`Bearer \${process.env.LINKLY_API_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(${JSON.stringify(body)}),
});
const data = await res.json();
console.log(data);`
    : `const res = await fetch('${url}', {
  headers: {
    'Authorization': \`Bearer \${process.env.LINKLY_API_KEY}\`,
  },
});
const data = await res.json();
console.log(data);`;

  const python = body
    ? `import requests

response = requests.${method.toLowerCase()}(
    "${url}",
    headers={
        "Authorization": "Bearer ${API_KEY_PLACEHOLDER}",
        "Content-Type": "application/json",
    },
    json=${JSON.stringify(body)},
    timeout=30,
)
print(response.json())`
    : `import requests

response = requests.${method.toLowerCase()}(
    "${url}",
    headers={
        "Authorization": "Bearer ${API_KEY_PLACEHOLDER}",
    },
    timeout=30,
)
print(response.json())`;

  return { curl, javascript, python };
}

function EndpointCard({
  method,
  path,
  description,
  examples,
  onTry,
}) {
  const [lang, setLang] = useState('curl');
  const [tryResult, setTryResult] = useState(null);
  const [trying, setTrying] = useState(false);
  const example = examples[lang] || examples.curl;

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
      <div className="api-example-tabs">
        {EXAMPLE_LANGS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`api-example-tab ${lang === item.id ? 'active' : ''}`}
            onClick={() => setLang(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
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
  const sampleUrlId = urls[0]?.id || urls[0]?._id || 'url-id';

  const tryGet = (path) => async () => {
    const response = await apiFetch(path);
    return readJson(response);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/auth/me',
      description: 'Verify your API key and load account profile.',
      examples: buildExamples(apiBase, '/api/auth/me'),
      onTry: tryGet('/api/auth/me'),
    },
    {
      method: 'POST',
      path: '/api/urls',
      description: 'Create a short link. Body: url or originalUrl, optional customAlias.',
      examples: buildExamples(apiBase, '/api/urls', 'POST', { url: 'https://example.com/page' }),
    },
    {
      method: 'GET',
      path: '/api/urls',
      description: 'List all links owned by your account.',
      examples: buildExamples(apiBase, '/api/urls'),
      onTry: tryGet('/api/urls'),
    },
    {
      method: 'GET',
      path: `/api/urls/${sampleUrlId}`,
      description: 'Get one link by ID (must belong to your account).',
      examples: buildExamples(apiBase, `/api/urls/${sampleUrlId}`),
      onTry: urls.length > 0 ? tryGet(`/api/urls/${sampleUrlId}`) : undefined,
    },
    {
      method: 'DELETE',
      path: `/api/urls/${sampleUrlId}`,
      description: 'Delete a link you own.',
      examples: buildExamples(apiBase, `/api/urls/${sampleUrlId}`, 'DELETE'),
    },
    {
      method: 'GET',
      path: '/api/analytics/summary?range=7d',
      description: 'Account analytics summary (7d, 30d, 90d, or all).',
      examples: buildExamples(apiBase, '/api/analytics/summary?range=7d'),
      onTry: tryGet('/api/analytics/summary?range=7d'),
    },
    {
      method: 'GET',
      path: `/api/analytics/links/${sampleUrlId}`,
      description: 'Per-link click analytics.',
      examples: buildExamples(apiBase, `/api/analytics/links/${sampleUrlId}`),
      onTry: urls.length > 0 ? tryGet(`/api/analytics/links/${sampleUrlId}`) : undefined,
    },
  ];

  return (
    <div className="dashboard-panel-body dashboard-panel-body--settings">
      <div className="settings-flat api-docs-panel">
        <section className="settings-flat-section">
          <h3 className="settings-flat-heading">
            <Terminal size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Programmatic API access
          </h3>
          <p className="api-intro">
            Generate an API key below, then call the same endpoints from Telegram bots, Discord bots,
            or server scripts using <code>Authorization: Bearer lk_live_...</code>.
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
          </dl>
        </section>

        <ApiKeyPanel />

        <section className="settings-flat-section settings-flat-section--last">
          <h3 className="settings-flat-heading">Bot & script examples</h3>
          <p className="api-intro">
            Replace <code>{API_KEY_PLACEHOLDER}</code> with your generated key. Store it in an environment
            variable such as <code>LINKLY_API_KEY</code> — never commit keys to git.
          </p>
          <div className="api-endpoints-list">
            {endpoints.map((endpoint) => (
              <EndpointCard key={`${endpoint.method}-${endpoint.path}`} {...endpoint} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
