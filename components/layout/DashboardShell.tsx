'use client';

import { Sidebar }           from './Sidebar';
import { TopNav }            from './TopNav';
import { BottomNav }         from './BottomNav';
import { RealtimeProvider }  from './RealtimeProvider';

interface DashboardShellProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardShell({ children, title }: DashboardShellProps) {
  return (
    <RealtimeProvider>
      <div className="min-h-screen bg-app">
        <Sidebar />
        <div className="lg:pl-64 transition-all duration-300">
          <TopNav title={title} />
          <main className="p-4 lg:p-6 pb-24 lg:pb-8 animate-fade-in">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </RealtimeProvider>
  );
}
