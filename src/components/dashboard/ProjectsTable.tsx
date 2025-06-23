import React, { useState } from 'react';
import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react';
import { Project } from '../../types';

interface ProjectsTableProps {
  projects: Project[];
}

export const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Ongoing': 
      case 'Completed': 
        return `border` + ` text-white`;
      case 'Paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusStyle = (status: string) => {
    if (status === 'Ongoing' || status === 'Completed') {
      return {
        backgroundColor: '#C2B5FC20',
        color: '#C2B5FC',
        borderColor: '#C2B5FC50'
      };
    }
    return {};
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 lg:mb-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-white mb-1">Knowledge Projects</h2>
          <p className="text-slate-400 text-xs lg:text-sm">Manage and track your knowledge domains</p>
        </div>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full lg:w-64 pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
              style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 text-sm"
            style={{ '--tw-ring-color': '#C2B5FC' } as React.CSSProperties}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Paused">Paused</option>
          </select>
          <button className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-slate-900 font-medium transition-colors text-sm hover:opacity-90" style={{ background: '#C2B5FC' }}>
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-slate-900/50 rounded-xl border border-slate-700/50 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: project.color }}
                ></div>
                <div>
                  <h3 className="text-white font-semibold">{project.name}</h3>
                  <p className="text-slate-400 text-sm">Knowledge domain</p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-600 rounded-lg transition-colors">
                <MoreHorizontal className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Status</span>
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}
                  style={getStatusStyle(project.status)}
                >
                  {project.status}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Progress</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-slate-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${project.progress}%`, 
                        backgroundColor: project.color 
                      }}
                    ></div>
                  </div>
                  <span className="text-slate-300 text-sm font-semibold">{project.progress}%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Notes</span>
                <span className="text-white font-semibold">{project.notesCount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Last Updated</span>
                <span className="text-slate-300 text-sm">{project.lastUpdated}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                <th className="text-left py-4 px-6 text-slate-300 font-semibold text-sm uppercase tracking-wider">Project Name</th>
                <th className="text-left py-4 px-6 text-slate-300 font-semibold text-sm uppercase tracking-wider">Status</th>
                <th className="text-left py-4 px-6 text-slate-300 font-semibold text-sm uppercase tracking-wider">Progress</th>
                <th className="text-left py-4 px-6 text-slate-300 font-semibold text-sm uppercase tracking-wider">Notes Count</th>
                <th className="text-left py-4 px-6 text-slate-300 font-semibold text-sm uppercase tracking-wider">Last Updated</th>
                <th className="text-left py-4 px-6 text-slate-300 font-semibold text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project, index) => (
                <tr 
                  key={project.id} 
                  className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${
                    index % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-800/10'
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: project.color }}
                      ></div>
                      <div>
                        <span className="text-white font-semibold text-base">{project.name}</span>
                        <div className="text-slate-400 text-sm mt-1">
                          Knowledge domain for {project.name.toLowerCase()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span 
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}
                      style={getStatusStyle(project.status)}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-slate-700 rounded-full h-2.5 min-w-[100px]">
                        <div 
                          className="h-2.5 rounded-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${project.progress}%`, 
                            backgroundColor: project.color 
                          }}
                        ></div>
                      </div>
                      <span className="text-slate-300 text-sm font-semibold min-w-[45px]">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold text-lg">{project.notesCount}</span>
                      <span className="text-slate-400 text-sm">notes</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-slate-300 font-medium">{project.lastUpdated}</span>
                  </td>
                  <td className="py-4 px-6">
                    <button className="p-2 hover:bg-slate-600 rounded-lg transition-colors">
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-2">No projects found</div>
            <div className="text-slate-500 text-sm">Try adjusting your search or filter criteria</div>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mt-6 pt-4 border-t border-slate-700/50 space-y-4 lg:space-y-0">
        <div className="text-slate-400 text-sm">
          Showing {filteredProjects.length} of {projects.length} projects
        </div>
        <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-slate-400">
              {projects.filter(p => p.status === 'Active').length} Active
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full" style={{ background: '#C2B5FC' }}></div>
            <span className="text-slate-400">
              {projects.filter(p => p.status === 'Ongoing').length} Ongoing
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-slate-400">
              {projects.filter(p => p.status === 'Paused').length} Paused
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};