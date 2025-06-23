export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  connections: number;
  createdAt: string;
  updatedAt: string;
  color?: string;
}

export interface Project {
  id: string;
  name: string;
  status: 'Active' | 'Ongoing' | 'Completed' | 'Paused';
  progress: number;
  notesCount: number;
  lastUpdated: string;
  color: string;
}

export interface KnowledgeStats {
  totalNotes: number;
  dailyNotes: number;
  connections: number;
  knowledgeScore: number;
  notesCreatedToday: number;
  newConnections: number;
  insightsGenerated: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}