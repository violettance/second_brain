import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';
import { useAuth } from '../../contexts/AuthContext';
import { Target, Calendar, CheckCircle } from 'lucide-react';
import { Project } from '../../types/projects';

const isValidDueDate = (dateStr?: string) => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return date.getFullYear() > 1971 && !isNaN(date.getTime());
};

const ProjectRadar = () => {
  const { user } = useAuth();
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFocusProject = async () => {
      if (!user) return;
      setIsLoading(true);

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['Active', 'In Progress'])
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error || !data) {
        logger.debug("No focus project found, which is fine.");
        setActiveProject(null);
      } else {
        // Sadece geçerli due_date'e sahip ilk projeyi bul
        const validProject = data.find((proj: Project) => isValidDueDate(proj.due_date));
        setActiveProject(validProject || null);
      }
      setIsLoading(false);
    };

    fetchFocusProject();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-surface p-6 rounded-lg animate-pulse h-chart-compact">
        <div className="h-5 bg-surface-muted rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-surface-muted rounded w-full mb-2"></div>
        <div className="h-4 bg-surface-muted rounded w-3/4"></div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="bg-surface border border-ink rounded-xl p-6 flex flex-col items-center justify-center text-center h-chart-compact">
        <CheckCircle className="h-10 w-10 text-brand-secondary-deep mb-3" />
        <h3 className="text-lg font-bold text-ink">All Clear!</h3>
        <p className="text-sm text-muted">No projects have an urgent due date. Great work!</p>
      </div>
    );
  }

  const daysLeft = (activeProject.due_date && isValidDueDate(activeProject.due_date))
    ? Math.ceil((new Date(activeProject.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-surface  border border-ink rounded-xl p-6">
      <div className="flex items-center mb-4">
        <Target className="h-6 w-6 text-indigo-400 mr-3" />
        <h3 className="text-xl font-bold text-ink">Project Radar</h3>
      </div>
      <div 
        className="p-4 rounded-lg border-l-4"
        style={{ borderColor: activeProject.color || 'var(--color-brand-primary)' }}
      >
        <h4 className="font-bold text-lg text-ink mb-1">{activeProject.name}</h4>
        <p className="text-sm text-muted mb-3 truncate">{activeProject.description}</p>
        
        <div className="flex items-center text-sm text-indigo-300">
          <Calendar className="h-4 w-4 mr-2" />
          {isValidDueDate(activeProject.due_date) ? (
            <span>Due Date: {new Date(activeProject.due_date!).toLocaleDateString()}</span>
          ) : (
            <span className="text-muted">No due date</span>
          )}
          {daysLeft !== null && (
            <span 
              className={`ml-auto font-bold ${
                daysLeft < 7
                  ? 'text-brand-primary-deep'
                  : daysLeft < 15
                  ? 'text-brand-yellow-ink'
                  : 'text-muted'
              }`}
            >
              {daysLeft > 0 ? `${daysLeft} days left` : 'Due today'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectRadar;
