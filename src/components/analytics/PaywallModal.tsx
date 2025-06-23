import React from 'react';
import { X, Crown, Sparkles, Brain, Target, TrendingUp, Zap } from 'lucide-react';

interface PaywallModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ onClose, onUpgrade }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative p-6 lg:p-8 text-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-b border-slate-700">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
          
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Crown className="h-10 w-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">Unlock AI Insights</h2>
          <p className="text-slate-300 text-lg">
            Discover hidden patterns in your knowledge with advanced AI analysis
          </p>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-xl">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Brain className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Knowledge Gap Analysis</h3>
                <p className="text-slate-400 text-xs">Identify missing connections in your thinking</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-xl">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Target className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Personalized Recommendations</h3>
                <p className="text-slate-400 text-xs">AI-curated content suggestions</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-xl">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Learning Patterns</h3>
                <p className="text-slate-400 text-xs">Understand your optimal learning times</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-slate-700/30 rounded-xl">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Zap className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Smart Connections</h3>
                <p className="text-slate-400 text-xs">Auto-discover related concepts</p>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span className="text-purple-400 font-semibold">Pro Plan</span>
              </div>
              <div className="text-3xl font-bold text-white mb-1">$9<span className="text-lg text-slate-400">/month</span></div>
              <div className="text-slate-400 text-sm">Unlock unlimited AI insights</div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onUpgrade}
            className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
          >
            <Crown className="h-5 w-5" />
            <span>Upgrade to Pro</span>
          </button>

          <div className="text-center mt-4">
            <p className="text-slate-500 text-xs">
              ✨ 7-day free trial • 🔒 Cancel anytime • 💳 Secure payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};