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
  critical: 'border-transparent bg-red-500/15 text-red-500 dark:bg-red-500/20 dark:text-red-300',
  high: 'border-transparent bg-orange-500/15 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300',
  medium: 'border-transparent bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
};

export default function UrgentFeedCard({ items = [], tickets = [], isLoading, error }) {
  const navigate = useNavigate();
  const sortedItems = [...items].sort((a, b) => Number(b.urgencyScore || 0) - Number(a.urgencyScore || 0));
  const highUrgencyItems = sortedItems.filter((item) => Number(item.urgencyScore) >= MIN_VISIBLE_SCORE);
  const fallbackItems = sortedItems.filter((item) => Number(item.urgencyScore) < MIN_VISIBLE_SCORE);
  const fillCount = Math.max(0, MIN_QUEUE_SIZE - highUrgencyItems.length);
  const visibleItems = [...highUrgencyItems, ...fallbackItems.slice(0, fillCount)];
  const ticketMap = new Map(tickets.map((ticket) => [ticket.id, ticket]));

  return (
    <Card className="h-full border-border/70 bg-card/95 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 dark:bg-orange-500/15">
            <AlertTriangle size={16} />
          </div>
          <div className="flex flex-col">
            <span>Urgent AI Queue</span>
            <span className="text-sm font-normal text-muted-foreground">Prioritized tickets that may need immediate attention.</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
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
              const ticket = ticketMap.get(item.ticketId);
              const subject = ticket?.subject?.trim() || `Support ticket`;

              return (
                <button
                  key={item.ticketId}
                  type="button"
                  onClick={() => navigate(item.ticketUrl)}
                  className="flex w-full items-start justify-between rounded-xl border border-border/70 px-4 py-3 text-left transition-colors hover:bg-accent/50 cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="truncate text-sm font-semibold text-foreground">{subject}</p>
                      <span className="text-sm text-muted-foreground">{item.ticketId}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{item.reasonShort}</p>
                  </div>
                  <Badge variant="outline" className={`ml-3 capitalize ${badgeClassByLevel[level]}`}>
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
