-- Seed Data for JUDWA SELECTION
-- Run after initial schema creation

-- 1. Insert Categories
INSERT INTO categories (name, slug, description, display_order) VALUES
('Boys', 'boys', 'Premium Boys Clothing Collection', 1),
('Girls', 'girls', 'Trendy Girls Clothing Collection', 2),
('Baby Boys', 'baby-boys', 'Cute Baby Boys Outfits', 3),
('Baby Girls', 'baby-girls', 'Adorable Baby Girls Outfits', 4),
('Newborn', 'newborn', 'Comfortable Newborn Wear', 5),
('School Uniforms', 'school-uniforms', 'Quality School Uniforms', 6),
('T-Shirts', 't-shirts', 'Comfortable T-Shirts', 7),
('Shirts', 'shirts', 'Smart Casual Shirts', 8),
('Polos', 'polos', 'Stylish Polo Shirts', 9),
('Frocks', 'frocks', 'Beautiful Frocks', 10),
('Dresses', 'dresses', 'Elegant Dresses', 11),
('Jeans', 'jeans', 'Quality Denim Jeans', 12),
('Trousers', 'trousers', 'Smart Trousers', 13),
('Shorts', 'shorts', 'Comfortable Shorts', 14),
('Track Pants', 'track-pants', 'Sporty Track Pants', 15),
('Jackets', 'jackets', 'Winter Jackets', 16),
('Ethnic Wear', 'ethnic-wear', 'Traditional Ethnic Wear', 17),
('Night Suits', 'night-suits', 'Cozy Night Suits', 18),
('Accessories', 'accessories', 'Fashion Accessories', 19);

-- 2. Insert Sample Schools
INSERT INTO schools (name, code, city, state, description) VALUES
('A School', 'SCH001', 'Himatnagar', 'Gujarat', 'Premier School in Himatnagar'),
('B School', 'SCH002', 'Ahmedabad', 'Gujarat', 'Leading School in Ahmedabad'),
('C School', 'SCH003', 'Vadodara', 'Gujarat', 'Quality Education Center');

-- 3. Insert Collections
INSERT INTO collections (name, slug, description, display_order, is_active) VALUES
('New Season Kids Collection', 'new-season', 'Fresh styles for every little star', 1, true),
('School Uniform Collection', 'school-uniform', 'Comfort, Quality, Perfect Fit', 2, true),
('Festive Kids Collection', 'festive', 'Make Every Occasion Special', 3, true),
('Summer Collection', 'summer', 'Beat the heat with our summer collection', 4, true),
('Weekend Wear', 'weekend-wear', 'Casual and comfortable weekend outfits', 5, true);

-- 4. Insert Sample Products
INSERT INTO products (sku, name, slug, description, category_id, purchase_price, selling_price, mrp, discount_percent, fabric, fit, age_group, gender, is_active, is_featured)
SELECT 
  'SKU001', 
  'Classic Kids Cotton T-Shirt', 
  'classic-kids-cotton-tshirt',
  'Premium quality cotton t-shirt perfect for everyday wear. Soft, breathable, and durable.',
  id, 
  300, 
  499, 
  999,
  50,
  'Pure Cotton',
  'Regular Fit',
  '4-5Y',
  'Unisex',
  true,
  true
FROM categories WHERE slug = 't-shirts'
LIMIT 1;

INSERT INTO products (sku, name, slug, description, category_id, purchase_price, selling_price, mrp, discount_percent, fabric, fit, age_group, gender, is_active, is_featured)
SELECT 
  'SKU002', 
  'Kids Formal Shirt', 
  'kids-formal-shirt',
  'Perfect for school and formal occasions. High-quality cotton blend for comfort.',
  id, 
  400, 
  699, 
  1299,
  46,
  'Cotton Blend',
  'Slim Fit',
  '5-6Y',
  'Boys',
  true,
  true
FROM categories WHERE slug = 'shirts'
LIMIT 1;

INSERT INTO products (sku, name, slug, description, category_id, purchase_price, selling_price, mrp, discount_percent, fabric, fit, age_group, gender, is_active, is_featured)
SELECT 
  'SKU003', 
  'Kids Denim Jeans', 
  'kids-denim-jeans',
  'Comfortable and stylish denim jeans for everyday wear. Available in multiple sizes.',
  id, 
  350, 
  599, 
  1199,
  50,
  'Denim',
  'Regular Fit',
  '6-7Y',
  'Boys',
  true,
  true
FROM categories WHERE slug = 'jeans'
LIMIT 1;

INSERT INTO products (sku, name, slug, description, category_id, purchase_price, selling_price, mrp, discount_percent, fabric, fit, age_group, gender, is_active, is_featured)
SELECT 
  'SKU004', 
  'Kids Summer Dress', 
  'kids-summer-dress',
  'Light and breezy summer dress perfect for hot days. Soft and comfortable fabric.',
  id, 
  250, 
  449, 
  899,
  50,
  'Pure Cotton',
  'Regular Fit',
  '5-6Y',
  'Girls',
  true,
  true
FROM categories WHERE slug = 'dresses'
LIMIT 1;

-- 5. Insert Product Variants
INSERT INTO product_variants (product_id, size, color, sku, purchase_price, selling_price, mrp, discount_percent, stock, is_active)
SELECT id, '0-3M', 'White', 'SKU001-W-0-3M', 280, 479, 999, 52, 20, true FROM products WHERE sku = 'SKU001' LIMIT 1;

INSERT INTO product_variants (product_id, size, color, sku, purchase_price, selling_price, mrp, discount_percent, stock, is_active)
SELECT id, '3-6M', 'Blue', 'SKU001-B-3-6M', 300, 499, 999, 50, 15, true FROM products WHERE sku = 'SKU001' LIMIT 1;

INSERT INTO product_variants (product_id, size, color, sku, purchase_price, selling_price, mrp, discount_percent, stock, is_active)
SELECT id, '6-12M', 'Red', 'SKU001-R-6-12M', 320, 519, 999, 48, 18, true FROM products WHERE sku = 'SKU001' LIMIT 1;

INSERT INTO product_variants (product_id, size, color, sku, purchase_price, selling_price, mrp, discount_percent, stock, is_active)
SELECT id, '4', 'White', 'SKU002-W-4', 390, 649, 1299, 50, 22, true FROM products WHERE sku = 'SKU002' LIMIT 1;

INSERT INTO product_variants (product_id, size, color, sku, purchase_price, selling_price, mrp, discount_percent, stock, is_active)
SELECT id, '5', 'Light Blue', 'SKU002-LB-5', 410, 699, 1299, 46, 20, true FROM products WHERE sku = 'SKU002' LIMIT 1;

INSERT INTO product_variants (product_id, size, color, sku, purchase_price, selling_price, mrp, discount_percent, stock, is_active)
SELECT id, '6', 'Navy', 'SKU002-N-6', 420, 749, 1299, 42, 18, true FROM products WHERE sku = 'SKU002' LIMIT 1;

-- 6. Insert Delivery Settings
INSERT INTO delivery_settings (region_name, delivery_charge, estimated_days, is_active) VALUES
('Gujarat', 50, 3, true),
('Outside Gujarat', 100, 5, true);

-- 7. Insert COD Settings
INSERT INTO cod_settings (is_enabled, cod_charge, min_amount) VALUES
(true, 100, 0);

-- 8. Insert Return Settings
INSERT INTO return_settings (is_enabled, return_window_days, allow_sale_product_return, allow_discount_product_return, restock_returned_product) VALUES
(true, 7, true, true, true);

-- 9. Insert Website Settings
INSERT INTO website_settings (store_name, phone, email, address, description) VALUES
('JUDWA SELECTION', '+91 9104128259', 'info@judwaselection.com', 'Panpur, Patiya, Perfect Complex, Himatnagar, Gujarat', 'Premium Kids Wear E-commerce Store in Gujarat');

-- 10. Insert Theme Settings
INSERT INTO theme_settings (primary_color, secondary_color, accent_color, button_color, theme_preset) VALUES
('#0ea5e9', '#ec4899', '#f59e0b', '#06b6d4', 'Premium Kids');

-- 11. Insert Sample Banners
INSERT INTO banners (title, subtitle, desktop_image_url, mobile_image_url, cta_text, cta_link, show_text_overlay, display_order, is_active) VALUES
('New Season Collection', 'Style For Every Little Star', 'https://via.placeholder.com/1920x500?text=New+Season', 'https://via.placeholder.com/540x300?text=New+Season', 'SHOP NOW', '/products', true, 1, true),
('School Uniform Collection', 'Comfort • Quality • Perfect Fit', 'https://via.placeholder.com/1920x500?text=School+Uniforms', 'https://via.placeholder.com/540x300?text=School+Uniforms', 'SHOP UNIFORMS', '/school-uniforms', true, 2, true),
('Festive Kids Collection', 'Make Every Occasion Special', 'https://via.placeholder.com/1920x500?text=Festive', 'https://via.placeholder.com/540x300?text=Festive', 'EXPLORE NOW', '/festive', true, 3, true);

-- 12. Insert Sample Coupons
INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order_amount, maximum_discount_amount, is_first_order_only, start_date, end_date, is_active) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10, 999, 300, true, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
('SAVE50', 'Flat ₹50 off on orders above ₹999', 'flat', 50, 999, 50, false, CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true),
('KIDS20', '20% off on kids collection', 'percentage', 20, 0, 500, false, CURRENT_DATE, CURRENT_DATE + INTERVAL '60 days', true);
