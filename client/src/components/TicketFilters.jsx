import { Button } from './ui/button.jsx';

const STATUS_MODES = [
  { value: 'all_grouped', label: 'All (Open first)' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
];

const SORT_MODES = [
  { value: 'date_desc', label: 'Date (Newest)' },
  { value: 'date_asc', label: 'Date (Oldest)' },
  { value: 'alpha', label: 'Alphabetical' },
];

export default function TicketFilters({
  statusMode,
  onStatusModeChange,
  sortMode,
  onSortModeChange,
  productFilter,
  onProductFilterChange,
  productOptions,
}) {
  return (
    <div className="flex w-full flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
      <div className="flex gap-1.5 rounded-lg border border-border/80 bg-muted/40 p-1">
        {STATUS_MODES.map(({ value, label }) => (
          <Button
            key={value}
            onClick={() => onStatusModeChange(value)}
            size="sm"
            variant={statusMode === value ? 'default' : 'ghost'}
            className="h-8"
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="sortMode" className="text-xs font-medium text-muted-foreground">
          Sort by
        </label>
        <select
          id="sortMode"
          value={sortMode}
          onChange={(event) => onSortModeChange(event.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          {SORT_MODES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label htmlFor="productFilter" className="text-xs font-medium text-muted-foreground">
          Product
        </label>
        <select
          id="productFilter"
          value={productFilter}
          onChange={(event) => onProductFilterChange(event.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="all">All products</option>
          {productOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
