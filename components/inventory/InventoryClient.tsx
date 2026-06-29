'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ProductWithShop, DbShop, ProductEntryType } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SearchInput } from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate, isLowStock, cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { useRealtimeStore } from '@/store/realtime';
import toast from 'react-hot-toast';
import {
  Plus, Package, Edit, Trash2, AlertTriangle,
  ArrowUp, ArrowDown, Sparkles, Archive, PackagePlus,
} from 'lucide-react';

const CATEGORIES = [
  'Electronics','Clothing','Food & Beverages',
  'Household','Stationery','Beauty','Sports','Other',
];

const emptyForm = {
  name: '', category: 'Other', description: '',
  buy_price: 0, sell_price: 0, quantity: 0, min_stock: 5,
  shop_id: '', entry_type: 'new' as ProductEntryType,
};

type TabType = 'all' | 'new' | 'existing';

interface InventoryClientProps {
  initialProducts: ProductWithShop[];
  shops: Pick<DbShop, 'id' | 'name'>[];
  canEdit: boolean;
}

export function InventoryClient({ initialProducts, shops, canEdit }: InventoryClientProps) {
  // Realtime store as source of truth
  const storeProducts   = useRealtimeStore((s) => s.products);
  const { upsertProduct, deactivateProduct } = useRealtimeStore();
  const products = (storeProducts.length > 0 ? storeProducts : initialProducts) as ProductWithShop[];

  const [activeTab, setActiveTab]           = useState<TabType>('all');
  const [search, setSearch]                 = useState('');
  const [catFilter, setCatFilter]           = useState('ALL');
  const [stockFilter, setStockFilter]       = useState('ALL');
  const [modalOpen, setModalOpen]           = useState(false);
  const [deleteId, setDeleteId]             = useState<string | null>(null);
  const [editing, setEditing]               = useState<ProductWithShop | null>(null);
  const [form, setForm]                     = useState(emptyForm);
  const [loading, setLoading]               = useState(false);
  const [adjustModal, setAdjustModal]       = useState<ProductWithShop | null>(null);
  const [adjustQty, setAdjustQty]           = useState(0);
  const [adjustType, setAdjustType]         = useState<'add' | 'remove'>('add');
  const [batchConfirmOpen, setBatchConfirmOpen] = useState(false);
  const [batchLoading, setBatchLoading]     = useState(false);

  const user            = useAuthStore((s) => s.user);
  const addNotification = useUIStore((s) => s.addNotification);
  const supabase        = createClient();

  // ── Tab counts ──────────────────────────────────────────────────────────────
  const newProducts      = products.filter((p) => p.entry_type === 'new');
  const existingProducts = products.filter((p) => p.entry_type === 'existing');

  const tabProducts = activeTab === 'new' ? newProducts
    : activeTab === 'existing' ? existingProducts
    : products;

  // ── Filters applied on top of active tab ───────────────────────────────────
  const filtered = tabProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === 'ALL' || p.category === catFilter;
    const matchStock  = stockFilter === 'ALL'
      || (stockFilter === 'LOW' && isLowStock(p.quantity, p.min_stock) && p.quantity > 0)
      || (stockFilter === 'OUT' && p.quantity === 0)
      || (stockFilter === 'OK'  && !isLowStock(p.quantity, p.min_stock));
    return matchSearch && matchCat && matchStock;
  });

  // ── Open modal helpers ──────────────────────────────────────────────────────
  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      shop_id: user?.shop_id ?? shops[0]?.id ?? '',
      // Pre-select entry_type based on active tab for convenience
      entry_type: activeTab === 'existing' ? 'existing' : 'new',
    });
    setModalOpen(true);
  };

  const openEdit = (p: ProductWithShop) => {
    setEditing(p);
    setForm({
      name: p.name, category: p.category, description: p.description ?? '',
      buy_price: p.buy_price, sell_price: p.sell_price,
      quantity: p.quantity, min_stock: p.min_stock,
      shop_id: p.shop_id, entry_type: p.entry_type ?? 'new',
    });
    setModalOpen(true);
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name || !form.shop_id) { toast.error('Name and shop are required'); return; }
    setLoading(true);

    const payload = {
      ...form,
      buy_price:  Number(form.buy_price),
      sell_price: Number(form.sell_price),
      quantity:   Number(form.quantity),
      min_stock:  Number(form.min_stock),
      updated_at: new Date().toISOString(),
    };

    if (editing) {
      const { data: updated, error } = await supabase
        .from('products').update(payload).eq('id', editing.id).select('*, shops(name)').single();
      if (error) toast.error(error.message);
      else {
        upsertProduct(updated);
        await supabase.from('inventory_logs').insert({
          product_id: editing.id, action: 'adjusted',
          quantity: Number(form.quantity), performed_by: user?.id, note: 'Product updated',
        });
        toast.success('Product updated');
        setModalOpen(false);
      }
    } else {
      const { data, error } = await supabase
        .from('products').insert(payload).select('*, shops(name)').single();
      if (error) toast.error(error.message);
      else {
        upsertProduct(data);
        await supabase.from('inventory_logs').insert({
          product_id: data.id, action: 'added',
          quantity: data.quantity, performed_by: user?.id, note: 'Initial stock',
        });
        addNotification({
          type: 'success',
          title: `${data.entry_type === 'new' ? 'New product' : 'Existing product'} added`,
          message: `${data.name} added to inventory`,
        });
        toast.success('Product added');
        setModalOpen(false);
      }
    }
    setLoading(false);
  };

  // ── Soft delete — sets is_active=false, preserves sale history ─────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    const { error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', deleteId);
    if (error) toast.error(error.message);
    else {
      deactivateProduct(deleteId);
      toast.success('Product removed from inventory');
    }
    setDeleteId(null);
    setLoading(false);
  };

  // ── Stock adjustment ────────────────────────────────────────────────────────
  const handleAdjust = async () => {
    if (!adjustModal || adjustQty <= 0) { toast.error('Enter a quantity greater than 0'); return; }
    setLoading(true);
    const newQty = adjustType === 'add'
      ? adjustModal.quantity + adjustQty
      : Math.max(0, adjustModal.quantity - adjustQty);

    const { data: updated, error } = await supabase
      .from('products')
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', adjustModal.id)
      .select('*, shops(name)').single();

    if (error) { toast.error(error.message); }
    else {
      await supabase.from('inventory_logs').insert({
        product_id: adjustModal.id,
        action: adjustType === 'add' ? 'added' : 'removed',
        quantity: adjustQty, performed_by: user?.id,
        note: `Stock ${adjustType === 'add' ? 'added' : 'removed'} manually`,
      });
      upsertProduct(updated);
      if (isLowStock(newQty, adjustModal.min_stock)) {
        addNotification({
          type: 'warning', title: 'Low stock alert',
          message: `${adjustModal.name} is running low (${newQty} units)`,
        });
      }
      toast.success(`Stock ${adjustType === 'add' ? 'increased' : 'decreased'}`);
      setAdjustModal(null);
      setAdjustQty(0);
    }
    setLoading(false);
  };

  // ── Batch commit: shift all active "new" → "existing" ──────────────────────
  const handleBatchCommit = async () => {
    const newIds = newProducts.filter((p) => p.is_active !== false).map((p) => p.id);
    if (newIds.length === 0) {
      toast.error('No new entries to commit');
      setBatchConfirmOpen(false);
      return;
    }
    setBatchLoading(true);

    const { data: updated, error } = await supabase
      .from('products')
      .update({ entry_type: 'existing', updated_at: new Date().toISOString() })
      .in('id', newIds)
      .select('*, shops(name)');

    if (error) {
      toast.error(error.message);
    } else {
      // Push every updated product into the realtime store
      (updated ?? []).forEach((p) => upsertProduct(p));

      addNotification({
        type: 'success',
        title: 'New batch committed',
        message: `${newIds.length} product${newIds.length !== 1 ? 's' : ''} moved to existing stock`,
      });
      toast.success(`${newIds.length} product${newIds.length !== 1 ? 's' : ''} committed to existing stock`);

      // Switch to existing tab so the user sees the result
      setActiveTab('existing');
    }

    setBatchConfirmOpen(false);
    setBatchLoading(false);
  };

  // ── Stock badge helper ───────────────────────────────────────────────────────
  const stockBadge = (p: ProductWithShop) => {
    if (p.quantity === 0)                    return <Badge variant="error">Out of stock</Badge>;
    if (isLowStock(p.quantity, p.min_stock)) return <Badge variant="warning">Low stock</Badge>;
    return <Badge variant="success">In stock</Badge>;
  };

  // ── Tabs ────────────────────────────────────────────────────────────────────
  const tabs: { id: TabType; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'all',      label: 'All Products',       icon: Package,  count: products.length },
    { id: 'new',      label: 'New Entries',         icon: Sparkles, count: newProducts.length },
    { id: 'existing', label: 'Existing Stock',      icon: Archive,  count: existingProducts.length },
  ];

  return (
    <div className="space-y-5">

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            )}
          >
            <tab.icon size={15} className={activeTab === tab.id && tab.id === 'new' ? 'text-brand-500' : ''} />
            {tab.label}
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded-full font-semibold',
              activeTab === tab.id
                ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                : 'bg-slate-200 dark:bg-slate-700 text-[var(--text-muted)]',
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Entry type info banner ───────────────────────────────────────────── */}
      {activeTab === 'new' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-sm text-brand-700 dark:text-brand-300">
          <Sparkles size={15} className="flex-shrink-0" />
          <span>New entries — products added fresh into the system for the first time</span>
        </div>
      )}
      {activeTab === 'existing' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-[var(--border)] text-sm text-[var(--text-secondary)]">
          <Archive size={15} className="flex-shrink-0" />
          <span>Existing stock — products that were already in the shop before being recorded in the system</span>
        </div>
      )}

      {/* ── Filters + action buttons ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <SearchInput value={search} onChange={setSearch} placeholder="Search products…" className="w-full sm:w-56" />
          <select className="input w-auto" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
            <option value="ALL">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input w-auto" value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
            <option value="ALL">All Stock</option>
            <option value="OK">In Stock</option>
            <option value="LOW">Low Stock</option>
            <option value="OUT">Out of Stock</option>
          </select>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Enter New Batch — only visible when there are new entries */}
            {newProducts.length > 0 && (
              <button
                onClick={() => setBatchConfirmOpen(true)}
                className="btn bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm whitespace-nowrap"
              >
                <PackagePlus size={16} />
                Enter New Batch
                <span className="ml-1 bg-emerald-500/40 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {newProducts.length}
                </span>
              </button>
            )}
            <button onClick={openCreate} className="btn-primary whitespace-nowrap">
              <Plus size={16} /> Add Product
            </button>
          </div>
        )}
      </div>

      {/* ── Summary row ─────────────────────────────────────────────────────── */}
      <div className="flex gap-4 text-sm text-secondary flex-wrap">
        <span><strong className="text-primary">{filtered.length}</strong> products</span>
        <span><strong className="text-amber-600">{filtered.filter((p) => isLowStock(p.quantity, p.min_stock) && p.quantity > 0).length}</strong> low stock</span>
        <span><strong className="text-red-600">{filtered.filter((p) => p.quantity === 0).length}</strong> out of stock</span>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={activeTab === 'new' ? Sparkles : activeTab === 'existing' ? Archive : Package}
          title={
            activeTab === 'new' ? 'No new entries yet'
            : activeTab === 'existing' ? 'No existing stock recorded'
            : 'No products found'
          }
          description={
            activeTab === 'new'
              ? 'Add a product and mark it as "New Entry" to see it here.'
              : activeTab === 'existing'
              ? 'Add a product and mark it as "Existing Stock" to see it here.'
              : 'Add your first product to start tracking inventory.'
          }
          action={canEdit ? (
            <button onClick={openCreate} className="btn-primary">
              <Plus size={16} /> Add Product
            </button>
          ) : undefined}
        />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Entry</th>
                <th>Category</th>
                <th>Buy Price</th>
                <th>Sell Price</th>
                <th>Qty</th>
                <th>Status</th>
                <th>Shop</th>
                <th>Updated</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div>
                      <p className="font-medium text-primary">{p.name}</p>
                      {(p as any).shops?.name && (
                        <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-0.5">
                          {(p as any).shops.name}
                        </p>
                      )}
                      {p.description && (
                        <p className="text-xs text-muted truncate max-w-[150px]">{p.description}</p>
                      )}
                    </div>
                  </td>
                  <td>
                    {p.entry_type === 'new' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                        <Sparkles size={10} /> New
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        <Archive size={10} /> Existing
                      </span>
                    )}
                  </td>
                  <td><Badge>{p.category}</Badge></td>
                  <td className="font-mono">{formatCurrency(p.buy_price)}</td>
                  <td className="font-mono">{formatCurrency(p.sell_price)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <span className={`font-semibold ${
                        p.quantity === 0 ? 'text-red-600'
                        : isLowStock(p.quantity, p.min_stock) ? 'text-amber-600'
                        : 'text-primary'
                      }`}>
                        {p.quantity}
                      </span>
                      {isLowStock(p.quantity, p.min_stock) && (
                        <AlertTriangle size={12} className="text-amber-500" />
                      )}
                    </div>
                  </td>
                  <td>{stockBadge(p)}</td>
                  <td>{(p as any).shops?.name ?? '—'}</td>
                  <td>{formatDate(p.updated_at)}</td>
                  {canEdit && (
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setAdjustModal(p); setAdjustQty(0); setAdjustType('add'); }}
                          className="btn-ghost p-1.5 text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                          title="Adjust stock"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button onClick={() => openEdit(p)} className="btn-ghost p-1.5">
                          <Edit size={14} />
                        </button>
                        {/* Soft-delete: available for any product */}
                        {p.is_active !== false ? (
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Remove product from inventory"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      <Modal
        open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Product' : 'Add Product'} size="lg"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary" disabled={loading}>Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : editing ? 'Save Changes' : 'Add Product'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Entry type selector — only shown when creating */}
          {!editing && (
            <div className="sm:col-span-2">
              <label className="input-label">Entry Type *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, entry_type: 'new' })}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                    form.entry_type === 'new'
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-[var(--border)] hover:border-brand-300',
                  )}
                >
                  <Sparkles size={20} className={form.entry_type === 'new' ? 'text-brand-500' : 'text-muted'} />
                  <div>
                    <p className="text-sm font-semibold text-primary">New Entry</p>
                    <p className="text-xs text-muted mt-0.5">Product added for the first time</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, entry_type: 'existing' })}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all',
                    form.entry_type === 'existing'
                      ? 'border-slate-500 bg-slate-50 dark:bg-slate-800/50'
                      : 'border-[var(--border)] hover:border-slate-400',
                  )}
                >
                  <Archive size={20} className={form.entry_type === 'existing' ? 'text-slate-500' : 'text-muted'} />
                  <div>
                    <p className="text-sm font-semibold text-primary">Existing Stock</p>
                    <p className="text-xs text-muted mt-0.5">Already in shop, now being recorded</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="input-label">Product Name *</label>
            <input className="input" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Coca Cola 500ml" />
          </div>
          <div>
            <label className="input-label">Category</label>
            <select className="input" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Shop *</label>
            <select className="input" value={form.shop_id}
              onChange={(e) => setForm({ ...form, shop_id: e.target.value })}>
              <option value="">Select shop</option>
              {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Buying Price (TZS)</label>
            <input className="input" type="number" min="0" value={form.buy_price}
              onChange={(e) => setForm({ ...form, buy_price: Number(e.target.value) })} />
          </div>
          <div>
            <label className="input-label">Selling Price (TZS)</label>
            <input className="input" type="number" min="0" value={form.sell_price}
              onChange={(e) => setForm({ ...form, sell_price: Number(e.target.value) })} />
          </div>
          <div>
            <label className="input-label">
              {form.entry_type === 'existing' ? 'Current Quantity (on hand)' : 'Initial Quantity'}
            </label>
            <input className="input" type="number" min="0" value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
          </div>
          <div>
            <label className="input-label">Min Stock Alert</label>
            <input className="input" type="number" min="0" value={form.min_stock}
              onChange={(e) => setForm({ ...form, min_stock: Number(e.target.value) })} />
          </div>
          <div className="sm:col-span-2">
            <label className="input-label">Description</label>
            <textarea className="input" rows={2} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description" />
          </div>
        </div>
      </Modal>

      {/* ── Adjust Stock Modal ───────────────────────────────────────────────── */}
      <Modal
        open={!!adjustModal} onClose={() => setAdjustModal(null)}
        title="Adjust Stock" size="sm"
        footer={
          <>
            <button onClick={() => setAdjustModal(null)} className="btn-secondary" disabled={loading}>Cancel</button>
            <button onClick={handleAdjust} className={adjustType === 'add' ? 'btn-primary' : 'btn-danger'} disabled={loading}>
              {loading ? 'Saving…' : adjustType === 'add' ? 'Add Stock' : 'Remove Stock'}
            </button>
          </>
        }
      >
        {adjustModal && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-primary">{adjustModal.name}</p>
              {adjustModal.entry_type === 'new'
                ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"><Sparkles size={10} />New</span>
                : <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"><Archive size={10} />Existing</span>
              }
            </div>
            <p className="text-sm text-secondary">Current stock: <strong>{adjustModal.quantity}</strong></p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setAdjustType('add')}
                className={`btn justify-center ${adjustType === 'add' ? 'btn-primary' : 'btn-secondary'}`}>
                <ArrowUp size={15} /> Add
              </button>
              <button onClick={() => setAdjustType('remove')}
                className={`btn justify-center ${adjustType === 'remove' ? 'btn-danger' : 'btn-secondary'}`}>
                <ArrowDown size={15} /> Remove
              </button>
            </div>
            <div>
              <label className="input-label">Quantity to {adjustType}</label>
              <input className="input" type="number" min="1" value={adjustQty || ''}
                onChange={(e) => setAdjustQty(Number(e.target.value))} />
            </div>
            <p className="text-xs text-muted">
              New quantity: <strong className="text-primary">
                {adjustType === 'add'
                  ? adjustModal.quantity + adjustQty
                  : Math.max(0, adjustModal.quantity - adjustQty)}
              </strong>
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Remove product?"
        message="This product will be hidden from inventory. Sale history is preserved. You can re-activate it from the database if needed."
        confirmLabel="Remove" danger loading={loading}
      />

      {/* ── Batch Commit Confirm Dialog ──────────────────────────────────────── */}
      {batchConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !batchLoading && setBatchConfirmOpen(false)} />
          <div className="relative w-full max-w-md bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] animate-slide-up">

            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <PackagePlus size={22} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">Enter New Batch?</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5">This action cannot be undone</p>
                </div>
              </div>

              {/* What will happen */}
              <div className="space-y-3 text-sm">
                <p className="text-[var(--text-secondary)]">
                  This will mark all <strong className="text-[var(--text-primary)]">{newProducts.length} new entr{newProducts.length !== 1 ? 'ies' : 'y'}</strong> as <strong className="text-[var(--text-primary)]">existing stock</strong>, indicating the current batch has been fully received and recorded.
                </p>

                {/* Preview of affected products */}
                <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--border)] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Products affected</span>
                    <span className="text-xs font-bold text-emerald-600">{newProducts.length} total</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto divide-y divide-[var(--border)]">
                    {newProducts.map((p) => (
                      <div key={p.id} className="flex items-center justify-between px-3 py-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Sparkles size={12} className="text-brand-500 flex-shrink-0" />
                          <span className="text-sm text-[var(--text-primary)] truncate">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-xs text-[var(--text-muted)]">qty: {p.quantity}</span>
                          <span className="text-[var(--text-muted)]">→</span>
                          <Archive size={12} className="text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* After this action note */}
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    After committing, the <strong>New Entries</strong> tab will be empty and ready for your next batch of products.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)]">
              <button
                onClick={() => setBatchConfirmOpen(false)}
                className="btn-secondary"
                disabled={batchLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleBatchCommit}
                className="btn bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                disabled={batchLoading}
              >
                {batchLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Committing…
                  </>
                ) : (
                  <>
                    <PackagePlus size={15} />
                    Commit {newProducts.length} Product{newProducts.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
