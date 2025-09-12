import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../../lib/logger';
import { ArrowRight } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for capturing your first ideas',
    features: [
      'Daily notes & reflections',
      'Short-term memory (30-day auto-archive)',
      'Long-term memory storage',
      'Basic project management',
      'Voice recording & transcription',
      'AI-powered tagging system',
      'Interactive knowledge graph',
      'Limited mermaid diagram generation',
      'Analytics dashboard',
      'Export capabilities'
    ],
    buttonText: 'Start Building',
    buttonStyle: 'bg-slate-700 hover:bg-slate-600 text-white',
    popular: false
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    description: 'For polymaths building their second brain',
    features: [
      'Everything in Free',
      'Connection discovery',
      'Pattern recognition & trends',
      'Daily insights for short-term notes',
      'Deep AI analysis of your permanent knowledge base',
      'Advanced analytics with AI-powered insights',
      'Mermaid diagram generation',
      'Offline mode + sync',
      'Feature request priority',
      'Theme choices'
    ],
    buttonText: 'Start Pro Trial',
    buttonStyle: 'bg-purple-600 hover:bg-purple-700 text-white',
    popular: true
  }
];

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleUpgrade = () => {
    // In a real implementation, this would trigger Paddle checkout
    logger.info('User clicked Pro subscription', { component: 'PricingPage' });
    alert('Paddle checkout would open here for Pro subscription');
  };

  const handleContactSales = () => {
    window.location.href = 'mailto:productora.analytics@gmail.com?subject=Enterprise Pricing Inquiry';
  };

  const handleGoToApp = () => {
    navigate('/');
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

      {/* Main Content */}
      <div className="relative z-10 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-900/20 border border-purple-500/20 text-purple-300 text-sm font-medium mb-6">
              <span className="mr-2">✨</span>
              Simple, Transparent Pricing
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Build Your <span className="text-purple-400">Second Brain</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
              Capture every idea, discover hidden connections, and amplify your thinking. Perfect for polymaths who want to turn scattered thoughts into powerful knowledge.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-slate-800 rounded-2xl p-8 border-2 transition-all duration-200 hover:scale-105 flex flex-col ${
                  plan.popular
                    ? 'border-purple-500 shadow-2xl shadow-purple-500/20'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400 ml-2">{plan.period}</span>
                  </div>
                  <p className="text-slate-400">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-purple-400 mr-3 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={
                    plan.name === 'Free'
                      ? handleGetStarted
                      : plan.name === 'Pro'
                      ? handleUpgrade
                      : handleContactSales
                  }
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${plan.buttonStyle}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mt-24 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-8">
              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-3">How does the 30-day evaluation work?</h3>
                <p className="text-slate-400">
                  Your ideas start in short-term memory where they're automatically archived after 30 days. During this time, you can decide which ideas deserve to move to your long-term memory for permanent storage.
                </p>
              </div>
              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-3">What makes this different from other note-taking apps?</h3>
                <p className="text-slate-400">
                  Second Brain focuses on connection discovery. Our AI finds hidden relationships between your ideas, creating a knowledge graph that helps you see patterns and insights you might have missed.
                </p>
              </div>
              <div className="bg-slate-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-3">What happens to my knowledge graph if I cancel?</h3>
                <p className="text-slate-400">
                  Your data remains accessible for 30 days after cancellation. You can export all your notes and connections before the end of this period to preserve your second brain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Second Brain Logo" className="h-8 w-8 rounded-lg" />
              <span className="text-lg font-bold text-white">Second Brain</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <a href="/terms-and-conditions" className="text-slate-400 hover:text-white transition-colors">
                Terms & Conditions
              </a>
              <a href="/privacy-policy" className="text-slate-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="mailto:productora.analytics@gmail.com" className="text-slate-400 hover:text-white transition-colors">
                Support
              </a>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Second Brain. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
