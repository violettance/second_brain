import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useKnowledgeGraph from '../../hooks/useKnowledgeGraph';
import { Loader2, AlertTriangle, X, Calendar, User, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ForceGraph2D = React.lazy(() => import('react-force-graph-2d'));

export const KnowledgeNetworkPage: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useKnowledgeGraph();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodeDetails, setNodeDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    setIsMounted(true);
    
    // Update dimensions when container size changes
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width - 2, // Subtract border width
          height: 598 // Subtract border height
        });
      }
    };

    // Use setTimeout to ensure the container is fully rendered
    setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const fetchNodeDetails = async (node: any) => {
    if (!node.id) return null;
    
    setLoadingDetails(true);
    try {
      let tableName = '';
      switch (node.type) {
        case 'short_term_note':
        case 'short_term':
          tableName = 'short_term_notes';
          break;
        case 'long_term_note':
        case 'long_term':
          tableName = 'long_term_notes';
          break;
        case 'project':
          tableName = 'projects';
          break;
        case 'task':
          tableName = 'tasks';
          break;
        default:
          return null;
      }

      const { data: details, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', node.id)
        .single();

      if (error) {
        console.error('Error fetching node details:', error);
        return null;
      }

      return details;
    } catch (err) {
      console.error('Error in fetchNodeDetails:', err);
      return null;
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleNodeClick = async (node: any) => {
    // Don't open panel for tags
    if (node.type === 'tag') return;
    
    console.log('Selected node data:', node);
    setSelectedNode(node);
    setNodeDetails(null);
    
    // Fetch detailed data from the appropriate table
    const details = await fetchNodeDetails(node);
    setNodeDetails(details);
  };

  const renderNodeDetailPanel = () => {
    if (!selectedNode) return null;

    return (
      <div className="fixed top-0 right-0 h-full w-80 bg-slate-800 border-l border-slate-700 shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white truncate">{selectedNode.label}</h3>
          <button
            onClick={() => {
              setSelectedNode(null);
              setNodeDetails(null);
            }}
            className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Type Badge */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400">Type:</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-white">
              {selectedNode.type?.replace('_', ' ')}
            </span>
          </div>

          {/* Loading State */}
          {loadingDetails && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              <span className="ml-2 text-sm text-slate-400">Loading details...</span>
            </div>
          )}

          {/* Content from detailed data */}
          {nodeDetails && !loadingDetails && (
            <>
              {/* Title */}
              {nodeDetails.title && nodeDetails.title !== selectedNode.label && (
                <div>
                  <span className="text-sm text-slate-400 block mb-2">Title:</span>
                  <p className="text-sm text-slate-300 bg-slate-900 p-3 rounded-lg">
                    {nodeDetails.title}
                  </p>
                </div>
              )}

              {/* Content */}
              {nodeDetails.content && (
                <div>
                  <span className="text-sm text-slate-400 block mb-2">Content:</span>
                  <p className="text-sm text-slate-300 bg-slate-900 p-3 rounded-lg whitespace-pre-wrap">
                    {nodeDetails.content}
                  </p>
                </div>
              )}

              {/* Description */}
              {nodeDetails.description && (
                <div>
                  <span className="text-sm text-slate-400 block mb-2">Description:</span>
                  <p className="text-sm text-slate-300 bg-slate-900 p-3 rounded-lg">
                    {nodeDetails.description}
                  </p>
                </div>
              )}

              {/* Status (for tasks/projects) */}
              {nodeDetails.status && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-400">Status:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                    {nodeDetails.status}
                  </span>
                </div>
              )}

              {/* Progress (for projects) */}
              {nodeDetails.progress !== undefined && (
                <div>
                  <span className="text-sm text-slate-400 block mb-2">Progress:</span>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${nodeDetails.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400 mt-1">{nodeDetails.progress}%</span>
                </div>
              )}

              {/* Tags */}
              {nodeDetails.tags && nodeDetails.tags.length > 0 && (
                <div>
                  <span className="text-sm text-slate-400 block mb-2">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {nodeDetails.tags.map((tag: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-900 text-purple-200">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="space-y-2">
                {nodeDetails.created_at && (
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {new Date(nodeDetails.created_at).toLocaleDateString()}</span>
                  </div>
                )}
                
                {nodeDetails.due_date && (
                  <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {new Date(nodeDetails.due_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Fallback if no details loaded */}
          {!nodeDetails && !loadingDetails && selectedNode.type !== 'tag' && (
            <div className="text-center py-4">
              <p className="text-sm text-slate-400">No additional details available</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGraph = () => {
    if (!isMounted) {
      return <div className="h-[600px] bg-slate-800/50 border border-slate-700 rounded-xl"></div>;
    }
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[600px] bg-slate-800/50 border border-slate-700 rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <span className="ml-4 text-slate-400">Building your knowledge network...</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-[600px] bg-red-900/10 border border-red-500/20 rounded-xl p-6">
          <AlertTriangle className="h-10 w-10 text-red-400 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Failed to load graph</h3>
          <p className="text-red-300 text-center">{error}</p>
        </div>
      );
    }
    if (data.nodes.length === 0) {
      return (
        <div className="text-center h-[600px] flex flex-col justify-center items-center bg-slate-800/50 border border-slate-700 rounded-xl">
          <h3 className="text-xl font-semibold text-white">Your Network is Empty</h3>
          <p className="text-slate-400 mt-2">Start adding notes, projects, and tags to see your knowledge network grow.</p>
        </div>
      );
    }
    return (
      <div 
        ref={containerRef}
        className="relative w-full h-[600px] bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
      >
        <React.Suspense fallback={<div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>}>
          <ForceGraph2D
            graphData={data}
            nodeLabel="label"
            nodeVal="val"
            nodeAutoColorBy="type"
            onNodeClick={handleNodeClick}
            nodeCanvasObject={(node, ctx, globalScale) => {
              // Ensure node has valid coordinates
              if (typeof node.x !== 'number' || typeof node.y !== 'number') return;
              
              const label = node.label;
              const nodeRadius = node.val || 4;
              
              // Set specific colors for different node types
              let nodeColor = node.color || '#ff6b6b';
              if (node.type === 'tag') {
                nodeColor = '#a855f7'; // Purple color for tags
              } else if (node.type === 'short_term_note' || node.type === 'short_term') {
                nodeColor = '#f472b6'; // Pink color for short term notes
              } else if (node.type === 'long_term_note' || node.type === 'long_term') {
                nodeColor = '#60a5fa'; // Blue color for long term notes
              } else if (node.type === 'project') {
                nodeColor = '#4ade80'; // Green color for projects
              } else if (node.type === 'task') {
                nodeColor = '#fbbf24'; // Yellow color for tasks
              }
              
              // Draw node circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
              ctx.fillStyle = nodeColor;
              ctx.fill();
              
              // Only show text labels when zoomed in enough (avoid overlap when zoomed out)
              if (globalScale > 1.5) {
                const fontSize = Math.min(8, Math.max(5, 5 / globalScale));
                ctx.font = `${fontSize}px Sans-Serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'rgba(0,0,0,0.8)';
                ctx.lineWidth = 1;
                
                // Add text outline for better readability
                ctx.strokeText(label, node.x, node.y + nodeRadius + fontSize + 2);
                ctx.fillText(label, node.x, node.y + nodeRadius + fontSize + 2);
              }
            }}
            linkColor={() => 'rgba(255,255,255,0.2)'}
            linkWidth={1}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.004}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleColor={() => 'rgba(255, 255, 255, 0.8)'}
            backgroundColor="transparent"
            enableZoomInteraction={true}
            enablePanInteraction={true}
            width={dimensions.width}
            height={dimensions.height}
          />
        </React.Suspense>
        
        {/* Legend Card */}
        <div className="absolute bottom-4 right-4 bg-slate-800/90 border border-slate-600 rounded-lg p-3 backdrop-blur-sm">
          <h4 className="text-sm font-semibold text-white mb-2">Node Types</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-pink-400"></div>
              <span className="text-slate-300">Short Term Notes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span className="text-slate-300">Long Term Notes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-slate-300">Projects</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span className="text-slate-300">Tasks</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-400"></div>
              <span className="text-slate-300">Tags</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-slate-900 overflow-y-auto h-screen">
      {/* Header - Added left padding for mobile view to prevent overlap with hamburger menu */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4 lg:p-6 sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">Knowledge Network</h1>
            <p className="text-slate-400 text-sm lg:text-base">
              Visualize the connections between your thoughts.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6 bg-slate-900 min-h-full">
        {renderGraph()}
      </div>

      {/* Node Detail Panel */}
      {renderNodeDetailPanel()}
    </div>
  );
}; 