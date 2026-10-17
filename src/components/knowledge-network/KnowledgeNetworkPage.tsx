import React, { useState, useEffect, useRef } from 'react';
import useKnowledgeGraph from '../../hooks/useKnowledgeGraph';
import { Loader2, AlertTriangle, X, Calendar, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { logger } from '../../lib/logger';
import { resolveColorValue, resolveDesignColor } from '../../design/tokens';

const ForceGraph2D = React.lazy(() => import('react-force-graph-2d'));

export const KnowledgeNetworkPage: React.FC = () => {
  const { data, isLoading, error } = useKnowledgeGraph();
  const [isMounted, setIsMounted] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [nodeDetails, setNodeDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setIsMounted(true);
    
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: clientWidth,
          height: clientHeight,
        });
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isMounted]);

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
        logger.error('Error fetching node details', { error: error.message });
        return null;
      }

      // If this is a project and details.name is missing, try to fetch the name again
      if (node.type === 'project' && (!details || !details.name)) {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('name')
          .eq('id', node.id)
          .single();
        if (!projectError && projectData && projectData.name) {
          return { ...details, name: projectData.name };
        }
      }

      return details;
    } catch (err) {
      logger.error('Error in fetchNodeDetails', { error: err instanceof Error ? err.message : 'Unknown error' });
      return null;
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleNodeClick = async (node: any) => {
    // Don't open panel for tags
    if (node.type === 'tag') return;
    
    logger.debug('Selected node data', { nodeId: node.id, nodeType: node.type });
    setSelectedNode(node);
    setNodeDetails(null);
    
    // Fetch detailed data from the appropriate table
    const details = await fetchNodeDetails(node);
    setNodeDetails(details);
  };

  const renderNodeDetailPanel = () => {
    if (!selectedNode) return null;

    return (
      <div className="fixed top-0 right-0 h-full w-80 bg-surface border-l border-ink shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface border-b border-ink p-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink truncate">
            {/* Show project name if available, otherwise fallback to label */}
            {selectedNode.type === 'project' && nodeDetails && nodeDetails.name
              ? nodeDetails.name
              : selectedNode.label}
          </h3>
          <button
            onClick={() => {
              setSelectedNode(null);
              setNodeDetails(null);
            }}
            className="p-1 hover:bg-surface-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Type Badge */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted">Type:</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-surface-muted text-ink">
              {selectedNode.type?.replace('_', ' ')}
            </span>
          </div>

          {/* Loading State */}
          {loadingDetails && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted" />
              <span className="ml-2 text-sm text-muted">Loading details...</span>
            </div>
          )}

          {/* Content from detailed data */}
          {nodeDetails && !loadingDetails && (
            <>
              {/* Title */}
              {nodeDetails.title && nodeDetails.title !== selectedNode.label && (
                <div>
                  <span className="text-sm text-muted block mb-2">Title:</span>
                  <p className="text-sm text-muted bg-canvas p-3 rounded-lg">
                    {nodeDetails.title}
                  </p>
                </div>
              )}

              {/* Content */}
              {nodeDetails.content && (
                <div>
                  <span className="text-sm text-muted block mb-2">Content:</span>
                  <p className="text-sm text-muted bg-canvas p-3 rounded-lg whitespace-pre-wrap">
                    {nodeDetails.content}
                  </p>
                </div>
              )}

              {/* Description */}
              {nodeDetails.description && (
                <div>
                  <span className="text-sm text-muted block mb-2">Description:</span>
                  <p className="text-sm text-muted bg-canvas p-3 rounded-lg">
                    {nodeDetails.description}
                  </p>
                </div>
              )}

              {/* Status (for tasks/projects) */}
              {nodeDetails.status && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted">Status:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-secondary-soft text-brand-secondary-ink">
                    {nodeDetails.status}
                  </span>
                </div>
              )}

              {/* Progress (for projects) */}
              {nodeDetails.progress !== undefined && (
                <div>
                  <span className="text-sm text-muted block mb-2">Progress:</span>
                  <div className="w-full bg-surface-muted rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${nodeDetails.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted mt-1">{nodeDetails.progress}%</span>
                </div>
              )}

              {/* Tags */}
              {nodeDetails.tags && nodeDetails.tags.length > 0 && (
                <div>
                  <span className="text-sm text-muted block mb-2">Tags:</span>
                  <div className="flex flex-wrap gap-1">
                    {nodeDetails.tags.map((tag: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-brand-purple-soft text-brand-purple-ink">
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
                  <div className="flex items-center space-x-2 text-sm text-muted">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {new Date(nodeDetails.created_at).toLocaleDateString()}</span>
                  </div>
                )}
                
                {nodeDetails.due_date && (
                  <div className="flex items-center space-x-2 text-sm text-muted">
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
              <p className="text-sm text-muted">No additional details available</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderGraph = () => {
    if (!isMounted) {
      return <div className="h-graph bg-surface border border-ink rounded-xl"></div>;
    }
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-graph bg-surface border border-ink rounded-xl">
          <Loader2 className="h-8 w-8 animate-spin text-muted" />
          <span className="ml-4 text-muted">Building your knowledge network...</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-graph bg-brand-primary-pale border border-brand-primary rounded-xl p-6">
          <AlertTriangle className="h-10 w-10 text-brand-primary-deep mb-4" />
          <h3 className="text-xl font-semibold text-ink mb-2">Failed to load graph</h3>
          <p className="text-brand-primary-deep text-center">{error}</p>
        </div>
      );
    }
    if (data.nodes.length === 0) {
      return (
        <div className="text-center h-graph flex flex-col justify-center items-center bg-surface border border-ink rounded-xl">
          <h3 className="text-xl font-semibold text-ink">Your Network is Empty</h3>
          <p className="text-muted mt-2">Start adding notes, projects, and tags to see your knowledge network grow.</p>
        </div>
      );
    }
    return (
      <div 
        ref={containerRef}
        className="relative w-full h-graph bg-surface border border-ink rounded-xl overflow-hidden"
      >
        <React.Suspense fallback={<div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted" /></div>}>
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
              const graphStyle = getComputedStyle(document.documentElement);
              const nodeRadius = node.val || Number.parseFloat(graphStyle.getPropertyValue('--graph-node-size-default'));
              
              // Set specific colors for different node types
              let nodeColor = node.color || resolveDesignColor('primary');
              if (node.type === 'tag') {
                nodeColor = resolveDesignColor('purple');
              } else if (node.type === 'short_term_note' || node.type === 'short_term') {
                nodeColor = resolveDesignColor('primary');
              } else if (node.type === 'long_term_note' || node.type === 'long_term') {
                nodeColor = resolveDesignColor('secondary');
              } else if (node.type === 'project') {
                nodeColor = resolveDesignColor('secondary');
              } else if (node.type === 'task') {
                nodeColor = resolveDesignColor('yellow');
              }
              
              // Draw node circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
              ctx.fillStyle = resolveColorValue(nodeColor);
              ctx.fill();
              
              // Only show text labels when zoomed in enough (avoid overlap when zoomed out)
              if (globalScale > 1.5) {
                const labelMin = Number.parseFloat(graphStyle.getPropertyValue('--graph-node-label-min-size'));
                const labelMax = Number.parseFloat(graphStyle.getPropertyValue('--graph-node-label-max-size'));
                const labelOffset = Number.parseFloat(graphStyle.getPropertyValue('--graph-node-label-offset'));
                const fontSize = Math.min(labelMax, Math.max(labelMin, labelMin / globalScale));
                ctx.font = `${fontSize}px ${graphStyle.getPropertyValue('--graph-font-family').trim()}`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = resolveDesignColor('ink');
                ctx.strokeStyle = resolveDesignColor('surface');
                ctx.lineWidth = Number.parseFloat(graphStyle.getPropertyValue('--graph-node-outline-width'));
                
                // Add text outline for better readability
                ctx.strokeText(label, node.x, node.y + nodeRadius + fontSize + labelOffset);
                ctx.fillText(label, node.x, node.y + nodeRadius + fontSize + labelOffset);
              }
            }}
            linkColor={() => resolveDesignColor('softBorder')}
            linkWidth={Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--graph-link-width'))}
            linkDirectionalParticles={Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--graph-particle-count'))}
            linkDirectionalParticleSpeed={Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--graph-particle-speed'))}
            linkDirectionalParticleWidth={Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--graph-particle-width'))}
            linkDirectionalParticleColor={() => resolveDesignColor('secondary')}
            backgroundColor="transparent"
            enableZoomInteraction={true}
            enablePanInteraction={true}
            width={dimensions.width}
            height={dimensions.height}
          />
        </React.Suspense>
        
        {/* Legend Card */}
        <div className="absolute bottom-4 right-4 bg-surface border border-ink rounded-lg p-3 shadow-sm">
          <h4 className="text-sm font-semibold text-ink mb-2">Node Types</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-pink-400"></div>
              <span className="text-muted">Short Term Notes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span className="text-muted">Long Term Notes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <span className="text-muted">Projects</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span className="text-muted">Tasks</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-400"></div>
              <span className="text-muted">Tags</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 bg-canvas overflow-y-auto h-screen">
      {/* Header - Added left padding for mobile view to prevent overlap with hamburger menu */}
      <div className="bg-surface  border-b border-ink p-4 lg:p-6 sticky top-0 z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="pl-12 lg:pl-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-ink mb-2">Knowledge Network</h1>
            <p className="text-muted text-sm lg:text-base">
              Visualize the connections between your thoughts.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6 bg-canvas min-h-full">
        {renderGraph()}
      </div>

      {/* Node Detail Panel */}
      {renderNodeDetailPanel()}
    </div>
  );
};
