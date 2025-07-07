import React, { useState } from 'react';
import { ArrowLeft, Plus, Filter, Search, MoreHorizontal, Calendar, Flag, Link, User } from 'lucide-react';
import { useProject } from '../../hooks/useProjects';
import { CreateTaskModal } from './CreateTaskModal';
import { TaskCard } from './TaskCard';

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, onBack }) => {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const { project, tasks, isLoading, refetch } = useProject(projectId);

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400">Loading project...</div>
      </div>
    );
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const todoTasks = filteredTasks.filter(task => task.status === 'TO DO');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'IN PROGRESS');
  const doneTasks = filteredTasks.filter(task => task.status === 'DONE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: project.color }}
            ></div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">{project.name}</h1>
          </div>
          <p className="text-slate-400">{project.description}</p>
        </div>
        <button
          onClick={() => setShowCreateTask(true)}
          className="flex items-center space-x-2 px-4 py-2 text-slate-900 rounded-lg font-semibold transition-colors text-sm hover:opacity-90"
          style={{ background: '#C2B5FC' }}
        >
          <Plus className="h-4 w-4" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{project.tasksCount}</div>
          <div className="text-slate-400 text-sm">Total Tasks</div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{project.completedTasks}</div>
          <div className="text-slate-400 text-sm">Completed</div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="text-2xl font-bold text-white">{project.progress}%</div>
          <div className="text-slate-400 text-sm">Progress</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
            style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 text-sm"
          style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
        >
          <option value="All">All Status</option>
          <option value="TO DO">To Do</option>
          <option value="IN PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TO DO Column */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">To Do</h3>
            <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded-full text-sm">
              {todoTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {todoTasks.map(task => (
              <TaskCard key={task.id} task={task} onTaskUpdated={refetch} />
            ))}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">In Progress</h3>
            <span className="px-2 py-1 rounded-full text-sm" style={{ backgroundColor: '#C2B5FC20', color: '#C2B5FC' }}>
              {inProgressTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {inProgressTasks.map(task => (
              <TaskCard key={task.id} task={task} onTaskUpdated={refetch} />
            ))}
          </div>
        </div>

        {/* DONE Column */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Done</h3>
            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm">
              {doneTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {doneTasks.map(task => (
              <TaskCard key={task.id} task={task} onTaskUpdated={refetch} />
            ))}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <CreateTaskModal 
          projectId={projectId}
          onClose={() => setShowCreateTask(false)}
          onTaskCreated={() => refetch()}
        />
      )}
    </div>
  );
};