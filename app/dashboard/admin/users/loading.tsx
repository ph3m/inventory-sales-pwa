import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { DashboardShell } from '@/components/layout/DashboardShell';
export default function Loading() {
  return (
    <DashboardShell>
      <TableSkeleton />
    </DashboardShell>
  );
}
