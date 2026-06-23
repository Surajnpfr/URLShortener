import { useEffect } from 'react';
import { Link2 } from 'lucide-react';
import { getAuthLoginUrl, getAuthSignupUrl } from '../lib/api';

export default function LoginPage({ mode = 'login' }) {
  const isSignup = mode === 'signup';

  useEffect(() => {
    const targetUrl = isSignup
      ? getAuthSignupUrl('/dashboard')
      : getAuthLoginUrl('/dashboard');
    window.location.replace(targetUrl);
  }, [isSignup]);

  return (
    <section className="container auth-page">
      <div className="shortener-card auth-card">
        <div className="auth-card-header">
          <div className="logo-icon-blue" style={{ width: '40px', height: '40px', margin: '0 auto 12px' }}>
            <Link2 size={22} style={{ transform: 'rotate(-45deg)' }} />
          </div>
          <h1>{isSignup ? 'Create your account' : 'Sign in'}</h1>
          <p>Redirecting to Auth0 to sign in with your email and password…</p>
        </div>
        <div className="auth-loading-screen" style={{ minHeight: '120px' }}>
          <p>Please wait…</p>
        </div>
      </div>
    </section>
  );
}
