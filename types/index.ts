export type Role = 'ADMIN' | 'SUPERVISOR' | 'WORKER';
export type UserStatus = 'active' | 'inactive';
export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'bank_transfer';
export type InventoryAction = 'added' | 'removed' | 'adjusted' | 'sale';

// ─── Database Row Types ────────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: Role;
  shop_id: string | null;
  status: UserStatus;
  created_at: string;
}

export interface DbShop {
  id: string;
  name: string;
  location: string;
  phone: string | null;
  created_at: string;
}

export type ProductEntryType = 'new' | 'existing';

export interface DbProduct {
  id: string;
  shop_id: string;
  name: string;
  category: string;
  description: string | null;
  buy_price: number;
  sell_price: number;
  quantity: number;
  min_stock: number;
  entry_type: ProductEntryType;
  is_active: boolean;
  hide_from_alerts: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbSale {
  id: string;
  shop_id: string;
  worker_id: string;
  total_amount: number;
  payment_method: PaymentMethod;
  created_at: string;
}

export interface DbSaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

export interface DbInventoryLog {
  id: string;
  product_id: string;
  action: InventoryAction;
  quantity: number;
  note: string | null;
  performed_by: string;
  created_at: string;
}

// ─── Extended / Joined Types ───────────────────────────────────────────────────

export interface UserWithShop extends DbUser {
  shops?: { name: string } | null;
}

export interface ProductWithShop extends DbProduct {
  shops?: { name: string } | null;
}

export interface SaleWithDetails extends DbSale {
  users?: { full_name: string } | null;
  shops?: { name: string } | null;
  sale_items?: SaleItemWithProduct[];
}

export interface SaleItemWithProduct extends DbSaleItem {
  products?: { name: string; category: string } | null;
}

// ─── UI / Form Types ───────────────────────────────────────────────────────────

export interface CartItem {
  product: DbProduct;
  quantity: number;
}

export interface ProductFormData {
  name: string;
  category: string;
  description: string;
  buy_price: number;
  sell_price: number;
  quantity: number;
  min_stock: number;
  shop_id: string;
  entry_type: ProductEntryType;
}

export interface ShopFormData {
  name: string;
  location: string;
  phone: string;
}

export interface UserFormData {
  full_name: string;
  email: string;
  phone: string;
  role: Role;
  shop_id: string;
  password?: string;
}
