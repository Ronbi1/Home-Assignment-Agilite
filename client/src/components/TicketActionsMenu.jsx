import { useState, useEffect, useRef } from 'react';
import { MoreVertical, Copy, Check, Trash2 } from 'lucide-react';
import { useDeleteTicket } from '../hooks/useTickets.js';

export default function TicketActionsMenu({ ticket }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionError, setActionError] = useState('');
  const menuRef = useRef(null);
  const { mutateAsync: deleteTicket, isPending: isDeleting } = useDeleteTicket();
  const canDelete = ticket.status === 'closed';

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleCopy = async (e) => {
    e.stopPropagation();
    setActionError('');
    const text = [
      `Ticket ID: ${ticket.id}`,
      `Customer Name: ${ticket.customer_name ?? 'Unknown customer'}`,
      `Subject: ${ticket.subject ?? 'No subject'}`,
      `Status: ${ticket.status ?? 'open'}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1500);
    } catch {
      setActionError('Failed to copy ticket details.');
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!canDelete || isDeleting) return;

    const confirmed = window.confirm(`Delete ticket ${ticket.id}? This keeps it in the database but removes it from the dashboard.`);
    if (!confirmed) return;

    try {
      setActionError('');
      await deleteTicket(ticket.id);
      setOpen(false);
    } catch (error) {
      setActionError(error?.response?.data?.error || 'Failed to delete ticket.');
    }
  };

  return (
    <div
      ref={menuRef}
      className="relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => {
          setActionError('');
          setOpen((prev) => !prev);
        }}
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        aria-label="Ticket actions"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-10 min-w-[190px] rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={handleCopy}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {copied ? (
              <Check size={14} className="text-emerald-500 flex-shrink-0" />
            ) : (
              <Copy size={14} className="flex-shrink-0" />
            )}
            {copied ? 'Copied!' : 'Copy'}
          </button>

          <button
            onClick={handleDelete}
            disabled={!canDelete || isDeleting}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent dark:text-red-400 dark:hover:bg-red-950/40 dark:disabled:text-slate-500"
            title={canDelete ? 'Delete ticket' : 'Only closed tickets can be deleted'}
          >
            <Trash2 size={14} className="flex-shrink-0" />
            {isDeleting ? 'Deleting...' : canDelete ? 'Delete' : 'Close ticket before deleting'}
          </button>

          {actionError ? (
            <p className="px-3 pb-2 pt-1 text-xs text-red-600 dark:text-red-400">{actionError}</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
