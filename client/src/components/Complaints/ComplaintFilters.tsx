import { Search, Filter, X } from 'lucide-react';
import type { ComplaintFilters } from '../../types';
import { useState, useEffect } from 'react';

interface ComplaintFiltersProps {
  filters: ComplaintFilters;
  onFiltersChange: (filters: ComplaintFilters) => void;
}

export default function ComplaintFiltersBar({ filters, onFiltersChange }: ComplaintFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onFiltersChange({ ...filters, search: localSearch, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, filters, onFiltersChange]);

  const handleChange = (key: keyof ComplaintFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    setLocalSearch('');
    onFiltersChange({ page: 1, limit: 10 });
  };

  const hasActiveFilters = filters.status || filters.priority || filters.category || filters.search || filters.isOverdue;

  return (
    <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-grow w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-500" />
        </div>
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search complaints..."
          className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 block pl-10 p-2.5 transition-all placeholder:text-gray-500"
        />
      </div>

      <div className="flex gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          <Filter className="w-4 h-4 text-gray-500" />
          
          <select
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] text-gray-300 text-sm rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 p-2.5 outline-none cursor-pointer appearance-none pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            <option value="" className="bg-gray-900 text-gray-300">All Statuses</option>
            <option value="OPEN" className="bg-gray-900 text-gray-300">Open</option>
            <option value="IN_PROGRESS" className="bg-gray-900 text-gray-300">In Progress</option>
            <option value="RESOLVED" className="bg-gray-900 text-gray-300">Resolved</option>
          </select>

          <select
            value={filters.priority || ''}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="bg-white/[0.04] border border-white/[0.08] text-gray-300 text-sm rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 p-2.5 outline-none cursor-pointer appearance-none pr-8"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            <option value="" className="bg-gray-900 text-gray-300">All Priorities</option>
            <option value="LOW" className="bg-gray-900 text-gray-300">Low</option>
            <option value="MEDIUM" className="bg-gray-900 text-gray-300">Medium</option>
            <option value="HIGH" className="bg-gray-900 text-gray-300">High</option>
          </select>

          <button
            onClick={() => handleChange('isOverdue', !filters.isOverdue)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all border ${
              filters.isOverdue 
                ? 'bg-red-500/20 border-red-500/50 text-red-400' 
                : 'bg-white/[0.04] border-white/[0.08] text-gray-300 hover:bg-white/[0.08]'
            }`}
          >
            Show Overdue
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center p-2.5 text-gray-400 hover:text-white hover:bg-white/[0.08] rounded-xl transition-all"
              title="Clear filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
