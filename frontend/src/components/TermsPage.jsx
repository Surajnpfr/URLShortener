import {
  ArrowLeft,
  Shield,
  Globe,
  UserCheck,
  AlertTriangle,
  Copyright,
  UserX,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  Mail
} from 'lucide-react';
import { Card, Divider, Typography } from './antd';

export default function TermsPage({ onNavigate }) {
  const handleGoHome = (e) => {
    e.preventDefault();
    onNavigate('/');
    window.scrollTo(0, 0);
  };

  const sections = [
    {
      title: '1. Acceptance of Terms',
      icon: Shield,
      paragraphs: [
        'By accessing or using Linkly, you agree to these Terms & Conditions. If you do not agree with any part of these terms, you should discontinue use of the service.',
        'Continued use of Linkly after updates become effective constitutes acceptance of the revised terms.'
      ]
    },
    {
      title: '2. Use of Services',
      icon: Globe,
      paragraphs: [
        'Linkly provides URL shortening, analytics, QR code generation, and related link management tools. These services are provided to support lawful communication and distribution of content.',
        'You agree to use the platform only for legitimate purposes and in compliance with applicable local, national, and international laws.'
      ]
    },
    {
      title: '3. User Responsibilities',
      icon: UserCheck,
      paragraphs: ['When using Linkly, you are responsible for:'],
      bullets: [
        'Maintaining the confidentiality of your account and login credentials.',
        'Providing accurate and up-to-date account information.',
        'Ensuring that links and destinations you create comply with legal and ethical standards.',
        'Monitoring and managing content distributed through your shortened links.'
      ]
    },
    {
      title: '4. Prohibited Activities',
      icon: AlertTriangle,
      paragraphs: ['You may not use Linkly to:'],
      bullets: [
        'Create phishing, deceptive, or fraudulent links.',
        'Distribute malware, spyware, or other harmful code.',
        'Promote spam, harassment, hate content, or unlawful material.',
        'Violate intellectual property rights or share protected content without authorization.',
        'Attempt to disrupt, overload, or compromise the integrity of the platform.'
      ]
    },
    {
      title: '5. Intellectual Property',
      icon: Copyright,
      paragraphs: [
        'All software, branding, designs, trademarks, and content associated with Linkly remain the exclusive property of Linkly or its licensors.',
        'No part of the platform may be copied, modified, republished, or redistributed without prior written consent.'
      ]
    },
    {
      title: '6. Account Suspension and Termination',
      icon: UserX,
      paragraphs: [
        'Linkly may suspend or terminate access to any account that violates these terms or poses a risk to users, systems, or third parties.',
        'We reserve the right to investigate misuse and take appropriate action, including permanent account restrictions.'
      ]
    },
    {
      title: '7. Third-Party Links',
      icon: ExternalLink,
      paragraphs: [
        'Linkly facilitates redirection to third-party websites. We do not control or endorse those destinations and are not responsible for their availability, security, or content.',
        'You access third-party resources at your own risk and should review their terms and privacy practices separately.'
      ]
    },
    {
      title: '8. Limitation of Liability',
      icon: HelpCircle,
      paragraphs: [
        'The service is provided on an "as is" and "as available" basis without warranties of uninterrupted access or error-free operation.',
        'To the fullest extent permitted by law, Linkly is not liable for indirect, incidental, consequential, or special damages arising from use of the platform.'
      ]
    },
    {
      title: '9. Changes to These Terms',
      icon: RefreshCw,
      paragraphs: [
        'We may revise these Terms & Conditions periodically to reflect operational, legal, or policy updates.',
        'Material changes will be posted on this page. Your continued use of Linkly after changes are published indicates acceptance of the updated terms.'
      ]
    },
    {
      title: '10. Contact Information',
      icon: Mail,
      paragraphs: ['For questions about these Terms & Conditions, please contact us at:'],
      contact: 'support@linkly.com'
    }
  ];

  return (
    <div className="terms-page-container container terms-page-layout">
      
      {/* Back to Home Link */}
      <div className="terms-back-link-wrap">
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
      <div className="terms-hero terms-hero-refined">
        <Typography.Title level={1} style={{ marginBottom: '16px', letterSpacing: '-1px' }}>
          Terms & Conditions
        </Typography.Title>
        <Typography.Paragraph className="terms-subtitle">
          Please read these terms carefully before using Linkly.
        </Typography.Paragraph>
      </div>

      <Card className="terms-single-card" bordered>
        <div className="terms-sections-wrap">
          {sections.map((section, index) => {
            const SectionIcon = section.icon;
            const isWarningSection = section.title.startsWith('4.');

            return (
              <div key={section.title}>
                <section className="terms-section-block">
                  <h2 className="terms-section-heading">
                    <span
                      className={`terms-section-icon ${isWarningSection ? 'terms-section-icon-warning' : ''}`}
                      aria-hidden="true"
                    >
                      <SectionIcon size={15} />
                    </span>
                    {section.title}
                  </h2>

                  {section.paragraphs?.map((text) => (
                    <Typography.Paragraph key={text} className="terms-legal-paragraph">
                      {text}
                    </Typography.Paragraph>
                  ))}

                  {section.bullets?.length ? (
                    <ul className="terms-legal-list">
                      {section.bullets.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}

                  {section.contact ? (
                    <Typography.Link href={`mailto:${section.contact}`} className="terms-contact-link">
                      {section.contact}
                    </Typography.Link>
                  ) : null}
                </section>

                {index < sections.length - 1 ? (
                  <Divider className="terms-divider" />
                ) : null}
              </div>
            );
          })}

          <Divider className="terms-divider terms-divider-footer" />
          <Typography.Text type="secondary" className="terms-updated-note">
            Last Updated: June 2026
          </Typography.Text>
        </div>
      </Card>

    </div>
  );
}
