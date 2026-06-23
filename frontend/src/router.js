export const TERMS_PATHS = new Set(['/terms', '/terms-and-conditions']);
export const PRIVACY_PATHS = new Set(['/privacy', '/privacy-policy']);
export const AUTH_LOGIN_PATHS = new Set(['/login']);
export const AUTH_SIGNUP_PATHS = new Set(['/register']);

export const TAB_PATHS = {
  dashboard: '/dashboard',
  links: '/links',
  analytics: '/analytics',
  qrcodes: '/qrcodes',
  settings: '/settings',
};

const PATH_TO_TAB = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([tab, path]) => [path, tab]),
);

export function normalizePath(pathname = '/') {
  if (!pathname || pathname === '/') return '/';
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed || '/';
}

export function readLocation() {
  return {
    pathname: normalizePath(window.location.pathname),
    hash: window.location.hash || '',
  };
}

export function isTermsPath(pathname) {
  return TERMS_PATHS.has(normalizePath(pathname));
}

export function isPrivacyPath(pathname) {
  return PRIVACY_PATHS.has(normalizePath(pathname));
}

export function tabFromPath(pathname) {
  return PATH_TO_TAB[normalizePath(pathname)] || null;
}

export function pathForTab(tab) {
  return TAB_PATHS[tab] || '/dashboard';
}

export function pathForSection(sectionId) {
  return sectionId ? `/#${sectionId.replace(/^#/, '')}` : '/';
}

export function getRoute(pathname, hash = '') {
  const path = normalizePath(pathname);

  if (TERMS_PATHS.has(path)) return { view: 'terms' };
  if (PRIVACY_PATHS.has(path)) return { view: 'privacy' };
  if (AUTH_LOGIN_PATHS.has(path)) return { view: 'auth', authMode: 'login' };
  if (AUTH_SIGNUP_PATHS.has(path)) return { view: 'auth', authMode: 'signup' };

  const tab = tabFromPath(path);
  if (tab) return { view: 'app', tab };

  const section = hash.replace(/^#/, '');
  if (path === '/') {
    return { view: 'home', section: section || null };
  }

  return { view: 'notFound' };
}

export function navigate(url, { replace = false } = {}) {
  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function scrollToSection(sectionId) {
  if (!sectionId) return;
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}
