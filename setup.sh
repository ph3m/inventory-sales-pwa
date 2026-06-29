#!/bin/bash
# ShopOS — Full project scaffold script
# Run: bash setup.sh

set -e
PROJECT="inventory-pwa"

echo "🚀 Creating ShopOS project..."
mkdir -p $PROJECT
cd $PROJECT

# ─── Create all directories ────────────────────────────────────────────────────
mkdir -p \
  app/auth/login \
  app/dashboard/admin/shops \
  app/dashboard/admin/inventory \
  app/dashboard/admin/sales \
  app/dashboard/admin/reports \
  app/dashboard/admin/users \
  app/dashboard/admin/settings \
  app/dashboard/supervisor/shops \
  app/dashboard/supervisor/inventory \
  app/dashboard/supervisor/sales \
  app/dashboard/supervisor/reports \
  app/dashboard/worker/inventory \
  app/dashboard/worker/sales \
  app/api/admin/users \
  components/ui \
  components/layout \
  components/charts \
  components/dashboard \
  components/inventory \
  components/sales \
  components/shops \
  components/users \
  components/reports \
  components/settings \
  lib/supabase \
  store \
  types \
  public/icons \
  supabase/migrations

echo "✅ Directories created"

# ─── package.json ──────────────────────────────────────────────────────────────
cat > package.json << 'EOF'
{
  "name": "inventory-sales-pwa",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "@supabase/supabase-js": "^2.44.4",
    "@supabase/ssr": "^0.4.0",
    "zustand": "^4.5.4",
    "recharts": "^2.12.7",
    "lucide-react": "^0.414.0",
    "next-pwa": "^5.6.0",
    "date-fns": "^3.6.0",
    "jspdf": "^2.5.1",
    "jspdf-autotable": "^3.8.2",
    "papaparse": "^5.4.1",
    "react-hot-toast": "^2.4.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/papaparse": "^5.3.14",
    "tailwindcss": "^3.4.1",
    "postcss": "^8",
    "autoprefixer": "^10",
    "eslint": "^8",
    "eslint-config-next": "14.2.5"
  }
}
EOF

# ─── tsconfig.json ─────────────────────────────────────────────────────────────
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# ─── next.config.js ────────────────────────────────────────────────────────────
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});
const nextConfig = { reactStrictMode: true };
module.exports = withPWA(nextConfig);
EOF

# ─── tailwind.config.js ────────────────────────────────────────────────────────
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { 50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',300:'#a5b4fc',400:'#818cf8',500:'#6366f1',600:'#4f46e5',700:'#4338ca',800:'#3730a3',900:'#312e81',950:'#1e1b4b' },
      },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 20px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10), 0 8px 30px rgba(0,0,0,0.08)',
      },
      animation: { 'fade-in':'fadeIn 0.3s ease-in-out','slide-up':'slideUp 0.3s ease-out' },
      keyframes: {
        fadeIn:  { '0%':{ opacity:'0' },'100%':{ opacity:'1' } },
        slideUp: { '0%':{ transform:'translateY(10px)',opacity:'0' },'100%':{ transform:'translateY(0)',opacity:'1' } },
      },
    },
  },
  plugins: [],
};
EOF

# ─── postcss.config.js ─────────────────────────────────────────────────────────
cat > postcss.config.js << 'EOF'
module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
EOF

# ─── vercel.json ───────────────────────────────────────────────────────────────
cat > vercel.json << 'EOF'
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "headers": [
    { "source": "/sw.js", "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }] },
    { "source": "/(.*)", "headers": [{ "key": "X-Frame-Options", "value": "DENY" }] }
  ]
}
EOF

# ─── .gitignore ────────────────────────────────────────────────────────────────
cat > .gitignore << 'EOF'
node_modules/
.next/
out/
.env
.env.local
.env.*.local
public/sw.js
public/workbox-*.js
.DS_Store
*.tsbuildinfo
next-env.d.ts
.vercel
EOF

# ─── .env.example ──────────────────────────────────────────────────────────────
cat > .env.example << 'EOF'
# Supabase — Settings → API Keys
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_XXXXXXXXXXXXXXXXXXXX
SUPABASE_SERVICE_ROLE_KEY=sb_secret_XXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo "✅ Config files created"

# ─── types/index.ts ────────────────────────────────────────────────────────────
cat > types/index.ts << 'EOF'
export type Role = 'ADMIN' | 'SUPERVISOR' | 'WORKER';
export type UserStatus = 'active' | 'inactive';
export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'bank_transfer';
export type InventoryAction = 'added' | 'removed' | 'adjusted' | 'sale';

export interface DbUser {
  id: string; full_name: string; email: string; phone: string | null;
  role: Role; shop_id: string | null; status: UserStatus; created_at: string;
}
export interface DbShop { id: string; name: string; location: string; phone: string | null; created_at: string; }
export interface DbProduct {
  id: string; shop_id: string; name: string; category: string; description: string | null;
  buy_price: number; sell_price: number; quantity: number; min_stock: number;
  created_at: string; updated_at: string;
}
export interface DbSale { id: string; shop_id: string; worker_id: string; total_amount: number; payment_method: PaymentMethod; created_at: string; }
export interface DbSaleItem { id: string; sale_id: string; product_id: string; quantity: number; price: number; }
export interface DbInventoryLog { id: string; product_id: string; action: InventoryAction; quantity: number; note: string | null; performed_by: string; created_at: string; }
export interface UserWithShop extends DbUser { shops?: { name: string } | null; }
export interface ProductWithShop extends DbProduct { shops?: { name: string } | null; }
export interface SaleWithDetails extends DbSale { users?: { full_name: string } | null; shops?: { name: string } | null; sale_items?: SaleItemWithProduct[]; }
export interface SaleItemWithProduct extends DbSaleItem { products?: { name: string; category: string } | null; }
export interface CartItem { product: DbProduct; quantity: number; }
EOF

# ─── lib/utils.ts ──────────────────────────────────────────────────────────────
cat > lib/utils.ts << 'EOF'
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatCurrency(amount: number, currency = 'TZS') {
  return new Intl.NumberFormat('sw-TZ', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}
export function formatNumber(n: number) { return new Intl.NumberFormat().format(n); }
export function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr));
}
export function formatDateTime(dateStr: string) {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
}
export function isLowStock(quantity: number, minStock: number) { return quantity <= minStock; }
export function generateReceiptNumber() {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `RCP-${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}-${Math.floor(Math.random()*9000+1000)}`;
}
EOF

# ─── lib/supabase/client.ts ────────────────────────────────────────────────────
cat > lib/supabase/client.ts << 'EOF'
import { createBrowserClient } from '@supabase/ssr';
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
EOF

# ─── lib/supabase/server.ts ────────────────────────────────────────────────────
cat > lib/supabase/server.ts << 'EOF'
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll(cookiesToSet) { try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } }
  );
}
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll() { return []; }, setAll() {} } }
  );
}
EOF

# ─── store/auth.ts ─────────────────────────────────────────────────────────────
cat > store/auth.ts << 'EOF'
import { create } from 'zustand';
import { DbUser } from '@/types';
interface AuthState { user: DbUser | null; setUser: (user: DbUser | null) => void; isLoading: boolean; setLoading: (loading: boolean) => void; }
export const useAuthStore = create<AuthState>((set) => ({ user: null, setUser: (user) => set({ user }), isLoading: true, setLoading: (isLoading) => set({ isLoading }) }));
EOF

# ─── store/ui.ts ───────────────────────────────────────────────────────────────
cat > store/ui.ts << 'EOF'
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export interface AppNotification { id: string; type: 'success'|'warning'|'error'|'info'; title: string; message: string; read: boolean; created_at: string; }
interface UIState {
  theme: 'light'|'dark'; toggleTheme: () => void;
  sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void;
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification,'id'|'created_at'|'read'>) => void;
  markAllRead: () => void; unreadCount: () => number;
}
export const useUIStore = create<UIState>()(persist(
  (set, get) => ({
    theme: 'light', toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
    sidebarOpen: true, setSidebarOpen: (open) => set({ sidebarOpen: open }),
    notifications: [],
    addNotification: (n) => set((s) => ({ notifications: [{ ...n, id: crypto.randomUUID(), read: false, created_at: new Date().toISOString() }, ...s.notifications.slice(0,49)] })),
    markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
    unreadCount: () => get().notifications.filter((n) => !n.read).length,
  }),
  { name: 'ui-store', partialize: (s) => ({ theme: s.theme }) }
));
EOF

echo "✅ Core lib/store/types created"

# ─── middleware.ts ─────────────────────────────────────────────────────────────
cat > middleware.ts << 'EOF'
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return request.cookies.getAll(); }, setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value)); supabaseResponse = NextResponse.next({ request }); cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options)); } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  if (!user && !pathname.startsWith('/auth')) return NextResponse.redirect(new URL('/auth/login', request.url));
  if (user && pathname.startsWith('/auth')) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    return NextResponse.redirect(new URL(`/dashboard/${(profile?.role ?? 'WORKER').toLowerCase()}`, request.url));
  }
  if (user && pathname.startsWith('/dashboard')) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!profile) return NextResponse.redirect(new URL('/auth/login', request.url));
    const role = profile.role.toLowerCase();
    const segment = pathname.split('/')[2];
    if (segment && segment !== role) return NextResponse.redirect(new URL(`/dashboard/${role}`, request.url));
  }
  return supabaseResponse;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|workbox).*)'] };
EOF

# ─── public/manifest.json ──────────────────────────────────────────────────────
cat > public/manifest.json << 'EOF'
{
  "name": "ShopOS — Inventory & Sales",
  "short_name": "ShopOS",
  "description": "Multi-shop inventory and sales management system",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#4f46e5",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
EOF

echo "✅ Middleware + manifest created"

# ─── app/globals.css ───────────────────────────────────────────────────────────
cat > app/globals.css << 'EOF'
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root { --bg:#f8fafc; --surface:#ffffff; --border:#e2e8f0; --text-primary:#0f172a; --text-secondary:#475569; --text-muted:#94a3b8; }
  .dark { --bg:#0f172a; --surface:#1e293b; --border:#334155; --text-primary:#f1f5f9; --text-secondary:#94a3b8; --text-muted:#475569; }
  body { @apply bg-[var(--bg)] text-[var(--text-primary)] font-sans antialiased; transition: background-color 0.2s, color 0.2s; }
}
@layer components {
  .card { @apply bg-[var(--surface)] rounded-2xl shadow-card border border-[var(--border)] p-6; transition: box-shadow 0.2s; }
  .card:hover { @apply shadow-card-hover; }
  .stat-card { @apply card flex items-start gap-4; }
  .btn { @apply inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed; }
  .btn-primary   { @apply btn bg-brand-600 hover:bg-brand-700 text-white shadow-sm; }
  .btn-secondary { @apply btn bg-[var(--surface)] hover:bg-slate-100 dark:hover:bg-slate-700 text-[var(--text-primary)] border border-[var(--border)]; }
  .btn-danger    { @apply btn bg-red-600 hover:bg-red-700 text-white; }
  .btn-ghost     { @apply btn hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-secondary)]; }
  .input { @apply w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all duration-150; }
  .input-label { @apply block text-sm font-medium text-[var(--text-secondary)] mb-1.5; }
  .badge { @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold; }
  .table-wrapper { @apply overflow-x-auto rounded-2xl border border-[var(--border)]; }
  .table { @apply min-w-full divide-y divide-[var(--border)]; }
  .table th { @apply bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider text-left; }
  .table td { @apply px-4 py-3.5 text-sm text-[var(--text-secondary)] bg-[var(--surface)]; }
  .table tr:hover td { @apply bg-slate-50 dark:bg-slate-800/30; }
  .nav-item { @apply flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-150 cursor-pointer; }
  .nav-item.active { @apply bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300; }
  .skeleton { @apply animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl; }
  ::-webkit-scrollbar { @apply w-1.5 h-1.5; }
  ::-webkit-scrollbar-thumb { @apply bg-slate-300 dark:bg-slate-600 rounded-full; }
}
@layer utilities {
  .text-primary { color: var(--text-primary); }
  .text-secondary { color: var(--text-secondary); }
  .text-muted { color: var(--text-muted); }
  .bg-surface { background: var(--surface); }
  .bg-app { background: var(--bg); }
  .border-default { border-color: var(--border); }
}
EOF

# ─── app/layout.tsx ────────────────────────────────────────────────────────────
cat > app/layout.tsx << 'EOF'
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'ShopOS — Inventory & Sales Management',
  description: 'Modern multi-shop inventory and sales management system',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'ShopOS' },
};
export const viewport: Viewport = { themeColor: '#4f46e5', width: 'device-width', initialScale: 1, maximumScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="icon" href="/icons/icon-192x192.png" /></head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ className: '!bg-[var(--surface)] !text-[var(--text-primary)] !shadow-card !border !border-[var(--border)] !rounded-xl !text-sm', duration: 4000 }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
EOF

cat > app/page.tsx << 'EOF'
import { redirect } from 'next/navigation';
export default function HomePage() { redirect('/auth/login'); }
EOF

echo "✅ App root files created"

# ─── app/auth ──────────────────────────────────────────────────────────────────
cat > app/auth/layout.tsx << 'EOF'
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
EOF

cat > app/auth/login/page.tsx << 'EOF'
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Boxes, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
      toast.success('Welcome back!');
      router.push(`/dashboard/${(profile?.role ?? 'WORKER').toLowerCase()}`);
    }
    setLoading(false);
  };

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl animate-slide-up">
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Boxes className="text-white" size={24} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">ShopOS</h1>
          <p className="text-sm text-slate-400 mt-1">Inventory &amp; Sales Management</p>
        </div>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className="w-full px-3 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/60" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-3 py-2.5 pr-10 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400/60" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mt-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all shadow-lg disabled:opacity-60">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-center text-xs text-slate-500 mt-6">Contact your administrator for account access</p>
    </div>
  );
}
EOF

echo "✅ Auth pages created"

# ─── app/dashboard layout ──────────────────────────────────────────────────────
cat > app/dashboard/layout.tsx << 'EOF'
import { AuthProvider } from '@/components/layout/AuthProvider';
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
EOF

echo "✅ Dashboard layout created"

# ─── components/layout ─────────────────────────────────────────────────────────
cat > components/layout/ThemeProvider.tsx << 'EOF'
'use client';
import { useEffect } from 'react';
import { useUIStore } from '@/store/ui';
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((s) => s.theme);
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  return <>{children}</>;
}
EOF

cat > components/layout/AuthProvider.tsx << 'EOF'
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth';
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const router = useRouter();
  const supabase = createClient();
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single(); setUser(profile); }
      setLoading(false);
    };
    init();
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') { setUser(null); router.push('/auth/login'); }
      if (event === 'SIGNED_IN' && session) { const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).single(); setUser(profile); }
    });
    return () => listener.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <>{children}</>;
}
EOF

cat > components/layout/DashboardShell.tsx << 'EOF'
'use client';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { BottomNav } from './BottomNav';
export function DashboardShell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="min-h-screen bg-app">
      <Sidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <TopNav title={title} />
        <main className="p-4 lg:p-6 pb-24 lg:pb-8 animate-fade-in">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
EOF

cat > components/layout/NotificationPanel.tsx << 'EOF'
'use client';
import { useUIStore } from '@/store/ui';
import { Bell, X, CheckCheck } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
const typeColors: Record<string, string> = { success:'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', warning:'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', error:'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', info:'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400' };
export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markAllRead } = useUIStore();
  return (
    <div className="absolute right-0 top-full mt-2 w-80 card p-0 overflow-hidden animate-fade-in z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h3>
        <div className="flex gap-1">
          <button onClick={markAllRead} className="btn-ghost p-1.5 text-xs flex items-center gap-1"><CheckCheck size={14} />All read</button>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={14} /></button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-[var(--text-muted)]"><Bell size={24} /><p className="text-sm">No notifications yet</p></div>
        ) : notifications.map((n) => (
          <div key={n.id} className={cn('px-4 py-3', !n.read && 'bg-brand-50/50 dark:bg-brand-900/10')}>
            <div className="flex items-start gap-3">
              <span className={cn('badge mt-0.5 text-[10px] flex-shrink-0', typeColors[n.type])}>{n.type}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--text-primary)] text-xs">{n.title}</p>
                <p className="text-[var(--text-muted)] text-xs mt-0.5 truncate">{n.message}</p>
                <p className="text-[var(--text-muted)] text-[10px] mt-1">{formatDateTime(n.created_at)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
EOF

echo "✅ Layout components created (part 1)"

# Sidebar, TopNav, BottomNav written as separate files for clarity
cat > components/layout/Sidebar.tsx << 'SEOF'
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { LayoutDashboard, Store, Package, ShoppingCart, BarChart3, Users, Settings, X, ChevronRight, Boxes } from 'lucide-react';

const NAV = [
  { label:'Dashboard', href:'',           icon:LayoutDashboard, roles:['ADMIN','SUPERVISOR','WORKER'] },
  { label:'Shops',     href:'/shops',     icon:Store,           roles:['ADMIN','SUPERVISOR'] },
  { label:'Inventory', href:'/inventory', icon:Package,         roles:['ADMIN','SUPERVISOR','WORKER'] },
  { label:'Sales',     href:'/sales',     icon:ShoppingCart,    roles:['ADMIN','SUPERVISOR','WORKER'] },
  { label:'Reports',   href:'/reports',   icon:BarChart3,       roles:['ADMIN','SUPERVISOR'] },
  { label:'Users',     href:'/users',     icon:Users,           roles:['ADMIN'] },
  { label:'Settings',  href:'/settings',  icon:Settings,        roles:['ADMIN'] },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const pathname = usePathname();
  if (!user) return null;
  const base = `/dashboard/${user.role.toLowerCase()}`;
  const filtered = NAV.filter((i) => i.roles.includes(user.role));
  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={cn('fixed top-0 left-0 z-30 h-full w-64 flex flex-col bg-[var(--surface)] border-r border-[var(--border)] transition-transform duration-300 lg:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center"><Boxes size={18} className="text-white" /></div>
            <span className="text-base font-bold text-[var(--text-primary)]">ShopOS</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="btn-ghost p-1.5 lg:hidden"><X size={18} /></button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Navigation</p>
          {filtered.map((item) => {
            const href = `${base}${item.href}`;
            const isActive = item.href === '' ? pathname === base : pathname.startsWith(href);
            return (
              <Link key={item.label} href={href} onClick={() => setSidebarOpen(false)} className={cn('nav-item group', isActive && 'active')}>
                <item.icon size={18} className={cn('flex-shrink-0', isActive && 'text-brand-600 dark:text-brand-400')} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight size={14} className="text-brand-500" />}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-brand-700 dark:text-brand-300">{user.full_name?.[0]?.toUpperCase() ?? 'U'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.full_name}</p>
              <p className="text-xs text-[var(--text-muted)]">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
SEOF

cat > components/layout/TopNav.tsx << 'TEOF'
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { createClient } from '@/lib/supabase/client';
import { NotificationPanel } from './NotificationPanel';
import toast from 'react-hot-toast';

export function TopNav({ title }: { title?: string }) {
  const { setUser } = useAuthStore();
  const { theme, toggleTheme, setSidebarOpen, unreadCount } = useUIStore();
  const [showNotifs, setShowNotifs] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); toast.success('Signed out'); router.push('/auth/login'); };
  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 px-4 lg:px-6 h-16 bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-2 lg:hidden"><Menu size={20} /></button>
      <h1 className="text-lg font-semibold text-[var(--text-primary)] hidden sm:block">{title ?? 'Dashboard'}</h1>
      <div className="flex-1" />
      <button onClick={toggleTheme} className="btn-ghost p-2">{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
      <div className="relative">
        <button onClick={() => setShowNotifs(!showNotifs)} className="btn-ghost p-2 relative">
          <Bell size={18} />
          {unreadCount() > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
        </button>
        {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
      </div>
      <button onClick={handleLogout} className="btn-ghost p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><LogOut size={18} /></button>
    </header>
  );
}
TEOF

cat > components/layout/BottomNav.tsx << 'BNEOF'
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Users } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
const NAV = [
  { label:'Home',      href:'',           icon:LayoutDashboard, roles:['ADMIN','SUPERVISOR','WORKER'] },
  { label:'Inventory', href:'/inventory', icon:Package,         roles:['ADMIN','SUPERVISOR','WORKER'] },
  { label:'Sales',     href:'/sales',     icon:ShoppingCart,    roles:['ADMIN','SUPERVISOR','WORKER'] },
  { label:'Reports',   href:'/reports',   icon:BarChart3,       roles:['ADMIN','SUPERVISOR'] },
  { label:'Users',     href:'/users',     icon:Users,           roles:['ADMIN'] },
];
export function BottomNav() {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();
  if (!user) return null;
  const base = `/dashboard/${user.role.toLowerCase()}`;
  const items = NAV.filter((i) => i.roles.includes(user.role));
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 lg:hidden bg-[var(--surface)]/90 backdrop-blur-md border-t border-[var(--border)] flex items-center justify-around px-2 py-1">
      {items.map((item) => {
        const href = `${base}${item.href}`;
        const isActive = item.href === '' ? pathname === base : pathname.startsWith(href);
        return (
          <Link key={item.label} href={href} className={cn('flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl text-[10px] font-medium transition-all', isActive ? 'text-brand-600 dark:text-brand-400' : 'text-[var(--text-muted)]')}>
            <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
BNEOF

echo "✅ Sidebar/TopNav/BottomNav created"

# ─── components/ui ─────────────────────────────────────────────────────────────
cat > components/ui/StatCard.tsx << 'EOF'
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
interface StatCardProps { title: string; value: string|number; icon: React.ElementType; iconColor?: 'brand'|'green'|'amber'|'red'|'purple'; change?: number; changeLabel?: string; className?: string; }
const iconStyles: Record<string,string> = { brand:'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400', green:'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400', amber:'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400', red:'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', purple:'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' };
export function StatCard({ title, value, icon: Icon, iconColor='brand', change, changeLabel, className }: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  return (
    <div className={cn('stat-card animate-slide-up', className)}>
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0', iconStyles[iconColor])}><Icon size={21} /></div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted truncate">{title}</p>
        <p className="text-2xl font-bold text-primary mt-0.5 truncate">{value}</p>
        {change !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs mt-1 font-medium', isPositive?'text-emerald-600':isNegative?'text-red-500':'text-muted')}>
            {isPositive?<TrendingUp size={13}/>:isNegative?<TrendingDown size={13}/>:<Minus size={13}/>}
            <span>{Math.abs(change).toFixed(1)}%</span>
            {changeLabel&&<span className="font-normal text-muted">{changeLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
EOF

cat > components/ui/Badge.tsx << 'EOF'
import { cn } from '@/lib/utils';
const variants: Record<string,string> = { default:'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', success:'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', warning:'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', error:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', info:'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400', purple:'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
export function Badge({ children, variant='default', className }: { children: React.ReactNode; variant?: string; className?: string }) {
  return <span className={cn('badge', variants[variant], className)}>{children}</span>;
}
EOF

cat > components/ui/Modal.tsx << 'EOF'
'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
const sizes = { sm:'max-w-sm', md:'max-w-md', lg:'max-w-lg', xl:'max-w-2xl' };
export function Modal({ open, onClose, title, children, size='md', footer }: { open:boolean; onClose:()=>void; title:string; children:React.ReactNode; size?:'sm'|'md'|'lg'|'xl'; footer?:React.ReactNode }) {
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative w-full bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] animate-slide-up', sizes[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)]">{footer}</div>}
      </div>
    </div>
  );
}
EOF

cat > components/ui/ConfirmDialog.tsx << 'EOF'
'use client';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel='Confirm', danger=false, loading=false }: { open:boolean; onClose:()=>void; onConfirm:()=>void; title:string; message:string; confirmLabel?:string; danger?:boolean; loading?:boolean }) {
  return (
    <Modal open={open} onClose={onClose} title="" size="sm" footer={<><button onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button><button onClick={onConfirm} className={danger?'btn-danger':'btn-primary'} disabled={loading}>{loading?'Processing…':confirmLabel}</button></>}>
      <div className="flex flex-col items-center gap-3 text-center py-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${danger?'bg-red-100 dark:bg-red-900/30':'bg-amber-100 dark:bg-amber-900/30'}`}><AlertTriangle size={22} className={danger?'text-red-600':'text-amber-600'} /></div>
        <div><p className="text-base font-semibold text-[var(--text-primary)]">{title}</p><p className="text-sm text-[var(--text-secondary)] mt-1">{message}</p></div>
      </div>
    </Modal>
  );
}
EOF

cat > components/ui/EmptyState.tsx << 'EOF'
import { cn } from '@/lib/utils';
export function EmptyState({ icon: Icon, title, description, action, className }: { icon:React.ElementType; title:string; description?:string; action?:React.ReactNode; className?:string }) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Icon size={28} className="text-[var(--text-muted)]" /></div>
      <div><p className="text-base font-semibold text-[var(--text-primary)]">{title}</p>{description&&<p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">{description}</p>}</div>
      {action}
    </div>
  );
}
EOF

cat > components/ui/SearchInput.tsx << 'EOF'
'use client';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
export function SearchInput({ value, onChange, placeholder='Search…', className }: { value:string; onChange:(v:string)=>void; placeholder?:string; className?:string }) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search size={16} className="absolute left-3 text-[var(--text-muted)] pointer-events-none" />
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input pl-9 pr-8" />
      {value && <button onClick={() => onChange('')} className="absolute right-3 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"><X size={14} /></button>}
    </div>
  );
}
EOF

cat > components/ui/Spinner.tsx << 'EOF'
import { cn } from '@/lib/utils';
export function Spinner({ className }: { className?: string }) { return <div className={cn('inline-block border-2 border-current border-t-transparent rounded-full animate-spin w-5 h-5', className)} />; }
export function PageLoader() { return <div className="flex items-center justify-center min-h-[60vh]"><Spinner className="w-8 h-8 text-brand-500" /></div>; }
EOF

echo "✅ UI components created"

# The large feature components (InventoryClient, SalesClient, etc.) are referenced
# from the chat above — copy them from the conversation into these paths:
echo ""
echo "⚠️  ACTION REQUIRED: Copy the following large components from the chat:"
echo "   → components/inventory/InventoryClient.tsx"
echo "   → components/sales/SalesClient.tsx"
echo "   → components/shops/ShopsClient.tsx"
echo "   → components/users/UsersClient.tsx"
echo "   → components/reports/ReportsClient.tsx"
echo "   → components/settings/SettingsClient.tsx"
echo "   → components/charts/AdminCharts.tsx"
echo "   → components/dashboard/RecentSalesTable.tsx"
echo "   → components/dashboard/LowStockAlert.tsx"
echo "   → components/dashboard/LowStockAlertWorker.tsx"
echo "   → All app/dashboard/admin/*.tsx pages"
echo "   → All app/dashboard/supervisor/*.tsx pages"
echo "   → All app/dashboard/worker/*.tsx pages"
echo "   → app/api/admin/users/route.ts"
echo ""
echo "✅ Setup script complete!"
echo ""
echo "Next steps:"
echo "  1. Copy remaining components listed above from the chat"
echo "  2. cp .env.example .env.local  →  fill in your Supabase keys"
echo "  3. npm install"
echo "  4. npm run dev"
