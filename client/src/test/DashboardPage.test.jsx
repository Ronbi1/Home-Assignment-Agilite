import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import DashboardPage from '../pages/DashboardPage.jsx';

// ─────────────────────────────────────────────────────────────────────────────
// Module mocks
// All mocks are hoisted by Vitest and replace every import of these modules
// throughout the entire render tree (including AnalyticsStrip, TicketTable, etc.)
// ─────────────────────────────────────────────────────────────────────────────

vi.mock('../hooks/useTickets.js', () => ({
  useCreateTicket: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useDeleteTicket: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useTickets: vi.fn(() => ({
    data: [
      {
        id: 'TKT-TST001',
        customer_name: 'Alice Johnson',
        customer_email: 'alice@example.com',
        subject: 'Package arrived damaged',
        message: 'The item was scratched.',
        product_id: 101,
        product_title: 'Keyboard',
        product_price: 49,
        product_image: 'https://cdn.example.com/keyboard.png',
        status: 'open',
        has_ai_first_reply: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'TKT-TST002',
        customer_name: 'Bob Smith',
        customer_email: 'bob@example.com',
        subject: 'Wrong item shipped',
        message: 'I received the wrong product.',
        product_id: 202,
        product_title: 'Chair',
        product_price: 149,
        product_image: 'https://cdn.example.com/chair.png',
        status: 'open',
        has_ai_first_reply: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'TKT-TST003',
        customer_name: 'Carol White',
        customer_email: 'carol@example.com',
        subject: 'Refund request for item',
        message: 'I would like a full refund please.',
        product_id: 101,
        product_title: 'Keyboard',
        product_price: 49,
        product_image: 'https://cdn.example.com/keyboard.png',
        status: 'closed',
        has_ai_first_reply: false,
        created_at: new Date().toISOString(),
      },
    ],
    isLoading: false,
    error: null,
  })),
  useTicketStats: vi.fn(() => ({
    // Stats represent the FULL dataset (which may differ from the current view).
    data: { total: 5, open: 3, closed: 2 },
    isLoading: false,
  })),
  useUrgentFeed: vi.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}));

vi.mock('../hooks/useFilteredTickets.js', () => ({
  default: vi.fn(({ tickets }) => tickets),
}));

vi.mock('../hooks/useReport.js', () => ({
  default: vi.fn(() => ({
    isGeneratingReport: false,
    generatePdf: vi.fn(),
    shareByEmail: vi.fn(),
    shareNative: vi.fn(),
    toast: null,
    setToast: vi.fn(),
  })),
}));

// ─────────────────────────────────────────────────────────────────────────────

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );

/**
 * Returns the AnalyticsStrip container element by anchoring on the unique
 * "Total Tickets" text (only present in AnalyticsStrip) and walking up to the
 * nearest grid wrapper.
 */
const getAnalyticsStrip = () =>
  screen.getByText('Total Tickets').closest('[class*="grid"]');

// ─────────────────────────────────────────────────────────────────────────────

describe('DashboardPage – AnalyticsStrip integration', () => {
  it('renders the Dashboard heading', () => {
    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('AnalyticsStrip shows all three stat card labels', () => {
    renderDashboard();

    // Scope to the AnalyticsStrip grid to avoid matching "Open"/"Closed" text
    // in TicketFilters buttons and TicketStatusBadge components.
    const strip = within(getAnalyticsStrip());

    expect(strip.getByText('Total Tickets')).toBeInTheDocument();
    expect(strip.getByText('Open')).toBeInTheDocument();
    expect(strip.getByText('Closed')).toBeInTheDocument();
  });

  it('AnalyticsStrip displays the correct total, open, and closed counts', () => {
    renderDashboard();

    // Stats from mock: { total: 5, open: 3, closed: 2 }
    // Scope queries to the AnalyticsStrip to avoid false positives from the
    // visible ticket count text ("3 tickets") or status badges.
    const strip = within(getAnalyticsStrip());

    expect(strip.getByText('5')).toBeInTheDocument(); // total
    expect(strip.getByText('3')).toBeInTheDocument(); // open
    expect(strip.getByText('2')).toBeInTheDocument(); // closed
  });

  it('AnalyticsStrip shows loading skeletons when stats are being fetched', async () => {
    // Override the mock to simulate the loading state for this single test.
    const { useTicketStats } = await import('../hooks/useTickets.js');
    useTicketStats.mockReturnValueOnce({ data: undefined, isLoading: true });

    renderDashboard();

    // In loading state the numeric values are replaced by animated skeleton divs.
    const strip = within(getAnalyticsStrip());

    expect(strip.queryByText('5')).not.toBeInTheDocument();
    expect(strip.queryByText('3')).not.toBeInTheDocument();
    expect(strip.queryByText('2')).not.toBeInTheDocument();
  });
});

describe('DashboardPage – AI first reply indicators', () => {
  it('renders the AI-first dashboard card for open tickets', () => {
    renderDashboard();

    expect(screen.getByText('AI First Replies')).toBeInTheDocument();
    expect(screen.getByText('TKT-TST001 · Alice Johnson')).toBeInTheDocument();
  });

  it('renders an AI First badge in the ticket table', () => {
    renderDashboard();

    const row = screen.getByText('TKT-TST001').closest('tr');
    expect(within(row).getByText('AI First')).toBeInTheDocument();
  });
});
