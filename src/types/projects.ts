export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  color: string;
  tasksCount: number;
  completedTasks: number;
  teamMembers: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  status: 'TO DO' | 'IN PROGRESS' | 'DONE';
  priority?: 'Low' | 'Medium' | 'High';
  startDate?: string;
  dueDate?: string;
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