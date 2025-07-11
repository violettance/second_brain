import React from 'react';
import { Database } from '../../types/database';
import { TaskCard } from './TaskCard';

type Task = Database['public']['Tables']['tasks']['Row'];

interface KanbanBoardProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

const KANBAN_COLUMNS: { title: string; status: Task['status'] }[] = [
    { title: 'To Do', status: 'TO DO' },
    { title: 'In Progress', status: 'IN PROGRESS' },
    { title: 'Done', status: 'DONE' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onSelectTask }) => {
    const getColumnTasks = (status: Task['status']) => {
        return tasks
            .filter((task) => task.status === status)
            .sort((a, b) => a.position_index - b.position_index);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {KANBAN_COLUMNS.map((column) => (
                <div key={column.status} className="bg-slate-900/70 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-white mb-4 sticky top-0 bg-slate-900/70 py-2">
                        {column.title}
                        <span className="ml-2 text-sm font-normal text-slate-400">
                            {getColumnTasks(column.status).length}
                        </span>
                    </h3>
                    <div className="space-y-4 overflow-y-auto h-[calc(100vh-200px)]">
                        {getColumnTasks(column.status).map((task) => (
                            <TaskCard key={task.id} task={task} onSelectTask={onSelectTask} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}; 