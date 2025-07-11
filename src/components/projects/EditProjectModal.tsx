import React, { useState } from 'react';
import { Project } from '../../types/projects';

type ProjectUpdates = Partial<Omit<Project, 'id' | 'tasksCount' | 'completedTasks' | 'createdAt' | 'updatedAt'>>;

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSave: (projectId: string, updates: ProjectUpdates) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, onClose, onSave }) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [color, setColor] = useState(project.color || '#C2B5FC');
  const [status, setStatus] = useState(project.status);
  const [dueDate, setDueDate] = useState(project.due_date ? project.due_date.split('T')[0] : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave(project.id, {
      name: name.trim(),
      description: description.trim(),
      color,
      status,
      due_date: dueDate || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Edit Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="project-name" className="block text-slate-400 text-sm font-medium mb-2">Project Name</label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="project-description" className="block text-slate-400 text-sm font-medium mb-2">Description</label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
              rows={3}
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="project-status" className="block text-slate-400 text-sm font-medium mb-2">Status</label>
                <select
                id="project-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Project['status'])}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                <option value="Active">Active</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                </select>
            </div>
            <div>
                <label htmlFor="project-color" className="block text-slate-400 text-sm font-medium mb-2">Color</label>
                <input
                id="project-color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 p-1 bg-slate-700 border border-slate-600 rounded-lg"
                />
            </div>
          </div>
           <div className="mb-6">
            <label htmlFor="project-due-date" className="block text-slate-400 text-sm font-medium mb-2">Due Date</label>
            <input
              id="project-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-slate-900 rounded-lg font-semibold" style={{ background: color }}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}; 