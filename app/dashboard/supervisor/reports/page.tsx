import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ReportsClient } from '@/components/reports/ReportsClient';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export default async function SupervisorReportsPage() {
  const supabase   = createClient();
  const now        = new Date();
  const monthStart = startOfMonth(now).toISOString();
  const monthEnd   = endOfMonth(now).toISOString();

  // Fetch monthly sales with all nested data in one query
  const { data: monthlySales } = await supabase
    .from('sales')
    .select('id, total_amount, created_at, sale_items(quantity, price, product_id, products(name, buy_price))')
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd)
    .order('created_at', { ascending: true });

  // Build daily chart data
  const dailyMap: Record<string, { revenue: number; profit: number; transactions: number }> = {};
  const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};

  (monthlySales ?? []).forEach((sale) => {
    const day = format(new Date(sale.created_at), 'MMM dd');
    if (!dailyMap[day]) dailyMap[day] = { revenue: 0, profit: 0, transactions: 0 };
    dailyMap[day].revenue      += sale.total_amount;
    dailyMap[day].transactions += 1;

    (sale.sale_items ?? []).forEach((item: any) => {
      const buyPrice = item.products?.buy_price ?? 0;
      const profit   = (item.price - buyPrice) * item.quantity;
      dailyMap[day].profit += profit;

      // Build top products from sale_items
      const name = item.products?.name ?? 'Unknown';
      if (!productMap[name]) productMap[name] = { name, qty: 0, revenue: 0 };
      productMap[name].qty     += item.quantity;
      productMap[name].revenue += item.price * item.quantity;
    });
  });

  const dailyData      = Object.entries(dailyMap).map(([date, d]) => ({ date, ...d }));
  const topProductsData = Object.values(productMap).sort((a, b) => b.qty - a.qty).slice(0, 10);
  const totalRevenue   = (monthlySales ?? []).reduce((s, r) => s + r.total_amount, 0);

  return (
    <DashboardShell title="Reports">
      <ReportsClient
        dailyData={dailyData}
        topProducts={topProductsData}
        totalRevenue={totalRevenue}
        totalTransactions={monthlySales?.length ?? 0}
      />
    </DashboardShell>
  );
}
