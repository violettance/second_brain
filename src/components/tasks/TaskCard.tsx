import React from 'react';
import { Database } from '../../types/database';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskCardProps {
  task: Task;
  onSelectTask: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSelectTask }) => {
  const priorityColors = {
    High: 'border-red-500',
    Medium: 'border-yellow-500',
    Low: 'border-blue-500',
    default: 'border-slate-500'
  };
  
  const priority = task.priority as keyof typeof priorityColors;
  const borderColor = priorityColors[priority] || priorityColors.default;


  return (
    <div 
      className={`bg-slate-800 p-3 rounded-lg border-l-4 ${borderColor} mb-3 cursor-pointer hover:bg-slate-700/80 transition-colors`}
      onClick={() => onSelectTask(task)}
    >
      <h4 className="font-semibold text-slate-200 mb-2">{task.name}</h4>
      <p className="text-sm text-slate-400 truncate">{task.description}</p>
    </div>
  );
}; 