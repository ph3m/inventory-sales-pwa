import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { SalesClient } from '@/components/sales/SalesClient';

export default async function SupervisorSalesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [{ data: sales }, { data: shops }] = await Promise.all([
    supabase.from('sales').select('*, users(full_name), shops(name), sale_items(*, products(name))').order('created_at', { ascending: false }).limit(100),
    supabase.from('shops').select('id, name').order('name'),
  ]);
  return (
    <DashboardShell title="Sales">
      <div className="mb-4 px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-sm text-purple-700 dark:text-purple-300">
        Read-only view — supervisors cannot create sales
      </div>
      <SalesClient initialSales={sales ?? []} products={[]} shops={shops ?? []} userRole="SUPERVISOR" userShopId={null} userId={user!.id} />
    </DashboardShell>
  );
}
