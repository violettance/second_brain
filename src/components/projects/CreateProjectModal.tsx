import React, { useState, useRef, useEffect } from 'react';
import { X, Save, FolderOpen } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { logger } from '../../lib/logger';
import { resolveDesignColor } from '../../design/tokens';

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectCreated?: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(() => resolveDesignColor('primary'));
  const [dueDate, setDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { createProject } = useProjects();

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const colors = [
    { name: 'Hot pink', value: resolveDesignColor('primary') },
    { name: 'Cyan', value: resolveDesignColor('secondary') },
    { name: 'Yellow', value: resolveDesignColor('yellow') },
    { name: 'Purple', value: resolveDesignColor('purple') },
  ];

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a project name');
      return;
    }

    setIsSaving(true);
    try {
      await createProject({
        name: name.trim(),
        description: description.trim(),
        color,
        due_date: dueDate || undefined
      });
      if (onProjectCreated) onProjectCreated();
      onClose();
    } catch (error) {
      logger.error('Error creating project', { error: error.message });
      alert('Failed to create project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50  z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-surface border border-ink rounded-2xl w-full max-w-2xl max-h-modal overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-ink">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ background: 'var(--color-brand-primary)' }}>
              <FolderOpen className="h-5 w-5 text-ink" />
            </div>
            <h2 className="text-xl font-bold text-ink">Create New Project</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name..."
              className="w-full px-4 py-3 bg-surface-muted border border-ink rounded-xl text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': 'var(--color-brand-primary)' } as React.CSSProperties}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project..."
              rows={4}
              className="w-full px-4 py-3 bg-surface-muted border border-ink rounded-xl text-ink placeholder-slate-400 focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': 'var(--color-brand-primary)' } as React.CSSProperties}
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-muted mb-3">
              Project Color
            </label>
            <div className="flex flex-wrap gap-3">
              {colors.map((colorOption) => (
                <button
                  key={colorOption.name}
                  type="button"
                  aria-label={`Use ${colorOption.name}`}
                  aria-pressed={color === colorOption.value}
                  onClick={() => setColor(colorOption.value)}
                  className={`h-9 w-9 rounded-md border-2 border-ink transition-transform hover:-translate-y-0.5 ${color === colorOption.value ? 'shadow-sm' : ''}`}
                  style={{ backgroundColor: colorOption.value }}
                />
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 bg-surface-muted border border-ink rounded-xl text-ink focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': 'var(--color-brand-primary)' } as React.CSSProperties}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-ink">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-ink text-muted rounded-xl font-semibold hover:bg-surface-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="flex items-center space-x-2 px-6 py-3 text-ink rounded-xl font-semibold transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-brand-primary)' }}
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Creating...' : 'Create Project'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
