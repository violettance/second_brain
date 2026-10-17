import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Zap, BookOpen, Brain, LayoutGrid, Plus } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useProjects } from '../../hooks/useProjects';
import { supabase } from '../../lib/supabase';
import ProjectRadar from './ProjectRadar';
import ExpiringNotes from './ExpiringNotes';
import { ActivityHeatmap } from './heatmap/ActivityHeatmap';
import YourMind from './YourMind';

export const Dashboard: React.FC = React.memo(() => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      if (!user?.id) {
        setKnowledgeScore(0);
        setIsLoadingKnowledgeScore(false);
        return;
      }
      const { data, error } = await supabase
        .from('v2_analytics_knowledge_score')
        .select('sum_all')
        .eq('user_id', user.id)
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
  }, [user]);

  useEffect(() => {
    const handleNavigateToAnalytics = () => {
      navigate('/analytics');
    };

    window.addEventListener('navigate-to-analytics', handleNavigateToAnalytics);
    return () => window.removeEventListener('navigate-to-analytics', handleNavigateToAnalytics);
  }, [navigate]);

  return (
    <>
      <Helmet>
        <title>Dashboard - Second Brain</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-10 border-b-2 border-ink bg-canvas px-4 py-5 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 pl-12 lg:flex-row lg:items-center lg:justify-between lg:pl-0">
          <div>
            <p className="mb-1 text-sm font-medium text-muted">Your knowledge, at a glance</p>
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink lg:text-3xl">
              Welcome back, {user?.name || 'Knowledge seeker'}.
            </h1>
            <p className="mt-1 text-sm text-muted lg:text-base">See what you have captured and where your ideas are heading.</p>
          </div>
          <button type="button" onClick={() => navigate('/daily-notes')} className="sb-action flex w-fit items-center gap-2 px-4 py-2.5 text-sm">
            <Plus aria-hidden="true" className="h-4 w-4" />
            <span>Capture a thought</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto min-h-full max-w-7xl space-y-6 bg-canvas p-4 lg:p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 lg:gap-6">
          <StatsCard
            title="Total Thoughts"
            value={isLoadingAnalytics ? '...' : analyticsData.totalNotes}
            change="All time"
            icon={Zap}
            iconColor="var(--color-brand-secondary)"
          />
          <StatsCard
            title="Daily Notes"
            value={isLoadingDailyCount ? '...' : dailyNotesCount}
            change="Today"
            icon={BookOpen}
            iconColor="var(--color-brand-secondary)"
          />
          <StatsCard
            title="Knowledge Score"
            value={isLoadingKnowledgeScore ? '...' : knowledgeScore}
            change="All time"
            icon={Brain}
            iconColor="var(--color-brand-yellow)"
          />
          <StatsCard
            title="Total Projects"
            value={isLoadingProjects ? '...' : projects.length}
            change="All time"
            icon={LayoutGrid}
            iconColor="var(--color-brand-purple)"
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
    </>
  );
});

export default Dashboard;
