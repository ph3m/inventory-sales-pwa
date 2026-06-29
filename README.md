# Mary Shop — Inventory & Sales Management PWA

A production-ready, multi-shop inventory and sales management Progressive Web App built with **Next.js 14**, **Supabase**, **Tailwind CSS**, and **Recharts**.

---

## ✨ Features

- **Multi-shop** — manage unlimited branches from one platform
- **Three-tier roles** — Admin (full control), Supervisor (read-only), Worker (shop-scoped)
- **Inventory management** — add/edit/delete products, stock adjustments, low-stock alerts
- **Point of sale** — cart-based POS, receipt generation, multiple payment methods
- **Analytics & reports** — revenue/profit charts, top products, CSV export
- **Row Level Security** — Supabase RLS enforces strict data isolation per role and shop
- **PWA** — installable on mobile, offline-capable, bottom navigation on mobile
- **Dark / Light mode** — toggle with persistence
- **No product images** — lean, fast, storage-free inventory

---

## 🗂 Project Structure

```
inventory-pwa/
├── app/
│   ├── auth/login/                   # Login page
│   ├── dashboard/
│   │   ├── admin/                    # Admin dashboard + shops/inventory/sales/reports/users/settings
│   │   ├── supervisor/               # Read-only views: dashboard/shops/inventory/sales/reports
│   │   └── worker/                   # Shop-scoped: dashboard/inventory/sales
│   ├── api/admin/users/              # Server-side user creation (uses service role key)
│   ├── layout.tsx                    # Root layout with ThemeProvider + Toaster
│   └── globals.css                   # Tailwind + custom design tokens
├── components/
│   ├── layout/                       # Sidebar, TopNav, BottomNav, DashboardShell, AuthProvider
│   ├── ui/                           # StatCard, Badge, Modal, ConfirmDialog, Spinner, EmptyState, SearchInput
│   ├── charts/                       # AdminCharts (Recharts)
│   ├── dashboard/                    # RecentSalesTable, LowStockAlert, LowStockAlertWorker
│   ├── inventory/                    # InventoryClient (full CRUD + stock adjust)
│   ├── sales/                        # SalesClient (POS cart + history + receipt)
│   ├── shops/                        # ShopsClient (CRUD)
│   ├── users/                        # UsersClient (CRUD + toggle status)
│   ├── reports/                      # ReportsClient (charts + CSV export)
│   └── settings/                     # SettingsClient (profile + theme)
├── lib/
│   ├── supabase/client.ts            # Browser Supabase client
│   ├── supabase/server.ts            # Server + admin Supabase clients
│   └── utils.ts                      # formatCurrency, formatDate, isLowStock, etc.
├── store/
│   ├── auth.ts                       # Zustand auth store
│   └── ui.ts                         # Zustand UI store (theme, notifications, sidebar)
├── types/index.ts                    # All TypeScript interfaces
├── middleware.ts                     # Auth guard + role-based route protection
├── supabase/migrations/
│   └── 001_initial_schema.sql        # Full DB schema + RLS policies
├── public/manifest.json              # PWA manifest
├── next.config.js                    # Next.js + next-pwa config
├── tailwind.config.js
├── .env.example                      # Environment variable template
└── vercel.json                       # Vercel deployment config
```

---

## 🚀 Quick Start

### Step 1 — Install dependencies

```bash
cd inventory-pwa
npm install
```

### Step 2 — Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. In the dashboard, go to **SQL Editor** and paste the entire contents of:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
   Then click **Run**.

### Step 3 — Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```env
# From Supabase Dashboard → Settings → API Keys
# Your project URL is in the browser address bar:
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co

# "Publishable key" (new UI) or "anon" key (Legacy tab)
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_XXXXXXXXXXXX

# "Secret key" (new UI) or "service_role" key (Legacy tab)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_XXXXXXXXXXXX

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Finding your keys:** Go to Supabase Dashboard → **Settings → API Keys**.
> - **Publishable key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
> - **Secret key** (scroll down) → `SUPABASE_SERVICE_ROLE_KEY`
> - **URL** → visible in the browser address bar as `https://xxxxxx.supabase.co`

### Step 4 — Create your first Admin user

1. In Supabase Dashboard → **Authentication → Users** → click **Add user**
2. Enter an email and password, click **Create user**
3. Copy the **UUID** of the new user
4. In **SQL Editor**, run:

```sql
INSERT INTO users (id, full_name, email, role, status)
VALUES (
  'paste-the-uuid-here',
  'Your Name',
  'your@email.com',
  'ADMIN',
  'active'
);
```

### Step 5 — Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

---

## 👤 User Roles

| Feature | Admin | Supervisor | Worker |
|---------|:-----:|:----------:|:------:|
| Manage shops | ✅ | 👁 view only | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| Manage inventory | ✅ | 👁 view only | ✅ own shop |
| Create sales | ✅ | ❌ | ✅ own shop |
| View reports | ✅ | ✅ | ❌ |
| System settings | ✅ | ❌ | ❌ |

---

## ☁️ Deploy to Vercel

### Option A — Vercel Dashboard (recommended)

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel --prod
```

---

## 📱 PWA Icons

Place two PNG icons in `public/icons/`:

```
public/icons/icon-192x192.png   ← 192×192 px
public/icons/icon-512x512.png   ← 512×512 px
```

Generate them at [realfavicongenerator.net](https://realfavicongenerator.net) from your logo.

---

## 🗄 Database Schema

```
shops          id, name, location, phone, created_at
users          id, full_name, email, phone, role, shop_id, status, created_at
products       id, shop_id, name, category, description, buy_price, sell_price, quantity, min_stock, created_at, updated_at
sales          id, shop_id, worker_id, total_amount, payment_method, created_at
sale_items     id, sale_id, product_id, quantity, price
inventory_logs id, product_id, action, quantity, note, performed_by, created_at
```

> **Note:** Products have no `image` column — intentionally omitted for a lean, fast system.

---

## 🔒 RLS Summary

| Table | Admin | Supervisor | Worker |
|-------|-------|------------|--------|
| shops | ALL | SELECT | SELECT |
| users | ALL | SELECT | SELECT own + UPDATE own |
| products | ALL | SELECT | ALL (own shop only) |
| sales | ALL | SELECT | SELECT + INSERT (own shop) |
| sale_items | ALL | SELECT | SELECT + INSERT (own shop) |
| inventory_logs | ALL | SELECT | SELECT + INSERT (own shop) |

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router, TypeScript) |
| UI | Tailwind CSS with custom design system |
| Database / Auth | Supabase (PostgreSQL + RLS) |
| State | Zustand |
| Charts | Recharts |
| Icons | Lucide React |
| PWA | next-pwa + Service Workers |
| Deployment | Vercel |

---

## 📄 License

MIT — free to use and adapt for commercial projects.
