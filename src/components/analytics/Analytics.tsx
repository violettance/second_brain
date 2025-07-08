import React, { useState, useEffect } from 'react';
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
import { useAnalytics, fetchNotCreationTrends } from '../../hooks/useAnalytics';
import { supabase } from '../../lib/supabase';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [graphFilter, setGraphFilter] = useState('all');
  const [showPaywall, setShowPaywall] = useState(false);
  const { analyticsData, isLoading, exportData } = useAnalytics(timeRange);

  // Not Creation Trends state
  const [notCreationTrends, setNotCreationTrends] = useState<{ date: string; value: number }[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(true);

  // Not Creation Trends description by timeRange
  const trendsDescription =
    timeRange === '7d' ? 'Cumulative note creation trend for the last 7 days.' :
    timeRange === '30d' ? 'Cumulative note creation trend for the last 30 days.' :
    'Cumulative note creation trend for all time.';

  // Total Thoughts state (Supabase view)
  const [totalThoughts, setTotalThoughts] = useState(0);
  const [totalChange, setTotalChange] = useState<number | null>(null);

  // Active Topics state
  const [activeTopics, setActiveTopics] = useState(0);
  const [activeTopicsChange, setActiveTopicsChange] = useState<number | null>(null);

  // Knowledge Score state
  const [knowledgeScore, setKnowledgeScore] = useState(0);
  const [knowledgeScoreChange, setKnowledgeScoreChange] = useState<number | null>(null);

  useEffect(() => {
    setLoadingTrends(true);
    fetchNotCreationTrends(timeRange)
      .then(setNotCreationTrends)
      .finally(() => setLoadingTrends(false));
  }, [timeRange]);

  useEffect(() => {
    async function fetchTotalThoughtsFromView() {
      const { data, error } = await supabase.from('analytics_total_thoughts_change').select('*').single();
      if (error || !data) {
        setTotalThoughts(0);
        setTotalChange(null);
        return;
      }
      let total = 0;
      let prev: number | null = 0;
      if (timeRange === '7d') {
        total = Number(data.sum_7) || 0;
        prev = Number(data.sum_prev_7) || 0;
      } else if (timeRange === '30d') {
        total = Number(data.sum_30) || 0;
        prev = Number(data.sum_prev_30) || 0;
      } else {
        // all time: sum_all
        total = Number(data.sum_all) || 0;
        prev = null;
      }
      setTotalThoughts(total);
      if (prev === null || timeRange === 'all') {
        setTotalChange(null);
        return;
      }
      let change = 0;
      if (prev === 0 && total > 0) {
        change = 100;
      } else if (prev === 0 && total === 0) {
        change = 0;
      } else if (prev > 0) {
        change = Math.round(((total - prev) / prev) * 100);
        if (change > 100) change = 100;
        if (change < -100) change = -100;
      } else {
        change = 0;
      }
      setTotalChange(change);
    }
    fetchTotalThoughtsFromView();
  }, [timeRange]);

  useEffect(() => {
    async function fetchActiveTopics() {
      const { data, error } = await supabase
        .from('analytics_active_topics')
        .select('*')
        .single();
      if (error || !data) {
        setActiveTopics(0);
        setActiveTopicsChange(null);
        return;
      }
      let total = 0;
      let prev: number | null = 0;
      if (timeRange === '7d') {
        total = Number(data.sum_7) || 0;
        prev = Number(data.sum_prev_7) || 0;
      } else if (timeRange === '30d') {
        total = Number(data.sum_30) || 0;
        prev = Number(data.sum_prev_30) || 0;
      } else {
        total = Number(data.sum_all) || 0;
        prev = null;
      }
      setActiveTopics(total);
      if (prev === null || timeRange === 'all') {
        setActiveTopicsChange(null);
        return;
      }
      let change = 0;
      if (prev === 0 && total > 0) {
        change = 100;
      } else if (prev === 0 && total === 0) {
        change = 0;
      } else if (prev > 0) {
        change = Math.round(((total - prev) / prev) * 100);
        if (change > 100) change = 100;
        if (change < -100) change = -100;
      } else {
        change = 0;
      }
      setActiveTopicsChange(change);
    }
    fetchActiveTopics();
  }, [timeRange]);

  useEffect(() => {
    async function fetchKnowledgeScore() {
      const { data, error } = await supabase
        .from('analytics_knowledge_score')
        .select('*')
        .single();
      if (error || !data) {
        setKnowledgeScore(0);
        setKnowledgeScoreChange(null);
        return;
      }
      let total = 0;
      let prev: number | null = 0;
      if (timeRange === '7d') {
        total = Number(data.sum_7) || 0;
        prev = Number(data.sum_prev_7) || 0;
      } else if (timeRange === '30d') {
        total = Number(data.sum_30) || 0;
        prev = Number(data.sum_prev_30) || 0;
      } else {
        total = Number(data.sum_all) || 0;
        prev = null;
      }
      setKnowledgeScore(total);
      if (prev === null || timeRange === 'all') {
        setKnowledgeScoreChange(null);
        return;
      }
      let change = 0;
      if (prev === 0 && total > 0) {
        change = 100;
      } else if (prev === 0 && total === 0) {
        change = 0;
      } else if (prev > 0) {
        change = Math.round(((total - prev) / prev) * 100);
        if (change > 100) change = 100;
        if (change < -100) change = -100;
      } else {
        change = 0;
      }
      setKnowledgeScoreChange(change);
    }
    fetchKnowledgeScore();
  }, [timeRange]);

  function renderTotalChange(change: number | null) {
    if (change === null || timeRange === 'all') return null;
    if (change === 0) return <span className="text-slate-400">0%</span>;
    const color = change > 0 ? 'text-green-400' : 'text-red-400';
    const sign = change > 0 ? '+' : '';
    return <span className={color}>{sign}{change}% from previous period</span>;
  }

  function renderActiveTopicsChange(change: number | null) {
    if (change === null || timeRange === 'all') return null;
    if (change === 0) return <span className="text-slate-400">0%</span>;
    const color = change > 0 ? 'text-green-400' : 'text-red-400';
    const sign = change > 0 ? '+' : '';
    return <span className={color}>{sign}{change}% from previous period</span>;
  }

  function renderKnowledgeScoreChange(change: number | null) {
    if (change === null || timeRange === 'all') return null;
    if (change === 0) return <span className="text-slate-400">0%</span>;
    const color = change > 0 ? 'text-green-400' : 'text-red-400';
    const sign = change > 0 ? '+' : '';
    return <span className={color}>{sign}{change}% from previous period</span>;
  }

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
        {/* Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-400 text-sm font-medium">Total Thoughts</h3>
              <Brain className="h-5 w-5" style={{ color: '#a7c7e7' }} />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">{totalThoughts}</div>
            {renderTotalChange(totalChange)}
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-400 text-sm font-medium">Active Topics</h3>
              <Tag className="h-5 w-5" style={{ color: '#f4c2a1' }} />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">{activeTopics}</div>
            {renderActiveTopicsChange(activeTopicsChange)}
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-400 text-sm font-medium">Knowledge Score</h3>
              <TrendingUp className="h-5 w-5" style={{ color: '#a7c7e7' }} />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">{knowledgeScore}</div>
            {renderKnowledgeScoreChange(knowledgeScoreChange)}
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

        {/* New Analytics Charts Section */}
        <div className="space-y-8 mb-12">
          {/* 1. Not Creation Trends (Short Term vs Long Term) — Line Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">Not Creation Trends</h2>
            <p className="text-slate-400 text-sm mb-4">{trendsDescription}</p>
            {loadingTrends ? (
              <div className="h-64 flex items-center justify-center text-slate-500">
                <svg className="animate-spin h-8 w-8 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              </div>
            ) : (
              <LineChart data={notCreationTrends} />
            )}
          </div>
          <hr className="border-slate-700" />
          {/* 2. Memory Distribution (Short Term vs Long Term) — Bar Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">📊 Memory Distribution (Short Term vs Long Term)</h2>
            <p className="text-slate-400 text-sm mb-4">Mevcut tüm notların % kaçı short, % kaçı long?</p>
            <div className="h-64 flex items-center justify-center text-slate-500">Bar Chart Placeholder</div>
          </div>
          <hr className="border-slate-700" />
          {/* 3. Note Activity by Hour — Bar Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">🕒 Note Activity by Hour</h2>
            <p className="text-slate-400 text-sm mb-4">Hangi saatlerde daha çok not giriyorsun?</p>
            <div className="h-64 flex items-center justify-center text-slate-500">Bar Chart Placeholder</div>
          </div>
          <hr className="border-slate-700" />
          {/* 4. Note Activity by Day of Week — Bar Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">📅 Note Activity by Day of Week</h2>
            <p className="text-slate-400 text-sm mb-4">Haftanın hangi günleri daha aktif olduğun gösterilir.</p>
            <div className="h-64 flex items-center justify-center text-slate-500">Bar Chart Placeholder</div>
          </div>
          <hr className="border-slate-700" />
          {/* 5. Tag Usage Frequency — Horizontal Bar Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">🧠 Tag Usage Frequency</h2>
            <p className="text-slate-400 text-sm mb-4">Hangi kavramlar, temalar, alanlar üzerinde daha çok çalışıyorsun?</p>
            <div className="h-64 flex items-center justify-center text-slate-500">Horizontal Bar Chart Placeholder</div>
          </div>
          <hr className="border-slate-700" />
          {/* 7. Tag Co-Occurrence Matrix — Network Graph */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">🧩 Tag Co-Occurrence Matrix</h2>
            <p className="text-slate-400 text-sm mb-4">Hangi etiketler birbiriyle birlikte daha çok geçiyor?</p>
            <div className="h-64 flex items-center justify-center text-slate-500">Network Graph Placeholder</div>
          </div>
          <hr className="border-slate-700" />
          {/* 9. Active Project Progress Overview — Progress Bar Set */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">🚦 Active Project Progress Overview</h2>
            <p className="text-slate-400 text-sm mb-4">Her projenin tamamlanma yüzdesi ve görev durumu.</p>
            <div className="h-64 flex items-center justify-center text-slate-500">Project Progress Bars Placeholder</div>
          </div>
          <hr className="border-slate-700" />
          {/* 10. Not Depth Analysis — Histogram */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">🧭 Not Depth Analysis</h2>
            <p className="text-slate-400 text-sm mb-4">Notların ortalama uzunluğu / kelime sayısı / karmaşıklık düzeyi.</p>
            <div className="h-64 flex items-center justify-center text-slate-500">Histogram Chart Placeholder</div>
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
            data={{
              nodes: analyticsData.knowledgeGraph.nodes.map(n => ({
                ...n,
                type: n.type === 'tag' ? 'tag' : 'note'
              })),
              edges: analyticsData.knowledgeGraph.edges.map(e => ({
                ...e,
                type: 'semantic'
              }))
            }}
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