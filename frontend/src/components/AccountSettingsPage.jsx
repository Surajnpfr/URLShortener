import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  Crown,
  LogOut,
  Shield,
  Sparkles,
  Trash2,
  UserRound,
  QrCode,
  Link2,
  MousePointer2,
  Globe2,
} from 'lucide-react';
import { Card, Typography, Row, Col, Space, Divider } from './antd.jsx';

const SESSION_ENDPOINTS = ['/api/auth/me', '/api/me', '/api/user/me', '/api/profile/me', '/api/account/me'];
const UPDATE_NAME_ENDPOINTS = [
  { url: '/api/auth/me', method: 'PATCH' },
  { url: '/api/me', method: 'PATCH' },
  { url: '/api/profile/me', method: 'PATCH' },
  { url: '/api/account/me', method: 'PATCH' },
  { url: '/api/auth/me', method: 'PUT' },
  { url: '/api/me', method: 'PUT' },
  { url: '/api/profile/me', method: 'PUT' },
  { url: '/api/account/me', method: 'PUT' },
];
const LOGOUT_ENDPOINTS = [
  { url: '/api/auth/logout', method: 'POST' },
  { url: '/api/logout', method: 'POST' },
  { url: '/api/auth/session', method: 'DELETE' },
];
const PASSWORD_ENDPOINTS = [
  '/api/auth/change-password',
  '/api/auth/password',
  '/api/password',
  '/api/profile/password',
];
const DELETE_ENDPOINTS = [
  { url: '/api/auth/me', method: 'DELETE' },
  { url: '/api/me', method: 'DELETE' },
  { url: '/api/account/me', method: 'DELETE' },
  { url: '/api/profile/me', method: 'DELETE' },
];
const NOTIFICATION_ENDPOINTS = [
  { url: '/api/auth/preferences', method: 'PATCH' },
  { url: '/api/me/preferences', method: 'PATCH' },
  { url: '/api/account/preferences', method: 'PATCH' },
  { url: '/api/profile/preferences', method: 'PATCH' },
];
const STATS_ENDPOINTS = ['/api/auth/stats', '/api/me/stats', '/api/account/stats', '/api/profile/stats', '/api/user/stats'];

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const firstLetter = (value) => {
  if (!value) return 'A';
  const trimmed = String(value).trim();
  if (!trimmed) return 'A';
  return trimmed.charAt(0).toUpperCase();
};

const normalizePlan = (value) => {
  if (!value) return null;
  const normalized = String(value).toLowerCase();
  if (normalized.includes('pro')) return 'Pro';
  if (normalized.includes('free')) return 'Free';
  return null;
};

const normalizeAccount = (payload) => {
  const user = payload?.user || payload?.account || payload?.profile || payload || {};
  const fullName = user.fullName || user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || null;
  const email = user.email || user.emailAddress || null;
  const username = user.username || user.handle || user.userName || null;
  const createdAt = user.createdAt || user.joinedAt || user.created || user.accountCreatedAt || null;
  const plan = normalizePlan(user.plan || user.subscription?.plan || user.tier || user.membershipPlan);
  const avatarUrl = user.avatarUrl || user.avatar || user.photoURL || null;
  const notificationsEnabled = user.preferences?.emailNotifications ?? user.emailNotifications ?? null;

  return {
    fullName,
    email,
    username,
    createdAt,
    plan,
    avatarUrl,
    notificationsEnabled,
    raw: user,
  };
};

const normalizeStats = (payload) => {
  const stats = payload?.stats || payload?.data || payload || {};
  const totalLinks = stats.totalLinksCreated ?? stats.totalLinks ?? stats.linksCreated ?? stats.linkCount;
  const totalClicks = stats.totalClicks ?? stats.clicks ?? stats.clickCount;
  const qrCodesGenerated = stats.qrCodesGenerated ?? stats.totalQrCodes ?? stats.qrCodes ?? stats.qrCount;

  if ([totalLinks, totalClicks, qrCodesGenerated].some((value) => value === undefined || value === null)) {
    return null;
  }

  return {
    totalLinks,
    totalClicks,
    qrCodesGenerated,
    customDomainsCount,
  };
};

const supportsEndpoint = async (apiBaseUrl, endpoint, method = 'OPTIONS') => {
  try {
    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      method,
      credentials: 'include',
    });

    if (response.ok) return true;
    if ([401, 403, 404, 405].includes(response.status)) return false;
    return response.status < 500;
  } catch {
    return false;
  }
};

const requestFirstAvailable = async (apiBaseUrl, candidates, options = {}) => {
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const response = await fetch(`${apiBaseUrl}${candidate.url}`, {
        method: candidate.method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (response.ok) {
        const data = await response.json().catch(() => null);
        return { ok: true, data, endpoint: candidate.url, method: candidate.method };
      }

      if ([401, 403, 404, 405].includes(response.status)) {
        lastError = new Error(`Endpoint unavailable: ${candidate.url}`);
        continue;
      }

      const errorData = await response.json().catch(() => null);
      lastError = new Error(errorData?.error || `Request failed with status ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }

  return { ok: false, error: lastError };
};

const formatStatValue = (value) => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') {
    if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return new Intl.NumberFormat().format(value);
  }
  return value;
};

const StatCard = ({ label, value, icon, tone }) => (
  <div className="settings-stat-card">
    <div className="settings-stat-icon" style={{ color: tone.color, background: tone.background }}>
      {icon}
    </div>
    <div className="settings-stat-copy">
      <span>{label}</span>
      <strong>{formatStatValue(value)}</strong>
    </div>
  </div>
);

const ActionButton = ({ children, danger = false, outlined = false, block = false, disabled = false, onClick, className = '', type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`settings-action-btn ${outlined ? 'outlined' : ''} ${danger ? 'danger' : ''} ${block ? 'block' : ''} ${className}`.trim()}
  >
    {children}
  </button>
);

const ComingSoonTag = ({ children = 'Coming Soon' }) => <span className="settings-tag">{children}</span>;

const SettingsSwitch = ({ checked, disabled, onChange }) => (
  <button
    type="button"
    className={`settings-switch ${checked ? 'checked' : ''}`}
    aria-pressed={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
  >
    <span />
  </button>
);

export default function AccountSettingsPage({ apiBaseUrl = '', setCurrentPath }) {
  const [account, setAccount] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canEditName, setCanEditName] = useState(false);
  const [canChangePassword, setCanChangePassword] = useState(false);
  const [canDeleteAccount, setCanDeleteAccount] = useState(false);
  const [canEditNotifications, setCanEditNotifications] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingNotification, setSavingNotification] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      const accountResult = await requestFirstAvailable(apiBaseUrl, SESSION_ENDPOINTS.map((url) => ({ url, method: 'GET' })));
      if (cancelled) return;

      if (accountResult.ok) {
        const normalized = normalizeAccount(accountResult.data);
        setAccount(normalized);
        setNameDraft(normalized.fullName || '');
      } else {
        setAccount(null);
        setNameDraft('');
      }

      const capabilityChecks = await Promise.all([
        supportsEndpoint(apiBaseUrl, UPDATE_NAME_ENDPOINTS[0].url, 'OPTIONS'),
        supportsEndpoint(apiBaseUrl, PASSWORD_ENDPOINTS[0], 'OPTIONS'),
        supportsEndpoint(apiBaseUrl, DELETE_ENDPOINTS[0].url, 'OPTIONS'),
        supportsEndpoint(apiBaseUrl, NOTIFICATION_ENDPOINTS[0].url, 'OPTIONS'),
      ]);

      if (cancelled) return;

      setCanEditName(capabilityChecks[0]);
      setCanChangePassword(capabilityChecks[1]);
      setCanDeleteAccount(capabilityChecks[2]);
      setCanEditNotifications(capabilityChecks[3]);

      if (accountResult.ok) {
        const statsResult = await requestFirstAvailable(apiBaseUrl, STATS_ENDPOINTS.map((url) => ({ url, method: 'GET' })));
        if (cancelled) return;
        setStats(statsResult.ok ? normalizeStats(statsResult.data) : null);
      } else {
        setStats(null);
      }

      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl]);

  const displayName = account?.fullName || account?.username || account?.email || 'Account';
  const avatarLabel = firstLetter(displayName);
  const joinedDate = formatDate(account?.createdAt);
  const planLabel = account?.plan || null;
  const isSignedIn = Boolean(account?.email);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    if (typeof setCurrentPath === 'function') {
      setCurrentPath(path);
    }
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSaveName = async () => {
    const nextName = nameDraft.trim();
    if (!nextName || !canEditName) return;

    setSavingName(true);
    const result = await requestFirstAvailable(apiBaseUrl, UPDATE_NAME_ENDPOINTS, {
      body: { fullName: nextName, name: nextName },
    });

    if (result.ok) {
      setAccount((previous) => ({
        ...previous,
        fullName: nextName,
        raw: { ...previous?.raw, fullName: nextName, name: nextName },
      }));
    } else {
      alert(result.error?.message || 'Unable to update name right now.');
    }
    setSavingName(false);
  };

  const handleToggleNotifications = async (checked) => {
    if (!canEditNotifications) return;
    setSavingNotification(true);
    const result = await requestFirstAvailable(apiBaseUrl, NOTIFICATION_ENDPOINTS, {
      body: { emailNotifications: checked },
    });

    if (result.ok) {
      setAccount((previous) => ({
        ...previous,
        notificationsEnabled: checked,
        raw: { ...previous?.raw, preferences: { ...(previous?.raw?.preferences || {}), emailNotifications: checked } },
      }));
    } else {
      alert(result.error?.message || 'Unable to update notification preferences.');
    }
    setSavingNotification(false);
  };

  const handleLogout = async () => {
    if (!window.confirm('Log out of your account?')) return;
    setLogoutLoading(true);
    const result = await requestFirstAvailable(apiBaseUrl, LOGOUT_ENDPOINTS);
    if (!result.ok && result.error) {
      alert(result.error.message || 'Logout endpoint is unavailable.');
    }
    setAccount(null);
    setStats(null);
    setNameDraft('');
    setLogoutLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete this account permanently? This cannot be undone.')) return;
    setDeleteLoading(true);
    const result = await requestFirstAvailable(apiBaseUrl, DELETE_ENDPOINTS);
    if (result.ok) {
      setAccount(null);
      setStats(null);
      setNameDraft('');
    } else {
      alert(result.error?.message || 'Account deletion is unavailable.');
    }
    setDeleteLoading(false);
  };

  const activityCards = stats ? [
    {
      label: 'Total links created',
      value: stats.totalLinks,
      icon: <Link2 size={18} />,
      tone: { color: '#5f6b38', background: 'rgba(96, 108, 56, 0.12)' },
    },
    {
      label: 'Total clicks',
      value: stats.totalClicks,
      icon: <MousePointer2 size={18} />,
      tone: { color: '#8b6b2f', background: 'rgba(221, 161, 94, 0.18)' },
    },
    {
      label: 'QR codes generated',
      value: stats.qrCodesGenerated,
      icon: <QrCode size={18} />,
      tone: { color: '#3f5b37', background: 'rgba(82, 115, 76, 0.12)' },
    },
    {
      label: 'Custom domains count',
      value: stats.customDomainsCount,
      icon: <Globe2 size={18} />,
      tone: { color: '#6b4c2a', background: 'rgba(221, 161, 94, 0.12)' },
    },
  ] : [];

  const hasSession = isSignedIn;

  return (
    <div className="settings-page-shell">
      <div className="settings-page-hero">
        <button type="button" className="settings-back-link" onClick={() => navigateTo('/')}>
          <ArrowLeft size={16} />
          Back to home
        </button>
        <div>
          <Typography.Title level={2} style={{ marginBottom: 10 }}>Settings</Typography.Title>
          <Typography.Paragraph style={{ maxWidth: 720 }}>
            Manage your account and preferences.
          </Typography.Paragraph>
        </div>
      </div>

      <Row gutter={20} className="settings-grid">
        <Col xs={24} md={12}>
          <Card title="Profile" className="settings-card settings-profile-card" bordered>
            {loading ? (
              <div className="settings-loading-state">Loading your account...</div>
            ) : (
              <div className="settings-profile">
                <div className="settings-avatar" aria-hidden="true">
                  {account?.avatarUrl ? <img src={account.avatarUrl} alt="Profile avatar" /> : avatarLabel}
                </div>
                <div className="settings-profile-copy">
                  <Typography.Title level={3}>{displayName}</Typography.Title>
                  <Typography.Text type="secondary">{account?.email || 'No account session detected.'}</Typography.Text>
                  <Space direction="vertical" size={8} className="settings-profile-meta">
                    <Typography.Text type="secondary" className="settings-meta-row">
                      <CalendarDays size={14} /> Joined {joinedDate}
                    </Typography.Text>
                    <Typography.Text type="secondary" className="settings-meta-row">
                      <Crown size={14} /> Current plan: {planLabel || '—'}
                    </Typography.Text>
                  </Space>
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Account Information" className="settings-card" bordered>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div className="settings-field-row">
                <span>Full Name</span>
                {canEditName ? (
                  <div className="settings-edit-row">
                    <input
                      className="settings-input"
                      value={nameDraft}
                      onChange={(event) => setNameDraft(event.target.value)}
                      placeholder="Enter your full name"
                    />
                    <ActionButton outlined onClick={handleSaveName} disabled={savingName || !nameDraft.trim()}>
                      {savingName ? 'Saving...' : 'Save'}
                    </ActionButton>
                  </div>
                ) : (
                  <strong>{account?.fullName || '—'}</strong>
                )}
              </div>

              <div className="settings-field-row">
                <span>Email</span>
                <strong>{account?.email || '—'}</strong>
              </div>

              <div className="settings-field-row">
                <span>Username</span>
                <strong>{account?.username || '—'}</strong>
              </div>

              <div className="settings-field-row">
                <span>Joined date</span>
                <strong>{joinedDate}</strong>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={20} className="settings-grid">
        <Col xs={24} md={12}>
          <Card title="Security" className="settings-card" bordered>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div className="settings-field-row">
                <span>Email address</span>
                <strong>{account?.email || '—'}</strong>
              </div>

              <div className="settings-field-row">
                <span>Password status</span>
                <strong>Protected</strong>
              </div>

              <div className="settings-action-row">
                {canChangePassword ? (
                  <ActionButton outlined>
                    Change password
                    <ChevronRight size={14} />
                  </ActionButton>
                ) : (
                  <Typography.Text type="secondary">Password change is not available for this backend.</Typography.Text>
                )}
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Session" className="settings-card" bordered>
            {hasSession ? (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Typography.Text type="secondary" className="settings-session-line">
                  Logged in as: {account.email}
                </Typography.Text>
                <div className="settings-action-row">
                  <ActionButton danger outlined onClick={handleLogout} disabled={logoutLoading}>
                    <LogOut size={14} />
                    {logoutLoading ? 'Logging out...' : 'Logout'}
                  </ActionButton>
                </div>
              </Space>
            ) : (
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <Typography.Text type="secondary">You are not signed in.</Typography.Text>
                <div className="settings-action-row settings-auth-actions">
                  <ActionButton outlined onClick={() => navigateTo('/login')}>
                    Sign In
                  </ActionButton>
                  <ActionButton onClick={() => navigateTo('/register')}>
                    Sign Up
                  </ActionButton>
                </div>
              </Space>
            )}
          </Card>
        </Col>
      </Row>

      <Card title="Preferences" className="settings-card" bordered>
        <Space direction="vertical" size={18} style={{ width: '100%' }}>
          <div className="settings-preference-row">
            <div>
              <strong>Theme preference</strong>
              <Typography.Text type="secondary">Coming Soon</Typography.Text>
            </div>
            <ComingSoonTag />
          </div>

          <div className="settings-preference-row">
            <div>
              <strong>Email notifications</strong>
              <Typography.Text type="secondary">{canEditNotifications ? 'Toggle to control update emails.' : 'Coming Soon'}</Typography.Text>
            </div>
            {canEditNotifications ? (
              <SettingsSwitch
                checked={Boolean(account?.notificationsEnabled)}
                disabled={savingNotification}
                onChange={handleToggleNotifications}
              />
            ) : (
              <ComingSoonTag />
            )}
          </div>

          <div className="settings-preference-row">
            <div>
              <strong>Language</strong>
              <Typography.Text type="secondary">Coming Soon</Typography.Text>
            </div>
            <ComingSoonTag />
          </div>
        </Space>
      </Card>

      {stats ? (
        <Card title="Your Activity" className="settings-card" bordered>
          <div className="settings-stats-grid">
            {activityCards.map((item) => (
              <StatCard key={item.label} {...item} />
            ))}
          </div>
        </Card>
      ) : null}

      <Card title="Danger Zone" className="settings-card settings-danger-card" bordered>
        <Space direction="vertical" size={14} style={{ width: '100%' }}>
          <Typography.Text type="secondary">These actions are irreversible.</Typography.Text>

          {canDeleteAccount ? (
            <ActionButton danger outlined onClick={handleDeleteAccount} disabled={deleteLoading}>
              <Trash2 size={14} />
              {deleteLoading ? 'Deleting...' : 'Delete Account'}
            </ActionButton>
          ) : (
            <div className="settings-unavailable-note">
              <CircleAlert size={16} />
              <span>Account deletion functionality is currently unavailable.</span>
            </div>
          )}
        </Space>
      </Card>

      <Card title="Session status" className="settings-card settings-footer-card" bordered>
        <div className="settings-inline-status">
          <Shield size={16} />
          <span>
            {hasSession ? 'Authenticated session detected.' : 'No authenticated session detected.'}
          </span>
        </div>
        <Divider />
        <div className="settings-footer-links">
          <button type="button" className="settings-text-link" onClick={() => navigateTo('/login')}>
            <UserRound size={14} /> Sign in
          </button>
          <button type="button" className="settings-text-link" onClick={() => navigateTo('/register')}>
            <Sparkles size={14} /> Create account
          </button>
        </div>
      </Card>
    </div>
  );
}
