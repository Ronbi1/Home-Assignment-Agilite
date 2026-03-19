import { Button } from './ui/button.jsx';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

export default function TicketFilters({ activeFilter, onChange }) {
  return (
    <div className="flex gap-1.5 rounded-lg border border-border/80 bg-muted/40 p-1">
      {FILTERS.map(({ value, label }) => (
        <Button
          key={value}
          onClick={() => onChange(value)}
          size="sm"
          variant={activeFilter === value ? 'default' : 'ghost'}
          className="h-8"
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
