import React, { useState, useEffect, useMemo } from 'react';
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
import { useProjects } from '../../hooks/useProjects';
import { Task } from '../../types/projects';
import { useAuth } from '../../contexts/AuthContext';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [graphFilter, setGraphFilter] = useState('all');
  const [showPaywall, setShowPaywall] = useState(false);
  const { analyticsData, isLoading, exportData } = useAnalytics(timeRange);
  const { projects, isLoading: loadingProjects } = useProjects();
  const { user } = useAuth();

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

  // Connections state
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [connectionsChange, setConnectionsChange] = useState<number | null>(null);

  // Memory Distribution BarChart data (real note counts)
  const [memoryBarData, setMemoryBarData] = useState<{ label: string; value: number; color: string }[]>([]);
  const fetchMemoryDistribution = async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('v2_analytics_memory_distribution_bars')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (error || !data) {
      setMemoryBarData([]);
      return;
    }
    let short = 0, long = 0;
    if (timeRange === '7d') {
      short = Number(data.st_7) || 0;
      long = Number(data.lt_7) || 0;
    } else if (timeRange === '30d') {
      short = Number(data.st_30) || 0;
      long = Number(data.lt_30) || 0;
    } else {
      short = Number(data.st_all) || 0;
      long = Number(data.lt_all) || 0;
    }
    setMemoryBarData([
      { label: 'Short Term', value: short, color: '#fb923c' },
      { label: 'Long Term', value: long, color: '#a78bfa' }
    ]);
  };

  useEffect(() => {
    fetchMemoryDistribution();
  }, [timeRange, user]);

  useEffect(() => {
    if (!user?.id) return;

    const stSubscription = supabase
      .channel('short_term_notes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'short_term_notes', filter: `user_id=eq.${user.id}` }, () => {
        fetchMemoryDistribution();
      })
      .subscribe();

    const ltSubscription = supabase
      .channel('long_term_notes_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'long_term_notes', filter: `user_id=eq.${user.id}` }, () => {
        fetchMemoryDistribution();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(stSubscription);
      supabase.removeChannel(ltSubscription);
    };
  }, [user]);

  // Connections data
  useEffect(() => {
    async function fetchConnections() {
      if (!user?.id) {
        setConnectionsCount(0);
        setConnectionsChange(null);
        return;
      }
      const { data, error } = await supabase
        .from('connections_statistics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        setConnectionsCount(0);
        setConnectionsChange(null);
        return;
      }

      let total = 0;
      let prev_total = 0;

      if (timeRange === '7d') {
        total = data.last_7_days_connections || 0;
        prev_total = data.prev_7_days_connections || 0;
      } else if (timeRange === '30d') {
        total = data.last_30_days_connections || 0;
        prev_total = data.prev_30_days_connections || 0;
      } else {
        total = data.all_time_connections || 0;
        prev_total = 0; // No previous period for all time
      }
      setConnectionsCount(total);

      if (timeRange !== 'all' && prev_total > 0) {
        const change = ((total - prev_total) / prev_total) * 100;
        setConnectionsChange(change);
      } else if (timeRange !== 'all' && prev_total === 0 && total > 0) {
        setConnectionsChange(100);
      }
      else {
        setConnectionsChange(null);
      }
    }
    fetchConnections();
  }, [timeRange, user]);


  // Note Activity by Day of Week BarChart data
  const [noteActivityBarData, setNoteActivityBarData] = useState<{ label: string; value: number; color: string }[]>([]);
  useEffect(() => {
    async function fetchNoteActivity() {
      if (!user?.id) {
        setNoteActivityBarData([]);
        return;
      }
      const { data, error } = await supabase
        .from('v2_analytics_note_activity_by_weekday')
        .select('*')
        .eq('user_id', user.id)
        .eq('range', timeRange === '7d' ? '7d' : timeRange === '30d' ? '30d' : 'all')
        .order('weekday_num', { ascending: true });
      if (error || !data) {
        setNoteActivityBarData([]);
        return;
      }
      setNoteActivityBarData(data.map((d: any) => ({ label: d.weekday_name.trim(), value: Number(d.total), color: '#38bdf8' })));
    }
    fetchNoteActivity();
  }, [timeRange, user]);

  // Note Activity by Hour BarChart data
  const [noteHourBarData, setNoteHourBarData] = useState<{ label: string; value: number; color: string }[]>([]);
  useEffect(() => {
    async function fetchNoteHourActivity() {
      if (!user?.id) {
        setNoteHourBarData([]);
        return;
      }
      const { data, error } = await supabase
        .from('v2_analytics_note_activity_by_hour')
        .select('*')
        .eq('user_id', user.id)
        .eq('range', timeRange === '7d' ? '7d' : timeRange === '30d' ? '30d' : 'all')
        .order('hour', { ascending: true });
      if (error || !data) {
        setNoteHourBarData([]);
        return;
      }
      // 0-23 tüm saatler için bar oluştur
      const hourMap = new Map<number, number>();
      data.forEach((d: any) => { hourMap.set(Number(d.hour), Number(d.total)); });
      const bars = Array.from({ length: 24 }, (_, h) => ({
        label: h.toString().padStart(2, '0') + ':00',
        value: hourMap.get(h) || 0,
        color: '#f472b6'
      }));
      setNoteHourBarData(bars);
    }
    fetchNoteHourActivity();
  }, [timeRange, user]);

  // Tag Usage Frequency BarChart data
  const [tagUsageBarData, setTagUsageBarData] = useState<{ label: string; value: number; color: string }[]>([]);
  useEffect(() => {
    async function fetchTagUsage() {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('v2_analytics_tag_usage_frequency')
        .select('*')
        .eq('user_id', user.id)
        .order('total', { ascending: false })
        .limit(10); // sadece en çok kullanılan 10 tag
      if (error || !data) {
        setTagUsageBarData([]);
        return;
      }
      setTagUsageBarData(data.map((d: any) => ({ label: d.tag, value: Number(d.total), color: '#38bdf8' })));
    }
    fetchTagUsage();
  }, [user]);

  // Tag Co-Occurrence Matrix state
  const [tagCooccurrence, setTagCooccurrence] = useState<{ tag1: string; tag2: string; total: number }[]>([]);
  const [loadingCooccurrence, setLoadingCooccurrence] = useState(true);
  useEffect(() => {
    setLoadingCooccurrence(true);
    if (!user?.id) {
      setTagCooccurrence([]);
      setLoadingCooccurrence(false);
      return;
    }
    supabase
      .from('v2_analytics_tag_cooccurrence_matrix')
      .select('*')
      .eq('user_id', user.id)
      .order('total', { ascending: false })
      .limit(5)
      .then(({ data, error }: { data: any; error: any }) => {
        setTagCooccurrence(Array.isArray(data) ? data : []);
      })
      .catch(() => setTagCooccurrence([]))
      .finally(() => setLoadingCooccurrence(false));
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      setNotCreationTrends([]);
      setLoadingTrends(false);
      return;
    }
    setLoadingTrends(true);
    fetchNotCreationTrends(timeRange, user.id)
      .then(setNotCreationTrends)
      .finally(() => setLoadingTrends(false));
  }, [timeRange, user]);

  useEffect(() => {
    async function fetchTotalThoughtsFromView() {
      if (!user?.id) {
        setTotalThoughts(0);
        setTotalChange(null);
        return;
      }
      const { data, error } = await supabase
        .from('v2_analytics_total_thoughts_change')
        .select('*')
        .eq('user_id', user.id)
        .single();
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
        total = Number(data.sum_all) || 0;
        prev = null;
      }
      setTotalThoughts(total);
      if (prev === null || timeRange === 'all') {
        setTotalChange(null);
        return;
      }
      let change = 0;
      change = total - prev;
      setTotalChange(change);
    }
    fetchTotalThoughtsFromView();
  }, [timeRange, user]);

  useEffect(() => {
    async function fetchActiveTopics() {
      if (!user) return;
      const { data, error } = await supabase
        .from('analytics_active_topics')
        .select('*')
        .eq('user_id', user.id)
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
      change = total - prev;
      setActiveTopicsChange(change);
    }
    fetchActiveTopics();
  }, [timeRange, user]);

  useEffect(() => {
    async function fetchKnowledgeScore() {
      if (!user?.id) {
        setKnowledgeScore(0);
        setKnowledgeScoreChange(null);
        return;
      }
      const { data, error } = await supabase
        .from('v2_analytics_knowledge_score')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data && !error) {
        let score = 0;
        let prev = null;
        if (timeRange === '7d') {
          score = Number(data.sum_7) || 0;
          prev = Number(data.sum_prev_7) || 0;
        } else if (timeRange === '30d') {
          score = Number(data.sum_30) || 0;
          prev = Number(data.sum_prev_30) || 0;
        } else {
          score = Number(data.sum_all) || 0;
          prev = null;
        }
        setKnowledgeScore(score);
        if (prev !== null && timeRange !== 'all') {
          setKnowledgeScoreChange(score - prev);
        } else {
          setKnowledgeScoreChange(null);
        }
      } else {
        setKnowledgeScore(0);
        setKnowledgeScoreChange(null);
      }
    }
    fetchKnowledgeScore();
  }, [user, timeRange]);

  // Fetch all tasks and group by projectId
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loadingAllTasks, setLoadingAllTasks] = useState(false);
  useEffect(() => {
    if (!user?.id) {
      setAllTasks([]);
      return;
    }
    setLoadingAllTasks(true);
    supabase
      .from('tasks')
      .select('*, subtasks(*)')
      .eq('user_id', user.id)
      .then(({ data, error }: { data: any; error: any }) => {
        if (Array.isArray(data)) {
          setAllTasks(data.map((task: any) => ({
            id: task.id,
            projectId: task.project_id,
            name: task.name,
            description: task.description,
            status: task.status,
            priority: task.priority,
            startDate: task.start_date,
            dueDate: task.due_date,
            tags: task.tags,
            subtasks: Array.isArray(task.subtasks)
              ? task.subtasks.map((st: any) => ({
                  id: st.id,
                  name: st.name,
                  completed: st.completed
                }))
              : [],
            createdAt: task.created_at,
            updatedAt: task.updated_at
          })));
        } else {
          setAllTasks([]);
        }
      })
      .catch(() => setAllTasks([]))
      .finally(() => setLoadingAllTasks(false));
  }, [user]);

  // Group tasks by projectId
  const tasksByProject: Record<string, Task[]> = useMemo(() => {
    const map: Record<string, Task[]> = {};
    allTasks.forEach((task) => {
      if (!map[task.projectId]) map[task.projectId] = [];
      map[task.projectId].push(task);
    });
    return map;
  }, [allTasks]);

  // Note Depth & Complexity Analysis data
  const [noteDepthData, setNoteDepthData] = useState<any[]>([]);
  const [loadingNoteDepth, setLoadingNoteDepth] = useState(true);
  useEffect(() => {
    setLoadingNoteDepth(true);
    if (!user?.id) {
      setNoteDepthData([]);
      setLoadingNoteDepth(false);
      return;
    }
    supabase
      .from('v2_analytics_note_depth_analysis')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data, error }: { data: any; error: any }) => {
        setNoteDepthData(Array.isArray(data) ? data : []);
      })
      .catch(() => setNoteDepthData([]))
      .finally(() => setLoadingNoteDepth(false));
  }, [timeRange, user]);

  function renderTotalChange(change: number | null) {
    if (change === null || timeRange === 'all') return null;
    if (change === 0) return <span className="text-slate-400">0</span>;
    const color = change > 0 ? 'text-green-400' : 'text-red-400';
    const sign = change > 0 ? '+' : '';
    return <span className={color}>{sign}{change} from previous period</span>;
  }

  function renderActiveTopicsChange(change: number | null) {
    if (change === null || timeRange === 'all') return null;
    if (change === 0) return <span className="text-slate-400">0</span>;
    const color = change > 0 ? 'text-green-400' : 'text-red-400';
    const sign = change > 0 ? '+' : '';
    return <span className={color}>{sign}{change} from previous period</span>;
  }

  function renderKnowledgeScoreChange(change: number | null) {
    if (change === null || timeRange === 'all') return null;
    if (change === 0) return <span className="text-slate-400">0</span>;
    const color = change > 0 ? 'text-green-400' : 'text-red-400';
    const sign = change > 0 ? '+' : '';
    return <span className={color}>{sign}{change} from previous period</span>;
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
              <Zap className="h-5 w-5" style={{ color: '#a7c7e7' }} />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">{totalThoughts}</div>
            {renderTotalChange(totalChange)}
            {timeRange === 'all' && (
              <div className="text-sm text-slate-400 mt-1">All time total thoughts</div>
            )}
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-400 text-sm font-medium">Active Topics</h3>
              <Tag className="h-5 w-5" style={{ color: '#f4c2a1' }} />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">{activeTopics}</div>
            {renderActiveTopicsChange(activeTopicsChange)}
            {timeRange === 'all' && (
              <div className="text-sm text-slate-400 mt-1">All time active topics</div>
            )}
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-400 text-sm font-medium">Knowledge Score</h3>
              <TrendingUp className="h-5 w-5" style={{ color: '#a7c7e7' }} />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">{knowledgeScore}</div>
            {renderKnowledgeScoreChange(knowledgeScoreChange)}
            {timeRange === 'all' && (
              <div className="text-sm text-slate-400 mt-1">All time cumulative score</div>
            )}
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-slate-400 text-sm font-medium">Connections</h3>
              <Tag className="h-5 w-5" style={{ color: '#d4a5d4' }} />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-white">{connectionsCount}</div>
            <div>
              {connectionsChange !== null && timeRange !== 'all' ? (
                <span className={`text-sm ${connectionsChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {connectionsChange >= 0 ? '+' : ''}{connectionsChange.toFixed(1)}%
                </span>
              ) : null}
              {timeRange === '7d' && <span className="text-sm text-slate-400"> in last 7 days</span>}
              {timeRange === '30d' && <span className="text-sm text-slate-400"> in last 30 days</span>}
              {timeRange === 'all' && <span className="text-sm text-slate-400">All time connections</span>}
            </div>
          </div>
        </div>

        {/* New Analytics Charts Section */}
        <div className="space-y-8 mb-12">
          {/* 1. Not Creation Trends (Short Term vs Long Term) — Line Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">Note Creation Trends</h2>
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
          {/* Memory Distribution & Note Activity by Day of Week yan yana */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Memory Distribution */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Memory Distribution</h2>
              <p className="text-slate-400 text-sm mb-4">
                {`Distribution of your notes by memory type for the ${timeRange === '7d' ? 'last 7 days' : timeRange === '30d' ? 'last 30 days' : 'all time'}.`}
              </p>
              <div className="h-64 flex items-end justify-center">
                {memoryBarData.map((bar, idx) => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center mx-2">
                    <div className="text-white text-lg font-bold mb-1">{bar.value}</div>
                    <div className="w-8 rounded-t-lg" style={{ height: `${bar.value * 8}px`, backgroundColor: bar.color, minHeight: '4px' }} />
                    <div className="text-slate-400 text-xs text-center font-medium mt-2">{bar.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Note Activity by Day of Week */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Note Activity by Day of Week</h2>
              <p className="text-slate-400 text-sm mb-4">
                {`Number of notes created on each day of the week for the ${timeRange === '7d' ? 'last 7 days' : timeRange === '30d' ? 'last 30 days' : 'all time'}.`}
              </p>
              <div className="h-64 flex items-end justify-center">
                {noteActivityBarData.map((bar, idx) => (
                  <div key={bar.label} className="flex-1 flex flex-col items-center mx-2">
                    <div className="text-white text-lg font-bold mb-1">{bar.value}</div>
                    <div className="w-8 rounded-t-lg" style={{ height: `${bar.value * 8}px`, backgroundColor: bar.color, minHeight: '4px' }} />
                    <div className="text-slate-400 text-xs text-center font-medium mt-2">{bar.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <hr className="border-slate-700" />
          {/* 3. Note Activity by Hour — Bar Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">Note Activity by Hour</h2>
            <p className="text-slate-400 text-sm mb-4">
              {`Number of notes created by hour for the ${timeRange === '7d' ? 'last 7 days' : timeRange === '30d' ? 'last 30 days' : 'all time'}.`}
            </p>
            <div className="h-64 flex items-end justify-center">
              {noteHourBarData.map((bar, idx) => (
                <div key={bar.label} className="flex-1 flex flex-col items-center mx-1">
                  <div className="text-white text-xs font-bold mb-1">{bar.value}</div>
                  <div className="w-4 rounded-t-lg" style={{ height: `${bar.value * 8}px`, backgroundColor: bar.color, minHeight: '4px' }} />
                  <div className="text-slate-400 text-[10px] text-center font-medium mt-2">{bar.label}</div>
                </div>
              ))}
            </div>
          </div>
          <hr className="border-slate-700" />
          {/* Tag Usage Frequency — Bar Chart */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">Tag Usage Frequency</h2>
            <p className="text-slate-400 text-sm mb-4">
              {`All time tag usage frequency`}
            </p>
            <div className="h-64 flex items-end justify-center">
              {tagUsageBarData.slice(0, 10).map((bar, idx) => (
                <div key={bar.label} className="flex-1 flex flex-col items-center mx-2">
                  <div className="text-white text-lg font-bold mb-1">{bar.value}</div>
                  <div className="w-8 rounded-t-lg" style={{ height: `${bar.value * 8}px`, backgroundColor: bar.color, minHeight: '4px' }} />
                  <div className="text-slate-400 text-xs text-center font-medium mt-2">{bar.label}</div>
                </div>
              ))}
            </div>
          </div>
          <hr className="border-slate-700" />
          {/* 7. Tag Co-Occurrence Matrix — Table */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-1">Tag Co-Occurrence Matrix</h2>
            <p className="text-slate-400 text-sm mb-4">
              {`All time tag co-occurrence matrix`}
            </p>
            {loadingCooccurrence ? (
              <div className="h-32 flex items-center justify-center text-slate-500">Loading...</div>
            ) : tagCooccurrence.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-slate-500">No tag co-occurrence data found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[320px] w-full text-left border-collapse">
                  <thead>
                    <tr className="text-slate-400 text-xs uppercase border-b border-slate-700">
                      <th className="py-2 px-3">Tag 1</th>
                      <th className="py-2 px-3">Tag 2</th>
                      <th className="py-2 px-3">Co-Occurrence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tagCooccurrence.slice(0, 5).map((row, idx) => (
                      <tr key={row.tag1 + '-' + row.tag2} className="border-b border-slate-700 hover:bg-slate-700/30">
                        <td className="py-2 px-3 font-medium text-white">{row.tag1}</td>
                        <td className="py-2 px-3 font-medium text-white">{row.tag2}</td>
                        <td className="py-2 px-3 text-slate-300">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <hr className="border-slate-700" />
          {/* 9. Active Project Progress Overview + 10. Note Depth & Complexity Analysis side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Active Project Progress Overview */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Active Project Progress Overview</h2>
              <p className="text-slate-400 text-sm mb-4">
                Progress and task status for your in-progress projects.
              </p>
              {loadingProjects ? (
                <div className="h-64 flex items-center justify-center text-slate-500">Loading...</div>
              ) : (() => {
                  const activeProjects = projects
                    .filter(p => ['In Progress', 'Active'].includes(p.status))
                    .map(project => ({
                      ...project,
                      inProgressTasks: (tasksByProject[project.id] || []).filter(task => task.status === 'IN PROGRESS'),
                    }))
                    .filter(p => p.inProgressTasks.length > 0);

                  if (activeProjects.length === 0) {
                    return <div className="h-64 flex items-center justify-center">No in-progress projects found.</div>;
                  }

                  return (
                    <div className="flex flex-col items-center justify-start text-slate-500 w-full">
                      {activeProjects.map((project) => {
                        return (
                          <div key={project.id} className="w-full max-w-xl mb-6 bg-slate-900/60 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white font-medium">{project.name}</span>
                              <span className="text-slate-400 text-xs">{project.progress}%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden mb-2">
                              <div
                                className="h-3 rounded-full"
                                style={{ width: `${project.progress}%`, backgroundColor: project.color || '#a78bfa' }}
                              ></div>
                            </div>
                            {/* Task List for this project */}
                            <div className="mt-2">
                              <div className="text-slate-400 text-xs mb-1">Tasks</div>
                              <div className="space-y-2">
                                {project.inProgressTasks.map((task: Task) => (
                                  <div key={task.id} className="bg-slate-800/70 rounded px-2 py-1 flex flex-col mb-1">
                                    <div className="flex items-center justify-between">
                                      <span className="text-slate-200 text-sm">{task.name}</span>
                                      <span className="flex items-center gap-1 text-xs font-medium">
                                        <span className={`inline-block w-2 h-2 rounded-full ${task.status === 'DONE' ? 'bg-green-400' : task.status === 'IN PROGRESS' ? 'bg-yellow-400' : 'bg-slate-400'}`}></span>
                                        <span className={` ${task.status === 'DONE' ? 'text-green-400' : task.status === 'IN PROGRESS' ? 'text-yellow-400' : 'text-slate-400'}`}>{task.status}</span>
                                      </span>
                                    </div>
                                    {/* Subtask progress bar if available */}
                                    {task.subtasks && task.subtasks.length > 0 && (
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-slate-400 text-xs">
                                          {task.subtasks.filter((st: { completed: boolean }) => st.completed).length} / {task.subtasks.length} subtasks
                                        </span>
                                        <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                                          <div
                                            className="h-1 rounded-full bg-green-400"
                                            style={{ width: `${(task.subtasks.filter((st: { completed: boolean }) => st.completed).length / task.subtasks.length) * 100}%` }}
                                          ></div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
            </div>
            {/* Note Depth & Complexity Analysis */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-1">Note Depth & Complexity Analysis</h2>
              <p className="text-slate-400 text-sm mb-4">
                Average note length, word count, and lexical complexity for your notes.
              </p>
              {loadingNoteDepth ? (
                <div className="h-32 flex items-center justify-center text-slate-500">Loading...</div>
              ) : noteDepthData.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-slate-500">No data found.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {noteDepthData.map((row: any) => (
                    <div key={row.type} className="rounded-lg shadow border border-slate-700 bg-slate-900/80 p-4 flex flex-col min-w-[180px]">
                      <div className="font-bold text-white text-base mb-2 capitalize">{row.type.replace('_', ' ')} Note</div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="flex flex-col">
                          <span className="text-slate-400 text-xs">Avg Length</span>
                          <span className="text-sm text-white font-semibold">{Number(row.avg_length).toFixed(1)} chars</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400 text-xs">Avg Word Count</span>
                          <span className="text-sm text-white font-semibold">{Number(row.avg_word_count).toFixed(1)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-400 text-xs">Avg Word Complexity</span>
                          <span className="text-sm text-white font-semibold">{Number(row.avg_word_complexity).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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