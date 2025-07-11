import React, { useState, useEffect } from 'react';
import { Database } from '../../types/database';
import { X, Plus } from 'lucide-react';
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

  return (
    <div className="w-96 bg-slate-800 border-l border-slate-700 p-6 flex flex-col h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Task Details</h2>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700">
          <X className="h-6 w-6 text-slate-400" />
        </button>
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
            <button onClick={handleCreateSubtask} className="ml-2 p-2 bg-indigo-600 hover:bg-indigo-700 rounded-md">
              <Plus className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button 
          onClick={handleSave} 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}; 