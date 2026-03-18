# SupportDesk

A full-stack customer support ticketing system built as a 3-day home assignment.

## Live Demo

> 🔗 _Deployment link — to be added after deploy_

---

## Project Overview

SupportDesk is a 4-page web application where customer support agents can manage tickets. Customers submit tickets linked to a product they purchased, agents reply in a thread, and tickets can be closed when resolved. Product data is fetched live from an external API and never stored locally.

**Pages:**
1. **Create Ticket** — customer-facing form with validation and product selector
2. **Dashboard** — all tickets with analytics strip, status filters, and skeleton loaders
3. **Ticket Details** — conversation thread, live product info, close ticket action
4. **Products Catalog** — browsable product grid from the external API

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React + Vite | Fast dev experience, minimal config |
| Routing | React Router v6 | Standard SPA routing |
| Server state | TanStack Query | Caching, loading states, deduplication |
| Forms | React Hook Form + Zod | Clean validation with inline errors |
| Styling | Tailwind CSS | Utility-first, no design system overhead |
| HTTP | Axios | Cleaner error handling than raw fetch |
| Backend | Node.js + Express | Lightweight, ES Modules |
| Database | PostgreSQL + `pg` | Raw parameterized SQL, no ORM |
| ID generation | nanoid | Readable `TKT-XXXXXX` ticket IDs |

---

## Architecture

### Backend — Layered Architecture
```
Routes → Controller → Service → Repository → PostgreSQL
```
- **Routes** — declare endpoints, delegate to controllers
- **Controllers** — parse request/response, no business logic
- **Service** — all business logic (validation, ID generation, error throwing)
- **Repository** — all SQL queries (parameterized, never string-concatenated)

Replies are nested under the tickets domain — not a separate top-level feature.
All reply endpoints live under `/api/tickets/:id/replies`.

### Frontend — Flat Structure by File Type
```
src/pages/        — page-level components (Dashboard, CreateTicket, TicketDetail, Products)
src/components/   — all UI components (shared and domain-specific)
src/hooks/        — React hooks (useTickets, useTicket, useProducts)
src/api/          — API call functions (tickets, products)
src/schemas/      — Zod validation schemas
src/lib/          — utilities (queryClient, productImage)
```
Components import from `hooks/`, `api/`, `lib/`, and `schemas/` — clean dependency direction with no circular imports.

### Products API Strategy
Product data is **never stored in the database**. Only `product_id` is persisted.
On the dashboard, product names are fetched per row via `useProduct(id)` — TanStack Query deduplicates calls for the same ID automatically.
On the ticket detail page, live product info (image, title, price, category) is fetched from the external API with graceful degradation if unavailable.

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (any recent version)
- pgAdmin 4 (or any PostgreSQL client)

### 1. Create the database in pgAdmin 4

1. Open pgAdmin 4
2. Right-click **Databases** → **Create** → **Database**
3. Set the name to `support_tickets` → click **Save**

### 2. Clone and configure

```bash
git clone <repo-url>
cd Agilite_Home_Assignment

cp server/.env.example server/.env
```

Open `server/.env` and update with your PostgreSQL password:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/support_tickets
PORT=3001
```

> **Tip:** To find your password — pgAdmin → right-click the server → Properties → Connection tab.

### 3. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 4. Initialize the database

```bash
cd server
npm run db:init
```

This runs a Node script that connects to PostgreSQL via `pg` and executes `db/init.sql`.
No `psql` CLI required — works on all platforms.

Expected output: `✓ Database initialized successfully`

### 5. Seed sample data

```bash
npm run db:seed
```

Inserts 6 tickets (mix of open/closed) and 8 replies so the app is populated on first load.

### 6. Start the servers

**Terminal 1 — API server:**
```bash
cd server && npm run dev
# → http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd client && npm run dev
# → http://localhost:5173
```

---

## Environment Variables

| Variable | Description | Default / Example |
|----------|-------------|-------------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/support_tickets` |
| `PORT` | API server port | `3001` |

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/tickets` | List all tickets. Optional `?status=open\|closed` |
| `GET` | `/api/tickets/stats` | Returns `{ total, open, closed }` counts |
| `GET` | `/api/tickets/:id` | Get a single ticket |
| `POST` | `/api/tickets` | Create a new ticket |
| `PATCH` | `/api/tickets/:id/status` | Update ticket status `{ "status": "closed" }` |
| `GET` | `/api/tickets/:id/replies` | Get all replies for a ticket |
| `POST` | `/api/tickets/:id/replies` | Add a reply `{ "author", "content" }` |

**Error format:** `{ "error": "Ticket not found" }` with appropriate HTTP status.

---

## Project Structure

```
├── client/src/
│   ├── pages/                    # DashboardPage, CreateTicketPage, TicketDetailPage, ProductsPage
│   ├── components/               # all UI components (Layout, Navbar, TicketTable, etc.)
│   ├── hooks/                    # useTickets, useTicket, useProducts
│   ├── api/                      # tickets.api.js, products.api.js
│   ├── schemas/                  # Zod validation schemas
│   ├── lib/
│   │   ├── queryClient.js
│   │   └── productImage.js       # getProductImage() — normalizes external API image URLs
│   ├── App.jsx
│   └── main.jsx
├── server/
│   ├── src/
│   │   ├── config/db.js          # pg Pool singleton
│   │   ├── features/tickets/     # routes, controller, service, repositories
│   │   └── middleware/errorHandler.js
│   └── db/
│       ├── init.sql              # schema (idempotent — safe to rerun)
│       ├── init.js               # Node-based DB init (no psql required)
│       └── seed.js               # sample tickets + replies
└── README.md
```

---

## Extra Features (Beyond the Assignment Brief)

| Feature | Description |
|---------|-------------|
| Analytics strip | Live Total / Open / Closed counts on the dashboard |
| Skeleton loaders | Shimmer placeholders on all data-loading states |
| Readable ticket IDs | `TKT-XXXXXX` format (e.g. `TKT-A3F9K2`) |
| Product names on dashboard | Fetched live from external API with TanStack Query deduplication |
| Graceful product degradation | "Product details unavailable" when external API fails |
| Node-based DB init | Works on Windows without `psql` in PATH |
| `getProductImage()` utility | Normalizes the external API's inconsistent image URL format |
| Differentiated conversation bubbles | Agent vs customer messages styled differently |
| Segmented status filter | Polished filter tabs on the dashboard |

---

## Trade-offs & Decisions

**Why raw SQL and no ORM?**
Required by the assignment. Also appropriate here — the schema is simple and raw SQL keeps the repository layer explicit and reviewable.

**Why products are never stored in the DB?**
Required by the assignment. Ensures product info is always fresh. The trade-off is a runtime dependency on an external API.

**Why replies are nested under the tickets feature?**
Replies have no independent meaning outside a ticket context. A separate top-level feature would be over-abstracted for this scope.

**Why `window.confirm()` for closing a ticket?**
Pragmatic for a 3-day assignment. A custom modal adds polish without adding architectural value.

---

## Known Limitations

- No authentication (not required by the assignment)
- No pagination on the dashboard
- Reply author is hardcoded to `'Support Agent'` — no auth system to identify users
- The external products API (`api.escuelajs.co`) has occasional downtime and inconsistent image URLs; both are handled gracefully

---

## Deployment

> To be updated with live URLs after deployment.

**Recommended stack:**
- **API + Database** → Railway (Node.js + PostgreSQL in one project)
- **Frontend** → Vercel (static Vite build, points to Railway API)
