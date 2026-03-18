const FILTERS = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

export default function TicketFilters({ activeFilter, onChange }) {
  return (
    <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
      {FILTERS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 ${
            activeFilter === value
              ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
