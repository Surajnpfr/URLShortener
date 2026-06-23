import { 
  ArrowLeft, Info, Database, Eye, Cookie, Layers, 
  Lock, Share2, Scale, Clock, Heart, RefreshCw, Mail 
} from 'lucide-react';
import { Card, Divider, Space, Typography, Row, Col } from './antd';

export default function PrivacyPage({ onNavigate }) {
  const handleGoHome = (e) => {
    e.preventDefault();
    onNavigate('/');
    window.scrollTo(0, 0);
  };

  return (
    <div className="privacy-page-container container" style={{ padding: '40px 24px 80px 24px', maxWidth: '840px' }}>
      
      {/* Back to Home Link */}
      <div style={{ marginBottom: '32px' }}>
        <a 
          href="/" 
          onClick={handleGoHome} 
          className="ant-typography-link" 
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </a>
      </div>

      {/* Hero Section */}
      <div className="privacy-hero" style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Typography.Title level={1} style={{ marginBottom: '16px', letterSpacing: '-1px' }}>
          Privacy Policy
        </Typography.Title>
        <Typography.Paragraph style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto' }}>
          Your privacy matters to us. This policy explains how Linkly collects, uses, and protects your information.
        </Typography.Paragraph>
      </div>

      {/* Content Space */}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        
        {/* 1. Introduction */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="feature-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <Info size={16} />
              </div>
              <span>1. Introduction</span>
            </div>
          }
        >
          <Typography.Paragraph>
            At Linkly, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how information is collected, used, stored, and safeguarded while you use our URL shortening services.
          </Typography.Paragraph>
        </Card>

        {/* 2. Information We Collect */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="feature-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <Database size={16} />
              </div>
              <span>2. Information We Collect</span>
            </div>
          }
        >
          <Typography.Paragraph style={{ marginBottom: '20px' }}>
            We may collect the following information:
          </Typography.Paragraph>

          {/* Grid Layout using Row and Col components */}
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)', height: '100%' }}>
                <Typography.Title level={4} style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '12px' }}>
                  Personal Information
                </Typography.Title>
                <ul className="pricing-features" style={{ paddingLeft: '4px' }}>
                  <li style={{ alignItems: 'flex-start' }}>
                    <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
                    <span>Email address.</span>
                  </li>
                  <li style={{ alignItems: 'flex-start' }}>
                    <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
                    <span>Account details.</span>
                  </li>
                  <li style={{ alignItems: 'flex-start' }}>
                    <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
                    <span>Contact information provided by users.</span>
                  </li>
                </ul>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '12px', border: '1px solid var(--card-border)', height: '100%' }}>
                <Typography.Title level={4} style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '12px' }}>
                  Usage Information
                </Typography.Title>
                <ul className="pricing-features" style={{ paddingLeft: '4px' }}>
                  <li style={{ alignItems: 'flex-start' }}>
                    <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
                    <span>IP address, browser type & version.</span>
                  </li>
                  <li style={{ alignItems: 'flex-start' }}>
                    <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
                    <span>Device & operating system details.</span>
                  </li>
                  <li style={{ alignItems: 'flex-start' }}>
                    <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
                    <span>Referring pages, date & time of access.</span>
                  </li>
                  <li style={{ alignItems: 'flex-start' }}>
                    <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
                    <span>Click statistics and analytics data.</span>
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 3. How We Use Your Information */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="feature-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <Eye size={16} />
              </div>
              <span>3. How We Use Your Information</span>
            </div>
          }
        >
          <Typography.Paragraph>
            Linkly uses collected information to:
          </Typography.Paragraph>
          <ul className="pricing-features" style={{ marginTop: '12px', paddingLeft: '8px' }}>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Provide and maintain URL shortening services.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Generate analytics and click statistics.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Improve platform performance and user experience.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Respond to support requests.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Detect abuse, spam, and malicious activities.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Ensure security and reliability.</span>
            </li>
          </ul>
        </Card>

        {/* 4. Cookies and Tracking Technologies */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="feature-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <Cookie size={16} />
              </div>
              <span>4. Cookies and Tracking Technologies</span>
            </div>
          }
        >
          <Typography.Paragraph style={{ marginBottom: '12px' }}>
            Linkly may use cookies and similar technologies to:
          </Typography.Paragraph>
          <ul className="pricing-features" style={{ paddingLeft: '8px', marginBottom: '16px' }}>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Maintain login sessions.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Remember user preferences.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Improve website functionality.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Analyze traffic and usage patterns.</span>
            </li>
          </ul>
          <Typography.Paragraph>
            Users may disable cookies through browser settings, although certain features may not function properly.
          </Typography.Paragraph>
        </Card>

        {/* 5. Third-Party Services */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="feature-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <Layers size={16} />
              </div>
              <span>5. Third-Party Services</span>
            </div>
          }
        >
          <Typography.Paragraph style={{ marginBottom: '12px' }}>
            Linkly may rely on trusted third-party services for:
          </Typography.Paragraph>
          <ul className="pricing-features" style={{ paddingLeft: '8px', marginBottom: '16px' }}>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Website hosting.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Analytics.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Email communications.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Payment processing for premium plans.</span>
            </li>
          </ul>
          <Typography.Paragraph>
            These providers have their own privacy policies and practices.
          </Typography.Paragraph>
        </Card>

        {/* 6. Data Security */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="feature-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <Lock size={16} />
              </div>
              <span>6. Data Security</span>
            </div>
          }
        >
          <Typography.Paragraph style={{ marginBottom: '12px' }}>
            We implement reasonable technical and organizational measures to protect user information from unauthorized access, misuse, alteration, or disclosure.
          </Typography.Paragraph>
          <Typography.Paragraph>
            While we strive to protect your information, no online service can guarantee complete security.
          </Typography.Paragraph>
        </Card>

        {/* 7. Data Sharing */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="feature-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <Share2 size={16} />
              </div>
              <span>7. Data Sharing</span>
            </div>
          }
        >
          <Typography.Paragraph style={{ marginBottom: '12px' }}>
            Linkly does not sell, rent, or trade personal information to third parties.
          </Typography.Paragraph>
          <Typography.Paragraph style={{ marginBottom: '12px' }}>
            Information may only be shared:
          </Typography.Paragraph>
          <ul className="pricing-features" style={{ paddingLeft: '8px' }}>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>When required by law.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>To protect the rights and security of Linkly.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>To prevent fraud, abuse, or illegal activities.</span>
            </li>
          </ul>
        </Card>

        {/* 8. User Rights */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="feature-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <Scale size={16} />
              </div>
              <span>8. User Rights</span>
            </div>
          }
        >
          <Typography.Paragraph style={{ marginBottom: '12px' }}>
            Users have the right to:
          </Typography.Paragraph>
          <ul className="pricing-features" style={{ paddingLeft: '8px' }}>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Access their information.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Request correction of inaccurate information.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Request deletion of personal data.</span>
            </li>
            <li style={{ alignItems: 'flex-start' }}>
              <div className="purple-badge" style={{ padding: '2px 8px', fontSize: '0.75rem', marginTop: '2px' }}>✓</div>
              <span>Contact us regarding privacy concerns.</span>
            </li>
          </ul>
        </Card>

        {/* 9. Data Retention */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="feature-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <Clock size={16} />
              </div>
              <span>9. Data Retention</span>
            </div>
          }
        >
          <Typography.Paragraph>
            Linkly retains information only for as long as necessary to provide services, comply with legal obligations, resolve disputes, and maintain security.
          </Typography.Paragraph>
        </Card>

        {/* 10. Children's Privacy */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="feature-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <Heart size={16} />
              </div>
              <span>10. Children's Privacy</span>
            </div>
          }
        >
          <Typography.Paragraph>
            Linkly is not intended for children under the age of 13, and we do not knowingly collect personal information from minors.
          </Typography.Paragraph>
        </Card>

        {/* 11. Changes to This Privacy Policy */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="feature-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <RefreshCw size={16} />
              </div>
              <span>11. Changes to This Privacy Policy</span>
            </div>
          }
        >
          <Typography.Paragraph style={{ marginBottom: '12px' }}>
            We may update this Privacy Policy periodically. Changes will become effective immediately after being posted on this page.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Continued use of Linkly constitutes acceptance of the updated policy.
          </Typography.Paragraph>
        </Card>

        {/* 12. Contact Us */}
        <Card 
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="feature-icon-box" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <Mail size={16} />
              </div>
              <span>12. Contact Us</span>
            </div>
          }
        >
          <Typography.Paragraph>
            For questions regarding this Privacy Policy, users may contact:
          </Typography.Paragraph>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
            <Typography.Text type="secondary" strong>Email:</Typography.Text>
            <Typography.Link href="mailto:support@linkly.com" style={{ fontSize: '0.95rem' }}>
              support@linkly.com
            </Typography.Link>
          </div>
        </Card>

      </Space>

      <Divider style={{ margin: '40px 0 24px 0' }} />

      {/* Footer Note */}
      <div style={{ textAlign: 'center' }}>
        <Typography.Text type="secondary" style={{ fontSize: '0.875rem' }}>
          Last Updated: June 2026
        </Typography.Text>
      </div>

    </div>
  );
}
