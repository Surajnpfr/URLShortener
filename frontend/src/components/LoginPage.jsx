import { useState, useEffect } from 'react';
import { Link2 } from 'lucide-react';
import { loginUser, registerUser } from '../lib/urlApi';
import { navigate } from '../router';

export default function LoginPage({ mode = 'login', onAuthSuccess }) {
  const [activeMode, setActiveMode] = useState(mode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveMode(mode);
  }, [mode]);

  const isSignup = activeMode === 'signup';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = isSignup
        ? await registerUser({ email, password, name })
        : await loginUser({ email, password });

      onAuthSuccess?.(data.user);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (nextMode) => {
    setActiveMode(nextMode);
    setError('');
    navigate(nextMode === 'signup' ? '/register' : '/login', { replace: true });
  };

  return (
    <section className="container auth-page">
      <div className="shortener-card auth-card">
        <div className="auth-card-header">
          <div className="logo-icon-blue" style={{ width: '40px', height: '40px', margin: '0 auto 12px' }}>
            <Link2 size={22} style={{ transform: 'rotate(-45deg)' }} />
          </div>
          <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
          <p>
            {isSignup
              ? 'Sign up with your email to shorten links and track analytics.'
              : 'Sign in with your email and password to continue.'}
          </p>
        </div>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={!isSignup}
            className={`auth-tab ${!isSignup ? 'active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignup}
            className={`auth-tab ${isSignup ? 'active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <div className="form-group">
              <label htmlFor="auth-name">Name (optional)</label>
              <input
                id="auth-name"
                type="text"
                className="form-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              className="form-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              className="form-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? 'At least 8 characters' : 'Your password'}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={isSignup ? 8 : undefined}
              required
              disabled={loading}
            />
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button
            type="submit"
            className="btn-shorten auth-submit"
            disabled={loading}
          >
            {loading ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch-hint">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            className="auth-link-btn"
            onClick={() => switchMode(isSignup ? 'login' : 'signup')}
            disabled={loading}
          >
            {isSignup ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </div>
    </section>
  );
}
