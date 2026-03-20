import { Loader2 } from 'lucide-react';

export default function PageLoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center p-6">
      <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-muted-foreground">
        <Loader2 size={18} className="animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
}
