# SupportDesk

![SupportDesk logo](client/public/assets/agilite-logo.png)

SupportDesk is a full-stack customer support ticketing application built for the Agilite Full Stack Developer home assignment. It delivers the required 4-page workflow, persists ticket data in PostgreSQL through a backend API, and extends the baseline brief with analytics, AI-assisted support tooling, AI-first replies, urgency scoring, and export/share reporting.

## 🌍 Production URLs

- **Frontend (SPA):** [home-assignment-agilite.vercel.app](https://home-assignment-agilite.vercel.app)
- **Backend (API):** [home-assignment-agilite-production.up.railway.app](https://home-assignment-agilite-production.up.railway.app)
- **Product Source Data:** [`https://api.escuelajs.co/api/v1/products`](https://api.escuelajs.co/api/v1/products)
## 🧭 Project Overview

The project simulates a lightweight support workspace where customers submit product-related tickets and support agents manage them through a dashboard and conversation flow.

At a high level, the system solves three core problems:

- Capture support requests with validated product-linked ticket creation.
- Give support agents a central workspace to triage, reply to, and close tickets.
- Enrich ticket operations with live product data, analytics, and AI-assisted prioritization.

Although the assignment describes a simple 4-page application, this implementation pushes further on engineering quality and UX polish by adding layered backend design, resilient product-data handling, AI features, dashboard reporting, and automated backend API testing.

## ✅ Assignment Coverage

The README is intentionally aligned with the original Agilite brief so a reviewer can verify scope quickly.

### Required Pages

| Assignment requirement | Implemented in project |
|---|---|
| Create Ticket Form | Customer-facing form with modal product selector, schema validation, submission feedback, and redirect to dashboard |
| Tickets Dashboard | Ticket table with analytics, filtering, search, and navigation into details |
| Ticket Details Page | Ticket metadata, customer info, product snapshot, conversation thread, reply action, close-ticket action |
| Products Page | Categorized product catalog with attractive cards and filtering |

### Required Behaviors

| Requirement | Implementation |
|---|---|
| Validate all fields before submission | `react-hook-form` + `zod` on the client, plus backend validation in the ticket service |
| Generate unique ticket ID | Backend generates readable `TKT-XXXXXX` IDs using `nanoid` |
| Save ticket with timestamp and `open` status | PostgreSQL schema stores timestamps; tickets default to `open` |
| Success feedback and form reset | Create flow shows success state, resets the form, and redirects |
| Ticket details with replies and closing | Replies are stored per ticket; status can be updated to `closed` |
| Loading states and API errors | All major pages include loading and error states |
| Routing between pages | React Router-based SPA routes |
| Persistent backend storage | Tickets and replies are stored in PostgreSQL |
| Responsive design | Layouts, forms, filters, and actions are designed for mobile and desktop breakpoints |

### Deliverables And Evaluation Themes

| Evaluation theme | Evidence in this codebase |
|---|---|
| Clean structure and organization | Backend is layered by feature; frontend is organized by pages, components, hooks, api, schemas, and lib |
| Data persists across refreshes | Tickets and replies are stored in PostgreSQL, not only in browser state |
| Proper validation and error handling | Client schemas, backend guards, explicit error responses, and empty/error UI states |
| UI is clean and usable | Tailwind-based UI, shadcn-style primitives, dark mode, loaders, filtering, and polished forms |
| Extra features beyond the brief | Analytics, AI-first replies, AI reply suggestions, AI urgency queue, PDF export/share, product normalization, backend CI tests |

## ✨ Key Features

### Core Assignment Features

- Schema-backed ticket creation with inline validation errors.
- Product selector modal backed by the external products API.
- Ticket dashboard with status filtering, ticket counts, and detail-page navigation.
- Ticket detail workflow with conversation thread, reply submission, and close-ticket action.
- Product catalog page grouped by category with image, price, and category presentation.
- Persistent backend API with PostgreSQL storage for tickets and replies.

### Beyond The Brief

- AI-generated reply suggestions for support agents.
- AI-first replies that automatically answer new tickets when AI is available.
- Hybrid urgent-ticket queue that combines heuristics with OpenAI scoring.
- Dashboard analytics strip for total, open, and closed ticket counts.
- Exportable and shareable dashboard reports with PDF, email, and native share flows.
- Dark/light theme persistence via `localStorage`.
- Product normalization, image validation, and graceful fallbacks for unreliable upstream data.
- Soft-delete behavior for closed tickets to keep ticket removal safer and audit-friendly.
- Automated backend API test suite running in CI with PostgreSQL.

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | `18.3.1` | Component-based SPA UI |
| Vite | `^5.4.10` | Frontend dev server and build tool |
| React Router DOM | `^6.27.0` | Client-side routing |
| TanStack React Query | `^5.59.0` | Server-state fetching, caching, invalidation |
| React Hook Form | `^7.53.0` | Form state management |
| Zod | `^3.23.8` | Schema validation |
| Axios | `^1.7.7` | HTTP client |
| Tailwind CSS | `^3.4.14` | Utility-first styling |
| shadcn/ui config | project config present | Reusable UI primitives and design consistency |
| Lucide React | `^0.454.0` | Icons |
| html2canvas | `^1.4.1` | Report rendering pipeline |
| jsPDF | `^4.2.1` | PDF export |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | `18+` recommended, CI runs `20` | Backend runtime |
| Express | `^4.21.1` | HTTP API |
| pg | `^8.13.0` | PostgreSQL access |
| nanoid | `^5.0.7` | Ticket ID generation |
| OpenAI SDK | `^6.32.0` | AI-first replies, AI reply suggestion, and urgency analysis |
| dotenv | `^16.4.5` | Environment configuration |
| cors | `^2.8.5` | Browser access control |

### Database

| Technology | Version | Purpose |
|---|---|---|
| PostgreSQL | recent version locally, `16` in CI | Persistent storage for tickets and replies |
| Raw SQL | project-level choice | Explicit schema and repository queries without an ORM |

### DevOps And Tooling

| Tooling | Version / detail | Purpose |
|---|---|---|
| Vitest | `^4.1.0` | Backend test runner |
| Supertest | `^7.2.2` | API integration tests |
| GitHub Actions | workflow in `.github/workflows/api-tests.yml` | CI for backend API tests |
| Vercel config | `client/vercel.json` | SPA rewrite support for frontend deployment |

## 🏗️ Architecture And Design

### Backend Pattern

The backend follows a layered feature-oriented structure:

```text
Routes -> Controllers -> Services -> Repositories -> PostgreSQL
```

- Routes define API endpoints and delegate work.
- Controllers translate HTTP requests and responses.
- Services enforce business rules, validation, and orchestration.
- Repositories isolate SQL queries and database reads/writes.

Replies are intentionally modeled inside the tickets feature instead of as a separate top-level module, because they only have meaning within a ticket conversation.

### Frontend Pattern

The frontend uses a flat-by-file-type structure:

```text
client/src/
  pages/        route-level screens
  components/   reusable UI and domain components
  hooks/        data-fetching and stateful logic
  api/          HTTP request functions
  schemas/      Zod form schemas
  lib/          utilities, theme, query client, reporting helpers
```

This keeps UI composition simple while separating routing, data access, validation, and reusable behavior cleanly.

### System Flow

```mermaid
flowchart LR
  customerUser["CustomerOrAgent"] --> frontend["ReactSPA"]
  frontend -->|"/api via Axios"| backend["ExpressAPI"]
  backend --> ticketsFeature["TicketsFeature"]
  backend --> productsFeature["ProductsFeature"]
  backend --> aiFeature["AIFeature"]
  ticketsFeature --> postgresDb["PostgreSQL"]
  productsFeature --> externalProducts["EscuelaJSProductsAPI"]
  aiFeature --> openAiService["OpenAI"]
```

### Notable Design Choices

- Ticket data is the persisted domain model; product catalog data is fetched from the external API and normalized in the backend.
- Product snapshot fields such as title, price, and image are stored with tickets so support workflows remain stable even if the upstream catalog changes.
- The products service validates image candidates and falls back to safe defaults to reduce UI breakage from external data issues.
- The dashboard report flow is intentionally client-side so exports do not require a separate reporting service.

## 📁 Project Structure

```text
Agilite_Home_Assignment/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── schemas/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vercel.json
├── server/
│   ├── db/
│   │   ├── init.sql
│   │   ├── init.js
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── features/
│   │   │   ├── ai/
│   │   │   ├── products/
│   │   │   └── tickets/
│   │   ├── middleware/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js `18+`
- npm
- PostgreSQL
- A local database client such as pgAdmin, `psql`, or TablePlus
- Optional: OpenAI API key if you want AI features enabled outside tests

For the smoothest experience, use Node `20` to match CI.

### 1. Clone The Repository

```bash
git clone <your-repo-url>
cd Agilite_Home_Assignment
```

### 2. Create The Databases

Create these PostgreSQL databases:

- `support_tickets`
- `support_tickets_test`

### 3. Create Environment Files

#### macOS / Linux

```bash
cp server/.env.example server/.env
cp server/.env.test.example server/.env.test
cp client/.env.example client/.env
```

#### PowerShell

```powershell
Copy-Item server/.env.example server/.env
Copy-Item server/.env.test.example server/.env.test
Copy-Item client/.env.example client/.env
```

### 4. Configure Environment Variables

Update `server/.env` and `server/.env.test` with your local PostgreSQL credentials. You can leave `client/.env` empty for local development if you want Vite to proxy `/api` requests to the backend.

### 5. Install Dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 6. Initialize And Seed The Database

```bash
cd server
npm run db:init
npm run db:seed
```

`db:init` executes `server/db/init.sql` through a Node script, so no `psql` CLI is required. `db:seed` inserts sample tickets and replies so the UI is useful immediately after startup.

### 7. Start The Application

#### Terminal 1: Backend API

```bash
cd server
npm run dev
```

Backend runs on `http://localhost:3001`.

#### Terminal 2: Frontend

```bash
cd client
npm run dev
```

Frontend runs on `http://localhost:5173`.

## 🔐 Environment Variables

### Server

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `DATABASE_URL` | Yes | `postgresql://postgres:postgres@localhost:5432/support_tickets` | Primary PostgreSQL connection |
| `PORT` | No | `3001` | Backend server port |
| `CLIENT_URL` | Yes for deployed frontend | `https://your-frontend-domain.vercel.app` | Allowed browser origin for CORS |
| `OPENAI_API_KEY` | Optional locally, required for AI features | `sk-...` | Enables AI-first replies, AI reply suggestions, and urgency scoring |

### Test Server

| Variable | Example | Purpose |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/support_tickets_test` | Test database connection |
| `PORT` | `3002` | Test server port |
| `CLIENT_URL` | `http://localhost:5173` | Test CORS origin |
| `OPENAI_API_KEY` | `test_key_not_used_in_mocked_tests` | Placeholder for mocked test runs |

### Client

| Variable | Required | Example | Purpose |
|---|---|---|---|
| `VITE_API_URL` | No for local dev | `https://your-api-domain.com` | Explicit API base URL in deployed environments |

Local development note:

- If `VITE_API_URL` is empty, the frontend uses same-origin requests and Vite proxies `/api` to `http://localhost:3001`.
- In production, set `VITE_API_URL` to your deployed API origin.

## ▶️ Usage

### Development

```bash
# Backend
cd server && npm run dev

# Frontend
cd client && npm run dev
```

### Production-Oriented Startup

```bash
cd server && npm start
```

Important caveat:

- `npm start` currently runs `db:init`, `db:seed`, and then starts the server.
- That makes it convenient for demo hosting, but it is not a safe long-term production pattern because it reseeds data on startup.

### Frontend Build

```bash
cd client
npm run build
npm run preview
```

### Backend Tests

```bash
cd server
npm test
```

Useful variants:

```bash
npm run test:watch
npm run test:api
```

## 🌐 API Documentation

Base path: `/api`

Common error shape:

```json
{ "error": "Ticket not found" }
```

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Confirms API availability and database connectivity |

### Tickets

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tickets` | List tickets; supports optional `?status=open` or `?status=closed` |
| `GET` | `/tickets/stats` | Return dashboard counts: `total`, `open`, `closed` |
| `GET` | `/tickets/:id` | Fetch a single ticket |
| `POST` | `/tickets` | Create a ticket |
| `PATCH` | `/tickets/:id/status` | Update ticket status |
| `DELETE` | `/tickets/:id` | Soft-delete a closed ticket |
| `GET` | `/tickets/:id/replies` | List replies for a ticket |
| `POST` | `/tickets/:id/replies` | Add a reply to a ticket |

#### Example: Create Ticket

```json
{
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "subject": "Package arrived damaged",
  "message": "The item arrived with a cracked corner.",
  "productId": 101,
  "productTitle": "Keyboard",
  "productPrice": 49,
  "productImage": "https://cdn.example.com/keyboard.png"
}
```

#### Example: Update Status

```json
{
  "status": "closed"
}
```

### Products

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | Fetch normalized products; supports optional `?limit=` |
| `GET` | `/products/:id` | Fetch a single product by ID |
| `GET` | `/products/meta` | Return cache and source metadata for products |

### AI

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/ai/suggest-reply` | Generate a suggested support reply for a ticket |
| `GET` | `/ai/urgent-feed` | Return urgency-ranked open tickets; supports optional `?limit=` |

#### AI First Replies

When a new ticket is created, the backend attempts a best-effort AI-generated first reply and stores it as a normal ticket reply authored by `AI Support Agent`.

- The ticket is still created successfully even if the AI provider is unavailable.
- The dashboard highlights open tickets that already received this first automated response in the `AI First Replies` section.

#### Example: Suggest Reply Request

```json
{
  "ticketId": "TKT-AI0001"
}
```

#### Example: Urgent Feed Item

```json
{
  "ticketId": "TKT-UF0001",
  "urgencyScore": 88,
  "reasonShort": "Customer may churn soon.",
  "ticketUrl": "/tickets/TKT-UF0001"
}
```

## 🧪 Testing

The application features a comprehensive test suite (55 tests) covering both the backend API and the frontend UI, ensuring stable happy paths and resilient edge-case handling.

### Backend Testing (Vitest + Supertest + PostgreSQL)

**Happy Paths:**
- Health endpoint and database connectivity.
- Ticket CRUD operations and status transition workflows.
- Reply workflows, ensuring proper linking to tickets.
- Products API fetching and caching behavior.
- AI reply suggestions and urgency-feed scoring.
- AI-first reply creation on new ticket submission, including fail-soft behavior when AI is unavailable.

**Edge Cases & Security (Advanced Coverage):**
- **Payload Validation:** Enforces strict upper-bound limits for names, subjects, and messages to prevent payload bloat, alongside email format validation.
- **State Machine Guards:** Prevents illegal state transitions, such as attempting to close a ticket that is already closed (returns `409 Conflict`) or replying to closed tickets.
- **External Service Failures:** Gracefully handles simulated timeouts, HTTP 500 errors, and malformed JSON from external dependencies (OpenAI and EscuelaJS) without crashing the server.

### Frontend Testing (Vitest + React Testing Library)

- Initialized frontend testing infrastructure.
- Integration coverage for `DashboardPage.jsx`, verifying that the Analytics strip correctly calculates and renders total, open, and closed ticket counts from mocked API responses.

### Test Setup Notes

- Tests load `server/.env.test`.
- Each worker gets its own PostgreSQL schema via `search_path`, which keeps parallel test runs completely isolated.
- The schema is automatically created from `server/db/init.sql` before the suite runs.
- External API dependencies (OpenAI and EscuelaJS) are strictly mocked in the test environment.

### CI/CD

GitHub Actions runs the backend suite on pushes to `main` and pull requests targeting `main`, using:
- Ubuntu runner
- Node `20`
- PostgreSQL `16`

## 🌟 What Goes Beyond The Brief

The assignment explicitly invites extra polish and creativity. This project adds several reviewer-visible upgrades beyond the baseline requirements:

| Enhancement | Why it matters |
|---|---|
| Analytics strip | Gives agents immediate operational visibility into ticket volume and status mix |
| Urgent AI queue | Adds triage support instead of only passive ticket browsing |
| AI-first replies | Gives agents an immediate automated first touch without blocking ticket creation |
| AI reply suggestions | Speeds agent response drafting and demonstrates real workflow augmentation |
| PDF/email/native sharing | Turns dashboard data into a usable reporting surface |
| Dark mode | Improves UX polish and usability |
| Product image normalization and fallback handling | Makes the app more resilient to inconsistent upstream product data |
| Soft-delete restriction for closed tickets | Introduces safer domain behavior than a naive destructive delete |
| CI-backed backend tests | Shows maintainability and delivery discipline beyond the minimum assignment brief |

## ⚖️ Trade-Offs And Known Limitations

- No authentication or authorization is implemented because the assignment explicitly did not require it.
- Reply authorship is application-driven and currently uses a fixed support-agent identity in the UI flow.
- The product catalog depends on `api.escuelajs.co`, so upstream outages or asset inconsistencies can affect product views.
- The dashboard does not yet implement pagination.
- `npm start` is demo-friendly but not production-safe because it initializes and reseeds data on startup.

## 🗺️ Future Roadmap

- Add authentication and role-aware support workflows for real multi-user usage.
- Introduce migrations and safer production bootstrapping instead of reseeding on startup.
- Add frontend automated tests for forms, routing, dashboard filters, and AI-assisted interactions.
- Add pagination, richer search, and audit history for higher ticket volume.

## 🤝 Support And Extension

This repository was built as an assignment submission, but it is structured to be extended. If you continue development, the safest next habit is:

- keep backend tests green with `cd server && npm test`
- treat the current seed/startup flow as demo infrastructure, not final production behavior
- preserve the layered backend separation between routes, services, and repositories

## 📌 Project Status

This is a complete assignment submission with working local setup, live deployment, backend CI coverage, and room for production hardening in future iterations.
