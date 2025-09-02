import React from 'react';

const sections = [
  {
    title: '1. Introduction',
    content: `This Privacy Policy describes how Productora LLC ("we," "us," or "our") collects, uses, and protects your personal information when you use Second Brain, our knowledge management application. We are committed to protecting your privacy and complying with applicable data protection laws, including the General Data Protection Regulation (GDPR).`
  },
  {
    title: '2. Information We Collect',
    content: `We collect the following types of information:

Personal Information:
• Name and email address (for account creation)
• Profile information you choose to provide
• Payment information (processed securely through Paddle.com)

Usage Information:
• Notes, projects, and content you create in the application
• Usage patterns and feature interactions
• Device information and browser type
• IP address and location data

Technical Information:
• Log files and error reports
• Performance and analytics data
• Cookies and similar tracking technologies`
  },
  {
    title: '3. How We Use Your Information',
    content: `We use your information for the following purposes:

Service Provision:
• To provide and maintain Second Brain services
• To process your subscription and payments
• To provide customer support
• To send important service updates

Improvement and Analytics:
• To improve our application features
• To analyze usage patterns and performance
• To develop new features and services
• To ensure security and prevent fraud

Communication:
• To respond to your inquiries
• To send product updates (with your consent)
• To provide technical support`
  },
  {
    title: '4. Information Sharing',
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:

Service Providers:
• Paddle.com for payment processing
• Supabase for secure data storage
• Google Cloud for hosting services

Legal Requirements:
• When required by law or legal process
• To protect our rights and prevent fraud
• To comply with regulatory requirements

Business Transfers:
• In the event of a merger, acquisition, or sale of assets`
  },
  {
    title: '5. Data Security',
    content: `We implement industry-standard security measures to protect your data:

• End-to-end encryption for data transmission
• Secure data storage with access controls
• Regular security audits and updates
• Two-factor authentication options
• Secure payment processing through Paddle.com

However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`
  },
  {
    title: '6. Your Rights (GDPR)',
    content: `Under GDPR, you have the following rights regarding your personal data:

• Right to Access: Request a copy of your personal data
• Right to Rectification: Correct inaccurate personal data
• Right to Erasure: Request deletion of your personal data
• Right to Restrict Processing: Limit how we use your data
• Right to Data Portability: Transfer your data to another service
• Right to Object: Object to certain types of processing
• Right to Withdraw Consent: Withdraw consent at any time

To exercise these rights, contact us at productora.analytics@gmail.com`
  },
  {
    title: '7. Data Retention',
    content: `We retain your personal information for as long as necessary to provide our services and comply with legal obligations:

• Account information: Until you delete your account
• Usage data: Up to 2 years for analytics purposes
• Payment information: As required by financial regulations
• Support communications: Up to 3 years

When you delete your account, we will permanently delete your personal data within 30 days, except where retention is required by law.`
  },
  {
    title: '8. Cookies and Tracking',
    content: `We use cookies and similar technologies to:

• Maintain your login session
• Remember your preferences
• Analyze application performance
• Provide personalized features

You can control cookies through your browser settings, but disabling certain cookies may affect application functionality.`
  },
  {
    title: '9. Children Privacy',
    content: `Second Brain is not intended for use by children under 18 years of age. We do not knowingly collect personal information from children under 18. If you believe we have collected information from a child under 18, please contact us immediately.`
  },
  {
    title: '10. International Data Transfers',
    content: `Your information may be transferred to and processed in countries other than your own. We ensure that such transfers are made in accordance with applicable data protection laws and with appropriate safeguards in place.`
  },
  {
    title: '11. Changes to This Privacy Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of Second Brain after any changes constitutes acceptance of the updated Privacy Policy.`
  },
  {
    title: '12. Contact Us',
    content: `If you have any questions about this Privacy Policy or how we handle your personal information, please contact us:

Email: productora.analytics@gmail.com
Company: Productora LLC

For data protection inquiries specifically, you may also contact our Data Protection Officer at: productora.analytics@gmail.com`
  }
];

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-10 px-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-800 rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-center text-white">Privacy Policy</h1>
        <p className="text-slate-400 text-center mb-8">
          Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-xl font-semibold mb-4 text-purple-300">{section.title}</h2>
              <p className="text-slate-200 leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-xs text-slate-400 text-center">
          &copy; {new Date().getFullYear()} Productora LLC. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
