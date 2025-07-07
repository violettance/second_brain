import React, { useState, useRef, useEffect } from 'react';
import { X, Save, CheckSquare, Calendar, Flag, Link, User, Plus } from 'lucide-react';
import { useProject } from '../../hooks/useProjects';

interface CreateTaskModalProps {
  projectId: string;
  onClose: () => void;
  onTaskCreated?: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ projectId, onClose, onTaskCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TO DO');
  const [priority, setPriority] = useState('Medium');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { createTask } = useProject(projectId);

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

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([...subtasks, subtaskInput.trim()]);
      setSubtaskInput('');
    }
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a task name');
      return;
    }

    setIsSaving(true);
    try {
      await createTask({
        name: name.trim(),
        description: description.trim() || undefined,
        status: status as any,
        priority: priority as any,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        tags: tags.length > 0 ? tags : undefined,
        subtasks: subtasks.length > 0 ? subtasks : undefined
      });
      
      onTaskCreated?.();
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Failed to create task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ background: '#C2B5FC' }}>
              <CheckSquare className="h-5 w-5 text-slate-900" />
            </div>
            <h2 className="text-xl font-bold text-white">Create New Task</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Task Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter task name..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
              >
                <option value="TO DO">To Do</option>
                <option value="IN PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Start Date (Optional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Tags
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addTag)}
                  placeholder="Add tags..."
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
                  style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
                />
                <button
                  onClick={addTag}
                  className="px-4 py-2 text-slate-900 rounded-lg font-medium transition-colors text-sm hover:opacity-90"
                  style={{ background: '#C2B5FC' }}
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center space-x-1 px-3 py-1 border rounded-full text-sm"
                      style={{ backgroundColor: '#C2B5FC20', color: '#C2B5FC', borderColor: '#C2B5FC50' }}
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="transition-colors hover:opacity-70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task or leave blank to generate with AI..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 resize-none"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Subtasks
            </label>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addSubtask)}
                  placeholder="Add subtask..."
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
                  style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
                />
                <button
                  onClick={addSubtask}
                  className="px-4 py-2 text-slate-900 rounded-lg font-medium transition-colors text-sm hover:opacity-90"
                  style={{ background: '#C2B5FC' }}
                >
                  Add
                </button>
              </div>
              {subtasks.length > 0 && (
                <div className="space-y-2">
                  {subtasks.map((subtask, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg"
                    >
                      <span className="text-white text-sm">{subtask}</span>
                      <button
                        onClick={() => removeSubtask(index)}
                        className="p-1 hover:bg-slate-600 rounded transition-colors"
                      >
                        <X className="h-3 w-3 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-slate-600 text-slate-300 rounded-xl font-semibold hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="flex items-center space-x-2 px-6 py-3 text-slate-900 rounded-xl font-semibold transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#C2B5FC' }}
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'Creating...' : 'Create Task'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};