'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeStore } from '@/store/realtime';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { DbProduct, SaleWithDetails } from '@/types';
import { startOfDay, startOfMonth } from 'date-fns';
import { isLowStock } from '@/lib/utils';

/**
 * Opens Supabase Realtime subscriptions for:
 *  - products  (INSERT / UPDATE / DELETE)
 *  - sales     (INSERT)
 *  - sale_items (INSERT — used to hydrate sale detail)
 *
 * All changes are pushed into useRealtimeStore so every
 * component re-renders immediately without a page reload.
 *
 * Pass shopId to scope worker subscriptions to their shop.
 */
export function useRealtimeSync(shopId?: string | null) {
  const supabase       = createClient();
  const user           = useAuthStore((s) => s.user);
  const addNotification = useUIStore((s) => s.addNotification);
  const {
    setProducts, upsertProduct, removeProduct,
    setSales, prependSale,
    setTodayRevenue, setTodayTransactions,
    setMonthRevenue, setLowStockCount,
    setConnected,
  } = useRealtimeStore();

  // Track channels so we can remove them on unmount
  const channelsRef = useRef<ReturnType<typeof supabase.channel>[]>([]);

  // ── Initial data load ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const loadInitialData = async () => {
      const today      = startOfDay(new Date()).toISOString();
      const monthStart = startOfMonth(new Date()).toISOString();

      // Build product query — scope by shop for workers, always filter active only
      const productQuery = supabase.from('products').select('*, shops(name)').eq('is_active', true).order('name');
      if (shopId) productQuery.eq('shop_id', shopId);

      // Build sales queries
      const todaySalesQ = supabase.from('sales').select('total_amount').gte('created_at', today);
      const monthSalesQ = supabase.from('sales').select('total_amount').gte('created_at', monthStart);
      const recentSalesQ = supabase
        .from('sales')
        .select('*, users(full_name), shops(name), sale_items(*, products(name))')
        .order('created_at', { ascending: false })
        .limit(50);
      if (shopId) {
        todaySalesQ.eq('shop_id', shopId);
        monthSalesQ.eq('shop_id', shopId);
        recentSalesQ.eq('shop_id', shopId);
      }

      const [
        { data: products },
        { data: todaySales },
        { data: monthSales },
        { data: recentSales },
      ] = await Promise.all([productQuery, todaySalesQ, monthSalesQ, recentSalesQ]);

      if (products)     setProducts(products);
      if (recentSales)  setSales(recentSales as SaleWithDetails[]);

      const todayRev  = (todaySales  ?? []).reduce((s, r) => s + r.total_amount, 0);
      const monthRev  = (monthSales  ?? []).reduce((s, r) => s + r.total_amount, 0);
      const lowCount  = (products    ?? []).filter((p) => isLowStock(p.quantity, p.min_stock)).length;

      setTodayRevenue(todayRev);
      setTodayTransactions(todaySales?.length ?? 0);
      setMonthRevenue(monthRev);
      setLowStockCount(lowCount);
    };

    loadInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, shopId]);

  // ── Realtime subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    // ── Products channel ─────────────────────────────────────
    const productFilter = shopId
      ? `shop_id=eq.${shopId}`
      : undefined;

    const productChannel = supabase
      .channel('realtime:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products', filter: productFilter },
        async (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const raw = payload.new as DbProduct;

            // Re-fetch with shop name join so the store always has full data
            const { data: product } = await supabase
              .from('products')
              .select('*, shops(name)')
              .eq('id', raw.id)
              .single();

            if (!product) return;
            upsertProduct(product as DbProduct);

            // Fire low-stock notification
            if (isLowStock(product.quantity, product.min_stock)) {
              addNotification({
                type: product.quantity === 0 ? 'error' : 'warning',
                title: product.quantity === 0 ? 'Out of stock' : 'Low stock alert',
                message: `${product.name} — ${product.quantity} unit${product.quantity !== 1 ? 's' : ''} remaining`,
              });
            }
          }
          if (payload.eventType === 'DELETE') {
            removeProduct((payload.old as DbProduct).id);
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    // ── Sales channel ────────────────────────────────────────
    const saleFilter = shopId ? `shop_id=eq.${shopId}` : undefined;

    const salesChannel = supabase
      .channel('realtime:sales')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sales', filter: saleFilter },
        async (payload) => {
          const newSale = payload.new as SaleWithDetails;

          // Fetch full sale details (with joins) for the table
          const { data: fullSale } = await supabase
            .from('sales')
            .select('*, users(full_name), shops(name), sale_items(*, products(name))')
            .eq('id', newSale.id)
            .single();

          if (fullSale) {
            prependSale(fullSale as SaleWithDetails);
            addNotification({
              type: 'success',
              title: 'New sale recorded',
              message: `TZS ${fullSale.total_amount.toLocaleString()} — ${fullSale.shops?.name ?? ''}`,
            });
          }

          // Update today's counters live
          setTodayRevenue((prev) => prev + newSale.total_amount);
          setTodayTransactions((prev) => prev + 1);
          setMonthRevenue((prev) => prev + newSale.total_amount);
        }
      )
      .subscribe();

    channelsRef.current = [productChannel, salesChannel];

    // Cleanup on unmount
    return () => {
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
      channelsRef.current = [];
      setConnected(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, shopId]);
}
