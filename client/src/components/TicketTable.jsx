import { useNavigate } from 'react-router-dom';
import TicketStatusBadge from './TicketStatusBadge.jsx';
import TicketActionsMenu from './TicketActionsMenu.jsx';
import { Card } from './ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table.jsx';

const SkeletonRow = ({ columns }) => (
  <TableRow>
    {Array.from({ length: columns }).map((_, i) => (
      <TableCell key={i}>
        <div className="h-4 animate-pulse rounded bg-muted" />
      </TableCell>
    ))}
  </TableRow>
);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export default function TicketTable({
  tickets,
  isLoading,
  selectable = false,
  selectedTicketIds = [],
  onToggleTicket,
}) {
  const navigate = useNavigate();
  const selectedIdsSet = new Set(selectedTicketIds);
  const columnCount = selectable ? 8 : 7;

  return (
    <Card className="overflow-hidden border-border/80 bg-card/95">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {selectable ? <TableHead className="w-10" /> : null}
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Ticket ID</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Customer</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Subject</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Product</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Status</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Date</TableHead>
            <TableHead className="w-12 text-right text-xs font-semibold uppercase tracking-wider" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} columns={columnCount} />)
          ) : tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount} className="py-14 text-center text-sm text-muted-foreground">
                No tickets found
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="group cursor-pointer hover:bg-muted/40"
              >
                {selectable ? (
                  <TableCell
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                    className="w-10"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIdsSet.has(ticket.id)}
                      onChange={() => onToggleTicket?.(ticket.id)}
                      aria-label={`Select ticket ${ticket.id}`}
                      className="h-4 w-4 cursor-pointer rounded border-border"
                    />
                  </TableCell>
                ) : null}
                <TableCell className="font-mono text-xs font-semibold text-primary">
                  {ticket.id}
                </TableCell>
                <TableCell className="font-medium text-foreground">{ticket.customer_name}</TableCell>
                <TableCell className="max-w-[200px] text-muted-foreground">
                  <span className="truncate block">{ticket.subject}</span>
                </TableCell>
                <TableCell>
                  <span className="block max-w-[160px] truncate text-slate-600 dark:text-slate-400">
                    {ticket.product_title || (ticket.product_id ? `Product #${ticket.product_id}` : 'Product unavailable')}
                  </span>
                </TableCell>
                <TableCell>
                  <TicketStatusBadge status={ticket.status} />
                </TableCell>
                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                  {formatDate(ticket.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <TicketActionsMenu ticket={ticket} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
