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
      statusBorder = 'border-ink'; // gray
      break;
    case 'IN PROGRESS':
      statusBorder = 'border-orange-400'; // orange
      break;
    case 'DONE':
      statusBorder = 'border-green-500'; // green
      break;
    default:
      statusBorder = 'border-ink';
  }

  return (
    <div 
      className={`bg-surface p-3 rounded-lg border-l-4 ${statusBorder} mb-3 cursor-pointer hover:bg-surface-muted transition-colors`}
      onClick={() => onSelectTask(task)}
    >
      <h4 className="font-semibold text-ink mb-2">{task.name}</h4>
      <p className="text-sm text-muted truncate">{task.description}</p>
    </div>
  );
}; 