import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database';
import { KanbanBoard } from './KanbanBoard';
import { TaskDetailPanel } from './TaskDetailPanel';
import { CreateTaskModal } from '../projects/CreateTaskModal';
import { Plus } from 'lucide-react';

type Task = Database['public']['Tables']['tasks']['Row'];

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = location.state?.projectId;

  useEffect(() => {
    if (!projectId) {
      navigate('/projects');
      return;
    }

    const fetchData = async () => {
      setLoading(true);

      const projectPromise = supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();
      
      const tasksPromise = supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('position_index', { ascending: true });

      const [projectResult, tasksResult] = await Promise.all([projectPromise, tasksPromise]);
      
      if (projectResult.error) {
        console.error('Error fetching project name:', projectResult.error);
      } else if (projectResult.data) {
        setProjectName(projectResult.data.name);
      }

      if (tasksResult.error) {
        console.error('Error fetching tasks:', tasksResult.error);
      } else if (tasksResult.data) {
        setTasks(tasksResult.data);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [projectId, navigate]);

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleClosePanel = () => {
    setSelectedTask(null);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setSelectedTask(updatedTask);
  };

  const handleTaskCreated = (newTask: Task) => {
    setTasks(prevTasks => [...prevTasks, newTask]);
  };


  if (!projectId) {
    return (
      <div className="flex h-full items-center justify-center text-white">
        <p>No project selected. Redirecting to projects page...</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-white">Loading tasks...</div>;
  }

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden">
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 lg:p-6 sticky top-0 z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="pl-12 lg:pl-0">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">{projectName || 'Project Tasks'}</h1>
                    <p className="text-slate-400 text-sm lg:text-base">
                        Organize and manage tasks for this project
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 text-slate-900 rounded-lg font-semibold transition-colors text-sm hover:opacity-90"
                    style={{ background: '#C2B5FC' }}
                >
                    <Plus className="h-4 w-4" />
                    <span>New Task</span>
                </button>
            </div>
        </div>

        {/* Kanban Board */}
        <div className="flex-1 text-white p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {tasks.length > 0 ? (
            <KanbanBoard tasks={tasks} onSelectTask={handleSelectTask} />
          ) : (
            !loading && <p>No tasks found for this project. Get started by creating a new one!</p>
          )}
        </div>
      </div>

      {/* Side Panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={handleClosePanel}
          onUpdateTask={handleUpdateTask}
        />
      )}

      {/* Create Task Modal */}
      {showCreateModal && projectId && (
        <CreateTaskModal 
            projectId={projectId} 
            onClose={() => setShowCreateModal(false)}
            onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}; 