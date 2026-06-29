'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import { createClient } from '@/lib/supabase/client';
import { Sun, Moon, Shield, User, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export function SettingsClient() {
  const { theme, toggleTheme } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const [form, setForm]   = useState({ full_name: user?.full_name ?? '', phone: user?.phone ?? '' });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('users')
      .update({ full_name: form.full_name, phone: form.phone }).eq('id', user.id);
    if (error) toast.error(error.message);
    else toast.success('Profile updated');
    setLoading(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-default">
          <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <User size={18} className="text-brand-600" />
          </div>
          <h2 className="text-sm font-semibold text-primary">Profile</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Full Name</label>
            <input className="input" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label className="input-label">Email</label>
            <input className="input opacity-60 cursor-not-allowed" value={user?.email ?? ''} disabled />
          </div>
          <div>
            <label className="input-label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+255 712 345 678" />
          </div>
          <div>
            <label className="input-label">Role</label>
            <input className="input opacity-60 cursor-not-allowed" value={user?.role ?? ''} disabled />
          </div>
        </div>
        <button onClick={saveProfile} className="btn-primary" disabled={loading}>
          <Save size={15} /> {loading ? 'Saving…' : 'Save Profile'}
        </button>
      </div>

      {/* Appearance */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-default">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Sun size={18} className="text-amber-600" />
          </div>
          <h2 className="text-sm font-semibold text-primary">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Theme</p>
            <p className="text-xs text-muted mt-0.5">Currently using {theme} mode</p>
          </div>
          <button onClick={toggleTheme} className="btn-secondary">
            {theme === 'dark' ? <><Sun size={16} /> Light mode</> : <><Moon size={16} /> Dark mode</>}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-default">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Shield size={18} className="text-emerald-600" />
          </div>
          <h2 className="text-sm font-semibold text-primary">Security</h2>
        </div>
        <p className="text-sm text-secondary">
          To change your password, use the forgot password flow from the login page, or contact your administrator.
        </p>
      </div>
    </div>
  );
}
