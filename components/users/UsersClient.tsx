'use client';

import { useState } from 'react';
import { UserWithShop, Role, DbShop } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Users, Mail, Edit, ToggleLeft, ToggleRight, Eye, EyeOff, KeyRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const emptyForm = { full_name: '', email: '', phone: '', role: 'WORKER' as Role, shop_id: '', password: '' };
const roleBadge: Record<string, 'info' | 'purple' | 'success'> = { ADMIN: 'info', SUPERVISOR: 'purple', WORKER: 'success' };

export function UsersClient({
  initialUsers,
  shops,
}: {
  initialUsers: UserWithShop[];
  shops: Pick<DbShop, 'id' | 'name'>[];
}) {
  const [users, setUsers]             = useState(initialUsers);
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('ALL');
  const [modalOpen, setModalOpen]     = useState(false);
  const [editing, setEditing]         = useState<UserWithShop | null>(null);
  const [form, setForm]               = useState(emptyForm);
  const [loading, setLoading]         = useState(false);
  const [showPw, setShowPw]           = useState(false);

  // Reset password state
  const [resetUser, setResetUser]       = useState<UserWithShop | null>(null);
  const [newPassword, setNewPassword]   = useState('');
  const [showNewPw, setShowNewPw]       = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const supabase = createClient();

  const filtered = users.filter((u) => {
    const matchSearch = u.full_name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowPw(false);
    setModalOpen(true);
  };

  const openEdit = (u: UserWithShop) => {
    setEditing(u);
    setForm({ full_name: u.full_name, email: u.email, phone: u.phone ?? '', role: u.role, shop_id: u.shop_id ?? '', password: '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.email) { toast.error('Name and email are required'); return; }
    setLoading(true);

    if (editing) {
      const { error } = await supabase.from('users').update({
        full_name: form.full_name,
        phone: form.phone,
        role: form.role,
        shop_id: form.shop_id || null,
      }).eq('id', editing.id);
      if (error) toast.error(error.message);
      else {
        setUsers((us) => us.map((u) => u.id === editing.id
          ? { ...u, full_name: form.full_name, phone: form.phone, role: form.role, shop_id: form.shop_id || null }
          : u
        ));
        toast.success('User updated');
        setModalOpen(false);
      }
    } else {
      if (!form.password) { toast.error('Password is required'); setLoading(false); return; }
      const res  = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) toast.error(json.error ?? 'Failed to create user');
      else { setUsers((us) => [json.user, ...us]); toast.success('User created'); setModalOpen(false); }
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!resetUser || !newPassword) { toast.error('Enter a new password'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setResetLoading(true);
    const res  = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: resetUser.id, newPassword }),
    });
    const json = await res.json();
    if (!res.ok) toast.error(json.error ?? 'Failed to reset password');
    else {
      toast.success(`Password reset for ${resetUser.full_name}`);
      setResetUser(null);
      setNewPassword('');
    }
    setResetLoading(false);
  };

  const toggleStatus = async (u: UserWithShop) => {
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    const { error } = await supabase.from('users').update({ status: newStatus }).eq('id', u.id);
    if (error) toast.error(error.message);
    else {
      setUsers((us) => us.map((usr) => usr.id === u.id ? { ...usr, status: newStatus } : usr));
      toast.success(`User ${newStatus}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <SearchInput value={search} onChange={setSearch} placeholder="Search users…" className="w-full sm:w-56" />
          <select className="input w-auto" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="WORKER">Worker</option>
          </select>
        </div>
        <button onClick={openCreate} className="btn-primary whitespace-nowrap">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* ── Table ── */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found"
          action={<button onClick={openCreate} className="btn-primary"><Plus size={16} />Add User</button>} />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Shop</th>
                <th>Status</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-brand-700 dark:text-brand-300">
                          {u.full_name[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-primary">{u.full_name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <Mail size={13} className="text-muted" />{u.email}
                    </div>
                  </td>
                  <td><Badge variant={roleBadge[u.role] ?? 'default'}>{u.role}</Badge></td>
                  <td>{(u as any).shops?.name ?? <span className="text-muted">—</span>}</td>
                  <td><Badge variant={u.status === 'active' ? 'success' : 'error'}>{u.status}</Badge></td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(u)} className="btn-ghost p-1.5" title="Edit user">
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => { setResetUser(u); setNewPassword(''); setShowNewPw(false); }}
                        className="btn-ghost p-1.5 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                        title="Reset password"
                      >
                        <KeyRound size={14} />
                      </button>
                      <button
                        onClick={() => toggleStatus(u)}
                        className="btn-ghost p-1.5"
                        title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {u.status === 'active'
                          ? <ToggleRight size={18} className="text-emerald-500" />
                          : <ToggleLeft  size={18} className="text-muted" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit User' : 'New User'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary" disabled={loading}>Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : editing ? 'Save Changes' : 'Create User'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="input-label">Full Name *</label>
            <input className="input" value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" />
          </div>
          <div>
            <label className="input-label">Email *</label>
            <input className="input" type="email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="john@company.com" disabled={!!editing} />
          </div>
          <div>
            <label className="input-label">Phone</label>
            <input className="input" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+255 712 345 678" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Role</label>
              <select className="input" value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                <option value="ADMIN">Admin</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="WORKER">Worker</option>
              </select>
            </div>
            <div>
              <label className="input-label">Shop</label>
              <select className="input" value={form.shop_id}
                onChange={(e) => setForm({ ...form, shop_id: e.target.value })}>
                <option value="">No shop</option>
                {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          {!editing && (
            <div>
              <label className="input-label">Password *</label>
              <div className="relative">
                <input className="input pr-10" type={showPw ? 'text' : 'password'}
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Reset Password Modal ── */}
      <Modal
        open={!!resetUser}
        onClose={() => { setResetUser(null); setNewPassword(''); }}
        title="Reset Password"
        size="sm"
        footer={
          <>
            <button
              onClick={() => { setResetUser(null); setNewPassword(''); }}
              className="btn-secondary" disabled={resetLoading}
            >
              Cancel
            </button>
            <button onClick={handleResetPassword} className="btn-primary" disabled={resetLoading}>
              {resetLoading ? 'Resetting…' : 'Reset Password'}
            </button>
          </>
        }
      >
        {resetUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-brand-700 dark:text-brand-300">
                  {resetUser.full_name[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">{resetUser.full_name}</p>
                <p className="text-xs text-muted">{resetUser.email}</p>
              </div>
            </div>
            <div>
              <label className="input-label">New Password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showNewPw ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoFocus
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-secondary">
                  {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <p className="text-xs text-muted mt-1.5">
                The user will need to use this password on their next login.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
