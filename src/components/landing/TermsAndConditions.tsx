import React from 'react';
import { ArrowRight } from 'lucide-react';

const sections = [
  {
    title: '1. Company Information',
    content: `Second Brain is operated by Second Brain. These Terms and Conditions constitute a legal agreement between you and Second Brain ("we," "us," or "our") regarding your use of the Second Brain knowledge management application and related services.`
  },
  {
    title: '2. Payment Processing',
    content: `Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns. All payments are processed securely through Paddle's platform.`
  },
  {
    title: '3. Acceptance of Terms',
    content: `By accessing and using Second Brain, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use Second Brain. We reserve the right to update or modify these Terms at any time without prior notice. Continued use of Second Brain constitutes acceptance of any changes.`
  },
  {
    title: '4. Use of Second Brain',
    content: `You may use Second Brain for lawful purposes only. You agree not to use Second Brain in any way that may damage, disable, overburden, or impair Second Brain or interfere with any other party's use of Second Brain. Unauthorized use, including but not limited to hacking, scraping, or circumventing security features, is strictly prohibited.`
  },
  {
    title: '5. Subscriptions and Billing',
    content: `Second Brain offers both free and paid subscription plans. When you purchase a subscription, you agree to pay all charges associated with your selected plan. Subscriptions will automatically renew unless cancelled. You may cancel your subscription at any time through your account settings or by contacting our support team.`
  },
  {
    title: '6. Refund Policy',
    content: `We offer a 30-day money-back guarantee for all paid subscriptions. If you are not satisfied with Second Brain within 30 days of your purchase, you may request a full refund. Refunds will be processed through Paddle.com within 5-10 business days. After the 30-day period, subscriptions are non-refundable, but you may cancel at any time to avoid future charges.`
  },
  {
    title: '7. Intellectual Property',
    content: `All content, trademarks, logos, and other intellectual property displayed on Second Brain are the property of Second Brain or its licensors. You may not reproduce, distribute, modify, or create derivative works from any material on Second Brain without express written permission from Second Brain.`
  },
  {
    title: '8. User Obligations',
    content: `You agree to provide accurate and current information when using Second Brain. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You must be at least 18 years old to use Second Brain.`
  },
  {
    title: '9. Privacy and Data Protection',
    content: `Second Brain is committed to protecting your privacy and complying with the General Data Protection Regulation (GDPR). We process personal data lawfully, fairly, and transparently. You have the right to access, rectify, or erase your personal data, restrict or object to its processing, and the right to data portability. For more information about how we handle your data, please refer to our Privacy Policy.`
  },
  {
    title: '10. Limitation of Liability',
    content: `Second Brain and its content are provided "as is" without warranties of any kind, either express or implied. We do not warrant that Second Brain will be uninterrupted or error-free. In no event shall Second Brain be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of Second Brain.`
  },
  {
    title: '11. Contact Information',
    content: `For customer support, billing inquiries, or general questions about Second Brain, please contact us at:
    
Email: productora.analytics@gmail.com
Company: Second Brain

For payment and billing support, please contact Paddle.com directly.`
  },
  {
    title: '12. Governing Law',
    content: `These Terms and Conditions are governed by and construed in accordance with applicable local laws. Any disputes arising from these Terms shall be resolved through appropriate legal channels in accordance with your jurisdiction.`
  }
];

export const TermsAndConditions: React.FC = () => {
  const handleGoToApp = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-4 lg:px-8 lg:py-6">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="flex-shrink-0">
            <img src="/logo.png" alt="Second Brain Logo" className="h-14 w-14 lg:h-16 lg:w-16 rounded-lg" />
          </div>
          <span className="text-xl lg:text-2xl font-bold text-white">Second Brain</span>
        </a>
        
        {/* Go to App Button */}
        <button
          onClick={handleGoToApp}
          className="flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 text-slate-900 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
          style={{ background: '#C2B5FC' }}
        >
          <span>Go to App</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </nav>

      {/* Content */}
      <div className="flex flex-col items-center py-10 px-4 overflow-y-auto">
        <div className="w-full max-w-3xl bg-slate-800 rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-center text-white">Terms and Conditions</h1>
        <div className="space-y-8">
          {sections.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-xl font-semibold mb-2 text-purple-300">{section.title}</h2>
              <p className="text-slate-200 leading-relaxed whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
          <div className="mt-10 text-xs text-slate-400 text-center">
            &copy; {new Date().getFullYear()} Second Brain. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions; 