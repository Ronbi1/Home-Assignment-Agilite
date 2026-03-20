const STATUS_CONFIG = {
  open: {
    badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  closed: {
    badge: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600',
    dot: 'bg-slate-400',
  },
};

export default function TicketStatusBadge({ status }) {
  const safeStatus = typeof status === 'string' && status.trim() ? status : 'open';
  const config = STATUS_CONFIG[safeStatus] || STATUS_CONFIG.open;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
    </span>
  );
}
