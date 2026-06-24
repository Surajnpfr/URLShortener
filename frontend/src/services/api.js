const API_BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:5000' : '');

if (!import.meta.env.DEV && !API_BASE_URL) {
  console.error(
    'VITE_API_URL is not set. Rebuild the frontend with VITE_API_URL pointing at your API host.',
  );
}

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = typeof handler === 'function' ? handler : null;
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
  const base = API_BASE_URL.replace(/\/$/, '');
  return `${base}/logout`;
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

  if (response.status === 401 && onUnauthorized) {
    onUnauthorized();
  }

  return response;
}

export async function readJson(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.error || data?.message || `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function shortenUrl(payload) {
  const response = await apiFetch('/api/urls', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return readJson(response);
}

export async function fetchUrls() {
  const response = await apiFetch('/api/urls');
  return readJson(response);
}

export async function fetchUrlById(id) {
  const response = await apiFetch(`/api/urls/${id}`);
  return readJson(response);
}

export async function deleteUrl(id) {
  const response = await apiFetch(`/api/urls/${id}`, {
    method: 'DELETE',
  });
  return readJson(response);
}

export async function fetchAnalyticsSummary(range = '7d') {
  const response = await apiFetch(`/api/analytics/summary?range=${encodeURIComponent(range)}`);
  return readJson(response);
}

export async function fetchLinkAnalytics(urlId, range = '30d') {
  const response = await apiFetch(`/api/analytics/links/${urlId}?range=${encodeURIComponent(range)}`);
  return readJson(response);
}

export async function fetchCurrentUser() {
  const response = await apiFetch('/api/auth/me');
  return readJson(response);
}

export async function fetchAuthSession() {
  const response = await apiFetch('/api/auth/session');
  return readJson(response);
}

export async function updateCurrentUserName(name) {
  const response = await apiFetch('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
  return readJson(response);
}
