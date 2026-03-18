import { MessageCircle } from 'lucide-react';

const AGENT_NAME = 'Support Agent';

const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function ReplyBubble({ reply }) {
  const isAgent = reply.author === AGENT_NAME;

  return (
    <div className={`flex flex-col gap-1 ${isAgent ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="font-medium text-slate-500 dark:text-slate-400">{reply.author}</span>
        <span>·</span>
        <span>{formatTime(reply.created_at)}</span>
      </div>
      <div
        className={`px-4 py-3 rounded-2xl max-w-sm text-sm leading-relaxed ${
          isAgent
            ? 'bg-indigo-600 text-white rounded-tr-sm'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'
        }`}
      >
        {reply.content}
      </div>
    </div>
  );
}

const SkeletonBubble = ({ align }) => (
  <div className={`flex flex-col gap-1 ${align === 'right' ? 'items-end' : 'items-start'}`}>
    <div className="h-3 w-28 bg-slate-200 dark:bg-slate-600 rounded animate-pulse" />
    <div className="h-14 w-56 bg-slate-200 dark:bg-slate-600 rounded-2xl animate-pulse" />
  </div>
);

export default function ConversationThread({ replies, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-5 p-5">
        <SkeletonBubble align="left" />
        <SkeletonBubble align="right" />
        <SkeletonBubble align="left" />
      </div>
    );
  }

  if (replies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-slate-400">
        <MessageCircle size={28} className="mb-2 opacity-40" />
        <p className="text-sm">No replies yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-5">
      {replies.map((reply) => (
        <ReplyBubble key={reply.id} reply={reply} />
      ))}
    </div>
  );
}
