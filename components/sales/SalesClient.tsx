'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DbProduct, DbShop, SaleWithDetails, CartItem, PaymentMethod } from '@/types';
import { SearchInput } from '@/components/ui/SearchInput';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDateTime, generateReceiptNumber } from '@/lib/utils';
import { useUIStore } from '@/store/ui';
import { useRealtimeStore } from '@/store/realtime';
import toast from 'react-hot-toast';
import { Plus, ShoppingCart, Minus, Trash2, Printer, Eye } from 'lucide-react';

interface SalesClientProps {
  initialSales: SaleWithDetails[];
  products:     DbProduct[];
  shops:        Pick<DbShop, 'id' | 'name'>[];
  userRole:     string;
  userShopId:   string | null;
  userId:       string;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash',          label: 'Cash'          },
  { value: 'card',          label: 'Card'          },
  { value: 'mobile_money',  label: 'Mobile Money'  },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

const payBadge: Record<string, 'success' | 'info' | 'purple' | 'warning'> = {
  cash: 'success', card: 'info', mobile_money: 'purple', bank_transfer: 'warning',
};

export function SalesClient({ initialSales, products, shops, userRole, userShopId, userId }: SalesClientProps) {
  const [sales, setSales]               = useState(initialSales);
  const [newSaleOpen, setNewSaleOpen]   = useState(false);
  const [cart, setCart]                 = useState<CartItem[]>([]);
  const [search, setSearch]             = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedShop, setSelectedShop] = useState(userShopId ?? shops[0]?.id ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading]           = useState(false);
  const [receiptSale, setReceiptSale]   = useState<SaleWithDetails | null>(null);
  const [viewSale, setViewSale]         = useState<SaleWithDetails | null>(null);
  const addNotification                 = useUIStore((s) => s.addNotification);
  const upsertProduct                   = useRealtimeStore((s) => s.upsertProduct);
  const supabase                        = createClient();

  const shopId = userRole === 'WORKER' ? (userShopId ?? selectedShop) : selectedShop;

  const filteredProducts = products.filter((p) =>
    p.shop_id === shopId &&
    p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
    p.quantity > 0
  );

  const filteredSales = sales.filter((s) =>
    (s.users?.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product: DbProduct) => {
    setCart((c) => {
      const existing = c.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) { toast.error('Not enough stock'); return c; }
        return c.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...c, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((c) => c.map((i) => {
      if (i.product.id !== productId) return i;
      const newQty = i.quantity + delta;
      if (newQty <= 0) return i;
      if (newQty > i.product.quantity) { toast.error('Exceeds available stock'); return i; }
      return { ...i, quantity: newQty };
    }));
  };

  const removeFromCart = (productId: string) => setCart((c) => c.filter((i) => i.product.id !== productId));
  const cartTotal = cart.reduce((s, i) => s + i.product.sell_price * i.quantity, 0);

  const handleSale = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    if (!shopId)           { toast.error('Select a shop'); return; }
    setLoading(true);

    const { data: sale, error: saleErr } = await supabase.from('sales')
      .insert({ shop_id: shopId, worker_id: userId, total_amount: cartTotal, payment_method: paymentMethod })
      .select().single();

    if (saleErr) { toast.error(saleErr.message); setLoading(false); return; }

    const items = cart.map((i) => ({
      sale_id: sale.id, product_id: i.product.id, quantity: i.quantity, price: i.product.sell_price,
    }));
    const { error: itemsErr } = await supabase.from('sale_items').insert(items);
    if (itemsErr) { toast.error(itemsErr.message); setLoading(false); return; }

    for (const item of cart) {
      const newQty = item.product.quantity - item.quantity;
      const { data: updatedProduct } = await supabase
        .from('products')
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq('id', item.product.id)
        .select('*, shops(name)')
        .single();

      await supabase.from('inventory_logs').insert({
        product_id: item.product.id, action: 'sale', quantity: item.quantity,
        performed_by: userId, note: `Sale ${sale.id.slice(0, 8)}`,
      });

      // Immediately push to realtime store — no waiting for WebSocket
      if (updatedProduct) {
        upsertProduct(updatedProduct);

        // Fire low-stock / out-of-stock notification right away
        if (newQty === 0) {
          addNotification({
            type: 'error',
            title: 'Out of stock',
            message: `${item.product.name} is now out of stock`,
          });
        } else if (newQty <= item.product.min_stock) {
          addNotification({
            type: 'warning',
            title: 'Low stock alert',
            message: `${item.product.name} — ${newQty} unit${newQty !== 1 ? 's' : ''} remaining`,
          });
        }
      }
    }

    const { data: fullSale } = await supabase.from('sales')
      .select('*, users(full_name), shops(name), sale_items(*, products(name))')
      .eq('id', sale.id).single();

    addNotification({ type: 'success', title: 'Sale recorded', message: `${formatCurrency(cartTotal)} — ${cart.length} item(s)` });
    toast.success('Sale recorded!');
    setSales((s) => [fullSale, ...s]);
    setReceiptSale(fullSale);
    setCart([]);
    setNewSaleOpen(false);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Search sales…" className="w-full sm:w-64" />
        {userRole !== 'SUPERVISOR' && (
          <button onClick={() => setNewSaleOpen(true)} className="btn-primary whitespace-nowrap">
            <Plus size={16} /> New Sale
          </button>
        )}
      </div>

      {/* Sales table */}
      {filteredSales.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No sales recorded"
          description="Record your first sale to see it here."
          action={userRole !== 'SUPERVISOR' ? <button onClick={() => setNewSaleOpen(true)} className="btn-primary"><Plus size={16} />New Sale</button> : undefined} />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Sale ID</th><th>Worker</th><th>Shop</th>
                <th>Items</th><th>Total</th><th>Payment</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredSales.map((s) => (
                <tr key={s.id}>
                  <td className="font-mono text-xs">{s.id.slice(0, 8)}</td>
                  <td className="font-medium text-primary">{s.users?.full_name ?? '—'}</td>
                  <td>{s.shops?.name ?? '—'}</td>
                  <td>{s.sale_items?.length ?? 0}</td>
                  <td className="font-semibold font-mono">{formatCurrency(s.total_amount)}</td>
                  <td><Badge variant={payBadge[s.payment_method] ?? 'default'}>{s.payment_method.replace('_', ' ')}</Badge></td>
                  <td className="text-xs">{formatDateTime(s.created_at)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => setViewSale(s)} className="btn-ghost p-1.5"><Eye size={14} /></button>
                      <button onClick={() => setReceiptSale(s)} className="btn-ghost p-1.5"><Printer size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Sale Modal */}
      <Modal open={newSaleOpen} onClose={() => setNewSaleOpen(false)} title="New Sale" size="xl"
        footer={
          <>
            <span className="text-sm font-semibold text-primary mr-auto">Total: {formatCurrency(cartTotal)}</span>
            <button onClick={() => setNewSaleOpen(false)} className="btn-secondary" disabled={loading}>Cancel</button>
            <button onClick={handleSale} className="btn-primary" disabled={loading || cart.length === 0}>
              {loading ? 'Processing…' : 'Complete Sale'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Product picker */}
          <div>
            <p className="text-sm font-semibold text-primary mb-3">Products</p>
            {userRole !== 'WORKER' && (
              <select className="input mb-3" value={selectedShop} onChange={(e) => setSelectedShop(e.target.value)}>
                {shops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            )}
            <SearchInput value={productSearch} onChange={setProductSearch} placeholder="Search products…" className="mb-3" />
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredProducts.length === 0
                ? <p className="text-sm text-muted text-center py-6">No products available</p>
                : filteredProducts.map((p) => (
                  <button key={p.id} onClick={() => addToCart(p)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--border)]
                               hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10 transition-all text-left">
                    <div>
                      <p className="text-sm font-medium text-primary">{p.name}</p>
                      <p className="text-xs text-muted">{p.quantity} in stock</p>
                    </div>
                    <span className="text-sm font-semibold text-brand-600">{formatCurrency(p.sell_price)}</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Cart */}
          <div>
            <p className="text-sm font-semibold text-primary mb-3">Cart ({cart.length})</p>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1 mb-4">
              {cart.length === 0
                ? <p className="text-sm text-muted text-center py-8">Add products to cart</p>
                : cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{item.product.name}</p>
                      <p className="text-xs text-muted">{formatCurrency(item.product.sell_price)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.product.id, -1)} className="btn-ghost p-1"><Minus size={12} /></button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product.id, 1)}  className="btn-ghost p-1"><Plus  size={12} /></button>
                    </div>
                    <span className="text-sm font-semibold text-primary w-20 text-right">
                      {formatCurrency(item.product.sell_price * item.quantity)}
                    </span>
                    <button onClick={() => removeFromCart(item.product.id)} className="btn-ghost p-1 text-red-500"><Trash2 size={12} /></button>
                  </div>
                ))}
            </div>

            {/* Payment method */}
            <div className="mb-4">
              <label className="input-label">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <button key={m.value} onClick={() => setPaymentMethod(m.value)}
                    className={`btn text-xs justify-center ${paymentMethod === m.value ? 'btn-primary' : 'btn-secondary'}`}>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {cart.length > 0 && (
              <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 space-y-1">
                <div className="flex justify-between text-sm text-secondary">
                  <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-primary pt-1 border-t border-brand-200 dark:border-brand-800">
                  <span>Total</span><span>{formatCurrency(cartTotal)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal open={!!receiptSale} onClose={() => setReceiptSale(null)} title="Receipt" size="sm">
        {receiptSale && (
          <div className="text-sm space-y-4">
            <div className="text-center border-b border-[var(--border)] pb-4">
              <p className="text-lg font-bold text-primary">Mary Shop</p>
              <p className="text-muted text-xs">{receiptSale.shops?.name}</p>
              <p className="font-mono text-xs mt-1">#{generateReceiptNumber()}</p>
              <p className="text-muted text-xs mt-1">{formatDateTime(receiptSale.created_at)}</p>
            </div>
            <div className="space-y-2">
              {receiptSale.sale_items?.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-secondary">{item.products?.name} × {item.quantity}</span>
                  <span className="font-mono font-medium text-primary">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--border)] pt-3 flex justify-between font-bold text-primary">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(receiptSale.total_amount)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>Payment</span><span>{receiptSale.payment_method.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span>Served by</span><span>{receiptSale.users?.full_name}</span>
            </div>
            <p className="text-center text-xs text-muted pt-2 border-t border-[var(--border)]">
              Thank you for your purchase!
            </p>
          </div>
        )}
      </Modal>

      {/* View Sale Modal */}
      <Modal open={!!viewSale} onClose={() => setViewSale(null)} title="Sale Details" size="md">
        {viewSale && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Sale ID',  viewSale.id.slice(0, 8)],
                ['Date',     formatDateTime(viewSale.created_at)],
                ['Worker',   viewSale.users?.full_name ?? '—'],
                ['Shop',     viewSale.shops?.name ?? '—'],
                ['Payment',  viewSale.payment_method.replace('_', ' ')],
                ['Total',    formatCurrency(viewSale.total_amount)],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-muted text-xs">{label}</p>
                  <p className={label === 'Total' ? 'font-bold font-mono text-brand-600' : 'font-medium text-primary'}>{val}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="font-semibold text-primary mb-2">Items</p>
              <div className="space-y-2">
                {viewSale.sale_items?.map((item) => (
                  <div key={item.id} className="flex justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <span>{item.products?.name} × {item.quantity}</span>
                    <span className="font-mono font-medium">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
