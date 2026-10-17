import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Search, Filter, MoreHorizontal, Calendar, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { logger } from '../../lib/logger';
import { EditProjectModal } from './EditProjectModal';

interface ProjectsListProps {
  onSelectProject: (projectId: string) => void;
}

export interface ProjectsListRef {
  refetch: () => void;
}

export const ProjectsList = forwardRef<ProjectsListRef, ProjectsListProps>(({ onSelectProject }, ref) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const { projects, isLoading, deleteProject, refetch, updateProject } = useProjects();

  useImperativeHandle(ref, () => ({
    refetch
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-brand-secondary-deep border-green-500/30';
      case 'In Progress': 
        return `border text-ink`;
      case 'Completed': return 'bg-blue-500/20 text-brand-secondary-deep border-blue-500/30';
      case 'On Hold': return 'bg-yellow-500/20 text-brand-yellow-ink border-yellow-500/30';
      default: return 'bg-slate-500/20 text-muted border-ink';
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === 'In Progress') {
      return {
        backgroundColor: 'color-mix(in srgb, var(--color-brand-purple) 20%, transparent)',
        color: 'var(--color-brand-primary)',
        borderColor: 'color-mix(in srgb, var(--color-brand-purple) 50%, transparent)'
      };
    }
    return {};
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      try {
        await deleteProject(projectId);
        setOpenDropdown(null);
      } catch (error) {
        logger.error('Failed to delete project', { error: error.message });
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-ink rounded-lg text-ink placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
            style={{ '--tw-ring-color': 'var(--color-brand-primary)' } as React.CSSProperties}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-surface border border-ink rounded-lg text-ink focus:outline-none focus:ring-2 text-sm"
          style={{ '--tw-ring-color': 'var(--color-brand-primary)' } as React.CSSProperties}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div 
            key={project.id} 
            className="bg-surface  border border-ink rounded-xl p-6 hover:bg-surface transition-all cursor-pointer group"
            onClick={() => onSelectProject(project.id)}
          >
            {/* Project Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: project.color }}
                ></div>
                <div>
                  <h3 className="text-ink font-semibold text-lg">{project.name}</h3>
                  <p className="text-muted text-sm">{project.description}</p>
                </div>
              </div>
              <div className="relative">
                <button 
                  className="p-2 hover:bg-surface-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === project.id ? null : project.id);
                  }}
                >
                  <MoreHorizontal className="h-4 w-4 text-muted" />
                </button>
                
                {openDropdown === project.id && (
                  <div className="absolute right-0 top-full mt-1 bg-surface-muted border border-ink rounded-lg shadow-lg z-10 py-1 min-w-menu">
                    <button
                      className="w-full px-3 py-2 text-left text-sm text-muted hover:bg-surface-muted flex items-center space-x-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProject(project.id);
                        setOpenDropdown(null);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      className="w-full px-3 py-2 text-left text-sm text-brand-primary-deep hover:bg-surface-muted flex items-center space-x-2"
                      onClick={(e) => handleDeleteProject(project.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="mb-4">
              <span 
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}
                style={getStatusStyle(project.status)}
              >
                {project.status}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted text-sm">Progress</span>
                <span className="text-muted text-sm font-semibold">{project.progress}%</span>
              </div>
              <div className="w-full bg-surface-muted rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ 
                    width: `${project.progress}%`, 
                    backgroundColor: project.color 
                  }}
                ></div>
              </div>
            </div>

            {/* Due Date */}
            {project.due_date && (
              <div className="mb-2 text-muted text-xs">
                Due: {project.due_date}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-ink font-semibold">{project.tasksCount}</div>
                <div className="text-muted text-xs">Tasks</div>
              </div>
              <div>
                <div className="text-ink font-semibold">{project.completedTasks}</div>
                <div className="text-muted text-xs">Done</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted text-lg mb-2">No projects found</div>
          <div className="text-muted text-sm">Create your first project to get started</div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal
          project={projects.find(p => p.id === editingProject)!}
          onClose={() => setEditingProject(null)}
          onSave={async (id, updates) => {
            await updateProject(id, updates);
            await refetch();
            setEditingProject(null);
          }}
        />
      )}
    </div>
  );
});
