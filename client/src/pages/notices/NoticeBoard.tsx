import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { noticeService } from '../../services/noticeService';
import type { Notice, NoticeFilters } from '../../types';
import NoticeCard from '../../components/Notices/NoticeCard';
import NoticeFormModal from '../../components/Notices/NoticeFormModal';
import { Megaphone, Search, Plus, Loader2 } from 'lucide-react';

export default function NoticeBoard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [notices, setNotices] = useState<Notice[]>([]);
  const [filters, setFilters] = useState<NoticeFilters>({ page: 1, limit: 10 });
  const [localSearch, setLocalSearch] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);

  const fetchNotices = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await noticeService.getNotices(filters);
      setNotices(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters.page, filters.limit, filters.search, filters.isImportant]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  // Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.search || '')) {
        setFilters(prev => ({ ...prev, search: localSearch, page: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, filters.search]);

  const handleCreateOrUpdate = async (data: Partial<Notice>) => {
    if (editingNotice) {
      await noticeService.updateNotice(editingNotice.id, data);
    } else {
      await noticeService.createNotice(data);
    }
    fetchNotices();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notice?')) {
      try {
        await noticeService.deleteNotice(id);
        fetchNotices();
      } catch (error) {
        console.error('Failed to delete notice:', error);
      }
    }
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingNotice(null);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Megaphone className="w-5 h-5 text-violet-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Notice Board
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Important announcements and updates for residents.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-violet-500/25 transition-all text-sm w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Post Notice
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search notices..."
            className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-sm rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 block pl-10 p-2.5 transition-all placeholder:text-gray-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              isImportant: prev.isImportant === true ? undefined : true,
              page: 1 
            }))}
            className={`flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              filters.isImportant === true
                ? 'bg-violet-500/20 border-violet-500/50 text-violet-400' 
                : 'bg-white/[0.04] border-white/[0.08] text-gray-300 hover:bg-white/[0.08]'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Important Only
          </button>
        </div>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <p>Loading notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-12 text-center">
            <Megaphone className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-white mb-1">No notices found</h3>
            <p className="text-gray-500 text-sm">
              There are no announcements matching your criteria.
            </p>
          </div>
        ) : (
          notices.map(notice => (
            <NoticeCard 
              key={notice.id} 
              notice={notice} 
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
            disabled={filters.page === 1}
            className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-gray-300 disabled:opacity-50 text-sm hover:bg-white/[0.08] transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 px-4">
            Page {filters.page} of {totalPages}
          </span>
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, (prev.page || 1) + 1) }))}
            disabled={filters.page === totalPages}
            className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-gray-300 disabled:opacity-50 text-sm hover:bg-white/[0.08] transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      <NoticeFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={editingNotice}
      />
    </div>
  );
}
