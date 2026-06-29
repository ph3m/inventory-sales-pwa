import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { InventoryClient } from '@/components/inventory/InventoryClient';
import { redirect } from 'next/navigation';

export default async function WorkerInventoryPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('users').select('shop_id').eq('id', user!.id).single();
  if (!profile?.shop_id) redirect('/dashboard/worker');

  const [{ data: products }, { data: shops }] = await Promise.all([
    supabase.from('products').select('*, shops(name)').eq('shop_id', profile.shop_id).order('name'),
    supabase.from('shops').select('id, name').eq('id', profile.shop_id),
  ]);

  return (
    <DashboardShell title="Inventory">
      <InventoryClient initialProducts={products ?? []} shops={shops ?? []} canEdit={true} />
    </DashboardShell>
  );
}
