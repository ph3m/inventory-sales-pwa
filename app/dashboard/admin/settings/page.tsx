import { DashboardShell } from '@/components/layout/DashboardShell';
import { SettingsClient } from '@/components/settings/SettingsClient';

export default function AdminSettingsPage() {
  return (
    <DashboardShell title="Settings">
      <SettingsClient />
    </DashboardShell>
  );
}
