import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AnalyticsData {
  totalNotes: number;
  activeTopics: number;
  knowledgeScore: number;
  connections: number;
  growthRate: number;
  topicBubbles: Array<{
    topic: string;
    frequency: number;
    color: string;
    size: number;
  }>;
  wordCloud: Array<{
    word: string;
    frequency: number;
    color: string;
  }>;
  creationTrends: Array<{
    date: string;
    value: number;
  }>;
  memoryDistribution: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  brainGrowth: Array<{
    date: string;
    totalNotes: number;
    capacity: number;
    fillPercentage: number;
  }>;
  topicEvolution: Array<{
    date: string;
    topics: {
      [key: string]: number;
    };
  }>;
  hourlyProductivity: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  weeklyPatterns: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  knowledgeVelocity: Array<{
    date: string;
    value: number;
  }>;
  knowledgeGraph: {
    nodes: Array<{
      id: string;
      label: string;
      type: 'short-term' | 'long-term' | 'tag' | 'date';
      size: number;
      color: string;
      connections: number;
    }>;
    edges: Array<{
      from: string;
      to: string;
      strength: number;
    }>;
  };
  insights: Array<{
    title: string;
    description: string;
    impact: string;
    color: string;
  }>;
}

// Mock analytics data with pastel colors
const MOCK_ANALYTICS: AnalyticsData = {
  totalNotes: 247,
  activeTopics: 34,
  knowledgeScore: 89,
  connections: 156,
  growthRate: 23,
  topicBubbles: [
    { topic: 'Programming', frequency: 45, color: '#a7c7e7', size: 80 },
    { topic: 'AI/ML', frequency: 32, color: '#b8e6b8', size: 65 },
    { topic: 'Philosophy', frequency: 28, color: '#f4c2a1', size: 60 },
    { topic: 'Design', frequency: 24, color: '#d4a5d4', size: 55 },
    { topic: 'Research', frequency: 20, color: '#f0d4a3', size: 50 },
    { topic: 'Learning', frequency: 18, color: '#c7e7a7', size: 45 },
    { topic: 'Ideas', frequency: 15, color: '#e7a7c7', size: 40 },
    { topic: 'Projects', frequency: 12, color: '#a7e7d4', size: 35 }
  ],
  wordCloud: [
    { word: 'learning', frequency: 45, color: '#a7c7e7' },
    { word: 'development', frequency: 38, color: '#b8e6b8' },
    { word: 'knowledge', frequency: 35, color: '#f4c2a1' },
    { word: 'research', frequency: 32, color: '#d4a5d4' },
    { word: 'ideas', frequency: 28, color: '#f0d4a3' },
    { word: 'thinking', frequency: 25, color: '#c7e7a7' },
    { word: 'innovation', frequency: 22, color: '#e7a7c7' },
    { word: 'creativity', frequency: 20, color: '#a7e7d4' },
    { word: 'analysis', frequency: 18, color: '#d4c7e7' },
    { word: 'insights', frequency: 15, color: '#e7d4a7' },
    { word: 'patterns', frequency: 12, color: '#c7d4e7' },
    { word: 'connections', frequency: 10, color: '#e7c7d4' }
  ],
  creationTrends: [
    { date: 'Jan 1', value: 5 },
    { date: 'Jan 2', value: 8 },
    { date: 'Jan 3', value: 12 },
    { date: 'Jan 4', value: 7 },
    { date: 'Jan 5', value: 15 },
    { date: 'Jan 6', value: 18 },
    { date: 'Jan 7', value: 22 },
    { date: 'Jan 8', value: 16 },
    { date: 'Jan 9', value: 25 },
    { date: 'Jan 10', value: 20 },
    { date: 'Jan 11', value: 28 },
    { date: 'Jan 12', value: 24 }
  ],
  memoryDistribution: [
    { label: 'Short-term', value: 89, color: '#f4c2a1' },
    { label: 'Long-term', value: 158, color: '#a7c7e7' }
  ],
  brainGrowth: [
    { date: 'Week 1', totalNotes: 50, capacity: 200, fillPercentage: 25 },
    { date: 'Week 2', totalNotes: 85, capacity: 220, fillPercentage: 39 },
    { date: 'Week 3', totalNotes: 120, capacity: 250, fillPercentage: 48 },
    { date: 'Week 4', totalNotes: 160, capacity: 280, fillPercentage: 57 },
    { date: 'Week 5', totalNotes: 200, capacity: 320, fillPercentage: 63 },
    { date: 'Week 6', totalNotes: 247, capacity: 350, fillPercentage: 71 }
  ],
  topicEvolution: [
    { 
      date: 'Jan 1', 
      topics: { 'Programming': 15, 'AI/ML': 8, 'Philosophy': 5, 'Design': 3 }
    },
    { 
      date: 'Jan 8', 
      topics: { 'Programming': 22, 'AI/ML': 12, 'Philosophy': 8, 'Design': 7 }
    },
    { 
      date: 'Jan 15', 
      topics: { 'Programming': 30, 'AI/ML': 18, 'Philosophy': 12, 'Design': 10 }
    },
    { 
      date: 'Jan 22', 
      topics: { 'Programming': 38, 'AI/ML': 25, 'Philosophy': 18, 'Design': 15 }
    },
    { 
      date: 'Jan 29', 
      topics: { 'Programming': 45, 'AI/ML': 32, 'Philosophy': 25, 'Design': 20 }
    }
  ],
  hourlyProductivity: [
    { label: '6AM', value: 2, color: '#a7c7e7' },
    { label: '9AM', value: 8, color: '#b8e6b8' },
    { label: '12PM', value: 6, color: '#f4c2a1' },
    { label: '3PM', value: 9, color: '#d4a5d4' },
    { label: '6PM', value: 5, color: '#f0d4a3' },
    { label: '9PM', value: 3, color: '#c7e7a7' }
  ],
  weeklyPatterns: [
    { label: 'Mon', value: 12, color: '#a7c7e7' },
    { label: 'Tue', value: 15, color: '#b8e6b8' },
    { label: 'Wed', value: 18, color: '#f4c2a1' },
    { label: 'Thu', value: 14, color: '#d4a5d4' },
    { label: 'Fri', value: 16, color: '#f0d4a3' },
    { label: 'Sat', value: 8, color: '#c7e7a7' },
    { label: 'Sun', value: 6, color: '#e7a7c7' }
  ],
  knowledgeVelocity: [
    { date: 'Week 1', value: 12 },
    { date: 'Week 2', value: 18 },
    { date: 'Week 3', value: 25 },
    { date: 'Week 4', value: 22 },
    { date: 'Week 5', value: 30 },
    { date: 'Week 6', value: 35 }
  ],
  knowledgeGraph: {
    nodes: [
      { id: '1', label: 'Programming', type: 'long-term', size: 20, color: '#a7c7e7', connections: 12 },
      { id: '2', label: 'AI Research', type: 'long-term', size: 18, color: '#b8e6b8', connections: 8 },
      { id: '3', label: 'Daily Ideas', type: 'short-term', size: 15, color: '#f4c2a1', connections: 6 },
      { id: '4', label: 'Philosophy', type: 'long-term', size: 16, color: '#d4a5d4', connections: 7 },
      { id: '5', label: 'Meeting Notes', type: 'short-term', size: 12, color: '#f4c2a1', connections: 4 },
      { id: '6', label: '#learning', type: 'tag', size: 14, color: '#c7e7a7', connections: 15 },
      { id: '7', label: '#research', type: 'tag', size: 13, color: '#e7a7c7', connections: 11 },
      { id: '8', label: 'Jan 2025', type: 'date', size: 11, color: '#a7e7d4', connections: 9 },
      { id: '9', label: 'Design System', type: 'long-term', size: 17, color: '#f0d4a3', connections: 10 },
      { id: '10', label: 'Quick Thoughts', type: 'short-term', size: 10, color: '#f4c2a1', connections: 3 }
    ],
    edges: [
      { from: '1', to: '2', strength: 0.8 },
      { from: '1', to: '6', strength: 0.9 },
      { from: '2', to: '7', strength: 0.7 },
      { from: '3', to: '6', strength: 0.6 },
      { from: '4', to: '6', strength: 0.5 },
      { from: '5', to: '8', strength: 0.4 },
      { from: '6', to: '7', strength: 0.8 },
      { from: '8', to: '3', strength: 0.6 },
      { from: '9', to: '1', strength: 0.7 },
      { from: '10', to: '3', strength: 0.5 }
    ]
  },
  insights: [
    {
      title: 'Peak Thinking Hours',
      description: 'You create most notes between 9-11 AM and 2-4 PM',
      impact: '68% of your best ideas',
      color: '#b8e6b8'
    },
    {
      title: 'Knowledge Clusters',
      description: 'Strong connections between Programming and AI topics',
      impact: '23 cross-references',
      color: '#a7c7e7'
    },
    {
      title: 'Learning Velocity',
      description: 'Your note creation has increased 45% this month',
      impact: 'Accelerating growth',
      color: '#f4c2a1'
    },
    {
      title: 'Memory Patterns',
      description: 'You tend to promote 30% of short-term notes to long-term',
      impact: 'Good curation habits',
      color: '#d4a5d4'
    },
    {
      title: 'Topic Diversity',
      description: 'You explore 8 different knowledge domains regularly',
      impact: 'Broad intellectual range',
      color: '#c7e7a7'
    },
    {
      title: 'Connection Density',
      description: 'Your knowledge graph shows high interconnectedness',
      impact: '89% connectivity score',
      color: '#e7a7c7'
    }
  ]
};

export const useAnalytics = (timeRange: string) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(MOCK_ANALYTICS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAnalytics = async () => {
    // Demo user id hardcoded for analytics
    const demoUserId = '2994cfab-5a29-422d-81f8-63909b93bf20';
    const userId = user?.id || demoUserId;
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch all needed data in parallel
      const [shortNotesRes, longNotesRes, tasksRes, subtasksRes] = await Promise.all([
        supabase.from('short_term_notes').select('id, tags, note_date').eq('user_id', userId),
        supabase.from('long_term_notes').select('id, tags, note_date').eq('user_id', userId),
        supabase.from('tasks').select('id').eq('user_id', userId),
        supabase.from('subtasks').select('id').in('task_id',
          (await supabase.from('tasks').select('id').eq('user_id', userId)).data?.map((t: any) => t.id) || []
        )
      ]);
      const shortNotes = Array.isArray(shortNotesRes.data) ? shortNotesRes.data : [];
      const longNotes = Array.isArray(longNotesRes.data) ? longNotesRes.data : [];
      const tasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
      const subtasks = Array.isArray(subtasksRes.data) ? subtasksRes.data : [];

      // 2. totalNotes
      const totalNotes = shortNotes.length + longNotes.length;
      // 3. activeTopics (unique tag count)
      const allTags = [
        ...shortNotes.flatMap((n: any) => n.tags || []),
        ...longNotes.flatMap((n: any) => n.tags || [])
      ];
      const uniqueTags = Array.from(new Set(allTags));
      const activeTopics = uniqueTags.length;
      // 4. knowledgeScore
      const knowledgeScore = shortNotes.length * 1 + longNotes.length * 3 + tasks.length * 2 + subtasks.length * 0.5;
      // 5. connections
      const connections = 0;
      // 6. growthRate (bu ay ve geçen ay eklenen not sayısı)
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
      const countInMonth = (notes: any[], month: number, year: number) =>
        notes.filter(n => {
          const d = new Date(n.note_date);
          return d.getMonth() === month && d.getFullYear() === year;
        }).length;
      const thisMonthNotes = countInMonth(shortNotes, thisMonth, thisYear) + countInMonth(longNotes, thisMonth, thisYear);
      const lastMonthNotes = countInMonth(shortNotes, lastMonth, lastMonthYear) + countInMonth(longNotes, lastMonth, lastMonthYear);
      const growthRate = lastMonthNotes > 0 ? Math.round(((thisMonthNotes - lastMonthNotes) / lastMonthNotes) * 100) : 0;

      setAnalyticsData(prev => ({
        ...prev,
        totalNotes,
        activeTopics,
        knowledgeScore,
        connections,
        growthRate
      }));
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    try {
      // Create CSV data
      const csvData = [
        ['Metric', 'Value'],
        ['Total Notes', analyticsData.totalNotes.toString()],
        ['Active Topics', analyticsData.activeTopics.toString()],
        ['Knowledge Score', `${analyticsData.knowledgeScore}%`],
        ['Connections', analyticsData.connections.toString()],
        ['Growth Rate', `${analyticsData.growthRate}%`],
        [''],
        ['Top Topics', ''],
        ...analyticsData.topicBubbles.map(topic => [topic.topic, topic.frequency.toString()]),
        [''],
        ['Creation Trends', ''],
        ...analyticsData.creationTrends.map(trend => [trend.date, trend.value.toString()]),
        [''],
        ['Brain Growth', ''],
        ...analyticsData.brainGrowth.map(growth => [growth.date, `${growth.fillPercentage}%`])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `knowledge-analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeRange]);

  return {
    analyticsData,
    isLoading,
    error,
    exportData,
    refetch: fetchAnalytics
  };
};

export async function fetchNotCreationTrends(timeRange: string = '30d') {
  const now = new Date();
  let fromDate: string | null = null;
  if (timeRange === '7d') {
    fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString().slice(0, 10);
  } else if (timeRange === '30d') {
    fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29).toISOString().slice(0, 10);
  } else if (timeRange === '90d') {
    fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 89).toISOString().slice(0, 10);
  } else if (timeRange === '1y') {
    fromDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate() + 1).toISOString().slice(0, 10);
  } else if (timeRange === 'all') {
    fromDate = null;
  }
  let query = supabase.from('daily_note_counts').select('note_date, total_count').order('note_date', { ascending: true });
  if (fromDate) {
    query = query.gte('note_date', fromDate);
  }
  const { data, error } = await query;
  if (error) throw error;
  let cumulative = 0;
  return (data || []).map((d: any) => {
    cumulative += d.total_count;
    const dateObj = new Date(d.note_date);
    const label = dateObj.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    return { date: label, value: cumulative };
  });
}