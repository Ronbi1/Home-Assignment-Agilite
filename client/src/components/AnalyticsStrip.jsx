import { Ticket, Clock, CheckCircle } from 'lucide-react';
import { useTicketStats } from '../hooks/useTickets.js';

const StatCard = ({ icon: Icon, label, value, colorClass, isLoading }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorClass}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
      {isLoading ? (
        <div className="h-8 w-12 bg-slate-200 dark:bg-slate-600 rounded animate-pulse mt-1" />
      ) : (
        <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 leading-tight">{value ?? '—'}</p>
      )}
    </div>
  </div>
);

export default function AnalyticsStrip() {
  const { data: stats, isLoading } = useTicketStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7">
      <StatCard
        icon={Ticket}
        label="Total Tickets"
        value={stats?.total}
        colorClass="bg-indigo-500"
        isLoading={isLoading}
      />
      <StatCard
        icon={Clock}
        label="Open"
        value={stats?.open}
        colorClass="bg-amber-500"
        isLoading={isLoading}
      />
      <StatCard
        icon={CheckCircle}
        label="Closed"
        value={stats?.closed}
        colorClass="bg-slate-500"
        isLoading={isLoading}
      />
    </div>
  );
}
