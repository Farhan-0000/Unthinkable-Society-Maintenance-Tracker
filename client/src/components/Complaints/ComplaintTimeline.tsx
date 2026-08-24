import type { ComplaintHistory } from '../../types';
import { format } from 'date-fns';
import { Activity, ArrowRight, User } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface ComplaintTimelineProps {
  history: ComplaintHistory[];
}

export default function ComplaintTimeline({ history }: ComplaintTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 bg-white/[0.02] border border-white/[0.08] rounded-2xl">
        <Activity className="w-8 h-8 mb-2 opacity-30" />
        <span className="text-sm">No activity history yet.</span>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-violet-400" />
        Activity Timeline
      </h3>
      
      <div className="space-y-6">
        {history.map((entry, index) => (
          <div key={entry.id} className="relative pl-6">
            {/* Vertical line connecting timeline items */}
            {index !== history.length - 1 && (
              <div className="absolute left-2.5 top-6 bottom-[-24px] w-px bg-white/[0.1]" />
            )}
            
            {/* Dot indicator */}
            <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-[#030712] bg-violet-500" />
            
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <StatusBadge status={entry.previousStatus} />
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                  <StatusBadge status={entry.newStatus} />
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center text-gray-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {entry.actor?.name || 'Unknown User'}
                </span>
                <span className="text-xs text-gray-500">
                  ({entry.actorRole === 'ADMIN' ? 'Admin' : 'Resident'})
                </span>
              </div>

              {entry.note && (
                <div className="mt-3 text-sm text-gray-400 bg-black/20 rounded-lg p-3 border-l-2 border-violet-500/50">
                  {entry.note}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
