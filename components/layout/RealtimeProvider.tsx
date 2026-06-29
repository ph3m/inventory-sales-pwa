'use client';

import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useAuthStore } from '@/store/auth';
import { useRealtimeStore } from '@/store/realtime';
import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeProviderProps {
  children: React.ReactNode;
}

function RealtimeStatus() {
  const connected = useRealtimeStore((s) => s.connected);
  return (
    <div
      title={connected ? 'Live — updates in real time' : 'Connecting…'}
      className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full transition-all ${
        connected
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-amber-500 dark:text-amber-400'
      }`}
    >
      {connected
        ? <><Wifi size={12} /><span className="hidden sm:inline">Live</span></>
        : <><WifiOff size={12} /><span className="hidden sm:inline">Connecting…</span></>
      }
    </div>
  );
}

function RealtimeSyncInner({ children }: RealtimeProviderProps) {
  const user = useAuthStore((s) => s.user);
  // Workers are scoped to their shop; admin/supervisor get everything
  const shopId = user?.role === 'WORKER' ? user.shop_id : null;
  useRealtimeSync(shopId);
  return <>{children}</>;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  return <RealtimeSyncInner>{children}</RealtimeSyncInner>;
}

export { RealtimeStatus };
