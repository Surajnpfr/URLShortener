import { apiFetch, readJson } from '../lib/api';

export async function shortenUrl(payload) {
  const response = await apiFetch('/api/shorten', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return readJson(response);
}

export async function fetchUrls() {
  const response = await apiFetch('/api/urls');
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

export async function loginUser({ email, password }) {
  const response = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return readJson(response);
}

export async function registerUser({ email, password, name }) {
  const response = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
  return readJson(response);
}

export async function logoutUser() {
  const response = await apiFetch('/api/auth/logout', {
    method: 'POST',
  });
  return readJson(response);
}

export async function updateCurrentUserName(name) {
  const response = await apiFetch('/api/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
  return readJson(response);
}
