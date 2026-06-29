import { AuthProvider } from '@/components/layout/AuthProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
