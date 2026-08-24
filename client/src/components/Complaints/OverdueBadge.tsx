import { AlertCircle } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface OverdueBadgeProps {
  createdAt: string;
}

export default function OverdueBadge({ createdAt }: OverdueBadgeProps) {
  const daysOverdue = differenceInDays(new Date(), new Date(createdAt));
  
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
      <AlertCircle className="w-3.5 h-3.5" />
      <span>{daysOverdue} days overdue</span>
    </div>
  );
}
