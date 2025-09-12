import { useState, useEffect } from 'react';
import { Project, Task } from '../types/projects';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

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

    due_date: '2025-02-15',
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

    due_date: '2025-03-01',
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
    due_date: '2025-01-15',
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
    due_date: '2025-01-25',
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
    due_date: '2025-02-01',
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
    due_date: '2025-02-10',
    tags: ['api', 'backend', 'endpoints'],
    relationships: ['2'], // Related to authentication task
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Check if Supabase is properly configured
const isSupabaseConfigured = () => {
  try {
    return !!(supabase);
  } catch {
    return false;
  }
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProjects = async () => {
    const demoUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };
    const currentUser = user || demoUser;

    setIsLoading(true);
    setError(null);

    try {
      // If Supabase isn't configured, use mock data
      if (!isSupabaseConfigured()) {
        logger.warn('Supabase not configured, using mock data. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setProjects(MOCK_PROJECTS);
        return;
      }

      // Fetch projects from Supabase
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      if (!projectsData || projectsData.length === 0) {
        setProjects([]);
        return;
      }

      // Fetch task counts for each project
      const projectIds = projectsData.map((p: any) => p.id);
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('project_id, status')
        .in('project_id', projectIds);

      if (tasksError) throw tasksError;

      // Calculate task counts and progress for each project
      const projectsWithCounts = projectsData.map((project: any) => {
        const projectTasks = tasksData?.filter((task: any) => task.project_id === project.id) || [];
        const completedTasks = projectTasks.filter((task: any) => task.status === 'DONE').length;
        const tasksCount = projectTasks.length;
        
        // Calculate actual progress based on completed tasks, but use existing progress if no tasks
        const calculatedProgress = tasksCount > 0 ? Math.round((completedTasks / tasksCount) * 100) : project.progress;

        return {
          id: project.id,
          name: project.name,
          description: project.description || '',
          status: project.status as Project['status'],
          progress: calculatedProgress,
          color: project.color,
          tasksCount,
          completedTasks,
          due_date: project.due_date || undefined,
          createdAt: project.created_at,
          updatedAt: project.updated_at
        } as Project;
      });

      setProjects(projectsWithCounts);
    } catch (err) {
      logger.error('Error fetching projects', { error: err.message });
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      // Fallback to mock data on error
      setProjects(MOCK_PROJECTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const createProject = async (projectData: {
    name: string;
    description: string;
    color: string;
    due_date?: string;
  }) => {
    const demoUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };
    const currentUser = user || demoUser;

    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        // Mock creation
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newProject: Project = {
          id: Date.now().toString(),
          name: projectData.name,
          description: projectData.description,
          status: 'Active',
          progress: 0,
          color: projectData.color,
          tasksCount: 0,
          completedTasks: 0,
          due_date: projectData.due_date,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProjects(prev => [newProject, ...prev]);
        return newProject;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: currentUser.id,
          name: projectData.name,
          description: projectData.description,
          color: projectData.color,
          due_date: projectData.due_date || null,
          status: 'Active'
        })
        .select()
        .single();

      if (error) throw error;

      // Refetch projects to update the list
      await fetchProjects();

      const newProject: Project = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        status: data.status as Project['status'],
        progress: data.progress,
        color: data.color,
        tasksCount: 0,
        completedTasks: 0,
        due_date: data.due_date || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      logger.error('Error creating project', { error: err.message });
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<{
    name: string;
    description: string;
    status: Project['status'];
    color: string;
    progress: number;
    due_date?: string;
  }>) => {
    const demoUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };
    const currentUser = user || demoUser;

    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        // Mock update
        await new Promise(resolve => setTimeout(resolve, 500));
        setProjects(prev => prev.map(p => 
          p.id === projectId 
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p
        ));
        return;
      }

      const { error } = await supabase
        .from('projects')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.description && { description: updates.description }),
          ...(updates.status && { status: updates.status }),
          ...(updates.color && { color: updates.color }),
          ...(updates.progress !== undefined && { progress: updates.progress }),
          ...(updates.due_date !== undefined && { due_date: updates.due_date }),
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      // Refetch projects to update the list
      await fetchProjects();

      // Update local state
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      ));
    } catch (err) {
      logger.error('Error updating project', { error: err.message });
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    const demoUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };
    const currentUser = user || demoUser;

    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        // Mock deletion
        await new Promise(resolve => setTimeout(resolve, 500));
        setProjects(prev => prev.filter(p => p.id !== projectId));
        return;
      }

      // First, delete related tasks to maintain data integrity
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', currentUser.id);

      if (tasksError) throw tasksError;

      // Then delete the project
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', currentUser.id);

      if (projectError) throw projectError;
      
      // Refetch projects to update the list
      await fetchProjects();
    } catch (err) {
      logger.error('Error deleting project', { error: err.message });
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject
  };
};

// --- HOOK FOR A SINGLE PROJECT'S DATA ---
export const useProjectData = (projectId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProject = async () => {
    if (!projectId) {
      setProject(null);
      return;
    }
    
    const demoUser = { id: '2994cfab-5a29-422d-81f8-63909b93bf20' };
    const currentUser = user || demoUser;

    setIsLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured()) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const foundProject = MOCK_PROJECTS.find(p => p.id === projectId);
        setProject(foundProject || null);
        return;
      }

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', currentUser.id)
        .single();
      
      if (projectError) throw projectError;
      if (!projectData) {
        setProject(null);
        return;
      }

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('status')
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      const completedTasks = tasksData?.filter((task: any) => task.status === 'DONE').length || 0;
      const tasksCount = tasksData?.length || 0;
      const calculatedProgress = tasksCount > 0 ? Math.round((completedTasks / tasksCount) * 100) : projectData.progress;
      
      const projectWithCounts: Project = {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status as Project['status'],
        progress: calculatedProgress,
        color: projectData.color,
        tasksCount,
        completedTasks,
        due_date: projectData.due_date || undefined,
        createdAt: projectData.created_at,
        updatedAt: projectData.updated_at,
      };
      setProject(projectWithCounts);
    } catch (err) {
      logger.error('Error fetching project', { error: err.message });
      setError(err instanceof Error ? err.message : 'Failed to fetch project details');
      setProject(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId, user]);

  return { project, isLoading, error, fetchProject };
};


// --- HOOK FOR A SINGLE PROJECT'S TASKS ---
export const useProjectTasks = (projectId: string, onTaskChange: () => void) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!projectId) {
      setTasks([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (!isSupabaseConfigured()) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const projectTasks = MOCK_TASKS.filter(t => t.projectId === projectId);
        setTasks(projectTasks);
        return;
      }
      
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;
      
      const tasksWithSubtasks = await Promise.all(
        (tasksData || []).map(async (task: any) => {
          const { data: subtasks, error: subtasksError } = await supabase
            .from('subtasks')
            .select('*')
            .eq('task_id', task.id);
          if (subtasksError) logger.error('Error fetching subtasks', { error: subtasksError.message });
          return {
            ...task,
            id: task.id,
            projectId: task.project_id,
            name: task.name,
            description: task.description || undefined,
            status: task.status as Task['status'],
            priority: task.priority as Task['priority'],
            startDate: task.start_date || undefined,
            due_date: task.due_date || undefined,
            tags: task.tags || undefined,
            subtasks: subtasks?.map((st: any) => ({ id: st.id, name: st.name, completed: st.completed })) || [],
            createdAt: task.created_at,
            updatedAt: task.updated_at,
          } as Task;
        })
      );
      
      setTasks(tasksWithSubtasks);
    } catch (err) {
      logger.error('Error fetching tasks', { error: err.message });
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const createTask = async (taskData: {
    name: string;
    description?: string;
    status: Task['status'];
    priority?: Task['priority'];
    startDate?: string;
    due_date?: string;
    tags?: string[];
    subtasks?: string[];
  }) => {
    try {
      if (!isSupabaseConfigured()) {
        await new Promise(resolve => setTimeout(resolve, 300));
        const newTask: Task = {
          id: Date.now().toString(),
          projectId,
          name: taskData.name,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority || 'Medium',
          startDate: taskData.startDate,
          due_date: taskData.due_date,
          tags: taskData.tags,
          subtasks: taskData.subtasks?.map((name, i) => ({ id: `${Date.now()}-${i}`, name, completed: false })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setTasks(prev => [...prev, newTask]);
        onTaskChange(); // Notify that project data might need a refresh
        return;
      }

      const { data: taskResult, error: taskError } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          name: taskData.name,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority || 'Medium',
          start_date: taskData.startDate || null,
          due_date: taskData.due_date || null,
          tags: taskData.tags || []
        })
        .select()
        .single();
      
      if (taskError) throw taskError;
      
      await fetchTasks();
      onTaskChange();
    } catch (err) {
      logger.error('Error creating task', { error: err.message });
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };
  
  const updateTask = async (taskId: string, updates: Partial<{
    name: string;
    description?: string;
    status: Task['status'];
    priority?: Task['priority'];
    startDate?: string;
    due_date?: string;
    tags?: string[];
  }>) => {
    try {
      if (!isSupabaseConfigured()) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
        onTaskChange();
        return;
      }

      const { error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;
      
      await fetchTasks();
      onTaskChange();
    } catch (err) {
      logger.error('Error updating task', { error: err.message });
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      if (!isSupabaseConfigured()) {
        setTasks(prev => prev.filter(t => t.id !== taskId));
        onTaskChange();
        return;
      }
      
      const { error: subtasksError } = await supabase
        .from('subtasks')
        .delete()
        .eq('task_id', taskId);

      if (subtasksError) throw subtasksError;

      const { error: taskError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (taskError) throw taskError;
      
      await fetchTasks();
      onTaskChange();
    } catch (err) {
      logger.error('Error deleting task', { error: err.message });
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  return { tasks, isLoading, error, createTask, updateTask, deleteTask, fetchTasks };
};