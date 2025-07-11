import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Define the structure of the graph data based on react-force-graph requirements
export interface GraphNode {
  id: string;
  label: string;
  val?: number; // Represents the size of the node
  color?: string;
  type?: string; // e.g., 'project', 'task', 'note', 'tag'
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface KnowledgeGraphData {
  nodes: GraphNode[];
  links: GraphEdge[];
}

const useKnowledgeGraph = () => {
  const [data, setData] = useState<KnowledgeGraphData>({ nodes: [], links: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchGraphData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all tag-entity relations for this user
      const { data: rows, error: fetchError } = await supabase
        .from('v2_entity_tags_view')
        .select('*')
        .eq('user_id', user.id);
      if (fetchError) throw fetchError;
      if (!rows) {
        setData({ nodes: [], links: [] });
        return;
      }

      // Fetch all tasks for this user
      const { data: tasks, error: taskError } = await supabase
        .from('tasks')
        .select('id, project_id, name')
        .eq('user_id', user.id);
      if (taskError) throw taskError;

      // Build nodes and links
      const nodeMap: Record<string, GraphNode> = {};
      const links: GraphEdge[] = [];

      // 1. Tag-entity links (notes, projects, etc. <-> tags)
      for (const row of rows) {
        // Entity node (note, project, etc.)
        if (!nodeMap[row.entity_id]) {
          nodeMap[row.entity_id] = {
            id: row.entity_id,
            label: row.entity_type === 'short_term_note' ? 'Short Note' : (row.entity_type === 'long_term_note' ? 'Long Note' : (row.entity_type === 'project' ? 'Project' : row.entity_type)),
            type: row.entity_type,
            val: 8,
            color: row.entity_type === 'short_term_note' ? '#f472b6' : (row.entity_type === 'long_term_note' ? '#60a5fa' : (row.entity_type === 'project' ? '#4ade80' : undefined))
          };
        }
        // Tag node
        if (!nodeMap[row.tag_id]) {
          nodeMap[row.tag_id] = {
            id: row.tag_id,
            label: row.tag_name,
            type: 'tag',
            val: 6,
            color: '#a855f7'
          };
        }
        // Link between entity and tag
        links.push({ source: row.entity_id, target: row.tag_id });
      }

      // 2. Task nodes and project-task links
      if (tasks) {
        for (const task of tasks) {
          // Task node
          if (!nodeMap[task.id]) {
            nodeMap[task.id] = {
              id: task.id,
              label: task.name || 'Task',
              type: 'task',
              val: 7,
              color: '#fbbf24'
            };
          }
          // Project node (if not already from tags view)
          if (task.project_id && !nodeMap[task.project_id]) {
            nodeMap[task.project_id] = {
              id: task.project_id,
              label: 'Project',
              type: 'project',
              val: 8,
              color: '#4ade80'
            };
          }
          // Link: task -> project
          if (task.project_id) {
            links.push({ source: task.id, target: task.project_id });
          }
        }
      }

      setData({ nodes: Object.values(nodeMap), links });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setData({ nodes: [], links: [] });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchGraphData,
  };
};

export default useKnowledgeGraph; 