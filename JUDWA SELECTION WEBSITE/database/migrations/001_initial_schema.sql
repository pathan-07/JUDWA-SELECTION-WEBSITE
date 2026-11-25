-- Supabase Migrations for JUDWA SELECTION
-- This file contains all database schema creation

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "http";

-- 2. Custom Types
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded');
CREATE TYPE return_status AS ENUM ('requested', 'approved', 'rejected', 'pickup_scheduled', 'picked_up', 'received', 'refund_pending', 'refunded', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('upi', 'card', 'netbanking', 'cod');

-- 3. Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Schools Table
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(50) NOT NULL UNIQUE,
  city VARCHAR(100),
  state VARCHAR(100),
  description TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Products Table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  short_description VARCHAR(500),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  mrp DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2),
  fabric VARCHAR(100),
  fit VARCHAR(50),
  care_instructions TEXT,
  age_group VARCHAR(50),
  gender VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Product Variants Table
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  sku VARCHAR(50) UNIQUE NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  mrp DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2),
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, size, color)
);

-- 7. Combos Table
CREATE TABLE combos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  combo_price DECIMAL(10, 2) NOT NULL,
  mrp DECIMAL(10, 2),
  discount_percent DECIMAL(5, 2),
  stock INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Combo Items Table
CREATE TABLE combo_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  combo_id UUID NOT NULL REFERENCES combos(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Uniform Materials Table
CREATE TABLE uniform_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  fabric VARCHAR(100),
  color VARCHAR(50),
  width_inches DECIMAL(5, 2),
  price_per_meter DECIMAL(10, 2) NOT NULL,
  mrp_per_meter DECIMAL(10, 2),
  stock_in_meters DECIMAL(10, 2) DEFAULT 0,
  sku VARCHAR(50) UNIQUE NOT NULL,
  image_url TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. School Product Pairings Table
CREATE TABLE school_product_pairings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  shirt_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  pant_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  skirt_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  short_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  combo_id UUID REFERENCES combos(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Collections Table
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Banners Table
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255),
  subtitle VARCHAR(500),
  desktop_image_url TEXT NOT NULL,
  mobile_image_url TEXT NOT NULL,
  cta_text VARCHAR(100),
  cta_link VARCHAR(500),
  show_text_overlay BOOLEAN DEFAULT false,
  text_position VARCHAR(50),
  text_alignment VARCHAR(50),
  text_size VARCHAR(50),
  text_color VARCHAR(50),
  button_style VARCHAR(50),
  start_date DATE,
  end_date DATE,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Reels Table
CREATE TABLE reels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  cta_text VARCHAR(100),
  cta_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  cta_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  cta_collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Media Gallery Table
CREATE TABLE media_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255),
  file_url TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  album VARCHAR(100),
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Coupons Table
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  discount_type VARCHAR(50) NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  minimum_order_amount DECIMAL(10, 2),
  maximum_discount_amount DECIMAL(10, 2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  is_first_order_only BOOLEAN DEFAULT false,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Users Table (Customers)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. Addresses Table
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  pincode VARCHAR(10) NOT NULL,
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_email VARCHAR(255),
  guest_phone VARCHAR(20),
  shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  coupon_code VARCHAR(50),
  delivery_charge DECIMAL(10, 2) DEFAULT 0,
  cod_charge DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  order_status order_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. Order Items Table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  combo_id UUID REFERENCES combos(id),
  quantity INTEGER NOT NULL,
  size VARCHAR(50),
  color VARCHAR(50),
  purchase_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  item_discount DECIMAL(10, 2) DEFAULT 0,
  item_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method payment_method,
  payment_status payment_status DEFAULT 'pending',
  razorpay_response JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. Returns Table
CREATE TABLE returns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_number VARCHAR(50) UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  user_id UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  return_status return_status DEFAULT 'requested',
  refund_amount DECIMAL(10, 2),
  add_to_stock BOOLEAN DEFAULT true,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  refunded_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 22. Reviews Table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id),
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  is_admin_added BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 23. Review Photos Table
CREATE TABLE review_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 24. Wishlists Table
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id, variant_id)
);

-- 25. Cart Sessions Table
CREATE TABLE cart_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE,
  cart_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 26. Product Views Analytics Table
CREATE TABLE product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  session_token VARCHAR(255),
  view_count INTEGER DEFAULT 1,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 27. Admins Table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) DEFAULT 'admin',
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 28. Theme Settings Table
CREATE TABLE theme_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  accent_color VARCHAR(7),
  background_color VARCHAR(7),
  text_color VARCHAR(7),
  button_color VARCHAR(7),
  button_style VARCHAR(50),
  card_style VARCHAR(50),
  border_radius VARCHAR(50),
  header_style VARCHAR(50),
  footer_style VARCHAR(50),
  font_family VARCHAR(100),
  theme_preset VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 29. Website Settings Table
CREATE TABLE website_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_name VARCHAR(255),
  logo_url TEXT,
  favicon_url TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  description TEXT,
  support_information TEXT,
  social_media JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 30. Delivery Settings Table
CREATE TABLE delivery_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_name VARCHAR(100),
  delivery_charge DECIMAL(10, 2),
  estimated_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 31. COD Settings Table
CREATE TABLE cod_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_enabled BOOLEAN DEFAULT true,
  cod_charge DECIMAL(10, 2) DEFAULT 0,
  min_amount DECIMAL(10, 2),
  max_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 32. Return Settings Table
CREATE TABLE return_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_enabled BOOLEAN DEFAULT true,
  return_window_days INTEGER DEFAULT 7,
  allow_sale_product_return BOOLEAN DEFAULT true,
  allow_discount_product_return BOOLEAN DEFAULT true,
  restock_returned_product BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 33. Reset History Table
CREATE TABLE reset_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admins(id),
  reset_type VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 34. Recently Viewed Products Table
CREATE TABLE recently_viewed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255),
  product_id UUID NOT NULL REFERENCES products(id),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 35. Inventory Log Table
CREATE TABLE inventory_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  quantity_change INTEGER,
  reason VARCHAR(100),
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_school ON products(school_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_returns_order ON returns(order_id);
CREATE INDEX idx_returns_status ON returns(return_status);
CREATE INDEX idx_recently_viewed_user ON recently_viewed(user_id);
CREATE INDEX idx_product_views_product ON product_views(product_id);
CREATE INDEX idx_payment_order ON payments(order_id);

-- Row Level Security (RLS) Policies
-- Note: These policies need to be configured based on your auth setup
-- Enable RLS on key tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
