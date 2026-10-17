import React, { useState } from 'react';
import { Maximize2, RotateCcw, ZoomIn, ZoomOut, Search, X } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'note' | 'tag' | 'concept';
  size: number;
  color: string;
  connections: number;
  x?: number;
  y?: number;
}

interface GraphEdge {
  from: string;
  to: string;
  strength: number;
  type: 'semantic' | 'temporal' | 'categorical';
}

interface KnowledgeGraphAdvancedProps {
  data: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  filter: string;
}

export const KnowledgeGraphAdvanced: React.FC<KnowledgeGraphAdvancedProps> = ({ 
  data, 
  filter 
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [tagSearch, setTagSearch] = useState('');

  // Clean, well-distributed nodes inspired by the screenshot
  const enhancedNodes: GraphNode[] = [
    { id: '1', label: 'Academic Ambition', type: 'concept', size: 25, color: 'var(--color-brand-yellow)', connections: 8, x: 50, y: 35 },
    { id: '2', label: 'Personality Test', type: 'note', size: 20, color: 'var(--color-brand-secondary)', connections: 6, x: 75, y: 20 },
    { id: '3', label: 'Open Psychometrics', type: 'concept', size: 22, color: 'var(--color-brand-secondary)', connections: 7, x: 85, y: 45 },
    { id: '4', label: 'Bestseller Project', type: 'note', size: 18, color: 'var(--color-brand-purple)', connections: 5, x: 25, y: 15 },
    { id: '5', label: 'Kolay Hedef - Tech', type: 'note', size: 16, color: 'var(--color-brand-secondary)', connections: 4, x: 15, y: 35 },
    { id: '6', label: 'Organizational Psyc', type: 'concept', size: 19, color: 'var(--color-brand-primary)', connections: 6, x: 30, y: 65 },
    { id: '7', label: 'Analiz Edilen Kitap', type: 'note', size: 17, color: 'var(--color-brand-secondary)', connections: 5, x: 70, y: 75 },
    { id: '8', label: 'Tiyatro', type: 'concept', size: 15, color: 'var(--color-brand-yellow)', connections: 3, x: 45, y: 85 },
    { id: '9', label: 'digital product', type: 'tag', size: 12, color: 'var(--color-brand-purple)', connections: 4, x: 40, y: 25 },
    { id: '10', label: 'psychometrics', type: 'tag', size: 14, color: 'var(--color-brand-yellow)', connections: 6, x: 65, y: 50 },
    { id: '11', label: 'personality test', type: 'tag', size: 13, color: 'var(--color-brand-secondary)', connections: 5, x: 80, y: 35 },
    { id: '12', label: 'epistemology', type: 'tag', size: 11, color: 'var(--color-brand-primary)', connections: 3, x: 75, y: 65 },
    { id: '13', label: 'depth psychology', type: 'tag', size: 12, color: 'var(--color-brand-secondary)', connections: 4, x: 40, y: 75 },
    { id: '14', label: 'organization', type: 'tag', size: 10, color: 'var(--color-brand-secondary)', connections: 3, x: 55, y: 80 }
  ];

  // Clean semantic relationships like in the screenshot
  const enhancedEdges: GraphEdge[] = [
    { from: '1', to: '2', strength: 0.9, type: 'semantic' },
    { from: '1', to: '6', strength: 0.8, type: 'categorical' },
    { from: '2', to: '3', strength: 0.95, type: 'semantic' },
    { from: '2', to: '11', strength: 0.9, type: 'categorical' },
    { from: '3', to: '10', strength: 0.85, type: 'categorical' },
    { from: '4', to: '9', strength: 0.7, type: 'categorical' },
    { from: '4', to: '5', strength: 0.6, type: 'temporal' },
    { from: '5', to: '9', strength: 0.5, type: 'categorical' },
    { from: '6', to: '13', strength: 0.8, type: 'categorical' },
    { from: '6', to: '14', strength: 0.75, type: 'categorical' },
    { from: '7', to: '12', strength: 0.7, type: 'categorical' },
    { from: '7', to: '8', strength: 0.4, type: 'temporal' },
    { from: '10', to: '11', strength: 0.9, type: 'semantic' },
    { from: '10', to: '13', strength: 0.6, type: 'semantic' },
    { from: '1', to: '7', strength: 0.5, type: 'semantic' },
    { from: '3', to: '6', strength: 0.7, type: 'semantic' },
    { from: '9', to: '10', strength: 0.4, type: 'semantic' },
    { from: '12', to: '13', strength: 0.8, type: 'semantic' }
  ];

  const filteredNodes = enhancedNodes.filter(node => {
    // First apply the main filter
    let passesMainFilter = true;
    switch (filter) {
      case 'short-term':
        passesMainFilter = node.type === 'note' && node.connections < 5;
        break;
      case 'long-term':
        passesMainFilter = node.type === 'concept' || node.connections >= 5;
        break;
      case 'tags':
        passesMainFilter = node.type === 'tag';
        break;
      case 'recent':
        passesMainFilter = node.label.includes('Test') || node.label.includes('Project');
        break;
      default:
        passesMainFilter = true;
    }

    // Then apply tag search filter
    const passesTagSearch = !tagSearch || 
      node.label.toLowerCase().includes(tagSearch.toLowerCase()) ||
      (node.type === 'tag' && node.label.toLowerCase().includes(tagSearch.toLowerCase()));

    return passesMainFilter && passesTagSearch;
  });

  const filteredEdges = enhancedEdges.filter(edge => 
    filteredNodes.some(n => n.id === edge.from) && 
    filteredNodes.some(n => n.id === edge.to)
  );

  return (
    <div className="relative h-96 bg-canvas rounded-lg border border-ink overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
        <button
          onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
          className="p-2 bg-surface  rounded-lg border border-ink hover:bg-surface-muted transition-colors"
        >
          <ZoomIn className="h-4 w-4 text-muted" />
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}
          className="p-2 bg-surface  rounded-lg border border-ink hover:bg-surface-muted transition-colors"
        >
          <ZoomOut className="h-4 w-4 text-muted" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-2 bg-surface  rounded-lg border border-ink hover:bg-surface-muted transition-colors"
        >
          <RotateCcw className="h-4 w-4 text-muted" />
        </button>
        <button className="p-2 bg-surface  rounded-lg border border-ink hover:bg-surface-muted transition-colors">
          <Maximize2 className="h-4 w-4 text-muted" />
        </button>
      </div>

      {/* Tag Search */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search tags or concepts..."
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            className="w-64 pl-10 pr-10 py-2 bg-surface  border border-ink rounded-lg text-ink placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
            style={{ '--tw-ring-color': 'var(--color-brand-primary)' } as React.CSSProperties}
          />
          {tagSearch && (
            <button
              onClick={() => setTagSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-ink transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Graph Container */}
      <div 
        className="absolute inset-0 transition-transform duration-300"
        style={{ transform: `scale(${zoom})` }}
      >
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Thin gray edges like in the screenshot */}
          {filteredEdges.map((edge, index) => {
            const fromNode = filteredNodes.find(n => n.id === edge.from);
            const toNode = filteredNodes.find(n => n.id === edge.to);
            
            if (!fromNode || !toNode || !fromNode.x || !fromNode.y || !toNode.x || !toNode.y) return null;
            
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="var(--color-neutral-muted)"
                strokeWidth="0.5"
                opacity="0.6"
                className="transition-all duration-300"
              />
            );
          })}
          
          {/* Clean nodes with proper styling */}
          {filteredNodes.map((node) => {
            if (!node.x || !node.y) return null;
            
            const isSelected = selectedNode === node.id;
            const isHighlighted = tagSearch && node.label.toLowerCase().includes(tagSearch.toLowerCase());
            const nodeSize = (node.size / 25) * 3; // Scale for SVG
            
            return (
              <g key={node.id}>
                {/* Node glow effect for selected or highlighted */}
                {(isSelected || isHighlighted) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeSize + 1}
                    fill={isHighlighted ? 'var(--color-brand-primary)' : node.color}
                    opacity="0.3"
                    className={isHighlighted ? "animate-pulse" : ""}
                  />
                )}
                
                {/* Main node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeSize}
                  fill={node.color}
                  stroke={isSelected ? 'var(--color-brand-primary)' : isHighlighted ? 'var(--color-brand-primary)' : 'var(--color-neutral-soft)'}
                  strokeWidth={isSelected || isHighlighted ? "0.5" : "0.2"}
                  className="cursor-pointer hover:stroke-white transition-all duration-200"
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                />
                
                {/* Connection count */}
                <text
                  x={node.x}
                  y={node.y + 0.5}
                  textAnchor="middle"
                  className="fill-ink text-xs font-bold pointer-events-none"
                  style={{ fontSize: 'var(--graph-label-count)' }}
                >
                  {node.connections}
                </text>
                
                {/* Node Label */}
                <text
                  x={node.x}
                  y={node.y + nodeSize + 2}
                  textAnchor="middle"
                  className={`font-medium pointer-events-none ${
                    isHighlighted ? 'fill-brand-purple-deep' : 'fill-muted'
                  }`}
                  style={{ fontSize: 'var(--graph-label-caption)' }}
                >
                  {node.label.length > 12 ? node.label.slice(0, 10) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Enhanced Node Info Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-surface  rounded-xl p-4 border border-ink max-w-xs">
          {(() => {
            const node = filteredNodes.find(n => n.id === selectedNode);
            if (!node) return null;
            
            const connectedNodes = filteredEdges
              .filter(e => e.from === node.id || e.to === node.id)
              .map(e => e.from === node.id ? e.to : e.from);
            
            return (
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: node.color }}
                  ></div>
                  <h3 className="text-ink font-semibold text-sm">{node.label}</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Type:</span>
                    <span className="text-muted capitalize">{node.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Connections:</span>
                    <span className="text-muted">{node.connections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Influence:</span>
                    <span className="text-muted">
                      {node.size > 20 ? 'High' : node.size > 15 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                  {connectedNodes.length > 0 && (
                    <div className="pt-2 border-t border-ink">
                      <div className="text-muted mb-1">Connected to:</div>
                      <div className="text-muted text-xs">
                        {connectedNodes.slice(0, 3).map(id => {
                          const connectedNode = filteredNodes.find(n => n.id === id);
                          return connectedNode?.label.slice(0, 8);
                        }).join(', ')}
                        {connectedNodes.length > 3 && ` +${connectedNodes.length - 3} more`}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Enhanced Legend */}
      <div className="absolute top-4 left-4 bg-surface  rounded-xl p-4 border border-ink">
        <div className="text-muted text-xs font-medium mb-3">Knowledge Network</div>
        <div className="space-y-2 text-xs">
          <div className="space-y-1">
            <div className="text-muted text-xs font-medium">Node Types:</div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-orange-400"></div>
              <span className="text-muted">Concepts</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--color-brand-secondary)' }}></div>
              <span className="text-muted">Notes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-muted">Tags</span>
            </div>
          </div>
          <div className="space-y-1 pt-2 border-t border-ink">
            <div className="text-muted text-xs font-medium">Search:</div>
            <div className="text-muted text-xs">
              {tagSearch ? `"${tagSearch}"` : 'All items'}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats */}
      <div className="absolute bottom-4 right-4 bg-surface  rounded-xl p-4 border border-ink">
        <div className="text-muted text-xs font-medium mb-2">Network Intelligence</div>
        <div className="space-y-1 text-xs text-muted">
          <div className="flex justify-between">
            <span>Visible:</span>
            <span className="text-muted">{filteredNodes.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Links:</span>
            <span className="text-muted">{filteredEdges.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Tags:</span>
            <span className="text-muted">{filteredNodes.filter(n => n.type === 'tag').length}</span>
          </div>
          <div className="flex justify-between">
            <span>Concepts:</span>
            <span className="text-muted">{filteredNodes.filter(n => n.type === 'concept').length}</span>
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {tagSearch && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-surface  rounded-lg px-3 py-2 border border-ink">
            <div className="text-xs text-muted">
              {filteredNodes.length} results for "{tagSearch}"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
