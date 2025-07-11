import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Project } from '../../types/projects';
import { X, Palette } from 'lucide-react';

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onProjectUpdated: () => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, onClose, onProjectUpdated }) => {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [status, setStatus] = useState(project.status);
  const [dueDate, setDueDate] = useState(project.due_date ? new Date(project.due_date).toISOString().split('T')[0] : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = [
    '#C2B5FC', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899'
  ];
  const [color, setColor] = useState(project.color || colors[0]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('Project name is required.');
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('projects')
      .update({
        name,
        description,
        status,
        color,
        due_date: dueDate || null,
      })
      .eq('id', project.id);

    if (updateError) {
      setError(updateError.message);
      setIsSubmitting(false);
    } else {
      onProjectUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Edit Project</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700">
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
              Project Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2"
              style={{'--tw-ring-color': color} as React.CSSProperties}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 resize-none"
              style={{'--tw-ring-color': color} as React.CSSProperties}
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Project['status'])}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2"
                style={{'--tw-ring-color': color} as React.CSSProperties}
              >
                <option>Active</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>On Hold</option>
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-1">
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2"
                style={{'--tw-ring-color': color} as React.CSSProperties}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-slate-400" />
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-transform ${
                      color === c ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-900 rounded-lg font-semibold transition-colors text-sm hover:opacity-90 disabled:opacity-50"
              style={{ background: color }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 