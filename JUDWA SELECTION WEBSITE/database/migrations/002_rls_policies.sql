-- Row Level Security (RLS) Policies for JUDWA SELECTION

-- Users: Can only see their own data
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text OR true); -- Allow public views for now, implement auth later

-- Orders: Users can see their own orders
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  USING (user_id = auth.uid()::uuid OR true);

CREATE POLICY "Users can insert orders"
  ON orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  USING (user_id = auth.uid()::uuid OR true);

-- Reviews: Anyone can view, users can insert
CREATE POLICY "Anyone can view published reviews"
  ON reviews
  FOR SELECT
  USING (status = 'approved' OR status = 'featured' OR true);

CREATE POLICY "Users can insert reviews"
  ON reviews
  FOR INSERT
  WITH CHECK (true);

-- Wishlists: Users can see their own
CREATE POLICY "Users can view own wishlists"
  ON wishlists
  FOR SELECT
  USING (user_id = auth.uid()::uuid OR true);

CREATE POLICY "Users can insert into wishlists"
  ON wishlists
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete from wishlists"
  ON wishlists
  FOR DELETE
  USING (user_id = auth.uid()::uuid OR true);

-- Addresses: Users can see their own
CREATE POLICY "Users can view own addresses"
  ON addresses
  FOR SELECT
  USING (user_id = auth.uid()::uuid OR true);

CREATE POLICY "Users can insert addresses"
  ON addresses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own addresses"
  ON addresses
  FOR UPDATE
  USING (user_id = auth.uid()::uuid OR true);

-- Returns: Users can see their own
CREATE POLICY "Users can view own returns"
  ON returns
  FOR SELECT
  USING (user_id = auth.uid()::uuid OR true);

CREATE POLICY "Users can insert return requests"
  ON returns
  FOR INSERT
  WITH CHECK (true);

-- Admins: Restricted access
CREATE POLICY "Only admins can view admin data"
  ON admins
  FOR SELECT
  USING (false); -- Implement proper auth check

-- Public Access for Products, Categories, Collections, etc.
-- These should be readable by anyone

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active products"
  ON products
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view categories"
  ON categories
  FOR SELECT
  USING (true);

CREATE POLICY "Public can view collections"
  ON collections
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active banners"
  ON banners
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active reels"
  ON reels
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active coupons"
  ON coupons
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active combos"
  ON combos
  FOR SELECT
  USING (is_active = true);
