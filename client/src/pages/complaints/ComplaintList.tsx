import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';
import type { Complaint, ComplaintFilters } from '../../types';
import ComplaintCard from '../../components/Complaints/ComplaintCard';
import ComplaintTable from '../../components/Complaints/ComplaintTable';
import ComplaintFiltersBar from '../../components/Complaints/ComplaintFilters';
import { LayoutGrid, List, Loader2, Plus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ComplaintList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [filters, setFilters] = useState<ComplaintFilters>({ page: 1, limit: 12 });
  const [totalPages, setTotalPages] = useState(1);

  const fetchComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await complaintService.getComplaints(filters);
      setComplaints(data.complaints);
      setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isAdmin ? 'All Complaints' : 'My Complaints'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isAdmin ? 'Manage society maintenance requests' : 'View and track your maintenance requests'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white/[0.08] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {!isAdmin && (
            <button
              onClick={() => navigate('/complaints/new')}
              className="flex items-center justify-center gap-2 flex-grow sm:flex-grow-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-violet-500/25 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              New Complaint
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <ComplaintFiltersBar filters={filters} onFiltersChange={setFilters} />

      {/* Content */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-violet-500" />
          <p>Loading complaints...</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {complaints.length > 0 ? (
                complaints.map((c) => <ComplaintCard key={c.id} complaint={c} isAdmin={isAdmin} />)
              ) : (
                <div className="col-span-full py-12 text-center text-gray-500 bg-white/[0.02] border border-white/[0.08] rounded-2xl">
                  No complaints found.
                </div>
              )}
            </div>
          ) : (
            <ComplaintTable complaints={complaints} isAdmin={isAdmin} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6 border-t border-white/[0.08]">
              <button
                disabled={filters.page === 1}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:bg-white/[0.08] disabled:opacity-50 transition-colors text-sm font-medium"
              >
                Previous
              </button>
              <span className="text-gray-500 text-sm px-4">
                Page {filters.page} of {totalPages}
              </span>
              <button
                disabled={filters.page === totalPages}
                onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-gray-300 hover:bg-white/[0.08] disabled:opacity-50 transition-colors text-sm font-medium"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
