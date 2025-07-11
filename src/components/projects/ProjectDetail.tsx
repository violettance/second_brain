import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectData, useProjectTasks } from '../../hooks/useProjects';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Tag, CheckSquare, Square, Users, Link as LinkIcon, MoreVertical } from 'lucide-react';
import { Task, TaskStatus, Subtask, Project } from '../../types/projects';
import { CreateTaskModal } from './CreateTaskModal';
import { EditTaskModal } from './EditTaskModal';
import { EditProjectModal } from './EditProjectModal';
import { TaskCard } from './TaskCard';

type GroupedTasks = {
  [key in TaskStatus]: Task[];
};

export const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState<Task | null>(null);
  const [showEditProject, setShowEditProject] = useState<Project | null>(null);

  if (!projectId) {
    return <div>Project not found.</div>;
  }

  const { project, isLoading: projectLoading, error: projectError, fetchProject } = useProjectData(projectId);
  const { tasks, isLoading: tasksLoading, error: tasksError, createTask, updateTask, deleteTask } = useProjectTasks(projectId, fetchProject);
  
  const isLoading = projectLoading || tasksLoading;

  const groupedTasks = tasks.reduce<GroupedTasks>(
    (acc, task) => {
      acc[task.status].push(task);
      return acc;
    },
    { 'TO DO': [], 'IN PROGRESS': [], 'DONE': [] }
  );

  const statusColumns: { status: TaskStatus; title: string; color: string }[] = [
    { status: 'TO DO', title: 'To Do', color: 'bg-slate-500' },
    { status: 'IN PROGRESS', title: 'In Progress', color: 'bg-blue-500' },
    { status: 'DONE', title: 'Done', color: 'bg-green-500' },
  ];

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId);
    }
  };

  if (isLoading) return <div>Loading project...</div>;
  if (projectError) return <div className="text-red-500">Error: {projectError}</div>;
  if (!project) return <div>Project not found.</div>;

  return (
    <div className="flex-1 bg-slate-900 text-white flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/projects')} className="p-2 hover:bg-slate-700 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <p className="text-slate-400 text-sm">{project.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setShowEditProject(project)} className="flex items-center space-x-2 px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg">
              <Edit className="h-4 w-4" />
              <span>Edit Project</span>
            </button>
            <button onClick={() => setShowCreateTask(true)} className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-900 rounded-lg font-semibold hover:opacity-90" style={{ background: '#C2B5FC' }}>
              <Plus className="h-4 w-4" />
              <span>New Task</span>
            </button>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-6 text-sm">
            <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div className="h-2.5 rounded-full" style={{ width: `${project.progress}%`, backgroundColor: project.color || '#C2B5FC' }}></div>
            </div>
            <span className="text-slate-300 font-semibold">{project.progress}%</span>
            <div className="flex items-center space-x-2 text-slate-400">
                <CheckSquare className="h-4 w-4" />
                <span>{project.completedTasks} / {project.tasksCount} Tasks</span>
            </div>
            {project.due_date && (
                 <div className="flex items-center space-x-2 text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>Due {new Date(project.due_date).toLocaleDateString()}</span>
                </div>
            )}
        </div>
      </header>
      
      {/* Kanban Board */}
      <main className="flex-1 overflow-x-auto p-4">
        {tasksError && <p className="text-red-500">{tasksError}</p>}
        <div className="flex space-x-4 h-full">
          {statusColumns.map(({ status, title, color }) => (
            <div key={status} className="w-80 flex-shrink-0 bg-slate-800/60 rounded-xl p-3 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`w-3 h-3 rounded-full ${color}`}></span>
                  <h2 className="font-semibold text-slate-200">{title}</h2>
                </div>
                <span className="text-sm font-medium text-slate-400 bg-slate-700/80 px-2 py-0.5 rounded-full">
                  {groupedTasks[status].length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {groupedTasks[status].map(task => (
                  <TaskCard 
                    key={task.id}
                    task={task} 
                    onEdit={() => setShowEditTask(task)} 
                    onDelete={() => handleDeleteTask(task.id)}
                    onStatusChange={(newStatus) => handleUpdateTaskStatus(task.id, newStatus)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modals */}
      {showCreateTask && (
        <CreateTaskModal
          projectId={projectId}
          onClose={() => setShowCreateTask(false)}
          onCreate={async (taskData) => {
            await createTask(taskData);
            setShowCreateTask(false);
          }}
        />
      )}
      {showEditTask && (
        <EditTaskModal
          task={showEditTask}
          onClose={() => setShowEditTask(null)}
          onSave={async (taskId, updates) => {
            await updateTask(taskId, updates);
            setShowEditTask(null);
          }}
        />
      )}
       {showEditProject && (
        <EditProjectModal
          project={showEditProject}
          onClose={() => setShowEditProject(null)}
          onSave={async (id, updates) => {
            // This function needs to be from useProjects (plural) hook
            // For now, we'll just refetch. A better approach would be to have a global context for projects.
            // await updateProject(id, updates);
            console.log("Project update needs a function from useProjects hook");
            setShowEditProject(null);
            fetchProject(); // Refetch project data after editing
          }}
        />
      )}
    </div>
  );
};