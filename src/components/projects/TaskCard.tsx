import React from 'react';
import { Task, TaskStatus } from '../../types/projects';
import { MoreVertical, Calendar, Tag, CheckSquare, Trash2, Edit } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (newStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const priorityColors = {
    High: 'border-red-500',
    Medium: 'border-yellow-500',
    Low: 'border-blue-500',
  };

  return (
    <div className={`bg-slate-800/80 p-3 rounded-lg border-l-4 ${priorityColors[task.priority || 'Medium']}`}>
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-slate-200 mb-2">{task.name}</h4>
        <div className="relative group">
          <button className="p-1 hover:bg-slate-700 rounded-md">
            <MoreVertical className="h-4 w-4 text-slate-400" />
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-slate-700 border border-slate-600 rounded-md shadow-lg z-10 hidden group-hover:block">
            <button onClick={() => onEdit(task)} className="w-full text-left flex items-center space-x-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-600">
              <Edit className="h-4 w-4" />
              <span>Edit Task</span>
            </button>
            <button onClick={() => onDelete(task.id)} className="w-full text-left flex items-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-slate-600">
              <Trash2 className="h-4 w-4" />
              <span>Delete Task</span>
            </button>
            <div className="border-t border-slate-600 my-1"></div>
            <p className="px-3 py-1 text-xs text-slate-400">Change Status</p>
            {['TO DO', 'IN PROGRESS', 'DONE'].map(status => (
              <button key={status} onClick={() => onStatusChange(status as TaskStatus)} className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-600">
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <p className="text-sm text-slate-400 mb-3">{task.description}</p>
      
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center space-x-2">
            {task.due_date && (
                <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(task.due_date).toLocaleDateString()}</span>
                </div>
            )}
            {task.tags && task.tags.length > 0 && (
                <div className="flex items-center space-x-1">
                    <Tag className="h-3 w-3" />
                    <span>{task.tags[0]}</span>
                </div>
            )}
        </div>
        {task.subtasks && task.subtasks.length > 0 && (
            <div className="flex items-center space-x-1">
                <CheckSquare className="h-3 w-3" />
                <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
            </div>
        )}
      </div>
    </div>
  );
};