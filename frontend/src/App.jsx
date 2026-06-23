import { useState, useEffect, useCallback } from 'react';
import { 
  Link2, Sun, Moon, BarChart2, 
  Settings, Home, QrCode, 
  CreditCard
} from 'lucide-react';
import ShortenerForm from './components/ShortenerForm';
import UrlList from './components/UrlList';
import QrModal from './components/QrModal';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';
import { getApiBaseUrl, getAuthLoginUrl, getAuthSignupUrl, getAuthLogoutUrl } from './lib/api';
import { deleteUrl, fetchUrls, fetchCurrentUser } from './lib/urlApi';
import {
  getRoute,
  isPrivacyPath,
  isTermsPath,
  navigate,
  pathForSection,
  pathForTab,
  readLocation,
  scrollToSection,
} from './router';

const API_BASE_URL = getApiBaseUrl();

const PANEL_TITLES = {
  dashboard: 'Dashboard',
  links: 'Links',
  analytics: 'Analytics',
  qrcodes: 'QR Codes',
  settings: 'Settings',
};

export default function App() {
  const [urls, setUrls] = useState([]);
  const [dbMode, setDbMode] = useState('MONGODB');
  const [appUser, setAppUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    return stored === 'dark' ? 'dark' : 'light';
  });
  
  // Navigation active tab in sidebar
  const [activeTab, setActiveTab] = useState('dashboard');

  const [location, setLocation] = useState(readLocation);

  // Pro Upgrade Billing state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  // QR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [qrShortCode, setQrShortCode] = useState('');

  const checkSession = useCallback(async () => {
    try {
      const userData = await fetchCurrentUser();
      setAppUser(userData.user);
      setIsAuthenticated(true);
      return true;
    } catch {
      setAppUser(null);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      setAuthLoading(true);
      await checkSession();
      if (!cancelled) setAuthLoading(false);
    };

    void initAuth();

    return () => {
      cancelled = true;
    };
  }, [checkSession]);

  useEffect(() => {
    const handlePopState = () => {
      setLocation(readLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    const nextRoute = getRoute(location.pathname, location.hash);

    if (nextRoute.tab) {
      setActiveTab(nextRoute.tab);
    }

    if (isAuthenticated && nextRoute.view === 'auth') {
      navigate(pathForTab('dashboard'), { replace: true });
      return;
    }

    if (isAuthenticated && location.pathname === '/' && !location.hash) {
      navigate(pathForTab('dashboard'), { replace: true });
      return;
    }

    if (!isAuthenticated && nextRoute.tab) {
      navigate('/login', { replace: true });
      return;
    }

    if (!isAuthenticated && nextRoute.view === 'notFound') {
      navigate('/', { replace: true });
      return;
    }

    if (nextRoute.view === 'home' && nextRoute.section && !isAuthenticated) {
      const timer = window.setTimeout(() => scrollToSection(nextRoute.section), 120);
      return () => window.clearTimeout(timer);
    }
  }, [location, isAuthenticated, authLoading]);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    navigate(pathForSection(targetId));
    if (!isAuthenticated) {
      window.setTimeout(() => scrollToSection(targetId), 120);
    }
  };

  const openAuth = (mode) => {
    window.location.href = mode === 'signup'
      ? getAuthSignupUrl('/dashboard')
      : getAuthLoginUrl('/dashboard');
  };

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const fetchData = useCallback(async () => {
    try {
      const statusRes = await fetch(`${API_BASE_URL}/api/status`).catch(() => null);
      if (statusRes && statusRes.ok) {
        const statusData = await statusRes.json();
        setDbMode(statusData.dbMode);
      }

      if (!isAuthenticated) {
        setUrls([]);
        setAppUser(null);
        return;
      }

      const [userData, urlsData] = await Promise.all([
        fetchCurrentUser().catch(() => null),
        fetchUrls().catch(() => []),
      ]);

      if (userData?.user) {
        setAppUser(userData.user);
      }
      setUrls(Array.isArray(urlsData) ? urlsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    void fetchData();
  }, [authLoading, fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shortened URL?')) {
      return;
    }
    try {
      await deleteUrl(id);
      setUrls(prev => prev.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting URL:', error);
      alert(error.message || 'Network error deleting URL');
    }
  };

  const handleOpenQr = (url, shortCode) => {
    setQrUrl(url);
    setQrShortCode(shortCode);
    setQrModalOpen(true);
  };

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to log out?')) {
      return;
    }
    window.location.href = getAuthLogoutUrl();
  };

  // Upgrade checkout billing handler
  const handleUpgradeSubmit = (e) => {
    e.preventDefault();
    setBillingLoading(true);
    setTimeout(() => {
      setBillingLoading(false);
      setAppUser(prev => ({
        ...prev,
        plan: 'Pro'
      }));
      setUpgradeModalOpen(false);
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      });
    }, 1500);
  };

  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <p>Loading…</p>
      </div>
    );
  }

  const displayEmail = appUser?.email || '';
  const displayPlan = appUser?.plan || 'Free';
  const currentRoute = getRoute(location.pathname, location.hash);
  const showAuthPage = !isAuthenticated && currentRoute.view === 'auth';

  return (
    <>
      <header className="app-header">
        <div className="container header-content">
          <a 
            href="/" 
            className="logo-container"
            onClick={(e) => {
              e.preventDefault();
              navigate(isAuthenticated ? pathForTab('dashboard') : '/');
              window.scrollTo(0, 0);
            }}
          >
            <div className="logo-icon-blue">
              <Link2 size={22} style={{ transform: 'rotate(-45deg)' }} />
            </div>
            <span className="logo-text">Linkly</span>
          </a>

          <nav className="header-nav">
            {!isAuthenticated ? (
              <a href="#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')} className="nav-link">How it works</a>
            ) : (
              <a href="/dashboard" onClick={(e) => { e.preventDefault(); navigate(pathForTab('dashboard')); }} className="nav-link">Dashboard</a>
            )}
          </nav>

          <div className="header-right">
            <button onClick={toggleTheme} className="theme-btn" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  👤 {displayEmail} {displayPlan === 'Pro' && '👑'}
                </span>
                <button onClick={handleLogout} className="login-link" style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}>
                  Log out
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => openAuth('login')} className="login-link" style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}>
                  Log in
                </button>
                <button onClick={() => openAuth('signup')} className="btn-signup" style={{ border: 'none', cursor: 'pointer' }}>
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ flexGrow: 1 }}>
        {isTermsPath(location.pathname) ? (
          <TermsPage onNavigate={navigate} />
        ) : isPrivacyPath(location.pathname) ? (
          <PrivacyPage onNavigate={navigate} />
        ) : showAuthPage ? (
          <LoginPage mode={currentRoute.authMode} />
        ) : isAuthenticated ? (
          /* Logged-in: dashboard only */
          <section id="dashboard-section" className="container dashboard-page-section">
            <div className="dashboard-outer-container">
              <div className="dashboard-wrapper">
                <aside className="dashboard-sidebar">
                  <div className="sidebar-title">
                    <div className="logo-icon-blue" style={{ width: '28px', height: '28px' }}>
                      <Link2 size={16} style={{ transform: 'rotate(-45deg)' }} />
                    </div>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>Linkly</span>
                  </div>

                  <ul className="sidebar-menu">
                    <li className="sidebar-item">
                      <button
                        onClick={() => navigate(pathForTab('dashboard'))}
                        className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                      >
                        <Home size={18} />
                        Dashboard
                      </button>
                    </li>
                    <li className="sidebar-item">
                      <button
                        onClick={() => navigate(pathForTab('links'))}
                        className={`sidebar-link ${activeTab === 'links' ? 'active' : ''}`}
                      >
                        <Link2 size={18} />
                        Links
                      </button>
                    </li>
                    <li className="sidebar-item">
                      <button
                        onClick={() => navigate(pathForTab('analytics'))}
                        className={`sidebar-link ${activeTab === 'analytics' ? 'active' : ''}`}
                      >
                        <BarChart2 size={18} />
                        Analytics
                      </button>
                    </li>
                    <li className="sidebar-item">
                      <button
                        onClick={() => navigate(pathForTab('qrcodes'))}
                        className={`sidebar-link ${activeTab === 'qrcodes' ? 'active' : ''}`}
                      >
                        <QrCode size={18} />
                        QR Codes
                      </button>
                    </li>
                    <li className="sidebar-item">
                      <button
                        onClick={() => navigate(pathForTab('settings'))}
                        className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
                      >
                        <Settings size={18} />
                        Settings
                      </button>
                    </li>
                  </ul>
                </aside>

                <div className="dashboard-panel">
                  <div className="panel-header">
                    <h2>{PANEL_TITLES[activeTab]}</h2>
                  </div>

                  <div className="dashboard-panel-content">
                    <div id="shortener-section" className="dashboard-shortener-wrap">
                      <ShortenerForm
                        variant="dashboard"
                        onShortenSuccess={() => void fetchData()}
                        onViewQr={handleOpenQr}
                      />
                    </div>

                    <UrlList
                      urls={urls}
                      activeTab={activeTab}
                      onDelete={handleDelete}
                      onViewQr={handleOpenQr}
                      onOpenAnalytics={() => navigate(pathForTab('analytics'))}
                      onNavigate={navigate}
                      onLogout={handleLogout}
                      dbMode={dbMode}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <LandingPage onLoginRequired={() => openAuth('login')} />
        )}
      </main>

      {/* Pro Billing checkout modal */}
      {upgradeModalOpen && (
        <div className="modal-overlay" onClick={() => setUpgradeModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3>👑 Upgrade to Linkly Pro</h3>
            <p>Access unlimited shortcodes, customized links, and branding tools.</p>
            
            <div style={{ background: 'var(--bg-color)', border: '1px solid var(--card-border)', borderRadius: '12px', padding: '16px', margin: '20px 0', textAlign: 'left' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PLAN SELECTED</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>Pro Plan Upgrade</span>
                <span style={{ fontWeight: 800, color: 'var(--primary)' }}>$9 / mo</span>
              </div>
            </div>

            <form onSubmit={handleUpgradeSubmit}>
              <div className="form-group">
                <label>Card Number</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <CreditCard size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    required
                    placeholder="4000 1234 5678 9010"
                    defaultValue="4242 •••• •••• 4242"
                    className="form-field"
                    style={{ paddingLeft: '38px' }}
                    disabled={billingLoading}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input type="text" required placeholder="MM / YY" defaultValue="12 / 29" className="form-field" disabled={billingLoading} />
                </div>
                <div className="form-group">
                  <label>CVC</label>
                  <input type="text" required placeholder="123" defaultValue="737" className="form-field" disabled={billingLoading} />
                </div>
              </div>

              <button type="submit" disabled={billingLoading} className="btn" style={{ width: '100%', background: 'var(--primary)', color: 'var(--primary-foreground)', marginTop: '16px', padding: '12px' }}>
                {billingLoading ? <div className="spinner" style={{ margin: '0 auto' }}></div> : 'Confirm Upgrade - $9'}
              </button>
            </form>
          </div>
        </div>
      )}

      <QrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        url={qrUrl}
        shortCode={qrShortCode}
      />
    </>
  );
}
