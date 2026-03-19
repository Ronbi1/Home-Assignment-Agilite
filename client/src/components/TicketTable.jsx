import { useNavigate } from 'react-router-dom';
import TicketStatusBadge from './TicketStatusBadge.jsx';
import TicketActionsMenu from './TicketActionsMenu.jsx';
import { useProduct } from '../hooks/useProducts.js';

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
  <tr>
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
      </td>
    ))}
  </tr>
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
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
      <table className="w-full text-sm min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80">
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ticket ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Subject
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-12">

            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : tickets.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-14 text-center text-slate-400 text-sm">
                No tickets found
              </td>
            </tr>
          ) : (
            tickets.map((ticket) => (
              <tr
                key={ticket.id}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3.5 font-mono text-xs font-semibold text-indigo-600">
                  {ticket.id}
                </td>
                <td className="px-4 py-3.5 font-medium text-slate-700 dark:text-slate-200">{ticket.customer_name}</td>
                <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 max-w-[200px]">
                  <span className="truncate block">{ticket.subject}</span>
                </td>
                <td className="px-4 py-3.5">
                  <ProductName productId={ticket.product_id} />
                </td>
                <td className="px-4 py-3.5">
                  <TicketStatusBadge status={ticket.status} />
                </td>
                <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">
                  {formatDate(ticket.created_at)}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <TicketActionsMenu ticket={ticket} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
