import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ShopsClient } from '@/components/shops/ShopsClient';

export default async function AdminShopsPage() {
  const supabase = createClient();
  const { data: shops } = await supabase.from('shops').select('*').order('created_at', { ascending: false });
  const { data: workerCounts } = await supabase.from('users').select('shop_id').eq('role', 'WORKER').not('shop_id', 'is', null);

  const countsByShop: Record<string, number> = {};
  workerCounts?.forEach((u) => { if (u.shop_id) countsByShop[u.shop_id] = (countsByShop[u.shop_id] ?? 0) + 1; });

  const shopsWithCounts = (shops ?? []).map((s) => ({ ...s, workerCount: countsByShop[s.id] ?? 0 }));
  return (
    <DashboardShell title="Shops">
      <ShopsClient initialShops={shopsWithCounts} />
    </DashboardShell>
  );
}
