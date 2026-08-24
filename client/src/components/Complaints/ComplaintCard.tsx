import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { Complaint } from '../../types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { Image as ImageIcon, Calendar } from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  isAdmin: boolean;
}

export default function ComplaintCard({ complaint, isAdmin }: ComplaintCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/complaints/${complaint.id}`)}
      className="group relative flex flex-col bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden hover:bg-white/[0.06] hover:border-violet-500/30 transition-all duration-300 cursor-pointer"
    >
      {complaint.photoUrl ? (
        <div className="h-40 w-full overflow-hidden bg-black/20">
          <img
            src={`http://localhost:5000${complaint.photoUrl}`}
            alt="Complaint"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
            }}
          />
        </div>
      ) : (
        <div className="h-40 w-full bg-white/[0.02] flex flex-col items-center justify-center text-gray-500">
          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs font-medium">No photo</span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-3 gap-2">
          <h3 className="font-semibold text-gray-100 truncate flex-grow">
            {complaint.category}
          </h3>
          <div className="flex flex-col gap-1.5 items-end flex-shrink-0">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>

        <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-grow">
          {complaint.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(new Date(complaint.createdAt), 'MMM d, yyyy')}</span>
          </div>
          {isAdmin && complaint.resident && (
            <span className="truncate max-w-[120px]">{complaint.resident.name}</span>
          )}
        </div>
      </div>
    </div>
  );
}
