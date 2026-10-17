import React, { useState } from 'react';
import { Project } from '../../types/projects';
import { resolveColorValue, resolveDesignColor } from '../../design/tokens';

type ProjectUpdates = Partial<Omit<Project, 'id' | 'tasksCount' | 'completedTasks' | 'createdAt' | 'updatedAt'>>;

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onSave: (projectId: string, updates: ProjectUpdates) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, onClose, onSave }) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [color, setColor] = useState(() => resolveColorValue(project.color || resolveDesignColor('primary')));
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
      <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-ink mb-4">Edit Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="project-name" className="block text-muted text-sm font-medium mb-2">Project Name</label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-muted border border-ink rounded-lg px-3 py-2 text-ink"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="project-description" className="block text-muted text-sm font-medium mb-2">Description</label>
            <textarea
              id="project-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-muted border border-ink rounded-lg px-3 py-2 text-ink"
              rows={3}
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label htmlFor="project-status" className="block text-muted text-sm font-medium mb-2">Status</label>
                <select
                id="project-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Project['status'])}
                className="w-full bg-surface-muted border border-ink rounded-lg px-3 py-2 text-ink"
                >
                <option value="Active">Active</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                </select>
            </div>
            <div>
                <label htmlFor="project-color" className="block text-muted text-sm font-medium mb-2">Color</label>
                <select
                  id="project-color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full bg-surface-muted border border-ink rounded-lg px-3 py-2 text-ink"
                >
                  <option value={resolveDesignColor('primary')}>Hot pink</option>
                  <option value={resolveDesignColor('secondary')}>Cyan</option>
                  <option value={resolveDesignColor('yellow')}>Yellow</option>
                  <option value={resolveDesignColor('purple')}>Purple</option>
                </select>
            </div>
          </div>
           <div className="mb-6">
            <label htmlFor="project-due-date" className="block text-muted text-sm font-medium mb-2">Due Date</label>
            <input
              id="project-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-surface-muted border border-ink rounded-lg px-3 py-2 text-ink"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-surface-muted text-muted rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-ink rounded-lg font-semibold" style={{ background: color }}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};
