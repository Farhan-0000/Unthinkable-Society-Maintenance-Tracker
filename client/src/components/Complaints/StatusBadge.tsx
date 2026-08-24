import type { ComplaintStatus } from '../../types';

interface StatusBadgeProps {
  status: ComplaintStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    OPEN: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    IN_PROGRESS: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    RESOLVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  };

  const labels = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
