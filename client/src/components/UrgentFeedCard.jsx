import { AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.jsx';
import { Badge } from './ui/badge.jsx';

const MIN_VISIBLE_SCORE = 70;
const MIN_QUEUE_SIZE = 5;

const getUrgencyLevel = (score) => {
  if (score >= 85) return 'critical';
  if (score >= 70) return 'high';
  return 'medium';
};

const badgeClassByLevel = {
  critical: 'border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300',
  high: 'border-orange-200 bg-orange-100 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300',
  medium: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
};

export default function UrgentFeedCard({ items = [], isLoading, error }) {
  const navigate = useNavigate();
  const sortedItems = [...items].sort((a, b) => Number(b.urgencyScore || 0) - Number(a.urgencyScore || 0));
  const highUrgencyItems = sortedItems.filter((item) => Number(item.urgencyScore) >= MIN_VISIBLE_SCORE);
  const fallbackItems = sortedItems.filter((item) => Number(item.urgencyScore) < MIN_VISIBLE_SCORE);
  const fillCount = Math.max(0, MIN_QUEUE_SIZE - highUrgencyItems.length);
  const visibleItems = [...highUrgencyItems, ...fallbackItems.slice(0, fillCount)];

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle size={16} className="text-orange-500" />
          Urgent AI Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            <span>Analyzing urgent tickets...</span>
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">Urgent feed is temporarily unavailable.</p>
        ) : visibleItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">No high-urgency tickets right now.</p>
        ) : (
          <div className="space-y-2">
            {visibleItems.map((item) => {
              const urgencyScore = Number(item.urgencyScore) || 0;
              const level = getUrgencyLevel(urgencyScore);

              return (
                <button
                  key={item.ticketId}
                  type="button"
                  onClick={() => navigate(item.ticketUrl)}
                  className="flex w-full items-center justify-between rounded-md border border-border/70 px-3 py-2 text-left hover:bg-muted/40"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">Ticket {item.ticketId} has an urgent issue</p>
                    <p className="text-xs text-muted-foreground">{item.reasonShort}</p>
                  </div>
                  <Badge variant="outline" className={badgeClassByLevel[level]}>
                    {level}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
