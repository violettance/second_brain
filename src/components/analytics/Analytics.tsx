import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Brain, 
  Clock, 
  Tag, 
  TrendingUp,
  PieChart,
  Activity,
  Filter,
  RefreshCw,
  Zap,
  Target,
  Crown,
  Lock
} from 'lucide-react';
import { BubbleChart } from './BubbleChart';
import { BarChart } from './BarChart';
import { LineChart } from './LineChart';
import { WordCloud } from './WordCloud';
import { KnowledgeGraphAdvanced } from './KnowledgeGraphAdvanced';
import { BrainGrowthChart } from './BrainGrowthChart';
import { TopicEvolutionChart } from './TopicEvolutionChart';
import { PaywallModal } from './PaywallModal';
import { useAnalytics } from '../../hooks/useAnalytics';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [graphFilter, setGraphFilter] = useState('all');
  const [showPaywall, setShowPaywall] = useState(false);
  const { analyticsData, isLoading, exportData } = useAnalytics(timeRange);

  const handleExport = async () => {
    try {
      await exportData();
      // Show success message
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleUpgrade = () => {
    // In real app, this would integrate with RevenueCat
    console.log('Upgrade to Pro clicked - integrate with RevenueCat');
    setShowPaywall(false);
    // Redirect to payment flow
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-slate-900 overflow-y-auto h-screen">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-3 text-slate-400">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Analyzing your knowledge...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-900 overflow-y-auto h-screen">
      {/* Mobile-Optimized Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 lg:p-6 sticky top-0 z-10">
        <div className="flex flex-col space-y-4">
          {/* Simple Mobile Title */}
          <div className="flex items-center justify-between">
            <div className="pl-12 lg:pl-0">
              <h1 className="text-xl lg:text-3xl font-bold text-white">Analytics</h1>
              <p className="text-slate-400 text-xs lg:text-base hidden lg:block">
                Insights into your knowledge patterns and thinking trends
              </p>
            </div>
            
            {/* Mobile Export Button */}
            <button
              onClick={handleExport}
              className="flex items-center justify-center space-x-2 px-3 lg:px-4 py-2 text-slate-900 rounded-lg font-semibold transition-colors text-xs lg:text-sm hover:opacity-90"
              style={{ background: '#C2B5FC' }}
            >
              <Download className="h-3 w-3 lg:h-4 lg:w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
          
          {/* Simple Controls Row */}
          <div className="flex items-center justify-between">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 text-xs lg:text-sm flex-1 max-w-[140px]"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
            >
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
              <option value="90d">3 months</option>
              <option value="1y">1 year</option>
              <option value="all">All time</option>
            </select>
            
            <div className="text-xs lg:text-sm text-slate-400">
              {analyticsData.totalNotes} total thoughts
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6 space-y-6 bg-slate-900 min-h-full">
        {/* Key Metrics - Pastel Colors */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-400 text-sm font-medium">Total Thoughts</h3>
              <Brain className="h-5 w-5" style={{ color: '#a7c7e7' }} />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">{analyticsData.totalNotes}</div>
            <div className="text-sm" style={{ color: '#b8e6b8' }}>+{analyticsData.growthRate}% this month</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-400 text-sm font-medium">Active Topics</h3>
              <Tag className="h-5 w-5" style={{ color: '#f4c2a1' }} />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">{analyticsData.activeTopics}</div>
            <div className="text-sm text-slate-400">Unique subjects</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-400 text-sm font-medium">Knowledge Score</h3>
              <TrendingUp className="h-5 w-5" style={{ color: '#b8e6b8' }} />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">{analyticsData.knowledgeScore}%</div>
            <div className="text-sm" style={{ color: '#b8e6b8' }}>+5% this week</div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-400 text-sm font-medium">Connections</h3>
              <Activity className="h-5 w-5" style={{ color: '#d4a5d4' }} />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">{analyticsData.connections}</div>
            <div className="text-sm" style={{ color: '#d4a5d4' }}>Neural links</div>
          </div>
        </div>

        {/* Main Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Topic Bubble Chart */}
          <div className="xl:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Thinking Patterns</h2>
                  <p className="text-slate-400 text-sm">Topics you think about most (bubble size = frequency)</p>
                </div>
                <PieChart className="h-6 w-6 text-slate-400" />
              </div>
              <BubbleChart data={analyticsData.topicBubbles} />
            </div>
          </div>

          {/* Word Cloud */}
          <div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Word Cloud</h2>
                  <p className="text-slate-400 text-sm">Most used words</p>
                </div>
                <Tag className="h-6 w-6 text-slate-400" />
              </div>
              <WordCloud words={analyticsData.wordCloud} />
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Note Creation Trends */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Note Creation Trends</h2>
                <p className="text-slate-400 text-sm">Daily note creation over time</p>
              </div>
              <Calendar className="h-6 w-6 text-slate-400" />
            </div>
            <LineChart data={analyticsData.creationTrends} />
          </div>

          {/* Memory Type Distribution */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Memory Distribution</h2>
                <p className="text-slate-400 text-sm">Short-term vs Long-term notes</p>
              </div>
              <BarChart3 className="h-6 w-6 text-slate-400" />
            </div>
            <BarChart data={analyticsData.memoryDistribution} />
          </div>
        </div>

        {/* Charts Row 2 - New Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Brain Growth Chart */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Brain Growth Over Time</h2>
                <p className="text-slate-400 text-sm">How your knowledge base fills up</p>
              </div>
              <Brain className="h-6 w-6 text-slate-400" />
            </div>
            <BrainGrowthChart data={analyticsData.brainGrowth} />
          </div>

          {/* Topic Evolution */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Topic Evolution</h2>
                <p className="text-slate-400 text-sm">How your interests change over time</p>
              </div>
              <Target className="h-6 w-6 text-slate-400" />
            </div>
            <TopicEvolutionChart data={analyticsData.topicEvolution} />
          </div>
        </div>

        {/* Charts Row 3 - More Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Productivity */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Daily Productivity</h2>
                <p className="text-slate-400 text-xs">Notes per hour</p>
              </div>
              <Zap className="h-5 w-5 text-slate-400" />
            </div>
            <BarChart data={analyticsData.hourlyProductivity} />
          </div>

          {/* Weekly Patterns */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Weekly Patterns</h2>
                <p className="text-slate-400 text-xs">Best thinking days</p>
              </div>
              <Calendar className="h-5 w-5 text-slate-400" />
            </div>
            <BarChart data={analyticsData.weeklyPatterns} />
          </div>

          {/* Knowledge Velocity */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Knowledge Velocity</h2>
                <p className="text-slate-400 text-xs">Learning acceleration</p>
              </div>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </div>
            <LineChart data={analyticsData.knowledgeVelocity} />
          </div>
        </div>

        {/* Advanced Knowledge Graph - Purple Theme */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Knowledge Network</h2>
              <p className="text-slate-400 text-sm">Interactive visualization of your interconnected thoughts</p>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={graphFilter}
                onChange={(e) => setGraphFilter(e.target.value)}
                className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 text-sm"
                style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
              >
                <option value="all">All Connections</option>
                <option value="short-term">Short-term Only</option>
                <option value="long-term">Long-term Only</option>
                <option value="recent">Recent (7 days)</option>
                <option value="tags">By Tags</option>
                <option value="dates">By Dates</option>
              </select>
              
              <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 transition-colors">
                <Filter className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
          
          <KnowledgeGraphAdvanced 
            data={analyticsData.knowledgeGraph} 
            filter={graphFilter}
          />
        </div>

        {/* AI Insights Panel with Pro Upgrade - Purple Theme */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg" style={{ background: '#C2B5FC20' }}>
                <Brain className="h-6 w-6" style={{ color: '#C2B5FC' }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Insights</h2>
                <p className="text-slate-400 text-sm">Advanced patterns discovered in your knowledge</p>
              </div>
            </div>
            
            {/* Pro Upgrade Required */}
            <div className="relative max-h-96 overflow-y-auto">
              {/* Blurred Content */}
              <div className="filter blur-sm pointer-events-none">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.insights.slice(0, 6).map((insight, index) => (
                    <div key={index} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: insight.color }}></div>
                        <h3 className="text-white font-medium text-sm">{insight.title}</h3>
                      </div>
                      <p className="text-slate-400 text-sm">{insight.description}</p>
                      <div className="mt-2 text-xs" style={{ color: insight.color }}>
                        {insight.impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Upgrade Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm rounded-lg">
                <div className="text-center p-8">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 rounded-full" style={{ background: '#C2B5FC' }}>
                      <Crown className="h-8 w-8 text-slate-900" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Unlock AI Insights</h3>
                  <p className="text-slate-400 text-sm mb-6 max-w-md">
                    Discover hidden patterns, knowledge gaps, and personalized recommendations with our advanced AI analysis.
                  </p>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setShowPaywall(true)}
                      className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-slate-900 rounded-lg font-semibold transition-colors hover:opacity-90"
                      style={{ background: '#C2B5FC' }}
                    >
                      <Crown className="h-4 w-4" />
                      <span>Upgrade to Pro</span>
                    </button>
                    <div className="text-xs text-slate-500">
                      ✨ Advanced AI insights • 🧠 Knowledge gap analysis • 📊 Personalized recommendations
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extra padding at bottom */}
        <div className="h-8"></div>
      </div>

      {/* Paywall Modal */}
      {showPaywall && (
        <PaywallModal 
          onClose={() => setShowPaywall(false)}
          onUpgrade={handleUpgrade}
        />
      )}
    </div>
  );
};