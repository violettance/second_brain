import React, { useRef, useEffect } from 'react';
import { X, Sparkles, Brain, Target, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PaywallModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ onClose, onUpgrade }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[75vh] flex flex-col"
      >
        {/* Header */}
        <div className="relative p-4 text-center border-b border-slate-700" 
             style={{ backgroundColor: '#C2B5FC20', borderColor: '#C2B5FC50' }}>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
          
          <div className="flex items-center justify-center mb-2">
            <div className="p-3 rounded-full" style={{ background: '#C2B5FC' }}>
              <Sparkles className="h-8 w-8 text-slate-900" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-1">Upgrade to Pro</h2>
          <p className="text-slate-300 text-base">
            Unlock unlimited notes and advanced AI features
          </p>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">
          {/* Features Grid - More compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-start space-x-2 p-3 bg-slate-700/30 rounded-lg">
              <div className="p-1.5 rounded-lg" style={{ background: '#C2B5FC20' }}>
                <Brain className="h-4 w-4" style={{ color: '#C2B5FC' }} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-xs">Knowledge Gap Analysis</h3>
                <p className="text-slate-400 text-xs">Identify missing connections</p>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-3 bg-slate-700/30 rounded-lg">
              <div className="p-1.5 rounded-lg" style={{ background: '#C2B5FC20' }}>
                <Target className="h-4 w-4" style={{ color: '#C2B5FC' }} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-xs">Personalized Recommendations</h3>
                <p className="text-slate-400 text-xs">AI-curated content</p>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-3 bg-slate-700/30 rounded-lg">
              <div className="p-1.5 rounded-lg" style={{ background: '#C2B5FC20' }}>
                <TrendingUp className="h-4 w-4" style={{ color: '#C2B5FC' }} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-xs">Learning Patterns</h3>
                <p className="text-slate-400 text-xs">Optimize learning times</p>
              </div>
            </div>

            <div className="flex items-start space-x-2 p-3 bg-slate-700/30 rounded-lg">
              <div className="p-1.5 rounded-lg" style={{ background: '#C2B5FC20' }}>
                <Zap className="h-4 w-4" style={{ color: '#C2B5FC' }} />
              </div>
              <div>
                <h3 className="text-white font-semibold text-xs">Smart Connections</h3>
                <p className="text-slate-400 text-xs">Auto-discover concepts</p>
              </div>
            </div>
          </div>

          {/* Pricing - More compact */}
          <div className="border rounded-lg p-4 mb-4" style={{ backgroundColor: '#C2B5FC10', borderColor: '#C2B5FC30' }}>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Sparkles className="h-4 w-4" style={{ color: '#C2B5FC' }} />
                <span className="font-semibold text-sm" style={{ color: '#C2B5FC' }}>Pro Plan</span>
              </div>
              <div className="text-2xl font-bold text-white">$9<span className="text-base text-slate-400">/month</span></div>
              <div className="text-slate-400 text-xs">Unlock your full potential</div>
            </div>
          </div>

          {/* CTA Button - Wider and more prominent */}
          <button
            onClick={onUpgrade}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-slate-900 rounded-lg font-semibold text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
            style={{ background: '#C2B5FC' }}
          >
            <Sparkles className="h-5 w-5" />
            <span>Upgrade to Pro</span>
          </button>

          <div className="text-center mt-3">
            <p className="text-slate-500 text-xs">
              ✨ 7-day free trial • 🔒 Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};