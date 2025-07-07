import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Plus, ListChecks } from 'lucide-react';
import { useProject } from '../../hooks/useProjects';
import { Task } from '../../types/projects';

interface EditTaskModalProps {
  task: Task;
  projectId: string;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ 
  task, 
  projectId, 
  onClose, 
  onTaskUpdated 
}) => {
  const [title, setTitle] = useState(task.name);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || '');
  const [newSubtask, setNewSubtask] = useState('');
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [isUpdating, setIsUpdating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { updateTask } = useProject(projectId);

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

  const statuses = ['TO DO', 'IN PROGRESS', 'DONE'] as const;
  const priorities = ['Low', 'Medium', 'High'] as const;

  const addSubtask = () => {
    if (newSubtask.trim()) {
      const subtask = {
        id: `subtask-${Date.now()}`,
        name: newSubtask.trim(),
        completed: false
      };
      setSubtasks([...subtasks, subtask]);
      setNewSubtask('');
    }
  };

  const toggleSubtask = (index: number) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks[index].completed = !updatedSubtasks[index].completed;
    setSubtasks(updatedSubtasks);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    setIsUpdating(true);
    try {
      await updateTask(task.id, {
        name: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate || undefined,
        // Note: subtasks updates not currently handled by updateTask
      });
      
      onTaskUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case 'Completed': return 'text-green-400';
      case 'In Progress': return 'text-blue-400';
      default: return 'text-slate-400';
    }
  };

  const getPriorityColor = (priorityValue: string) => {
    switch (priorityValue) {
      case 'High': return 'text-red-400';
      case 'Medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-violet-500/20 rounded-lg">
              <ListChecks className="h-5 w-5 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Edit Task</h2>
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
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the task..."
              rows={4}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {statuses.map((statusOption) => (
                  <option key={statusOption} value={statusOption}>
                    {statusOption}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {priorities.map((priorityOption) => (
                  <option key={priorityOption} value={priorityOption}>
                    {priorityOption}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Subtasks
            </label>
            
            {/* Add Subtask */}
            <div className="flex space-x-2 mb-4">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask..."
                className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400"
                onKeyPress={(e) => e.key === 'Enter' && addSubtask()}
              />
              <button
                onClick={addSubtask}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Subtasks List */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {subtasks.map((subtask, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg"
                >
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => toggleSubtask(index)}
                    className="h-4 w-4 text-violet-600 bg-slate-700 border-slate-600 rounded focus:ring-violet-500"
                  />
                  <span className={`flex-1 text-sm ${
                    subtask.completed ? 'text-slate-400 line-through' : 'text-white'
                  }`}>
                    {subtask.name}
                  </span>
                  <button
                    onClick={() => removeSubtask(index)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
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
            onClick={handleUpdate}
            disabled={isUpdating || !title.trim()}
            className="flex items-center space-x-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{isUpdating ? 'Updating...' : 'Update Task'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}; 