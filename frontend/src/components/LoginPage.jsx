import { useEffect } from 'react';
import { Link2 } from 'lucide-react';
import { apiFetch, getAuthLoginUrl, getAuthSignupUrl, readJson } from '../lib/api';
import { navigate } from '../router';

export default function LoginPage({ mode = 'login', authError = null, onRetryAuth }) {
  const isSignup = mode === 'signup';

  useEffect(() => {
    if (authError) {
      return undefined;
    }

    let cancelled = false;

    const redirectToAuth0 = async () => {
      try {
        const response = await apiFetch('/api/auth/session');
        const data = await readJson(response);
        if (data.authenticated) {
          if (!cancelled) {
            navigate('/dashboard', { replace: true });
          }
          return;
        }
      } catch {
        // Session check failed; continue to Auth0 login.
      }

      if (!cancelled) {
        const targetUrl = isSignup
          ? getAuthSignupUrl('/dashboard')
          : getAuthLoginUrl('/dashboard');
        window.location.replace(targetUrl);
      }
    };

    void redirectToAuth0();

    return () => {
      cancelled = true;
    };
  }, [authError, isSignup]);

  return (
    <section className="container auth-page">
      <div className="shortener-card auth-card">
        <div className="auth-card-header">
          <div className="logo-icon-blue" style={{ width: '40px', height: '40px', margin: '0 auto 12px' }}>
            <Link2 size={22} style={{ transform: 'rotate(-45deg)' }} />
          </div>
          <h1>{isSignup ? 'Create your account' : 'Sign in'}</h1>
          {authError ? (
            <p className="auth-error-text">{authError}</p>
          ) : (
            <p>Redirecting to Auth0 to sign in with your email and password…</p>
          )}
        </div>
        {authError ? (
          <div className="auth-loading-screen" style={{ minHeight: '120px' }}>
            <button type="button" className="btn-primary" onClick={onRetryAuth}>
              Try signing in again
            </button>
          </div>
        ) : (
          <div className="auth-loading-screen" style={{ minHeight: '120px' }}>
            <p>Please wait…</p>
          </div>
        )}
      </div>
    </section>
  );
}
