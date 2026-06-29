'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { createClient } from '@/lib/supabase/client';
import { NotificationPanel } from './NotificationPanel';
import { RealtimeStatus } from './RealtimeProvider';
import toast from 'react-hot-toast';

export function TopNav({ title }: { title?: string }) {
  const { setUser }                                          = useAuthStore();
  const { theme, toggleTheme, setSidebarOpen, unreadCount } = useUIStore();
  const [showNotifs, setShowNotifs]                         = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Signed out');
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-10 flex items-center gap-2 px-4 lg:px-6 h-16
                       bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)]">
      <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-2 lg:hidden">
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-semibold text-[var(--text-primary)] hidden sm:block">
        {title ?? 'Dashboard'}
      </h1>

      <div className="flex-1" />

      {/* Live connection indicator */}
      <RealtimeStatus />

      {/* Theme */}
      <button onClick={toggleTheme} className="btn-ghost p-2">
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button onClick={() => setShowNotifs(!showNotifs)} className="btn-ghost p-2 relative">
          <Bell size={18} />
          {unreadCount() > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
        {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} />}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="btn-ghost p-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <LogOut size={18} />
      </button>
    </header>
  );
}
