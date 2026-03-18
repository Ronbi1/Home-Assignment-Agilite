import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, XCircle, Calendar, Mail, User, PackageX } from 'lucide-react';
import { useTicket, useReplies, useCloseTicket, useAddReply } from '../hooks/useTicket.js';
import { useProduct } from '../hooks/useProducts.js';
import { getProductImage } from '../lib/productImage.js';
import TicketStatusBadge from '../components/TicketStatusBadge.jsx';
import ConversationThread from '../components/ConversationThread.jsx';
import ReplyForm from '../components/ReplyForm.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

const FALLBACK_IMAGE = 'https://placehold.co/80x80?text=?';

function ProductInfo({ productId }) {
  const { data: product, isLoading, isError } = useProduct(productId);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl animate-pulse">
        <div className="w-14 h-14 bg-slate-200 dark:bg-slate-600 rounded-lg flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3.5 bg-slate-200 dark:bg-slate-600 rounded w-3/4" />
          <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-slate-400">
        <PackageX size={18} className="flex-shrink-0" />
        <p className="text-sm">Product details unavailable</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
      <img
        src={getProductImage(product.images)}
        alt={product.title}
        className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
        onError={(e) => {
          e.target.src = FALLBACK_IMAGE;
        }}
      />
      <div className="min-w-0">
        <p className="text-xs font-medium text-indigo-600 mb-0.5">
          {product.category?.name || 'Uncategorized'}
        </p>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
          {product.title}
        </p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">${product.price}</p>
      </div>
    </div>
  );
}

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

function TicketDetailSkeleton() {
  return (
    <div className="p-4 sm:p-8 max-w-5xl animate-pulse">
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-36 mb-8" />
      <div className="h-7 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="h-36 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-28 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
        <div className="lg:col-span-2 h-[480px] bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: ticket, isLoading: ticketLoading, error: ticketError } = useTicket(id);
  const { data: replies = [], isLoading: repliesLoading } = useReplies(id);
  const { mutateAsync: closeTicket, isPending: isClosing } = useCloseTicket(id);
  const { mutateAsync: addReply, isPending: isReplying } = useAddReply(id);
  const [actionError, setActionError] = useState(null);

  const handleClose = async () => {
    if (window.confirm('Close this ticket? This marks it as resolved.')) {
      try {
        setActionError(null);
        await closeTicket();
      } catch {
        setActionError('Failed to close ticket. Please try again.');
      }
    }
  };

  const handleReply = async (data) => {
    try {
      setActionError(null);
      await addReply({ content: data.content, author: 'Support Agent' });
    } catch {
      setActionError('Failed to send reply. Please try again.');
    }
  };

  if (ticketLoading) return <TicketDetailSkeleton />;
  if (ticketError) {
    return (
      <div className="p-8">
        <ErrorMessage message="Ticket not found or failed to load." />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-5xl">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to Dashboard
      </button>

      <div className="flex items-start justify-between mb-7 gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{ticket.subject}</h1>
            <TicketStatusBadge status={ticket.status} />
          </div>
          <p className="text-xs font-mono text-slate-400">{ticket.id}</p>
        </div>
        {ticket.status === 'open' && (
          <button
            onClick={handleClose}
            disabled={isClosing}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50 transition-colors text-sm font-medium flex-shrink-0"
          >
            <XCircle size={15} />
            {isClosing ? 'Closing...' : 'Close Ticket'}
          </button>
        )}
      </div>

      {actionError && <ErrorMessage message={actionError} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Customer</p>
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-slate-400 flex-shrink-0" />
              <span className="font-medium text-slate-700 dark:text-slate-200">{ticket.customer_name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 dark:text-slate-400 truncate">{ticket.customer_email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 dark:text-slate-400">{formatDate(ticket.created_at)}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Product
            </p>
            <ProductInfo productId={ticket.product_id} />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Message
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{ticket.message}</p>
          </div>
        </div>

        {/* Conversation panel */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col min-h-[480px]">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Conversation
              <span className="ml-2 text-slate-400 font-normal">
                ({replies.length} {replies.length === 1 ? 'reply' : 'replies'})
              </span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ConversationThread replies={replies} isLoading={repliesLoading} />
          </div>

          {ticket.status === 'open' ? (
            <ReplyForm onSubmit={handleReply} isLoading={isReplying} />
          ) : (
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 text-center text-xs text-slate-400">
              This ticket is closed — no further replies can be added.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
