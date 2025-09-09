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
        .from('v3_entity_tags_view')
        .select('*')
        .eq('user_id', user.id);
      if (fetchError) throw fetchError;
      if (!rows) {
        setData({ nodes: [], links: [] });
        return;
      }

      // Filter out archived short-term notes
      const { data: archivedNotes } = await supabase
        .from('short_term_notes')
        .select('id')
        .eq('user_id', user.id)
        .not('archived_at', 'is', null);
      
      const archivedNoteIds = new Set(archivedNotes?.map(note => note.id) || []);
      
      // Filter rows to exclude archived short-term notes
      const activeRows = rows.filter(row => 
        !(row.entity_type === 'short_term_note' && archivedNoteIds.has(row.entity_id))
      );

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
      // First, collect missing IDs by type
      const missingShortTermNoteIds = [];
      const missingLongTermNoteIds = [];
      const missingProjectIds = [];
      for (const row of activeRows) {
        if ((row.entity_type === 'short_term_note' && !row.title)) {
          missingShortTermNoteIds.push(row.entity_id);
        } else if ((row.entity_type === 'long_term_note' && !row.title)) {
          missingLongTermNoteIds.push(row.entity_id);
        } else if ((row.entity_type === 'project' && !row.name)) {
          missingProjectIds.push(row.entity_id);
        }
      }
      // Fetch missing titles/names in bulk
      let shortTermNotesMap: Record<string, string> = {};
      let longTermNotesMap: Record<string, string> = {};
      let projectsMap: Record<string, string> = {};
      if (missingShortTermNoteIds.length > 0) {
        const { data } = await supabase.from('short_term_notes').select('id, title').in('id', missingShortTermNoteIds);
        if (data) {
          shortTermNotesMap = Object.fromEntries(data.map((n: any) => [n.id, n.title]));
        }
      }
      if (missingLongTermNoteIds.length > 0) {
        const { data } = await supabase.from('long_term_notes').select('id, title').in('id', missingLongTermNoteIds);
        if (data) {
          longTermNotesMap = Object.fromEntries(data.map((n: any) => [n.id, n.title]));
        }
      }
      if (missingProjectIds.length > 0) {
        const { data } = await supabase.from('projects').select('id, name').in('id', missingProjectIds);
        if (data) {
          projectsMap = Object.fromEntries(data.map((n: any) => [n.id, n.name]));
        }
      }
      for (const row of activeRows) {
        // Entity node (note, project, etc.)
        if (!nodeMap[row.entity_id]) {
          let label = row.entity_type;
          if (row.entity_type === 'short_term_note') {
            label = row.title || shortTermNotesMap[row.entity_id] || 'Short Note';
          } else if (row.entity_type === 'long_term_note') {
            label = row.title || longTermNotesMap[row.entity_id] || 'Long Note';
          } else if (row.entity_type === 'project') {
            label = row.name || projectsMap[row.entity_id];
            // If still no label, try to fetch from projectsMap again (for task-project links)
            if (!label && projectsMap[row.entity_id]) {
              label = projectsMap[row.entity_id];
            }
            // If still no label, try to find a task with this project_id and use its project name
            if (!label && tasks) {
              const taskWithProject = tasks.find((t: any) => t.project_id === row.entity_id && t.project_name);
              if (taskWithProject) {
                label = taskWithProject.project_name;
              }
            }
            // If still no label, fetch from Supabase directly (async update)
            if (!label) {
              (async () => {
                const { data: projectData, error: projectError } = await supabase
                  .from('projects')
                  .select('name')
                  .eq('id', row.entity_id)
                  .single();
                if (!projectError && projectData && projectData.name) {
                  nodeMap[row.entity_id].label = projectData.name;
                  setData({ nodes: Object.values(nodeMap), links });
                }
              })();
            }
          }
          nodeMap[row.entity_id] = {
            id: row.entity_id,
            label,
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
            let projectLabel = projectsMap[task.project_id];
            // If still no label, fetch from Supabase directly (async update)
            if (!projectLabel) {
              (async () => {
                const { data: projectData, error: projectError } = await supabase
                  .from('projects')
                  .select('name')
                  .eq('id', task.project_id)
                  .single();
                if (!projectError && projectData && projectData.name) {
                  nodeMap[task.project_id].label = projectData.name;
                  setData({ nodes: Object.values(nodeMap), links });
                }
              })();
            }
            nodeMap[task.project_id] = {
              id: task.project_id,
              label: projectLabel || '',
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