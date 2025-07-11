import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Define the structure of the graph data based on react-force-graph requirements
export interface GraphNode {
  id: string;
  name: string;
  val?: number; // Represents the size of the node
  color?: string;
  type?: string; // e.g., 'project', 'task', 'note'
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
      const { data: graphData, error: rpcError } = await supabase.rpc('get_knowledge_graph_v3');

      if (rpcError) {
        throw new Error(`Failed to fetch knowledge graph: ${rpcError.message}`);
      }

      // Ensure the returned data has the expected structure.
      // The RPC might return 'edges' instead of 'links', so we handle both.
      const links = graphData.links || graphData.edges;

      if (graphData && graphData.nodes && links) {
        setData({ nodes: graphData.nodes, links: links });
      } else {
        // Handle cases where RPC returns unexpected data format
        console.warn('RPC function get_knowledge_graph_v3 returned data in an unexpected format.', graphData);
        setData({ nodes: [], links: [] });
      }

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setData({ nodes: [], links: [] }); // Clear data on error
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