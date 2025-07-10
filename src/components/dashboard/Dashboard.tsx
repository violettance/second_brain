import React, { useEffect, useState } from 'react';
import { Zap, BookOpen, Brain, LayoutGrid } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useProjects } from '../../hooks/useProjects';
import { supabase } from '../../lib/supabase';
import ProjectRadar from './ProjectRadar';
import ExpiringNotes from './ExpiringNotes';
import { ActivityHeatmap } from './heatmap/ActivityHeatmap';
import YourMind from './YourMind';

interface DashboardProps {
  onPageChange?: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const { user } = useAuth();
  const { analyticsData, isLoading: isLoadingAnalytics } = useAnalytics('all');
  const { projects, isLoading: isLoadingProjects } = useProjects();
  
  const [dailyNotesCount, setDailyNotesCount] = useState(0);
  const [isLoadingDailyCount, setIsLoadingDailyCount] = useState(true);

  const [knowledgeScore, setKnowledgeScore] = useState(0);
  const [isLoadingKnowledgeScore, setIsLoadingKnowledgeScore] = useState(true);

  useEffect(() => {
    // Fetch daily notes count for today (user-specific)
    const fetchDailyCount = async () => {
      setIsLoadingDailyCount(true);
      if (!user?.id) {
        setDailyNotesCount(0);
        setIsLoadingDailyCount(false);
        return;
      }
      const today = new Date().toISOString().split('T')[0];
      // Count short-term notes for today
      const { count: stCount, error: stError } = await supabase
        .from('short_term_notes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('note_date', today)
        .is('archived_at', null);
      // Count long-term notes for today
      const { count: ltCount, error: ltError } = await supabase
        .from('long_term_notes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('note_date', today);
      if ((stError && !stCount) && (ltError && !ltCount)) {
        setDailyNotesCount(0);
      } else {
        setDailyNotesCount((stCount || 0) + (ltCount || 0));
      }
      setIsLoadingDailyCount(false);
    };

    // Fetch knowledge score
    const fetchKnowledgeScore = async () => {
      setIsLoadingKnowledgeScore(true);
      const { data, error } = await supabase
        .from('analytics_knowledge_score')
        .select('sum_all')
        .single();
      
      if (data && !error) {
        setKnowledgeScore(Number(data.sum_all) || 0);
      } else {
        setKnowledgeScore(0);
      }
      setIsLoadingKnowledgeScore(false);
    };

    fetchDailyCount();
    fetchKnowledgeScore();
  }, []);

  useEffect(() => {
    const handleNavigateToAnalytics = () => {
      if (onPageChange) {
        onPageChange('analytics');
      }
    };

    window.addEventListener('navigate-to-analytics', handleNavigateToAnalytics);
    return () => window.removeEventListener('navigate-to-analytics', handleNavigateToAnalytics);
  }, [onPageChange]);

  return (
    <div className="flex-1 bg-slate-900 overflow-y-auto h-screen">
      {/* Header - Added left padding for mobile view to prevent overlap with hamburger menu */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 lg:p-6 sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0 pl-12 lg:pl-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Welcome Back, {user?.name || 'Knowledge Seeker'}! 👀
            </h1>
            <p className="text-slate-400 text-sm lg:text-base">
              Here's a snapshot of your brain's activity.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6 space-y-6 bg-slate-900 min-h-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatsCard
            title="Total Thoughts"
            value={isLoadingAnalytics ? '...' : analyticsData.totalNotes}
            change="All time"
            icon={Zap}
            iconColor="#a7c7e7"
          />
          <StatsCard
            title="Daily Notes"
            value={isLoadingDailyCount ? '...' : dailyNotesCount}
            change="Today"
            icon={BookOpen}
            iconColor="#A7F3D0"
          />
          <StatsCard
            title="Knowledge Score"
            value={isLoadingKnowledgeScore ? '...' : knowledgeScore}
            change="All time"
            icon={Brain}
            iconColor="#FDE68A"
          />
          <StatsCard
            title="Total Projects"
            value={isLoadingProjects ? '...' : projects.length}
            change="All time"
            icon={LayoutGrid}
            iconColor="#C2B5FC"
          />
        </div>

        {/* Activity Heatmap */}
        <div className="mt-8">
            <ActivityHeatmap />
        </div>
        <div className="mt-6">
          <YourMind />
        </div>

        {/* New Dynamic Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ProjectRadar />
          <ExpiringNotes />
        </div>
        
        {/* Extra padding at bottom to ensure proper scrolling */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default Dashboard;