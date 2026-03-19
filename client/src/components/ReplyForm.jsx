import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { replySchema } from '../schemas/ticket.schema.js';

export default function ReplyForm({ onSubmit, isLoading, onSuggest, isSuggesting }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(replySchema) });

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  const handleSuggest = async () => {
    if (!onSuggest) return;

    const result = await onSuggest();
    const suggestion = typeof result?.suggestion === 'string' ? result.suggestion.trim() : '';
    if (suggestion) {
      setValue('content', suggestion, { shouldValidate: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 border-t border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={handleSuggest}
          disabled={isSuggesting}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSuggesting ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={13} />
              Suggest Reply
            </>
          )}
        </button>
      </div>
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <textarea
            {...register('content')}
            placeholder="Write a reply..."
            rows={3}
            className={`w-full px-3.5 py-2.5 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors dark:bg-slate-700 dark:text-slate-100 dark:placeholder-slate-400 ${
              errors.content ? 'border-red-300' : 'border-slate-200 dark:border-slate-600'
            }`}
          />
          {errors.content && (
            <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 text-sm font-medium flex-shrink-0 mb-[1px]"
        >
          <Send size={15} />
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
}
