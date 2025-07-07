import React, { useState, useEffect } from 'react';
import { Calendar, Flag, Link, User, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Task } from '../../types/projects';
import { useProject } from '../../hooks/useProjects';
import { EditTaskModal } from './EditTaskModal';

interface TaskCardProps {
  task: Task;
  onTaskUpdated?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onTaskUpdated }) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { deleteTask } = useProject(task.projectId);
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-yellow-400';
      case 'Low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getPriorityIcon = (priority: string) => {
    return <Flag className={`h-3 w-3 ${getPriorityColor(priority)}`} />;
  };

  const handleDeleteTask = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task? This will also delete all subtasks.')) {
      try {
        await deleteTask(task.id);
        onTaskUpdated?.();
        setOpenDropdown(false);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(false);
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  return (
    <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-4 hover:bg-slate-700/70 transition-all cursor-pointer group">
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-white font-medium text-sm leading-tight flex-1 pr-2">
          {task.name}
        </h4>
        <div className="relative">
          <button 
            className="p-1 hover:bg-slate-600 rounded transition-colors opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(!openDropdown);
            }}
          >
            <MoreHorizontal className="h-3 w-3 text-slate-400" />
          </button>
          
          {openDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-slate-600 border border-slate-500 rounded-lg shadow-lg z-10 py-1 min-w-[100px]">
              <button
                className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-500 flex items-center space-x-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                  setOpenDropdown(false);
                }}
              >
                <Edit className="h-3 w-3" />
                <span>Edit</span>
              </button>
              <button
                className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-slate-500 flex items-center space-x-2"
                onClick={handleDeleteTask}
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-slate-400 text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-slate-600/50 text-slate-400 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="px-2 py-1 bg-slate-600/50 text-slate-400 rounded text-xs">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          {/* Priority */}
          {task.priority && (
            <div className="flex items-center space-x-1">
              {getPriorityIcon(task.priority)}
              <span className={getPriorityColor(task.priority)}>{task.priority}</span>
            </div>
          )}

          {/* Relationships */}
          {task.relationships && task.relationships.length > 0 && (
            <div className="flex items-center space-x-1 text-slate-400">
              <Link className="h-3 w-3" />
              <span>{task.relationships.length}</span>
            </div>
          )}
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center space-x-1 text-slate-400">
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>

      {/* Subtasks Progress */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-600/50">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Subtasks</span>
            <span>{task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-1">
            <div 
              className="bg-green-500 h-1 rounded-full transition-all duration-300"
              style={{ 
                width: `${(task.subtasks.filter(st => st.completed).length / task.subtasks.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {isEditing && (
        <EditTaskModal
          task={task}
          projectId={task.projectId}
          onClose={() => setIsEditing(false)}
          onTaskUpdated={onTaskUpdated}
        />
      )}
    </div>
  );
};