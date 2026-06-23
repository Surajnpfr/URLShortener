import { ArrowRight, Link2 } from 'lucide-react';
import ShortenerForm from './ShortenerForm';
import { navigate } from '../router';

export default function LandingPage({ onLoginRequired }) {
  return (
    <div className="landing">
      <section className="landing-hero container">
        <div className="landing-hero-grid">
          <div className="landing-hero-copy">
            <p className="landing-kicker">Linkly</p>
            <h1>
              Turn long URLs into links people
              <em> actually click.</em>
            </h1>
            <p className="landing-lede">
              No marketing fluff — paste a URL, get a short link, track the clicks.
              Sign in when you&apos;re ready to save them.
            </p>
            <div className="landing-example" aria-hidden="true">
              <span className="landing-example-long">google.com/search?q=...</span>
              <ArrowRight size={16} className="landing-example-arrow" />
              <span className="landing-example-short">drovashop.com/go/k4m9x2</span>
            </div>
          </div>

          <div id="shortener-section" className="landing-hero-tool">
            <ShortenerForm
              variant="landing"
              className="landing-signin-card"
              requiresAuth
              onLoginRequired={onLoginRequired}
            />
          </div>
        </div>
      </section>

      <section id="features" className="landing-strip container">
        <ul className="landing-strip-list">
          <li>
            <span className="landing-strip-num">01</span>
            <div>
              <strong>Short links</strong>
              <p>Type <code>google.com</code> — no https required. Optional custom alias.</p>
            </div>
          </li>
          <li>
            <span className="landing-strip-num">02</span>
            <div>
              <strong>Click tracking</strong>
              <p>See totals and trends per link from your dashboard.</p>
            </div>
          </li>
          <li>
            <span className="landing-strip-num">03</span>
            <div>
              <strong>QR codes</strong>
              <p>Download PNG or SVG for print, posters, or packaging.</p>
            </div>
          </li>
        </ul>
      </section>

      <section id="how-it-works" className="landing-flow container">
        <h2 className="landing-section-title">Three steps, no onboarding tour</h2>
        <ol className="landing-flow-steps">
          <li>
            <span className="landing-flow-label">Paste</span>
            <code>your-long-url.com/page</code>
          </li>
          <li>
            <span className="landing-flow-label">Shorten</span>
            <code>drovashop.com/go/x7k2m9</code>
          </li>
          <li>
            <span className="landing-flow-label">Check</span>
            <code>12 clicks · last 7 days</code>
          </li>
        </ol>
      </section>

      <section id="faq" className="landing-faq container">
        <h2 className="landing-section-title">Common questions</h2>
        <dl className="landing-faq-list">
          <div>
            <dt>Do I need an account?</dt>
            <dd>Yes — sign in to create and manage links. Browsing the site is open.</dd>
          </div>
          <div>
            <dt>Can I use my own domain?</dt>
            <dd>Links use the shared Linkly short domain for now.</dd>
          </div>
          <div>
            <dt>What happens when someone clicks my link?</dt>
            <dd>They&apos;re redirected to your original URL. We record the click for your stats.</dd>
          </div>
        </dl>
      </section>

      <footer className="landing-footer">
        <div className="container landing-footer-inner">
          <div className="landing-footer-brand">
            <Link2 size={18} style={{ transform: 'rotate(-45deg)' }} />
            <span>Linkly</span>
          </div>
          <p className="landing-footer-tagline">Short links with real analytics.</p>
          <nav className="landing-footer-nav">
            <a
              href="/terms"
              onClick={(e) => {
                e.preventDefault();
                navigate('/terms');
                window.scrollTo(0, 0);
              }}
            >
              Terms
            </a>
            <a
              href="/privacy"
              onClick={(e) => {
                e.preventDefault();
                navigate('/privacy');
                window.scrollTo(0, 0);
              }}
            >
              Privacy
            </a>
          </nav>
          <p className="landing-footer-copy">&copy; {new Date().getFullYear()} Linkly</p>
        </div>
      </footer>
    </div>
  );
}
