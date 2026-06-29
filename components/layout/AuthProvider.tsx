'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const router   = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('users').select('*').eq('id', user.id).single();
        setUser(profile);
      }
      setLoading(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') { setUser(null); router.push('/auth/login'); }
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('users').select('*').eq('id', session.user.id).single();
        setUser(profile);
      }
    });

    return () => listener.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
