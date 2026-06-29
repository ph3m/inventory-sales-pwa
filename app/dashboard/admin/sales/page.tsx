import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { SalesClient } from '@/components/sales/SalesClient';

export default async function AdminSalesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('users').select('role, shop_id').eq('id', user!.id).single();
  const [{ data: sales }, { data: products }, { data: shops }] = await Promise.all([
    supabase.from('sales').select('*, users(full_name), shops(name), sale_items(*, products(name))').order('created_at', { ascending: false }).limit(100),
    supabase.from('products').select('*').eq('is_active', true).gt('quantity', 0).order('name'),
    supabase.from('shops').select('id, name').order('name'),
  ]);
  return (
    <DashboardShell title="Sales">
      <SalesClient initialSales={sales ?? []} products={products ?? []} shops={shops ?? []} userRole={profile?.role ?? 'ADMIN'} userShopId={profile?.shop_id ?? null} userId={user!.id} />
    </DashboardShell>
  );
}
