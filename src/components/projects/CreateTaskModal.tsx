import React, { useState } from 'react';
import { Task } from '../../types/projects';

type TaskData = Omit<Task, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>;

interface CreateTaskModalProps {
  projectId: string;
  onClose: () => void;
  onCreate: (taskData: TaskData) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ projectId, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'TO DO' | 'IN PROGRESS' | 'DONE'>('TO DO');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onCreate({
      name,
      description,
      status,
      // Default values for other fields
      priority: 'Medium',
      tags: [],
      subtasks: [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Create New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="task-name" className="block text-slate-400 text-sm font-medium mb-2">Task Name</label>
            <input
              id="task-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
              placeholder="e.g., Design the landing page"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="task-description" className="block text-slate-400 text-sm font-medium mb-2">Description</label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
              placeholder="Add more details about the task..."
              rows={4}
            ></textarea>
          </div>
          <div className="mb-6">
            <label htmlFor="task-status" className="block text-slate-400 text-sm font-medium mb-2">Status</label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'TO DO' | 'IN PROGRESS' | 'DONE')}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
            >
              <option value="TO DO">To Do</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-slate-900 rounded-lg font-semibold transition-colors hover:opacity-90"
              style={{ background: '#C2B5FC' }}
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};