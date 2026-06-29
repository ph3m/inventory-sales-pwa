import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { Store, MapPin, Phone, Users } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default async function SupervisorShopsPage() {
  const supabase = await createClient();
  const { data: shops } = await supabase.from('shops').select('*').order('name');
  const { data: workers } = await supabase.from('users').select('shop_id').eq('role', 'WORKER').not('shop_id', 'is', null);
  const countsByShop: Record<string, number> = {};
  workers?.forEach((u) => { if (u.shop_id) countsByShop[u.shop_id] = (countsByShop[u.shop_id] ?? 0) + 1; });

  return (
    <DashboardShell title="Shops">
      <div className="space-y-5">
        <div className="px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-sm text-purple-700 dark:text-purple-300">
          Read-only view — contact an admin to make changes
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(shops ?? []).map((shop) => (
            <div key={shop.id} className="card">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center mb-3">
                <Store size={20} className="text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="text-base font-semibold text-primary mb-2">{shop.name}</h3>
              <div className="space-y-1.5 text-sm text-secondary">
                <div className="flex items-center gap-2"><MapPin size={13} className="text-muted" />{shop.location}</div>
                {shop.phone && <div className="flex items-center gap-2"><Phone size={13} className="text-muted" />{shop.phone}</div>}
                <div className="flex items-center gap-2"><Users size={13} className="text-muted" />{countsByShop[shop.id] ?? 0} workers</div>
              </div>
              <div className="mt-3 pt-3 border-t border-default text-xs text-muted">Created {formatDate(shop.created_at)}</div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
