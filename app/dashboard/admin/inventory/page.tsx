import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { InventoryClient } from '@/components/inventory/InventoryClient';

export default async function AdminInventoryPage() {
  const supabase = await createClient();
  const [{ data: products }, { data: shops }] = await Promise.all([
    supabase.from('products').select('*, shops(name)').eq('is_active', true).order('name'),
    supabase.from('shops').select('id, name').order('name'),
  ]);
  return (
    <DashboardShell title="Inventory">
      <InventoryClient initialProducts={products ?? []} shops={shops ?? []} canEdit={true} />
    </DashboardShell>
  );
}
