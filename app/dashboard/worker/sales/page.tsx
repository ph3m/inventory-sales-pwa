import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { SalesClient } from '@/components/sales/SalesClient';
import { redirect } from 'next/navigation';

export default async function WorkerSalesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('users').select('shop_id').eq('id', user!.id).single();
  if (!profile?.shop_id) redirect('/dashboard/worker');

  const [{ data: sales }, { data: products }, { data: shops }] = await Promise.all([
    supabase.from('sales').select('*, users(full_name), shops(name), sale_items(*, products(name))').eq('shop_id', profile.shop_id).order('created_at', { ascending: false }).limit(100),
    supabase.from('products').select('*').eq('shop_id', profile.shop_id).gt('quantity', 0).order('name'),
    supabase.from('shops').select('id, name').eq('id', profile.shop_id),
  ]);

  return (
    <DashboardShell title="Sales">
      <SalesClient initialSales={sales ?? []} products={products ?? []} shops={shops ?? []} userRole="WORKER" userShopId={profile.shop_id} userId={user!.id} />
    </DashboardShell>
  );
}
