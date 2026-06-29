import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

interface UIState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'created_at' | 'read'>) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      notifications: [],
      addNotification: (n) =>
        set((s) => ({
          notifications: [
            { ...n, id: crypto.randomUUID(), read: false, created_at: new Date().toISOString() },
            ...s.notifications.slice(0, 49),
          ],
        })),
      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'ui-store', partialize: (s) => ({ theme: s.theme }) }
  )
);
