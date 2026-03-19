import { useNavigate } from 'react-router-dom';
import TicketStatusBadge from './TicketStatusBadge.jsx';
import TicketActionsMenu from './TicketActionsMenu.jsx';
import { useProduct } from '../hooks/useProducts.js';
import { Card } from './ui/card.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table.jsx';

function ProductName({ productId }) {
  const { data, isLoading, isError } = useProduct(productId);
  if (isLoading) {
    return <span className="inline-block w-24 h-3.5 bg-slate-200 dark:bg-slate-600 rounded animate-pulse" />;
  }
  if (isError || !data) {
    return (
      <span className="truncate max-w-[160px] block text-slate-400 dark:text-slate-500">
        Product unavailable
      </span>
    );
  }
  return (
    <span className="truncate max-w-[160px] block text-slate-600 dark:text-slate-400">
      {data.title || `Product #${productId}`}
    </span>
  );
}

const SkeletonRow = () => (
  <TableRow>
    {Array.from({ length: 7 }).map((_, i) => (
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

export default function TicketTable({ tickets, isLoading }) {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden border-border/80 bg-card/95">
      <Table className="min-w-[700px]">
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
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
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : tickets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-14 text-center text-sm text-muted-foreground">
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
                <TableCell className="font-mono text-xs font-semibold text-primary">
                  {ticket.id}
                </TableCell>
                <TableCell className="font-medium text-foreground">{ticket.customer_name}</TableCell>
                <TableCell className="max-w-[200px] text-muted-foreground">
                  <span className="truncate block">{ticket.subject}</span>
                </TableCell>
                <TableCell>
                  <ProductName productId={ticket.product_id} />
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
