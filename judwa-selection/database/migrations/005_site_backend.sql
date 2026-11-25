-- 005: Backend for the storefront content managed in the admin panel, plus security hardening.
-- Run after 001-004 in the Supabase SQL editor.

-- 1. Admin-managed content (products, banners, reels, collections) stored as JSON documents.
--    Only the server (service-role key) reads/writes this table; the browser goes through /api routes.
CREATE TABLE IF NOT EXISTS site_content (
  key VARCHAR(50) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- 2. Public bucket for uploaded images/videos (uploads are only possible via server-signed URLs).
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Order items reference products from site_content (text ids), not the old products table.
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_variant_id_fkey;
ALTER TABLE order_items ALTER COLUMN product_id TYPE VARCHAR(100) USING product_id::text;
ALTER TABLE order_items ALTER COLUMN variant_id TYPE VARCHAR(100) USING variant_id::text;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);

-- 4. Lock down customer data. 002 created "OR true" policies (anyone could read every order)
--    and never enabled RLS on these tables. With RLS on and no anon policies, only the server can access them.
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Users can view own wishlists" ON wishlists;
DROP POLICY IF EXISTS "Users can insert into wishlists" ON wishlists;
DROP POLICY IF EXISTS "Users can delete from wishlists" ON wishlists;
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can view own returns" ON returns;
DROP POLICY IF EXISTS "Users can insert return requests" ON returns;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_log ENABLE ROW LEVEL SECURITY;
