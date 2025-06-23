import { useState, useEffect } from 'react';
import { Project, Task } from '../types/projects';
import { useAuth } from '../contexts/AuthContext';

// Mock data for demo
const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Knowledge Management System',
    description: 'Building a comprehensive second brain application',
    status: 'In Progress',
    progress: 75,
    color: '#C2B5FC',
    tasksCount: 12,
    completedTasks: 9,
    teamMembers: 3,
    dueDate: '2025-02-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Research Project',
    description: 'AI and machine learning research initiative',
    status: 'Active',
    progress: 45,
    color: '#10b981',
    tasksCount: 8,
    completedTasks: 3,
    teamMembers: 2,
    dueDate: '2025-03-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Content Creation',
    description: 'Blog posts and educational content',
    status: 'Active',
    progress: 60,
    color: '#f59e0b',
    tasksCount: 15,
    completedTasks: 9,
    teamMembers: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    projectId: '1',
    name: 'Design user interface',
    description: 'Create wireframes and mockups for the main dashboard',
    status: 'DONE',
    priority: 'High',
    startDate: '2025-01-01',
    dueDate: '2025-01-15',
    tags: ['design', 'ui', 'dashboard'],
    subtasks: [
      { id: '1', name: 'Create wireframes', completed: true },
      { id: '2', name: 'Design mockups', completed: true },
      { id: '3', name: 'Get feedback', completed: true }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    projectId: '1',
    name: 'Implement authentication',
    description: 'Set up user authentication and authorization system',
    status: 'IN PROGRESS',
    priority: 'High',
    startDate: '2025-01-10',
    dueDate: '2025-01-25',
    tags: ['backend', 'auth', 'security'],
    subtasks: [
      { id: '1', name: 'Setup Supabase auth', completed: true },
      { id: '2', name: 'Create login forms', completed: true },
      { id: '3', name: 'Add password reset', completed: false }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    projectId: '1',
    name: 'Database schema design',
    description: 'Design and implement the database structure',
    status: 'TO DO',
    priority: 'Medium',
    dueDate: '2025-02-01',
    tags: ['database', 'schema', 'backend'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    projectId: '1',
    name: 'API development',
    description: 'Create REST API endpoints for data operations',
    status: 'TO DO',
    priority: 'High',
    dueDate: '2025-02-10',
    tags: ['api', 'backend', 'endpoints'],
    relationships: ['2'], // Related to authentication task
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setProjects(MOCK_PROJECTS);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects
  };
};

export const useProject = (projectId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProject = async () => {
    if (!user || !projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foundProject = MOCK_PROJECTS.find(p => p.id === projectId);
      const projectTasks = MOCK_TASKS.filter(t => t.projectId === projectId);
      
      setProject(foundProject || null);
      setTasks(projectTasks);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && projectId) {
      fetchProject();
    }
  }, [user, projectId]);

  return {
    project,
    tasks,
    isLoading,
    error,
    refetch: fetchProject
  };
};