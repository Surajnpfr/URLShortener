import { useState, useEffect } from 'react';
import { 
  Link2, Sun, Moon, Sparkles, Check, Shield, BarChart2, 
  Plus, Settings, Home, Globe, QrCode, Mail, Key, 
  CreditCard, ChevronDown
} from 'lucide-react';
import ShortenerForm from './components/ShortenerForm';
import UrlList from './components/UrlList';
import QrModal from './components/QrModal';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';

// Custom Brand SVGs due to lucide-react brand icons mismatch
const TwitterIcon = ({ size = 16, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const FacebookIcon = ({ size = 16, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const LinkedinIcon = ({ size = 16, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = ({ size = 16, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [urls, setUrls] = useState([]);
  const [dbMode, setDbMode] = useState('MONGODB');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light'; // Default to light theme for Linkly look
  });
  
  // Navigation active tab in sidebar
  const [activeTab, setActiveTab] = useState('dashboard');

<<<<<<< HEAD
  // Dynamic Custom Domains List state
  const [domains, setDomains] = useState(() => {
    const local = localStorage.getItem('domains');
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.includes('drovashop.com')) return parsed;
      return ['drovashop.com', ...parsed.filter(d => d !== 'linkly.to')];
    }
    return ['drovashop.com'];
  });
=======
  // Client-side router path state
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
>>>>>>> c49193b20b300406eb3aeea420f9305225b431b0

  // Synchronize route with history back/forward button navigations
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Shared navigation link scrolling logic
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    if (currentPath !== '/') {
      window.history.pushState({}, '', `/#${targetId}`);
      setCurrentPath('/');
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };


 

  // Mock User Authentication state
  const [user, setUser] = useState(() => {
    const local = localStorage.getItem('user');
    return local ? JSON.parse(local) : null;
  });

  // Auth Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Pro Upgrade Billing state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  // QR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [qrShortCode, setQrShortCode] = useState('');

  // FAQ Expand state
  const [activeFaq, setActiveFaq] = useState(null);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

 

  // Persist user auth details
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Toggle Theme function
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const statusRes = await fetch(`${API_BASE_URL}/api/status`).catch(() => null);
      if (statusRes && statusRes.ok) {
        const statusData = await statusRes.json();
        setDbMode(statusData.dbMode);
      }

      const urlsRes = await fetch(`${API_BASE_URL}/api/urls`).catch(() => null);
      if (urlsRes && urlsRes.ok) {
        const urlsData = await urlsRes.json();
        setUrls(urlsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const statusRes = await fetch(`${API_BASE_URL}/api/status`).catch(() => null);
        if (cancelled) return;
        if (statusRes && statusRes.ok) {
          const statusData = await statusRes.json();
          setDbMode(statusData.dbMode);
        }

        const urlsRes = await fetch(`${API_BASE_URL}/api/urls`).catch(() => null);
        if (cancelled) return;
        if (urlsRes && urlsRes.ok) {
          const urlsData = await urlsRes.json();
          setUrls(urlsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shortened URL?')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/urls/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUrls(prev => prev.filter(item => item._id !== id));
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to delete URL');
      }
    } catch (error) {
      console.error('Error deleting URL:', error);
      alert('Network error deleting URL');
    }
  };

  const handleOpenQr = (url, shortCode) => {
    setQrUrl(url);
    setQrShortCode(shortCode);
    setQrModalOpen(true);
  };

  const handleScrollToShortener = () => {
    const element = document.getElementById('shortener-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Auth form handlers
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    // Successfully log user in using mocks
    setUser({
      email: emailInput.trim(),
      plan: 'Free',
      role: 'User'
    });
    setAuthModalOpen(false);
    setEmailInput('');
    setPasswordInput('');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setUser(null);
    }
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  // Upgrade checkout billing handler
  const handleUpgradeSubmit = (e) => {
    e.preventDefault();
    setBillingLoading(true);
    setTimeout(() => {
      setBillingLoading(false);
      setUser(prev => ({
        ...prev,
        plan: 'Pro'
      }));
      setUpgradeModalOpen(false);
      // Confetti feedback!
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      });
    }, 1500);
  };

  return (
    <>
      <header className="app-header">
        <div className="container header-content">
          <a 
            href="/" 
            className="logo-container"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/');
              setCurrentPath('/');
              window.scrollTo(0, 0);
            }}
          >
            <div className="logo-icon-blue">
              <Link2 size={22} style={{ transform: 'rotate(-45deg)' }} />
            </div>
            <span className="logo-text">Linkly</span>
          </a>

          <nav className="header-nav">
            <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="nav-link">Features</a>
            <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="nav-link">Pricing</a>
            <a href="#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')} className="nav-link">How it works</a>
            <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="nav-link">FAQ</a>
          </nav>

          <div className="header-right">
            <button onClick={toggleTheme} className="theme-btn" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  👤 {user.email} {user.plan === 'Pro' && '👑'}
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
        {currentPath === '/terms' || currentPath === '/terms-and-conditions' ? (
          <TermsPage setCurrentPath={setCurrentPath} />
        ) : currentPath === '/privacy' || currentPath === '/privacy-policy' ? (
          <PrivacyPage setCurrentPath={setCurrentPath} />
        ) : (

          <>
            {/* Hero Section */}
        <section className="container">
          <div className="badge-container">
            <div className="purple-badge">⚡ Fast. Simple. Reliable.</div>
          </div>
          <div className="hero">
            <h1>Shorten links, <br /><span>share everywhere.</span></h1>
            <p>Create short links in seconds, track performance, and grow your audience.</p>
          </div>
        </section>

        {/* Shortener Section */}
        <section id="shortener-section" className="container" style={{ position: 'relative', zIndex: 10 }}>
          <ShortenerForm 
            onShortenSuccess={fetchData} 
            onViewQr={handleOpenQr} 
            apiBaseUrl={API_BASE_URL}
            
          />
        </section>

        {/* Feature Grid */}
        <section id="features" className="container" style={{ scrollMarginTop: '80px' }}>
          <div className="feature-grid">
            <div className="feature-item">
              <div className="feature-icon-box">
                <Link2 size={20} />
              </div>
              <h3>Shorten in seconds</h3>
              <p>Create short links quickly and easily from any device.</p>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon-box">
                <BarChart2 size={20} />
              </div>
              <h3>Track & analyze</h3>
              <p>Get insights and track performance in real time with detailed stats.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box">
                <Sparkles size={20} />
              </div>
              <h3>Grow your audience</h3>
              <p>Smart analytics to help you make better decisions and increase CTR.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box">
                <Shield size={20} />
              </div>
              <h3>Reliable & secure</h3>
              <p>Your links are safe, secure, HTTPS encrypted, and always online.</p>
            </div>
          </div>
        </section>

        {/* How It Works Timeline Section */}
        <section id="how-it-works" className="container" style={{ scrollMarginTop: '80px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800 }}>How It Works</h2>
          <div className="timeline-container">
            <div className="timeline-card">
              <div className="timeline-step">1</div>
              <h3>Paste Link</h3>
              <p>Input your long URL into the shorten bar at the top of the page.</p>
            </div>
            <div className="timeline-card">
              <div className="timeline-step">2</div>
              <h3>Branding</h3>
              <p>Select your branded custom domain and customize the alias suffix.</p>
            </div>
            <div className="timeline-card">
              <div className="timeline-step">3</div>
              <h3>Share & Track</h3>
              <p>Download the QR code, share the link, and view live click analytics.</p>
            </div>
          </div>
        </section>

        {/* Dashboard Section */}
        <section className="container">
          <div className="dashboard-outer-container">
            <div className="dashboard-wrapper">
              
              {/* Sidebar */}
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
                      onClick={() => setActiveTab('dashboard')} 
                      className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                    >
                      <Home size={18} />
                      Dashboard
                    </button>
                  </li>
                  <li className="sidebar-item">
                    <button 
                      onClick={() => setActiveTab('links')} 
                      className={`sidebar-link ${activeTab === 'links' ? 'active' : ''}`}
                    >
                      <Link2 size={18} />
                      Links
                    </button>
                  </li>
                  <li className="sidebar-item">
                    <button 
                      onClick={() => setActiveTab('analytics')} 
                      className={`sidebar-link ${activeTab === 'analytics' ? 'active' : ''}`}
                    >
                      <BarChart2 size={18} />
                      Analytics
                    </button>
                  </li>
                  <li className="sidebar-item">
                    <button 
                      onClick={() => setActiveTab('qrcodes')} 
                      className={`sidebar-link ${activeTab === 'qrcodes' ? 'active' : ''}`}
                    >
                      <QrCode size={18} />
                      QR Codes
                    </button>
                  </li>
               
                  <li className="sidebar-item">
                    <button 
                      onClick={() => setActiveTab('settings')} 
                      className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}
                    >
                      <Settings size={18} />
                      Settings
                    </button>
                  </li>
                </ul>

                <div className="sidebar-upgrade">
                  <h4>👑 {user && user.plan === 'Pro' ? 'Pro Account' : 'Upgrade to Pro'}</h4>
                  <p>{user && user.plan === 'Pro' ? 'You are enjoying full features!' : 'Unlock more features and grow your brand.'}</p>
                  {!(user && user.plan === 'Pro') && (
                    <button onClick={() => setUpgradeModalOpen(true)} className="btn-upgrade">Upgrade now &gt;</button>
                  )}
                </div>
              </aside>

              {/* Main Content Area */}
              <div className="dashboard-panel">
                <div className="panel-header">
                  <h2>
                    {activeTab === 'dashboard' && 'Dashboard'}
                    {activeTab === 'links' && 'Links'}
                    {activeTab === 'analytics' && 'Analytics'}
                    {activeTab === 'qrcodes' && 'QR Codes'}

                  </h2>
                  {(activeTab === 'dashboard' || activeTab === 'links') && (
                    <button className="btn-newlink" onClick={handleScrollToShortener}>
                      <Plus size={16} />
                      New Link
                    </button>
                  )}
                </div>

                <UrlList 
                  urls={urls} 
                  activeTab={activeTab}
                  onDelete={handleDelete} 
                  onViewQr={handleOpenQr}
                  onOpenAnalytics={() => setActiveTab('analytics')}
                  dbMode={dbMode}
                 
                 
                />
              </div>

            </div>
          </div>
        </section>

        {/* Pricing Tables Section */}
        <section id="pricing" className="container pricing-section" style={{ scrollMarginTop: '80px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Plans & Pricing</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Select a plan that fits your growth targets.</p>
          
          <div className="pricing-grid">
            {/* Free Card */}
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Free Tier</h3>
                <p>Perfect for personal, basic shortening needs.</p>
              </div>
              <div className="pricing-price">$0 <span>/ month</span></div>
              <ul className="pricing-features">
                <li><Check size={16} /> 10 dynamic shortcodes / month</li>
                <li><Check size={16} /> Standard system domain links</li>
                <li><Check size={16} /> Basic click statistics tracking</li>
              </ul>
              <button 
                onClick={() => {
                  if (!user) openAuth('login');
                  else alert('You are already on the Free tier!');
                }} 
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: 'auto' }}
              >
                {user ? 'Current Tier' : 'Get Started'}
              </button>
            </div>

            {/* Pro Card */}
            <div className="pricing-card premium">
              <div className="pricing-header">
                <h3>Pro Upgrade</h3>
                <p>Best for branded links and complete analytics.</p>
              </div>
              <div className="pricing-price">$9 <span>/ month</span></div>
              <ul className="pricing-features">
                <li><Check size={16} /> Unlimited link shortening maps</li>
                <li><Check size={16} /> Branded custom domain connections</li>
                <li><Check size={16} /> Multi-format vector QR code downloads</li>
                <li><Check size={16} /> Smart link routing controls</li>
              </ul>
              <button 
                onClick={() => {
                  if (!user) openAuth('login');
                  else if (user.plan === 'Pro') alert('You are already a Pro member!');
                  else setUpgradeModalOpen(true);
                }} 
                className="btn" 
                style={{ width: '100%', marginTop: 'auto', background: 'var(--primary)', color: 'var(--card-bg)' }}
              >
                {user && user.plan === 'Pro' ? 'Premium Active' : 'Upgrade to Pro'}
              </button>
            </div>
          </div>
        </section>

        {/* Accordion FAQ Section */}
        <section id="faq" className="container faq-section" style={{ scrollMarginTop: '80px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800 }}>Frequently Asked Questions</h2>
          <div className="faq-list">
            
            <div className={`faq-item ${activeFaq === 0 ? 'active' : ''}`}>
              <button onClick={() => setActiveFaq(activeFaq === 0 ? null : 0)} className="faq-question">
                Is this URL shortener completely free?
                <ChevronDown size={18} />
              </button>
              {activeFaq === 0 && (
                <div className="faq-answer">
                  Yes! The core URL shortening functionality is free to use on our base domains. We offer a Premium Pro Tier upgrade that grants custom branded domains support and advanced QR Code tools.
                </div>
              )}
            </div>

            <div className={`faq-item ${activeFaq === 1 ? 'active' : ''}`}>
              <button onClick={() => setActiveFaq(activeFaq === 1 ? null : 1)} className="faq-question">
                What is a custom branded domain?
                <ChevronDown size={18} />
              </button>
              {activeFaq === 1 && (
                <div className="faq-answer">
                  A custom domain replaces "linkly.to" in the shortened URL with your own domain name (e.g. <code>go.yourbrand.com</code>). This builds trust with your audience and increases click-through rates.
                </div>
              )}
            </div>

            <div className={`faq-item ${activeFaq === 2 ? 'active' : ''}`}>
              <button onClick={() => setActiveFaq(activeFaq === 2 ? null : 2)} className="faq-question">
                Are redirects temporary or permanent?
                <ChevronDown size={18} />
              </button>
              {activeFaq === 2 && (
                <div className="faq-answer">
                  Linkly handles redirects automatically to keep clicks fast and trackable, while Pro members unlock more branding and analytics options.
                </div>
              )}
            </div>

          </div>
        </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <a href="/" className="logo-container" style={{ margin: 0 }}>
                <div className="logo-icon-blue" style={{ width: '32px', height: '32px' }}>
                  <Link2 size={18} style={{ transform: 'rotate(-45deg)' }} />
                </div>
                <span className="logo-text" style={{ fontSize: '1.25rem' }}>Linkly</span>
              </a>
              <p>Linkly is a fast, reliable and powerful URL shortener built for everyone.</p>
              <div className="social-links">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn"><TwitterIcon size={16} /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn"><FacebookIcon size={16} /></a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn"><LinkedinIcon size={16} /></a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn"><InstagramIcon size={16} /></a>
              </div>
            </div>

            <div className="footer-links-col">
              <h4>Product</h4>
              <ul className="footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#api">API</a></li>
                <li><a href="#integrations">Integrations</a></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h4>Resources</h4>
              <ul className="footer-links">
                <li><a href="#blog">Blog</a></li>
                <li><a href="#guides">Guides</a></li>
                <li>
                  <a 
                    href="/terms" 
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, '', '/terms');
                      setCurrentPath('/terms');
                      window.scrollTo(0, 0);
                    }}
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a 
                    href="/privacy" 
                    onClick={(e) => {
                      e.preventDefault();
                      window.history.pushState({}, '', '/privacy');
                      setCurrentPath('/privacy');
                      window.scrollTo(0, 0);
                    }}
                  >
                    Privacy Policy
                  </a>
                </li>
                <li><a href="#status">Status</a></li>
              </ul>
            </div>

            <div className="footer-subscribe">
              <h4>Stay in the loop</h4>
              <p>Get tips, product updates, and more straight to your inbox.</p>
              <form 
                className="subscribe-form" 
                onSubmit={(e) => {
                  e.preventDefault();
                  alert('Thank you for subscribing to our newsletter! 📬');
                  e.target.reset();
                }}
              >
                <input type="email" placeholder="Enter your email" className="subscribe-input" required />
                <button type="submit" className="btn-subscribe">Subscribe</button>
              </form>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Linkly. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal Form */}
      {authModalOpen && (
        <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <h3>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h3>
            <p style={{ marginBottom: '24px' }}>
              {authMode === 'login' ? 'Enter credentials to access your dashboard' : 'Shorten links and track performance'}
            </p>
            
            <form onSubmit={handleAuthSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="form-field"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Key size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="form-field"
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>
              
              <button type="submit" className="btn" style={{ width: '100%', background: 'var(--primary)', color: 'var(--card-bg)', marginTop: '16px', padding: '12px' }}>
                {authMode === 'login' ? 'Log in' : 'Sign up'}
              </button>
            </form>
            
            <div style={{ marginTop: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
              >
                {authMode === 'login' ? 'Sign up' : 'Log in'}
              </button>
            </div>
          </div>
        </div>
      )}

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

              <button type="submit" disabled={billingLoading} className="btn" style={{ width: '100%', background: 'var(--primary)', color: 'var(--card-bg)', marginTop: '16px', padding: '12px' }}>
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
