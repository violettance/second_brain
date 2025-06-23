import React from 'react';
import { Calendar, Flag, Link, User, MoreHorizontal } from 'lucide-react';
import { Task } from '../../types/projects';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
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

  return (
    <div className="bg-slate-700/50 border border-slate-600/50 rounded-lg p-4 hover:bg-slate-700/70 transition-all cursor-pointer group">
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-white font-medium text-sm leading-tight flex-1 pr-2">
          {task.name}
        </h4>
        <button className="p-1 hover:bg-slate-600 rounded transition-colors opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="h-3 w-3 text-slate-400" />
        </button>
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
    </div>
  );
};