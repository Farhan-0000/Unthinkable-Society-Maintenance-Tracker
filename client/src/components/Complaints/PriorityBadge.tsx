import type { Priority } from '../../types';

interface PriorityBadgeProps {
  priority: Priority;
}

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const styles = {
    LOW: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    MEDIUM: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    HIGH: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  const labels = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[priority]}`}
    >
      {labels[priority]}
    </span>
  );
}
