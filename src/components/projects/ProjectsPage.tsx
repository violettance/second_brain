import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectsList } from './ProjectsList';
import { CreateProjectModal } from './CreateProjectModal';
import { Plus } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';

export const ProjectsPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const { projects, isLoading, deleteProject, refetch } = useProjects();

  const handleSelectProject = (projectId: string) => {
    navigate('/tasks', { state: { projectId } });
  };
  
  const handleProjectCreated = () => {
    setShowCreateModal(false);
    refetch();
  };

  return (
    <div className="flex-1 bg-slate-900 overflow-y-auto h-screen">
      {/* Header - Added left padding for mobile view to prevent overlap with hamburger menu */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 lg:p-6 sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Projects</h1>
            <p className="text-slate-400 text-sm lg:text-base">
              Manage your knowledge projects and tasks
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center space-x-2 px-4 py-2 text-slate-900 rounded-lg font-semibold transition-colors text-sm hover:opacity-90"
            style={{ background: '#C2B5FC' }}
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6 bg-slate-900 min-h-full">
        <ProjectsList 
          projects={projects}
          isLoading={isLoading}
          deleteProject={deleteProject}
          refetch={refetch}
          onSelectProject={handleSelectProject} 
        />
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal 
          onClose={() => setShowCreateModal(false)} 
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};