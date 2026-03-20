import { Button } from './ui/button.jsx';
import { SORT_MODES as SORT_MODE_VALUES, STATUS_MODES as STATUS_MODE_VALUES } from '../lib/constants/dashboard.constants.js';

const STATUS_MODE_OPTIONS = [
  { value: STATUS_MODE_VALUES.ALL_GROUPED, label: 'All (Open first)' },
  { value: STATUS_MODE_VALUES.OPEN, label: 'Open' },
  { value: STATUS_MODE_VALUES.CLOSED, label: 'Closed' },
];

const SORT_MODE_OPTIONS = [
  { value: SORT_MODE_VALUES.DATE_DESC, label: 'Date (Newest)' },
  { value: SORT_MODE_VALUES.DATE_ASC, label: 'Date (Oldest)' },
  { value: SORT_MODE_VALUES.ALPHA, label: 'Alphabetical' },
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
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-3">
        <div className="flex w-full flex-col gap-1.5 sm:w-auto">
          <label htmlFor="sortMode" className="text-xs font-medium text-muted-foreground">
            Sort by
          </label>
          <select
            id="sortMode"
            value={sortMode}
            onChange={(event) => onSortModeChange(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm sm:min-w-44"
          >
            {SORT_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex w-full flex-col gap-1.5 sm:w-auto">
          <label htmlFor="productFilter" className="text-xs font-medium text-muted-foreground">
            Product
          </label>
          <select
            id="productFilter"
            value={productFilter}
            onChange={(event) => onProductFilterChange(event.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm sm:min-w-44"
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

      <div className="flex flex-col gap-1.5 rounded-lg border border-border/80 bg-muted/40 p-1 sm:self-end sm:flex-row sm:flex-wrap">
        {STATUS_MODE_OPTIONS.map(({ value, label }) => (
          <Button
            key={value}
            onClick={() => onStatusModeChange(value)}
            size="sm"
            variant={statusMode === value ? 'default' : 'ghost'}
            className="h-8 w-full justify-center sm:w-auto"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
