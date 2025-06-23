import { Note, Project, KnowledgeStats } from '../types';

export const mockStats: KnowledgeStats = {
  totalNotes: 247,
  dailyNotes: 31,
  connections: 156,
  knowledgeScore: 89,
  notesCreatedToday: 12,
  newConnections: 8,
  insightsGenerated: 5
};

export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Quantum Computing Basics',
    content: 'Exploring the fundamentals of quantum computing and its applications',
    category: 'Physics Research',
    tags: ['quantum', 'computing', 'physics'],
    connections: 8,
    createdAt: '2024-03-12',
    updatedAt: '2024-03-12',
    color: '#3b82f6'
  },
  {
    id: '2',
    title: 'Daily Reflection - March 12',
    content: 'Today I learned about the importance of consistent knowledge building',
    category: 'Daily Notes',
    tags: ['reflection', 'learning'],
    connections: 3,
    createdAt: '2024-03-12',
    updatedAt: '2024-03-12',
    color: '#10b981'
  },
  {
    id: '3',
    title: 'React Hooks Deep Dive',
    content: 'Advanced patterns and best practices for React hooks',
    category: 'Programming',
    tags: ['react', 'javascript', 'hooks'],
    connections: 12,
    createdAt: '2024-03-11',
    updatedAt: '2024-03-11',
    color: '#8b5cf6'
  },
  {
    id: '4',
    title: 'Stoicism and Modern Life',
    content: 'How ancient stoic principles apply to contemporary challenges',
    category: 'Philosophy',
    tags: ['stoicism', 'philosophy', 'life'],
    connections: 6,
    createdAt: '2024-03-11',
    updatedAt: '2024-03-11',
    color: '#f59e0b'
  },
  {
    id: '5',
    title: 'Meeting Notes - Team Sync',
    content: 'Weekly team synchronization and project updates',
    category: 'Work Notes',
    tags: ['meeting', 'team', 'sync'],
    connections: 4,
    createdAt: '2024-03-10',
    updatedAt: '2024-03-10',
    color: '#ef4444'
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Physics Research',
    status: 'Active',
    progress: 75,
    notesCount: 45,
    lastUpdated: '12 Mar 2024',
    color: '#3b82f6'
  },
  {
    id: '2',
    name: 'Daily Notes',
    status: 'Ongoing',
    progress: 100,
    notesCount: 31,
    lastUpdated: '12 Mar 2024',
    color: '#10b981'
  },
  {
    id: '3',
    name: 'Programming',
    status: 'Active',
    progress: 60,
    notesCount: 67,
    lastUpdated: '12 Mar 2024',
    color: '#8b5cf6'
  },
  {
    id: '4',
    name: 'Philosophy',
    status: 'Active',
    progress: 40,
    notesCount: 23,
    lastUpdated: '12 Mar 2024',
    color: '#f59e0b'
  },
  {
    id: '5',
    name: 'Machine Learning',
    status: 'Active',
    progress: 85,
    notesCount: 89,
    lastUpdated: '11 Mar 2024',
    color: '#06b6d4'
  },
  {
    id: '6',
    name: 'Book Summaries',
    status: 'Ongoing',
    progress: 55,
    notesCount: 34,
    lastUpdated: '11 Mar 2024',
    color: '#84cc16'
  },
  {
    id: '7',
    name: 'Research Ideas',
    status: 'Active',
    progress: 30,
    notesCount: 18,
    lastUpdated: '10 Mar 2024',
    color: '#f97316'
  },
  {
    id: '8',
    name: 'Personal Development',
    status: 'Active',
    progress: 65,
    notesCount: 42,
    lastUpdated: '10 Mar 2024',
    color: '#ec4899'
  },
  {
    id: '9',
    name: 'Travel Planning',
    status: 'Paused',
    progress: 20,
    notesCount: 12,
    lastUpdated: '09 Mar 2024',
    color: '#6366f1'
  },
  {
    id: '10',
    name: 'Cooking Experiments',
    status: 'Active',
    progress: 45,
    notesCount: 28,
    lastUpdated: '09 Mar 2024',
    color: '#14b8a6'
  },
  {
    id: '11',
    name: 'Investment Research',
    status: 'Active',
    progress: 70,
    notesCount: 56,
    lastUpdated: '08 Mar 2024',
    color: '#eab308'
  },
  {
    id: '12',
    name: 'Health & Fitness',
    status: 'Ongoing',
    progress: 80,
    notesCount: 39,
    lastUpdated: '08 Mar 2024',
    color: '#22c55e'
  }
];