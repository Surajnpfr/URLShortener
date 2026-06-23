import { useEffect, useState } from 'react';
import {
  CalendarDays,
  LogOut,
} from 'lucide-react';
import { Typography } from './antd.jsx';
import { navigate as defaultNavigate } from '../router';
import { fetchCurrentUser, updateCurrentUserName } from '../lib/urlApi';

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

export default function AccountSettingsPage({ onNavigate, onLogout }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nameDraft, setNameDraft] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchCurrentUser();
        if (cancelled) return;
        const user = data.user || data;
        setAccount(user);
        setNameDraft(user.name || user.fullName || '');
      } catch {
        if (!cancelled) {
          setAccount(null);
          setNameDraft('');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = account?.name || account?.fullName || account?.email || 'Account';
  const avatarLabel = firstLetter(displayName);
  const joinedDate = formatDate(account?.createdAt);
  const isSignedIn = Boolean(account?.email);

  const navigateTo = (path) => {
    if (typeof onNavigate === 'function') {
      onNavigate(path);
      return;
    }
    defaultNavigate(path);
  };

  const handleSaveName = async () => {
    const nextName = nameDraft.trim();
    if (!nextName) return;

    setSavingName(true);
    try {
      const data = await updateCurrentUserName(nextName);
      setAccount(data.user);
      setNameDraft(data.user.name || nextName);
    } catch (error) {
      alert(error.message || 'Unable to update name right now.');
    } finally {
      setSavingName(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Log out of your account?')) return;
    setLogoutLoading(true);
    try {
      if (typeof onLogout === 'function') {
        await onLogout();
      }
    } finally {
      setAccount(null);
      setNameDraft('');
      setLogoutLoading(false);
    }
  };

  return (
    <div className="settings-flat">
      <section className="settings-flat-section">
        <h3 className="settings-flat-heading">Profile</h3>
        {loading ? (
          <div className="settings-loading-state">Loading…</div>
        ) : (
          <div className="settings-profile settings-profile--flat">
            <div className="settings-avatar" aria-hidden="true">
              {avatarLabel}
            </div>
            <div className="settings-profile-copy">
              <p className="settings-profile-name">{displayName}</p>
              <p className="settings-profile-email">{account?.email || 'Not signed in'}</p>
              <p className="settings-profile-meta">
                <CalendarDays size={14} /> Joined {joinedDate}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="settings-flat-section">
        <h3 className="settings-flat-heading">Account</h3>
        <dl className="detail-list detail-list--settings">
          <div className="detail-list-row">
            <dt>Full name</dt>
            <dd>
              {isSignedIn ? (
                <div className="settings-edit-row">
                  <input
                    className="settings-input"
                    value={nameDraft}
                    onChange={(event) => setNameDraft(event.target.value)}
                    placeholder="Your name"
                  />
                  <ActionButton outlined onClick={handleSaveName} disabled={savingName || !nameDraft.trim()}>
                    {savingName ? 'Saving…' : 'Save'}
                  </ActionButton>
                </div>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div className="detail-list-row">
            <dt>Email</dt>
            <dd>{account?.email || '—'}</dd>
          </div>
          <div className="detail-list-row">
            <dt>Plan</dt>
            <dd>{account?.plan || 'Free'}</dd>
          </div>
        </dl>
      </section>

      <section className="settings-flat-section">
        <h3 className="settings-flat-heading">Security</h3>
        <Typography.Text type="secondary">
          Password and account security are managed through Auth0.
        </Typography.Text>
      </section>

      <section className="settings-flat-section settings-flat-section--last">
        <h3 className="settings-flat-heading">Session</h3>
        {isSignedIn ? (
          <>
            <p className="settings-session-line">Signed in as {account.email}</p>
            <div className="settings-action-row">
              <ActionButton danger outlined onClick={handleLogout} disabled={logoutLoading}>
                <LogOut size={14} />
                {logoutLoading ? 'Logging out…' : 'Log out'}
              </ActionButton>
            </div>
          </>
        ) : (
          <div className="settings-action-row settings-auth-actions">
            <ActionButton outlined onClick={() => navigateTo('/login')}>Sign in</ActionButton>
            <ActionButton onClick={() => navigateTo('/register')}>Create account</ActionButton>
          </div>
        )}
      </section>
    </div>
  );
}
