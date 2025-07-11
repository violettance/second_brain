export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  color: string;
  tasksCount: number;
  completedTasks: number;
  due_date?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'TO DO' | 'IN PROGRESS' | 'DONE';

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: TaskStatus;
  priority?: 'Low' | 'Medium' | 'High';
  startDate?: string;
  due_date?: string;
  tags?: string[];
  relationships?: string[]; // IDs of related tasks
  subtasks?: Subtask[];
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  name: string;
  completed: boolean;
}