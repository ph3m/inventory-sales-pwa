'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DbShop } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Store, MapPin, Phone, Edit, Trash2, Users } from 'lucide-react';

interface ShopWithCount extends DbShop { workerCount: number; }
const emptyForm = { name: '', location: '', phone: '' };

export function ShopsClient({ initialShops }: { initialShops: ShopWithCount[] }) {
  const [shops, setShops]       = useState(initialShops);
  const [search, setSearch]     = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing]   = useState<ShopWithCount | null>(null);
  const [form, setForm]         = useState(emptyForm);
  const [loading, setLoading]   = useState(false);
  const supabase                = createClient();

  const filtered = shops.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.location.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit   = (s: ShopWithCount) => {
    setEditing(s); setForm({ name: s.name, location: s.location, phone: s.phone ?? '' }); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.location) { toast.error('Name and location are required'); return; }
    setLoading(true);
    if (editing) {
      const { error } = await supabase.from('shops').update(form).eq('id', editing.id);
      if (error) toast.error(error.message);
      else {
        setShops((s) => s.map((shop) => shop.id === editing.id ? { ...shop, ...form } : shop));
        toast.success('Shop updated'); setModalOpen(false);
      }
    } else {
      const { data, error } = await supabase.from('shops').insert(form).select().single();
      if (error) toast.error(error.message);
      else { setShops((s) => [{ ...data, workerCount: 0 }, ...s]); toast.success('Shop created'); setModalOpen(false); }
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    const { error } = await supabase.from('shops').delete().eq('id', deleteId);
    if (error) toast.error(error.message);
    else { setShops((s) => s.filter((shop) => shop.id !== deleteId)); toast.success('Shop deleted'); }
    setDeleteId(null); setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search shops…" className="w-full sm:w-64" />
        <button onClick={openCreate} className="btn-primary whitespace-nowrap"><Plus size={16} /> Add Shop</button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Store} title="No shops found"
          description="Create your first branch to get started."
          action={<button onClick={openCreate} className="btn-primary"><Plus size={16} />Add Shop</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((shop) => (
            <div key={shop.id} className="card group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center">
                  <Store size={20} className="text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(shop)} className="btn-ghost p-1.5"><Edit size={14} /></button>
                  <button onClick={() => setDeleteId(shop.id)} className="btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="text-base font-semibold text-primary mb-2">{shop.name}</h3>
              <div className="space-y-1.5 text-sm text-secondary">
                <div className="flex items-center gap-2"><MapPin size={13} className="text-muted flex-shrink-0" />{shop.location}</div>
                {shop.phone && <div className="flex items-center gap-2"><Phone size={13} className="text-muted flex-shrink-0" />{shop.phone}</div>}
                <div className="flex items-center gap-2"><Users size={13} className="text-muted flex-shrink-0" />{shop.workerCount} worker{shop.workerCount !== 1 ? 's' : ''}</div>
              </div>
              <div className="mt-3 pt-3 border-t border-default text-xs text-muted">Created {formatDate(shop.created_at)}</div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Shop' : 'New Shop'}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary" disabled={loading}>Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : editing ? 'Save Changes' : 'Create Shop'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div><label className="input-label">Shop Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Downtown Branch" /></div>
          <div><label className="input-label">Location *</label><input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Dar es Salaam, Tanzania" /></div>
          <div><label className="input-label">Phone</label><input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+255 712 345 678" /></div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete shop?" message="This will permanently delete the shop and cannot be undone."
        confirmLabel="Delete" danger loading={loading} />
    </div>
  );
}
