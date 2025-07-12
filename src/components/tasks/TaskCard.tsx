import React from 'react';
import { Database } from '../../types/database';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskCardProps {
  task: Task;
  onSelectTask: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSelectTask }) => {
  let statusBorder = '';
  switch (task.status) {
    case 'TO DO':
      statusBorder = 'border-slate-500'; // gray
      break;
    case 'IN PROGRESS':
      statusBorder = 'border-orange-400'; // orange
      break;
    case 'DONE':
      statusBorder = 'border-green-500'; // green
      break;
    default:
      statusBorder = 'border-slate-500';
  }

  return (
    <div 
      className={`bg-slate-800 p-3 rounded-lg border-l-4 ${statusBorder} mb-3 cursor-pointer hover:bg-slate-700/80 transition-colors`}
      onClick={() => onSelectTask(task)}
    >
      <h4 className="font-semibold text-slate-200 mb-2">{task.name}</h4>
      <p className="text-sm text-slate-400 truncate">{task.description}</p>
    </div>
  );
}; 