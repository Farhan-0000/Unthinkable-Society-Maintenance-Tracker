import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import type { Complaint } from '../../types';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import OverdueBadge from './OverdueBadge';
import { Eye, Image as ImageIcon } from 'lucide-react';

interface ComplaintTableProps {
  complaints: Complaint[];
  isAdmin: boolean;
}

export default function ComplaintTable({ complaints, isAdmin }: ComplaintTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-white/[0.04] text-xs uppercase text-gray-500">
          <tr>
            <th className="px-6 py-4 font-semibold tracking-wider">Complaint</th>
            {isAdmin && <th className="px-6 py-4 font-semibold tracking-wider">Resident</th>}
            <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
            <th className="px-6 py-4 font-semibold tracking-wider">Priority</th>
            <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
            <th className="px-6 py-4 text-right font-semibold tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.08]">
          {complaints.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                No complaints found matching the current filters.
              </td>
            </tr>
          ) : (
            complaints.map((complaint) => (
              <tr
                key={complaint.id}
                className={`hover:bg-white/[0.04] transition-colors group cursor-pointer ${
                  complaint.isOverdue ? 'bg-red-500/[0.02] hover:bg-red-500/[0.04]' : ''
                }`}
                onClick={() => navigate(`/complaints/${complaint.id}`)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center overflow-hidden flex-shrink-0">
                      {complaint.photoUrl ? (
                        <img
                          src={`http://localhost:5000${complaint.photoUrl}`}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => {
                             (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40?text=X';
                          }}
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-200">{complaint.category}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[200px] mt-0.5">
                        {complaint.description}
                      </p>
                    </div>
                  </div>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {complaint.resident?.name || 'Unknown'}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={complaint.status} />
                    {complaint.isOverdue && <OverdueBadge createdAt={complaint.createdAt} />}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <PriorityBadge priority={complaint.priority} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                  {format(new Date(complaint.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/complaints/${complaint.id}`);
                    }}
                    className="p-2 text-gray-400 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
