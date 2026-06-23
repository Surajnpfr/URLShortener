// In dev, call the API directly on :5000 (session cookies are host-scoped to localhost).
// In production, set VITE_API_URL to your API host (e.g. https://app.drovashop.com).
const API_BASE_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:5000' : '');

export function getApiBaseUrl() {
  return API_BASE_URL;
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
