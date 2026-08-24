import type { Notice } from '../../types';
import { format } from 'date-fns';
import { Megaphone, Calendar, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NoticeCardProps {
  notice: Notice;
  onEdit?: (notice: Notice) => void;
  onDelete?: (id: string) => void;
}

export default function NoticeCard({ notice, onEdit, onDelete }: NoticeCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className={`relative bg-white/[0.04] backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 ${
      notice.isImportant 
        ? 'border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.1)]' 
        : 'border-white/[0.08] hover:border-white/[0.15]'
    }`}>
      {/* Important Pin */}
      {notice.isImportant && (
        <div className="absolute -top-3 -right-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-xs font-semibold text-white shadow-lg shadow-violet-500/25">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Important</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4 gap-4">
        <div>
          <h3 className={`text-xl font-bold tracking-tight mb-2 ${
            notice.isImportant ? 'text-violet-100' : 'text-white'
          }`}>
            {notice.title}
          </h3>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(notice.createdAt), 'MMM d, yyyy')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              Posted by {notice.createdBy.name}
            </span>
          </div>
        </div>

        {/* Admin Actions */}
        {isAdmin && onEdit && onDelete && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onEdit(notice)}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] text-gray-400 hover:text-white transition-all"
              title="Edit notice"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(notice.id)}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all"
              title="Delete notice"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content - Preserves line breaks automatically via whitespace-pre-wrap */}
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap break-words text-sm sm:text-base">
          {notice.content}
        </p>
      </div>
    </div>
  );
}
