'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Boxes, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const router   = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); setLoading(false); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('users').select('role').eq('id', user.id).single();
      const role = profile?.role?.toLowerCase() ?? 'worker';
      toast.success('Welcome back!');
      router.push(`/dashboard/${role}`);
    }
    setLoading(false);
  };

  return (
    <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl animate-slide-up">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Boxes className="text-white" size={24} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Mary Shop</h1>
          <p className="text-sm text-slate-400 mt-1">Inventory &amp; Sales Management</p>
        </div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com" required
            className="w-full px-3 py-2.5 rounded-xl border border-white/20 bg-white/10
                       text-white placeholder:text-slate-500 text-sm
                       focus:outline-none focus:ring-2 focus:ring-brand-400/60 focus:border-brand-400/60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required
              className="w-full px-3 py-2.5 pr-10 rounded-xl border border-white/20 bg-white/10
                         text-white placeholder:text-slate-500 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-400/60 focus:border-brand-400/60"
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mt-2
                     bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white
                     font-semibold rounded-xl transition-all shadow-lg
                     disabled:opacity-60 disabled:cursor-not-allowed">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-500 mt-6">
        Contact your administrator for account access
      </p>
    </div>
  );
}
