// In dev, call the API directly on :5000 (Auth0 session cookies are on the API host).
// In production, set VITE_API_URL to your API host (e.g. https://app.drovashop.com).
const API_BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:5000' : '');

if (!import.meta.env.DEV && !API_BASE_URL) {
  console.error(
    'VITE_API_URL is not set. Rebuild the frontend with VITE_API_URL pointing at your API host (e.g. https://app.drovashop.com).',
  );
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

function buildAuthUrl(path, returnPath = '/dashboard') {
  const returnTo = encodeURIComponent(`${window.location.origin}${returnPath}`);
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}${path}?returnTo=${returnTo}`;
}

export function getAuthLoginUrl(returnPath = '/dashboard') {
  return buildAuthUrl('/login', returnPath);
}

export function getAuthSignupUrl(returnPath = '/dashboard') {
  return buildAuthUrl('/signup', returnPath);
}

export function getAuthLogoutUrl() {
  const returnTo = encodeURIComponent(window.location.origin);
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}/logout?returnTo=${returnTo}`;
}

export async function apiFetch(path, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  return response;
}

export async function readJson(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.error || data?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}
