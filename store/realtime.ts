import { create } from 'zustand';
import { DbProduct, DbSale, SaleWithDetails } from '@/types';

interface RealtimeState {
  // ── Products ──────────────────────────────────────────────
  products: DbProduct[];
  setProducts: (products: DbProduct[]) => void;
  upsertProduct: (product: DbProduct) => void;
  deactivateProduct: (id: string) => void;

  // ── Sales ─────────────────────────────────────────────────
  sales: SaleWithDetails[];
  setSales: (sales: SaleWithDetails[]) => void;
  prependSale: (sale: SaleWithDetails) => void;

  // ── Dashboard counters (derived, kept in sync) ────────────
  todayRevenue: number;
  todayTransactions: number;
  monthRevenue: number;
  lowStockCount: number;

  setTodayRevenue: (v: number | ((prev: number) => number)) => void;
  setTodayTransactions: (v: number | ((prev: number) => number)) => void;
  setMonthRevenue: (v: number | ((prev: number) => number)) => void;
  setLowStockCount: (v: number) => void;

  // ── Subscription status ───────────────────────────────────
  connected: boolean;
  setConnected: (v: boolean) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  products: [],
  setProducts: (products) => set({
    products: products.filter((p) => p.is_active !== false),
    lowStockCount: products.filter((p) =>
      p.is_active !== false && !p.hide_from_alerts &&
      (p.quantity === 0 || p.quantity <= p.min_stock)
    ).length,
  }),
  upsertProduct: (product) =>
    set((s) => {
      // If the product was soft-deleted, remove it from the store
      if (product.is_active === false) {
        const products = s.products.filter((p) => p.id !== product.id);
        const lowStockCount = products.filter((p) =>
          !p.hide_from_alerts && (p.quantity === 0 || p.quantity <= p.min_stock)
        ).length;
        return { products, lowStockCount };
      }
      const exists = s.products.find((p) => p.id === product.id);
      const products = exists
        ? s.products.map((p) => (p.id === product.id ? product : p))
        : [product, ...s.products];
      const lowStockCount = products.filter((p) =>
        !p.hide_from_alerts && (p.quantity === 0 || p.quantity <= p.min_stock)
      ).length;
      return { products, lowStockCount };
    }),
  deactivateProduct: (id) =>
    set((s) => {
      const products = s.products.filter((p) => p.id !== id);
      const lowStockCount = products.filter((p) =>
        !p.hide_from_alerts && (p.quantity === 0 || p.quantity <= p.min_stock)
      ).length;
      return { products, lowStockCount };
    }),

  sales: [],
  setSales: (sales) => set({ sales }),
  prependSale: (sale) =>
    set((s) => {
      const sales = [sale, ...s.sales].slice(0, 100);
      return { sales };
    }),

  todayRevenue: 0,
  todayTransactions: 0,
  monthRevenue: 0,
  lowStockCount: 0,

  setTodayRevenue: (v) => set((s) => ({ todayRevenue: typeof v === 'function' ? v(s.todayRevenue) : v })),
  setTodayTransactions: (v) => set((s) => ({ todayTransactions: typeof v === 'function' ? v(s.todayTransactions) : v })),
  setMonthRevenue: (v) => set((s) => ({ monthRevenue: typeof v === 'function' ? v(s.monthRevenue) : v })),
  setLowStockCount: (v) => set({ lowStockCount: v }),

  connected: false,
  setConnected: (v) => set({ connected: v }),
}));
