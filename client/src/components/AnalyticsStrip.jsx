import { Ticket, Clock, CheckCircle } from 'lucide-react';
import { useTicketStats } from '../hooks/useTickets.js';
import { Card, CardContent } from './ui/card.jsx';

const StatCard = ({ icon: Icon, label, value, colorClass, isLoading }) => (
  <Card className="border-border/80 bg-card/95">
    <CardContent className="flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorClass}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        {isLoading ? (
          <div className="mt-1 h-8 w-12 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-3xl font-bold leading-tight text-foreground">{value ?? '—'}</p>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function AnalyticsStrip() {
  const { data: stats, isLoading } = useTicketStats();

  return (
    <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        icon={Ticket}
        label="Total Tickets"
        value={stats?.total}
        colorClass="bg-primary"
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
