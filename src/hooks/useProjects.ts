import { useState, useEffect } from 'react';
import { Project, Task } from '../types/projects';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
    // For demo purposes, use a fallback user if none exists
    const currentUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };

    setIsLoading(true);
    setError(null);

    try {
      // If Supabase isn't configured, use mock data
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, using mock data. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
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
          dueDate: project.due_date || undefined,
          createdAt: project.created_at,
          updatedAt: project.updated_at
        } as Project;
      });

      setProjects(projectsWithCounts);
    } catch (err) {
      console.error('Error fetching projects:', err);
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
    dueDate?: string;
  }) => {
    const currentUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };

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
          dueDate: projectData.dueDate,
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
          due_date: projectData.dueDate || null,
          status: 'Active'
        })
        .select()
        .single();

      if (error) throw error;

      const newProject: Project = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        status: data.status as Project['status'],
        progress: data.progress,
        color: data.color,
        tasksCount: 0,
        completedTasks: 0,
        dueDate: data.due_date || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      console.error('Error creating project:', err);
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
    dueDate?: string;
  }>) => {
    const currentUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };

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
          ...(updates.dueDate !== undefined && { due_date: updates.dueDate }),
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      // Update local state
      setProjects(prev => prev.map(p => 
        p.id === projectId 
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      ));
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    const currentUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };

    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        // Mock deletion
        await new Promise(resolve => setTimeout(resolve, 500));
        setProjects(prev => prev.filter(p => p.id !== projectId));
        return;
      }

      // Delete related tasks and subtasks first
      const { error: tasksError } = await supabase
        .from('tasks')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', currentUser.id);

      if (tasksError) throw tasksError;

      // Delete the project
      const { error: projectError } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', currentUser.id);

      if (projectError) throw projectError;

      // Update local state
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch (err) {
      console.error('Error deleting project:', err);
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

export const useProject = (projectId: string) => {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProject = async () => {
    const currentUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };

    if (!projectId) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        // Use mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        const foundProject = MOCK_PROJECTS.find(p => p.id === projectId);
        const projectTasks = MOCK_TASKS.filter(t => t.projectId === projectId);
        setProject(foundProject || null);
        setTasks(projectTasks);
        return;
      }

      // Fetch project from Supabase
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', currentUser.id)
        .single();

      if (projectError) throw projectError;

      // Fetch tasks with subtasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          subtasks (*)
        `)
        .eq('project_id', projectId)
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: true });

      if (tasksError) throw tasksError;

      // Transform Supabase data to match our Project interface
      const transformedProject: Project = {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description || '',
        status: projectData.status as Project['status'],
        progress: projectData.progress,
        color: projectData.color,
        tasksCount: tasksData?.length || 0,
        completedTasks: tasksData?.filter((task: any) => task.status === 'DONE').length || 0,
        dueDate: projectData.due_date || undefined,
        createdAt: projectData.created_at,
        updatedAt: projectData.updated_at
      };

      // Transform tasks data
      const transformedTasks: Task[] = tasksData?.map((task: any) => ({
        id: task.id,
        projectId: task.project_id,
        name: task.name,
        description: task.description || undefined,
        status: task.status as Task['status'],
        priority: task.priority as Task['priority'],
        startDate: task.start_date || undefined,
        dueDate: task.due_date || undefined,
        tags: task.tags || undefined,
        subtasks: task.subtasks?.map((st: any) => ({
          id: st.id,
          name: st.name,
          completed: st.completed
        })) || undefined,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      })) || [];

      setProject(transformedProject);
      setTasks(transformedTasks);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
      // Fallback to mock data
      const foundProject = MOCK_PROJECTS.find(p => p.id === projectId);
      const projectTasks = MOCK_TASKS.filter(t => t.projectId === projectId);
      setProject(foundProject || null);
      setTasks(projectTasks);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (taskData: {
    name: string;
    description?: string;
    status: Task['status'];
    priority?: Task['priority'];
    startDate?: string;
    dueDate?: string;
    tags?: string[];
    subtasks?: string[];
  }) => {
    const currentUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };

    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        // Mock creation
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newTask: Task = {
          id: Date.now().toString(),
          projectId: projectId,
          name: taskData.name,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          startDate: taskData.startDate,
          dueDate: taskData.dueDate,
          tags: taskData.tags,
          subtasks: taskData.subtasks?.map((name, index) => ({
            id: (Date.now() + index).toString(),
            name,
            completed: false
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setTasks(prev => [...prev, newTask]);
        return newTask;
      }

      const { data: taskResult, error: taskError } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          user_id: currentUser.id,
          name: taskData.name,
          description: taskData.description || null,
          status: taskData.status,
          priority: taskData.priority || 'Medium',
          start_date: taskData.startDate || null,
          due_date: taskData.dueDate || null,
          tags: taskData.tags || []
        })
        .select()
        .single();

      if (taskError) throw taskError;

      let subtasks: any[] = [];
      if (taskData.subtasks && taskData.subtasks.length > 0) {
        const { data: subtaskResults, error: subtaskError } = await supabase
          .from('subtasks')
          .insert(
            taskData.subtasks.map(name => ({
              task_id: taskResult.id,
              name,
              completed: false
            }))
          )
          .select();

        if (subtaskError) throw subtaskError;
        subtasks = subtaskResults || [];
      }

      const newTask: Task = {
        id: taskResult.id,
        projectId: taskResult.project_id,
        name: taskResult.name,
        description: taskResult.description || undefined,
        status: taskResult.status as Task['status'],
        priority: taskResult.priority as Task['priority'],
        startDate: taskResult.start_date || undefined,
        dueDate: taskResult.due_date || undefined,
        tags: taskResult.tags || undefined,
        subtasks: subtasks.map(st => ({
          id: st.id,
          name: st.name,
          completed: st.completed
        })),
        createdAt: taskResult.created_at,
        updatedAt: taskResult.updated_at
      };

      setTasks(prev => [...prev, newTask]);
      
      // Update project task count
      if (project) {
        setProject(prev => prev ? {
          ...prev,
          tasksCount: prev.tasksCount + 1
        } : null);
      }

      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [user, projectId]);

  const updateTask = async (taskId: string, updates: Partial<{
    name: string;
    description?: string;
    status: Task['status'];
    priority?: Task['priority'];
    startDate?: string;
    dueDate?: string;
    tags?: string[];
  }>) => {
    const currentUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };

    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        // Mock update
        await new Promise(resolve => setTimeout(resolve, 500));
        setTasks(prev => prev.map(t => 
          t.id === taskId 
            ? { ...t, ...updates, updatedAt: new Date().toISOString() }
            : t
        ));
        return;
      }

      const { error } = await supabase
        .from('tasks')
        .update({
          ...(updates.name && { name: updates.name }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.status && { status: updates.status }),
          ...(updates.priority && { priority: updates.priority }),
          ...(updates.startDate !== undefined && { start_date: updates.startDate }),
          ...(updates.dueDate !== undefined && { due_date: updates.dueDate }),
          ...(updates.tags && { tags: updates.tags }),
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', currentUser.id);

      if (error) throw error;

      // Update local state
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t
      ));

      // Update project completed tasks count if status changed
      if (updates.status && project) {
        const currentTask = tasks.find(t => t.id === taskId);
        if (currentTask) {
          const wasCompleted = currentTask.status === 'DONE';
          const isCompleted = updates.status === 'DONE';
          
          if (wasCompleted !== isCompleted) {
            setProject(prev => prev ? {
              ...prev,
              completedTasks: prev.completedTasks + (isCompleted ? 1 : -1)
            } : null);
          }
        }
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    const currentUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };

    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        // Mock deletion
        await new Promise(resolve => setTimeout(resolve, 500));
        setTasks(prev => prev.filter(t => t.id !== taskId));
        return;
      }

      // Delete subtasks first
      const { error: subtasksError } = await supabase
        .from('subtasks')
        .delete()
        .eq('task_id', taskId);

      if (subtasksError) throw subtasksError;

      // Delete the task
      const { error: taskError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', currentUser.id);

      if (taskError) throw taskError;

      // Update local state
      const taskToDelete = tasks.find(t => t.id === taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      
      // Update project task counts
      if (project && taskToDelete) {
        setProject(prev => prev ? {
          ...prev,
          tasksCount: prev.tasksCount - 1,
          completedTasks: taskToDelete.status === 'DONE' 
            ? prev.completedTasks - 1 
            : prev.completedTasks
        } : null);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    project,
    tasks,
    isLoading,
    error,
    refetch: fetchProject,
    createTask,
    updateTask,
    deleteTask
  };
};