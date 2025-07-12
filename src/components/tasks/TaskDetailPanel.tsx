import React, { useState, useEffect } from 'react';
import { Database } from '../../types/database';
import { X, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];
type Subtask = Database['public']['Tables']['subtasks']['Row'];

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
}

export const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ task, onClose, onUpdateTask }) => {
  const [name, setName] = useState(task.name);
  const [description, setDescription] = useState(task.description);
  const [isSaving, setIsSaving] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    setName(task.name);
    setDescription(task.description);
    fetchSubtasks();
  }, [task]);

  const fetchSubtasks = async () => {
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', task.id)
      .order('created_at');

    if (error) {
      console.error('Error fetching subtasks:', error);
    } else if (data) {
      setSubtasks(data);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { data, error } = await supabase
      .from('tasks')
      .update({ name, description })
      .eq('id', task.id)
      .select()
      .single();
    
    setIsSaving(false);

    if (error) {
      console.error('Error updating task:', error);
    } else if (data) {
      onUpdateTask(data);
    }
  };

  const handleCreateSubtask = async () => {
    if (newSubtaskName.trim() === '') return;

    const { data, error } = await supabase
      .from('subtasks')
      .insert({
        task_id: task.id,
        name: newSubtaskName,
        completed: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subtask:', error);
    } else if (data) {
      setSubtasks([...subtasks, data]);
      setNewSubtaskName('');
    }
  };

  const handleToggleSubtask = async (subtask: Subtask) => {
    const { data, error } = await supabase
      .from('subtasks')
      .update({ completed: !subtask.completed })
      .eq('id', subtask.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating subtask:', error);
    } else if (data) {
      setSubtasks(subtasks.map(s => s.id === data.id ? data : s));
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);
    if (error) {
      console.error('Error deleting subtask:', error);
    } else {
      setSubtasks(subtasks.filter(s => s.id !== subtaskId));
    }
  };

  const handleDeleteTask = async () => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id);
    if (error) {
      alert('Error deleting task: ' + error.message);
    } else {
      onClose();
    }
  };

  return (
    <div className="w-96 bg-slate-800 border-l border-slate-700 p-6 flex flex-col h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Task Details</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDeleteConfirm(true)} className="p-1 rounded-full hover:bg-slate-700" title="Delete Task">
            <Trash2 className="h-6 w-6" style={{ color: '#C2B5FC' }} />
          </button>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700" title="Close">
            <X className="h-6 w-6 text-slate-400" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-4">
        <div>
          <label htmlFor="task-name" className="block text-sm font-medium text-slate-400 mb-1">Task Name</label>
          <input
            id="task-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-700 text-white rounded-md p-2"
          />
        </div>
        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-slate-400 mb-1">Description</label>
          <textarea
            id="task-description"
            value={description || ''}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-700 text-white rounded-md p-2 h-32"
          />
        </div>
        <div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">Subtasks</h3>
          <div className="space-y-2">
            {subtasks.map(subtask => (
              <div key={subtask.id} className="flex items-center bg-slate-700 p-2 rounded-md">
                <input 
                  type="checkbox" 
                  checked={subtask.completed} 
                  onChange={() => handleToggleSubtask(subtask)}
                  className="mr-3 h-4 w-4 bg-slate-600 border-slate-500 text-indigo-500 focus:ring-indigo-500 rounded"
                />
                <span className={`flex-1 ${subtask.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                  {subtask.name}
                </span>
                <button onClick={() => handleDeleteSubtask(subtask.id)} className="ml-2 p-1 rounded hover:bg-slate-600" style={{ color: '#C2B5FC' }} title="Delete Subtask">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center">
            <input
              type="text"
              value={newSubtaskName}
              onChange={(e) => setNewSubtaskName(e.target.value)}
              placeholder="Add a new subtask"
              className="flex-1 bg-slate-700 text-white rounded-md p-2 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSubtask()}
            />
            <button onClick={handleCreateSubtask} className="ml-2 p-2 rounded-md transition-colors" style={{ background: '#C2B5FC', color: '#18181b' }} title="Add Subtask"
              onMouseOver={e => { e.currentTarget.style.background = '#b39ddb'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#C2B5FC'; }}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <button 
          onClick={handleSave} 
          className="w-full font-bold py-2 px-4 rounded-md transition-colors"
          style={{ background: '#C2B5FC', color: '#18181b' }}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-xs flex flex-col items-center">
              <Trash2 className="h-8 w-8 text-red-400 mb-2" />
              <p className="text-white text-lg font-semibold mb-4 text-center">Are you sure you want to delete this task?</p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-md bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => { setShowDeleteConfirm(false); await handleDeleteTask(); }}
                  className="flex-1 py-2 rounded-md bg-red-500 text-white font-bold hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 