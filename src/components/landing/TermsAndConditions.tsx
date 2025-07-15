import React from 'react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing and using Second Brain, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use Second Brain. We reserve the right to update or modify these Terms at any time without prior notice. Continued use of Second Brain constitutes acceptance of any changes.`
  },
  {
    title: '2. Use of Second Brain',
    content: `You may use Second Brain for lawful purposes only. You agree not to use Second Brain in any way that may damage, disable, overburden, or impair Second Brain or interfere with any other party's use of Second Brain. Unauthorized use, including but not limited to hacking, scraping, or circumventing security features, is strictly prohibited.`
  },
  {
    title: '3. Intellectual Property',
    content: `All content, trademarks, logos, and other intellectual property displayed on Second Brain are the property of the owner or its licensors. You may not reproduce, distribute, modify, or create derivative works from any material on Second Brain without express written permission.`
  },
  {
    title: '4. Limitation of Liability',
    content: `Second Brain and its content are provided "as is" without warranties of any kind, either express or implied. We do not warrant that Second Brain will be uninterrupted or error-free. In no event shall the owner be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of Second Brain.`
  },
  {
    title: '5. User Obligations',
    content: `You agree to provide accurate and current information when using Second Brain. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.`
  },
  {
    title: '6. GDPR Compliance',
    content: `Second Brain is committed to protecting your privacy and complying with the General Data Protection Regulation (GDPR). We process personal data lawfully, fairly, and transparently. You have the right to access, rectify, or erase your personal data, restrict or object to its processing, and the right to data portability. For more information about how we handle your data, please refer to our Privacy Policy.`
  },
  {
    title: '7. Governing Law',
    content: `These Terms and Conditions are governed by and construed in accordance with the laws of the applicable jurisdiction. Any disputes arising from these Terms shall be resolved in the courts of the applicable jurisdiction.`
  }
];

export const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-10 px-4 overflow-y-auto">
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
  );
};

export default TermsAndConditions; 