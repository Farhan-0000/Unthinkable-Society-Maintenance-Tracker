import { useState, useEffect, useCallback } from 'react';
import { Mail, RefreshCw, AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { emailLogService } from '../../services/emailLogService';
import type { EmailLog, EmailLogFilters } from '../../types';
import { format } from 'date-fns';

export default function EmailLogs() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [filters, setFilters] = useState<EmailLogFilters>({ page: 1, limit: 15 });
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await emailLogService.getEmailLogs(filters);
      setLogs(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch email logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters.page, filters.limit, filters.status]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRetry = async (id: string) => {
    try {
      setRetryingId(id);
      await emailLogService.retryEmail(id);
      // Re-fetch to show updated status
      fetchLogs();
    } catch (error) {
      console.error('Retry failed:', error);
      alert('Failed to retry email. Please check console for details.');
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SENT':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sent</span>
          </div>
        );
      case 'FAILED':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Failed</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Mail className="w-5 h-5 text-violet-400" />
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Email Delivery Logs
            </h1>
          </div>
          <p className="text-gray-500 text-sm">
            Monitor and manage automated system emails.
          </p>
        </div>
        
        <select
          value={filters.status || ''}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          className="bg-white/[0.04] border border-white/[0.08] text-gray-300 text-sm rounded-xl focus:ring-2 focus:ring-violet-500/50 p-2.5 outline-none cursor-pointer"
        >
          <option value="" className="bg-gray-900">All Statuses</option>
          <option value="SENT" className="bg-gray-900">Sent</option>
          <option value="FAILED" className="bg-gray-900">Failed</option>
          <option value="PENDING" className="bg-gray-900">Pending</option>
        </select>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-white/[0.02] border-b border-white/[0.08]">
              <tr>
                <th className="px-6 py-4 font-medium">Recipient</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.08]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-500" />
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No email logs found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-[200px] truncate" title={log.to}>
                        {log.to}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-200">{log.subject}</div>
                      {log.error && (
                        <div className="text-xs text-red-400/80 mt-1 max-w-xs truncate" title={log.error}>
                          Error: {log.error}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                      {log.retryCount > 0 && (
                        <div className="text-[10px] text-gray-500 mt-1 text-center">
                          Retries: {log.retryCount}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {log.status === 'FAILED' && (
                        <button
                          onClick={() => handleRetry(log.id)}
                          disabled={retryingId === log.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-sm text-gray-300 transition-colors disabled:opacity-50"
                        >
                          {retryingId === log.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          Retry
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
            disabled={filters.page === 1}
            className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-gray-300 disabled:opacity-50 text-sm"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 px-4">
            Page {filters.page} of {totalPages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: Math.min(totalPages, (filters.page || 1) + 1) })}
            disabled={filters.page === totalPages}
            className="px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-xl text-gray-300 disabled:opacity-50 text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
