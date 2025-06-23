import React, { useEffect } from 'react';
import { FileText, BookOpen, Link, Brain } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { RecentNotes } from './RecentNotes';
import { KnowledgeGraph } from './KnowledgeGraph';
import { ProjectsTable } from './ProjectsTable';
import { mockStats, mockNotes, mockProjects } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardProps {
  onPageChange?: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const { user } = useAuth();

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
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 lg:p-6 sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Welcome Back, {user?.name}! 👀
            </h1>
            <p className="text-slate-400 text-sm lg:text-base">
              <span className="block lg:inline">{mockStats.notesCreatedToday} Notes Created Today, </span>
              <span className="block lg:inline">{mockStats.newConnections} New Connections, </span>
              <span className="block lg:inline">{mockStats.insightsGenerated} Insights Generated</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6 space-y-6 bg-slate-900 min-h-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatsCard
            title="Total Notes"
            value={mockStats.totalNotes}
            change="+12 vs last month"
            icon={FileText}
            iconColor="#C2B5FC"
          />
          <StatsCard
            title="Daily Notes"
            value={mockStats.dailyNotes}
            change="+6 vs last month"
            icon={BookOpen}
            iconColor="#A7F3D0"
          />
          <StatsCard
            title="Connections"
            value={mockStats.connections}
            change="+23 vs last month"
            icon={Link}
            iconColor="#C2B5FC"
          />
          <StatsCard
            title="Knowledge Score"
            value={`${mockStats.knowledgeScore}%`}
            change="+8% vs last week"
            icon={Brain}
            iconColor="#FDE68A"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Recent Notes - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2">
            <RecentNotes notes={mockNotes} />
          </div>
          
          {/* Knowledge Graph */}
          <div>
            <KnowledgeGraph />
          </div>
        </div>

        {/* Projects Table */}
        <ProjectsTable projects={mockProjects} />
        
        {/* Extra padding at bottom to ensure proper scrolling */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};