-- ============================================================
-- Mary Shop — Complete Database Schema
-- Paste into: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TABLES ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shops (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT        NOT NULL,
  location   TEXT        NOT NULL,
  phone      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id         UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  phone      TEXT,
  role       TEXT        NOT NULL CHECK (role IN ('ADMIN','SUPERVISOR','WORKER')) DEFAULT 'WORKER',
  shop_id    UUID        REFERENCES shops(id) ON DELETE SET NULL,
  status     TEXT        NOT NULL CHECK (status IN ('active','inactive')) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No image column — intentionally omitted per requirements
CREATE TABLE IF NOT EXISTS products (
  id          UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id     UUID           NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name        TEXT           NOT NULL,
  category    TEXT           NOT NULL DEFAULT 'Other',
  description TEXT,
  buy_price   NUMERIC(12,2)  NOT NULL DEFAULT 0,
  sell_price  NUMERIC(12,2)  NOT NULL DEFAULT 0,
  quantity    INTEGER        NOT NULL DEFAULT 0,
  min_stock   INTEGER        NOT NULL DEFAULT 5,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id             UUID           PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id        UUID           NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  worker_id      UUID           NOT NULL REFERENCES users(id),
  total_amount   NUMERIC(12,2)  NOT NULL DEFAULT 0,
  payment_method TEXT           NOT NULL CHECK (payment_method IN ('cash','card','mobile_money','bank_transfer')) DEFAULT 'cash',
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id         UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id    UUID          NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID          NOT NULL REFERENCES products(id),
  quantity   INTEGER       NOT NULL DEFAULT 1,
  price      NUMERIC(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  action       TEXT        NOT NULL CHECK (action IN ('added','removed','adjusted','sale')),
  quantity     INTEGER     NOT NULL,
  note         TEXT,
  performed_by UUID        REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_shop_id        ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_sales_shop_id           ON sales(shop_id);
CREATE INDEX IF NOT EXISTS idx_sales_worker_id         ON sales(worker_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at        ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale         ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product  ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_users_shop_id           ON users(shop_id);
CREATE INDEX IF NOT EXISTS idx_users_role              ON users(role);

-- ─── AUTO-UPDATE updated_at TRIGGER ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

ALTER TABLE shops          ENABLE ROW LEVEL SECURITY;
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales          ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions (SECURITY DEFINER so they run as the table owner)
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION current_user_shop()
RETURNS UUID AS $$
  SELECT shop_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── SHOPS POLICIES ───────────────────────────────────────────────────────────

CREATE POLICY "admin_all_shops" ON shops
  FOR ALL TO authenticated
  USING (current_user_role() = 'ADMIN')
  WITH CHECK (current_user_role() = 'ADMIN');

CREATE POLICY "non_admin_select_shops" ON shops
  FOR SELECT TO authenticated
  USING (current_user_role() IN ('SUPERVISOR','WORKER'));

-- ─── USERS POLICIES ───────────────────────────────────────────────────────────

CREATE POLICY "admin_all_users" ON users
  FOR ALL TO authenticated
  USING (current_user_role() = 'ADMIN')
  WITH CHECK (current_user_role() = 'ADMIN');

CREATE POLICY "user_read_own" ON users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "supervisor_select_users" ON users
  FOR SELECT TO authenticated
  USING (current_user_role() = 'SUPERVISOR');

CREATE POLICY "worker_update_own" ON users
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─── PRODUCTS POLICIES ────────────────────────────────────────────────────────

CREATE POLICY "admin_all_products" ON products
  FOR ALL TO authenticated
  USING (current_user_role() = 'ADMIN')
  WITH CHECK (current_user_role() = 'ADMIN');

CREATE POLICY "supervisor_select_products" ON products
  FOR SELECT TO authenticated
  USING (current_user_role() = 'SUPERVISOR');

CREATE POLICY "worker_select_products" ON products
  FOR SELECT TO authenticated
  USING (current_user_role() = 'WORKER' AND shop_id = current_user_shop());

CREATE POLICY "worker_insert_products" ON products
  FOR INSERT TO authenticated
  WITH CHECK (current_user_role() = 'WORKER' AND shop_id = current_user_shop());

CREATE POLICY "worker_update_products" ON products
  FOR UPDATE TO authenticated
  USING (current_user_role() = 'WORKER' AND shop_id = current_user_shop())
  WITH CHECK (current_user_role() = 'WORKER' AND shop_id = current_user_shop());

CREATE POLICY "worker_delete_products" ON products
  FOR DELETE TO authenticated
  USING (current_user_role() = 'WORKER' AND shop_id = current_user_shop());

-- ─── SALES POLICIES ───────────────────────────────────────────────────────────

CREATE POLICY "admin_all_sales" ON sales
  FOR ALL TO authenticated
  USING (current_user_role() = 'ADMIN')
  WITH CHECK (current_user_role() = 'ADMIN');

CREATE POLICY "supervisor_select_sales" ON sales
  FOR SELECT TO authenticated
  USING (current_user_role() = 'SUPERVISOR');

CREATE POLICY "worker_select_sales" ON sales
  FOR SELECT TO authenticated
  USING (current_user_role() = 'WORKER' AND shop_id = current_user_shop());

CREATE POLICY "worker_insert_sales" ON sales
  FOR INSERT TO authenticated
  WITH CHECK (
    current_user_role() = 'WORKER'
    AND shop_id = current_user_shop()
    AND worker_id = auth.uid()
  );

-- ─── SALE ITEMS POLICIES ──────────────────────────────────────────────────────

CREATE POLICY "admin_all_sale_items" ON sale_items
  FOR ALL TO authenticated
  USING (current_user_role() = 'ADMIN');

CREATE POLICY "supervisor_select_sale_items" ON sale_items
  FOR SELECT TO authenticated
  USING (current_user_role() = 'SUPERVISOR');

CREATE POLICY "worker_select_sale_items" ON sale_items
  FOR SELECT TO authenticated
  USING (
    current_user_role() = 'WORKER' AND
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
        AND sales.shop_id = current_user_shop()
    )
  );

CREATE POLICY "worker_insert_sale_items" ON sale_items
  FOR INSERT TO authenticated
  WITH CHECK (
    current_user_role() = 'WORKER' AND
    EXISTS (
      SELECT 1 FROM sales
      WHERE sales.id = sale_items.sale_id
        AND sales.shop_id = current_user_shop()
    )
  );

-- ─── INVENTORY LOGS POLICIES ──────────────────────────────────────────────────

CREATE POLICY "admin_all_logs" ON inventory_logs
  FOR ALL TO authenticated
  USING (current_user_role() = 'ADMIN');

CREATE POLICY "supervisor_select_logs" ON inventory_logs
  FOR SELECT TO authenticated
  USING (current_user_role() = 'SUPERVISOR');

CREATE POLICY "worker_select_logs" ON inventory_logs
  FOR SELECT TO authenticated
  USING (
    current_user_role() = 'WORKER' AND
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = inventory_logs.product_id
        AND products.shop_id = current_user_shop()
    )
  );

CREATE POLICY "worker_insert_logs" ON inventory_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    current_user_role() = 'WORKER' AND
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = inventory_logs.product_id
        AND products.shop_id = current_user_shop()
    )
  );

-- ─── CREATE YOUR FIRST ADMIN ─────────────────────────────────────────────────
-- After creating a user in Supabase Auth dashboard, run this (replace the values):
--
-- INSERT INTO users (id, full_name, email, role, status)
-- VALUES (
--   'paste-auth-user-uuid-here',
--   'Your Name',
--   'your@email.com',
--   'ADMIN',
--   'active'
-- );


-- ─── MIGRATION: Add entry_type to products ────────────────────────────────────
-- Run this in SQL Editor if you already applied the initial schema

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS entry_type TEXT
    NOT NULL
    CHECK (entry_type IN ('new', 'existing'))
    DEFAULT 'new';

COMMENT ON COLUMN products.entry_type IS
  '"new" = product added fresh into the system; "existing" = product that was already in stock before being entered';


-- ─── MIGRATION: Soft-delete for products ─────────────────────────────────────
-- Run this if you already applied the initial schema.
-- Adds is_active column so products can be hidden without breaking sale history.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Index for fast filtering of active products
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

COMMENT ON COLUMN products.is_active IS
  'false = soft-deleted. Product is hidden from inventory and low stock views but preserved for sale history.';


-- ─── MIGRATION: Fix product soft-delete — prevent FK violations ───────────────
-- Run this in Supabase SQL Editor.
--
-- The problem: Supabase's default FK constraint on sale_items.product_id
-- uses RESTRICT, which blocks even UPDATE on products that have sale history.
-- Fix: recreate the FK to allow updates (ON UPDATE CASCADE) while still
-- blocking hard deletes (ON DELETE RESTRICT), then add a trigger that
-- converts any attempted hard DELETE into a soft-delete (is_active = false).

-- Step 1: Drop the old FK constraint
ALTER TABLE sale_items
  DROP CONSTRAINT IF EXISTS sale_items_product_id_fkey;

-- Step 2: Re-add it with ON UPDATE CASCADE so updating the product row is allowed
ALTER TABLE sale_items
  ADD CONSTRAINT sale_items_product_id_fkey
  FOREIGN KEY (product_id)
  REFERENCES products(id)
  ON UPDATE CASCADE
  ON DELETE RESTRICT;

-- Step 3: Add a trigger that intercepts hard DELETEs on products
-- and converts them to soft-deletes instead, so the FK is never violated.
CREATE OR REPLACE FUNCTION soft_delete_product()
RETURNS TRIGGER AS $$
BEGIN
  -- Instead of deleting, mark the product as inactive
  UPDATE products
    SET is_active  = false,
        updated_at = NOW()
  WHERE id = OLD.id;

  -- Cancel the actual DELETE
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_soft_delete_product ON products;

CREATE TRIGGER trg_soft_delete_product
  BEFORE DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION soft_delete_product();


-- ─── MIGRATION: Backfill is_active for existing products ─────────────────────
-- Run this if you had products before adding the is_active column.
-- Sets all existing products to active so the delete button works correctly.

UPDATE products SET is_active = true WHERE is_active IS NULL;

-- Also ensure the column has a proper default for future inserts
ALTER TABLE products
  ALTER COLUMN is_active SET DEFAULT true;


-- ─── MIGRATION: Add hide_from_alerts column ───────────────────────────────────
-- Allows a product at 0 stock to be dismissed from low stock alerts
-- without being soft-deleted from inventory.

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS hide_from_alerts BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN products.hide_from_alerts IS
  'true = product is hidden from low stock / out-of-stock alerts but still visible in inventory';

-- Reset hide_from_alerts when stock is added back (auto-restore alert)
CREATE OR REPLACE FUNCTION reset_hide_on_restock()
RETURNS TRIGGER AS $$
BEGIN
  -- If quantity goes above 0, restore the alert visibility automatically
  IF NEW.quantity > 0 AND OLD.quantity = 0 AND NEW.hide_from_alerts = true THEN
    NEW.hide_from_alerts := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reset_hide_on_restock ON products;
CREATE TRIGGER trg_reset_hide_on_restock
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION reset_hide_on_restock();
