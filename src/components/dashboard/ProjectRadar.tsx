import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Target, Calendar, CheckCircle } from 'lucide-react';
import { Project } from '../../types/projects';

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
        .in('status', ['Active', 'In Progress'])
        .order('due_date', { ascending: true, nullsFirst: false })
        .limit(1)
        .single();

      if (error) {
        console.log("No focus project found, which is fine.");
        setActiveProject(null);
      } else {
        setActiveProject(data);
      }
      setIsLoading(false);
    };

    fetchFocusProject();
  }, [user]);

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 p-6 rounded-lg animate-pulse h-[180px]">
        <div className="h-5 bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center text-center h-[180px]">
        <CheckCircle className="h-10 w-10 text-green-400 mb-3" />
        <h3 className="text-lg font-bold text-white">All Clear!</h3>
        <p className="text-sm text-slate-400">No projects have an urgent due date. Great work!</p>
      </div>
    );
  }

  const daysLeft = activeProject.due_date
    ? Math.ceil((new Date(activeProject.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center mb-4">
        <Target className="h-6 w-6 text-indigo-400 mr-3" />
        <h3 className="text-xl font-bold text-white">Project Radar</h3>
      </div>
      <div 
        className="p-4 rounded-lg border-l-4"
        style={{ borderColor: activeProject.color || '#C2B5FC' }}
      >
        <h4 className="font-bold text-lg text-white mb-1">{activeProject.name}</h4>
        <p className="text-sm text-slate-300 mb-3 truncate">{activeProject.description}</p>
        
        <div className="flex items-center text-sm text-indigo-300">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Due Date: {new Date(activeProject.due_date!).toLocaleDateString()}</span>
          {daysLeft !== null && (
            <span 
              className={`ml-auto font-bold ${
                daysLeft < 7
                  ? 'text-red-400'
                  : daysLeft < 15
                  ? 'text-yellow-400'
                  : 'text-slate-400'
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
