import React from 'react';
import { 
  Brain, 
  ArrowRight, 
  Zap, 
  Network, 
  BookOpen, 
  Search,
  Star,
  Users,
  Shield,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

interface LandingPageProps {
  onGoToApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToApp }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23374151%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-4 lg:px-8 lg:py-6">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <div className="flex-shrink-0">
            <img src="/logo.png" alt="Second Brain Logo" className="h-14 w-14 lg:h-16 lg:w-16 rounded-lg" />
          </div>
          <span className="text-xl lg:text-2xl font-bold text-white">Second Brain</span>
        </a>
        
        {/* Desktop Navigation - Center */}
        <div className="hidden md:flex items-center space-x-8">
          <a
            href="/our-pricing"
            className="text-slate-300 hover:text-white transition-colors font-medium"
          >
            Pricing
          </a>
          <a
            href="/privacy-policy"
            className="text-slate-300 hover:text-white transition-colors font-medium"
          >
            Privacy
          </a>
          <a
            href="/terms-and-conditions"
            className="text-slate-300 hover:text-white transition-colors font-medium"
          >
            Terms
          </a>
        </div>

        {/* Desktop CTA Button - Right */}
        <div className="hidden md:block">
          <button
            onClick={onGoToApp}
            className="flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 text-slate-900 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl"
            style={{ background: '#C2B5FC' }}
          >
            <span>Go to App</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-white"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-b border-slate-700 md:hidden">
            <div className="p-4 space-y-4">
              <a
                href="/our-pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-white transition-colors font-medium text-center py-2"
              >
                Pricing
              </a>
              <a
                href="/privacy-policy"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-white transition-colors font-medium text-center py-2"
              >
                Privacy
              </a>
              <a
                href="/terms-and-conditions"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-300 hover:text-white transition-colors font-medium text-center py-2"
              >
                Terms
              </a>
              <button
                onClick={() => {
                  onGoToApp();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-slate-900 rounded-xl font-semibold"
                style={{ background: '#C2B5FC' }}
              >
                <span>Go to App</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-8 lg:pt-20 pb-16 lg:pb-32">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6 lg:mb-8">
            <div className="border rounded-full px-4 lg:px-6 py-2 lg:py-3" style={{ backgroundColor: '#C2B5FC20', borderColor: '#C2B5FC50' }}>
              <div className="flex items-center space-x-2" style={{ color: '#C2B5FC' }}>
                <Sparkles className="h-4 w-4" />
                <span className="text-xs lg:text-sm font-medium">AI-Powered Knowledge Management</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-7xl font-bold text-white mb-6 lg:mb-8 leading-tight px-4">
            Build Your
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, #C2B5FC, #A78BFA)` }}> Second Brain</span>
          </h1>
          
          <p className="text-lg lg:text-2xl text-slate-300 mb-8 lg:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
            Transform scattered thoughts into connected knowledge. Capture, organize, and discover insights 
            with our intelligent note-taking system that grows smarter with every entry.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 px-4">
            <button
              onClick={onGoToApp}
              className="w-full sm:w-auto flex items-center justify-center space-x-3 px-6 lg:px-8 py-3 lg:py-4 text-slate-900 rounded-xl font-semibold text-base lg:text-lg hover:opacity-90 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105"
              style={{ background: '#C2B5FC' }}
            >
              <span>Start Building</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 lg:px-8 py-3 lg:py-4 border border-slate-600 text-slate-300 rounded-xl font-semibold text-base lg:text-lg hover:bg-slate-800 hover:border-slate-500 transition-all duration-200">
              <span>Watch Demo</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 mt-16 lg:mt-24 px-4">
          <div className="text-center">
            <div className="text-2xl lg:text-4xl font-bold text-white mb-2">10K+</div>
            <div className="text-slate-400">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl lg:text-4xl font-bold text-white mb-2">1M+</div>
            <div className="text-slate-400">Notes Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl lg:text-4xl font-bold text-white mb-2">500K+</div>
            <div className="text-slate-400">Connections Made</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 lg:mb-6">
            Powerful Features for
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, #10b981, #C2B5FC)` }}> Polymaths</span>
          </h2>
          <p className="text-lg lg:text-xl text-slate-300 max-w-3xl mx-auto px-4">
            Everything you need to capture, connect, and cultivate your ideas into a thriving knowledge ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Feature 1 - Daily Notes */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 lg:p-8 hover:bg-slate-800/70 transition-all duration-200">
            <div className="bg-green-500/20 p-3 rounded-xl w-fit mb-4 lg:mb-6">
              <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 text-green-400" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 lg:mb-4">Daily Notes</h3>
            <p className="text-slate-300 leading-relaxed">
              Capture daily thoughts and reflections with automatic linking to your knowledge base.
            </p>
          </div>

          {/* Feature 2 - Voice Recording */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 lg:p-8 hover:bg-slate-800/70 transition-all duration-200">
            <div className="bg-blue-500/20 p-3 rounded-xl w-fit mb-4 lg:mb-6">
              <Zap className="h-6 w-6 lg:h-8 lg:w-8 text-blue-400" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 lg:mb-4">Voice Recording</h3>
            <p className="text-slate-300 leading-relaxed">
              Record your thoughts instantly with voice-to-text transcription and automatic note creation.
            </p>
          </div>

          {/* Feature 3 - Knowledge Graph */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 lg:p-8 hover:bg-slate-800/70 transition-all duration-200">
            <div className="p-3 rounded-xl w-fit mb-4 lg:mb-6" style={{ backgroundColor: '#C2B5FC20' }}>
              <Network className="h-6 w-6 lg:h-8 lg:w-8" style={{ color: '#C2B5FC' }} />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 lg:mb-4">Knowledge Graph</h3>
            <p className="text-slate-300 leading-relaxed">
              Visualize relationships between your notes and ideas in an interactive network graph.
            </p>
          </div>

          {/* Feature 4 - Smart Diagrams */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 lg:p-8 hover:bg-slate-800/70 transition-all duration-200">
            <div className="bg-purple-500/20 p-3 rounded-xl w-fit mb-4 lg:mb-6">
              <Brain className="h-6 w-6 lg:h-8 lg:w-8 text-purple-400" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 lg:mb-4">Smart Diagrams</h3>
            <p className="text-slate-300 leading-relaxed">
              Generate Mermaid diagrams from your notes to visualize complex ideas and processes.
            </p>
          </div>

          {/* Feature 5 - Daily Insights */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 lg:p-8 hover:bg-slate-800/70 transition-all duration-200">
            <div className="bg-orange-500/20 p-3 rounded-xl w-fit mb-4 lg:mb-6">
              <Sparkles className="h-6 w-6 lg:h-8 lg:w-8 text-orange-400" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 lg:mb-4">Daily Insights</h3>
            <p className="text-slate-300 leading-relaxed">
              Get AI-powered insights and patterns from your daily notes to discover hidden connections.
            </p>
          </div>

          {/* Feature 6 - Connection Discovery */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 lg:p-8 hover:bg-slate-800/70 transition-all duration-200">
            <div className="bg-pink-500/20 p-3 rounded-xl w-fit mb-4 lg:mb-6">
              <Search className="h-6 w-6 lg:h-8 lg:w-8 text-pink-400" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 lg:mb-4">Connection Discovery</h3>
            <p className="text-slate-300 leading-relaxed">
              AI automatically discovers and suggests connections between your ideas and notes.
            </p>
          </div>

          {/* Feature 7 - AI Tagging */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 lg:p-8 hover:bg-slate-800/70 transition-all duration-200">
            <div className="bg-indigo-500/20 p-3 rounded-xl w-fit mb-4 lg:mb-6">
              <Brain className="h-6 w-6 lg:h-8 lg:w-8 text-indigo-400" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 lg:mb-4">AI-Powered Tagging</h3>
            <p className="text-slate-300 leading-relaxed">
              Automatically tag and categorize your notes with intelligent AI-powered suggestions.
            </p>
          </div>

          {/* Feature 8 - Memory System */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 lg:p-8 hover:bg-slate-800/70 transition-all duration-200">
            <div className="bg-teal-500/20 p-3 rounded-xl w-fit mb-4 lg:mb-6">
              <Users className="h-6 w-6 lg:h-8 lg:w-8 text-teal-400" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 lg:mb-4">Memory System</h3>
            <p className="text-slate-300 leading-relaxed">
              Short-term and long-term memory storage with automatic archiving and connection discovery.
            </p>
          </div>

          {/* Feature 9 - Analytics Dashboard */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 lg:p-8 hover:bg-slate-800/70 transition-all duration-200">
            <div className="bg-red-500/20 p-3 rounded-xl w-fit mb-4 lg:mb-6">
              <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-red-400" />
            </div>
            <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 lg:mb-4">Analytics Dashboard</h3>
            <p className="text-slate-300 leading-relaxed">
              Track your knowledge growth with insights, patterns, and productivity analytics.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 lg:mb-6">
            Loved by
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, #C2B5FC, #A78BFA)` }}> Polymaths</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-slate-300 mb-4 lg:mb-6 leading-relaxed text-sm lg:text-base">
              "Second Brain has revolutionized how I manage my research and helps me discover connections I never would have found."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full" style={{ background: '#C2B5FC' }}></div>
              <div>
                <div className="text-white font-semibold text-sm lg:text-base">Dr. Sarah Chen</div>
                <div className="text-slate-400 text-xs lg:text-sm">Research Scientist</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 lg:p-8">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-slate-300 mb-4 lg:mb-6 leading-relaxed text-sm lg:text-base">
              "The knowledge graph visualization is incredible. I can see how all my ideas connect and build upon each other."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-green-500 to-purple-600 rounded-full"></div>
              <div>
                <div className="text-white font-semibold text-sm lg:text-base">Marcus Johnson</div>
                <div className="text-slate-400 text-xs lg:text-sm">Product Manager</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 lg:p-8 md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <p className="text-slate-300 mb-4 lg:mb-6 leading-relaxed text-sm lg:text-base">
              "Finally, a note-taking app that thinks like I do. The daily notes feature keeps me consistent and productive."
            </p>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"></div>
              <div>
                <div className="text-white font-semibold text-sm lg:text-base">Elena Rodriguez</div>
                <div className="text-slate-400 text-xs lg:text-sm">Writer & Educator</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 lg:px-8 py-16 lg:py-24 text-center">
        <div className="border rounded-3xl p-8 lg:p-12" style={{ backgroundColor: '#C2B5FC20', borderColor: '#C2B5FC50' }}>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 lg:mb-6">
            Ready to Build Your Second Brain?
          </h2>
          <p className="text-lg lg:text-xl text-slate-300 mb-6 lg:mb-8 max-w-2xl mx-auto">
            Join thousands of polymaths who have transformed their thinking with Second Brain.
          </p>
          <button
            onClick={onGoToApp}
            className="w-full sm:w-auto flex items-center justify-center space-x-3 px-6 lg:px-8 py-3 lg:py-4 text-slate-900 rounded-xl font-semibold text-base lg:text-lg hover:opacity-90 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 mx-auto"
            style={{ background: '#C2B5FC' }}
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col space-y-6">
            {/* Top Section */}
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <img src="/logo.png" alt="Second Brain Logo" className="h-12 w-12 lg:h-14 lg:w-14 rounded-lg" />
                </div>
                <span className="text-lg lg:text-xl font-bold text-white">Second Brain</span>
              </div>
              
              {/* Navigation Links */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <a href="/our-pricing" className="text-slate-400 hover:text-white transition-colors">
                  Pricing
                </a>
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
            
            {/* Bottom Section */}
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 pt-4 border-t border-slate-800">
              <div className="text-slate-400 text-sm text-center md:text-left">
                © 2025 Second Brain. All rights reserved.
              </div>
              <div className="text-slate-500 text-xs text-center md:text-right">
                Payment processing by Paddle.com
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};