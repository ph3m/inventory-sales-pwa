import { createClient } from '@/lib/supabase/server';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { UsersClient } from '@/components/users/UsersClient';

export default async function AdminUsersPage() {
  const supabase = createClient();
  const [{ data: users }, { data: shops }] = await Promise.all([
    supabase.from('users').select('*, shops(name)').order('created_at', { ascending: false }),
    supabase.from('shops').select('id, name').order('name'),
  ]);
  return (
    <DashboardShell title="Users">
      <UsersClient initialUsers={users ?? []} shops={shops ?? []} />
    </DashboardShell>
  );
}
