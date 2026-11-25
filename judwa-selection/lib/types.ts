// Product Types
export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  category_id: string;
  school_id?: string;
  purchase_price: number;
  selling_price: number;
  mrp: number;
  discount_percent?: number;
  fabric?: string;
  fit?: string;
  care_instructions?: string;
  age_group?: string;
  gender?: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color: string;
  sku: string;
  purchase_price: number;
  selling_price: number;
  mrp: number;
  discount_percent?: number;
  stock: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

// Collection Types
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'refunded';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  guest_email?: string;
  guest_phone?: string;
  shipping_address_id?: string;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  delivery_charge: number;
  cod_charge: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  combo_id?: string;
  quantity: number;
  size?: string;
  color?: string;
  purchase_price: number;
  selling_price: number;
  item_discount: number;
  item_total: number;
  created_at: string;
}

// Cart Types
export interface CartItem {
  id?: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  size?: string;
  color?: string;
  selling_price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  coupon?: string;
  delivery_charge?: number;
  cod_charge?: number;
  total: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  name: string;
  phone?: string;
  pincode: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  country: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Review Types
export interface Review {
  id: string;
  product_id: string;
  order_id?: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  rating: number;
  title?: string;
  content?: string;
  is_verified_purchase: boolean;
  is_featured: boolean;
  is_admin_added: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  created_at: string;
  updated_at: string;
}

export interface ReviewPhoto {
  id: string;
  review_id: string;
  photo_url: string;
  uploaded_by?: string;
  created_at: string;
}

// Coupon Types
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'flat';
  discount_value: number;
  minimum_order_amount?: number;
  maximum_discount_amount?: number;
  category_id?: string;
  product_id?: string;
  is_first_order_only: boolean;
  usage_limit?: number;
  usage_count: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Banner Types
export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  desktop_image_url: string;
  mobile_image_url: string;
  cta_text?: string;
  cta_link?: string;
  show_text_overlay: boolean;
  text_position?: string;
  text_alignment?: string;
  text_size?: string;
  text_color?: string;
  button_style?: string;
  start_date?: string;
  end_date?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Reel Types
export interface Reel {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  cta_text?: string;
  cta_product_id?: string;
  cta_category_id?: string;
  cta_collection_id?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Combo Types
export interface Combo {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  combo_price: number;
  mrp?: number;
  discount_percent?: number;
  stock: number;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComboItem {
  id: string;
  combo_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  is_required: boolean;
  display_order: number;
  created_at: string;
}

// School Types
export interface School {
  id: string;
  name: string;
  code: string;
  city?: string;
  state?: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Uniform Material Types
export interface UniformMaterial {
  id: string;
  name: string;
  school_id?: string;
  fabric?: string;
  color?: string;
  width_inches?: number;
  price_per_meter: number;
  mrp_per_meter?: number;
  stock_in_meters: number;
  sku: string;
  image_url?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Return Types
export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'pickup_scheduled' | 'picked_up' | 'received' | 'refund_pending' | 'refunded' | 'cancelled';

export interface Return {
  id: string;
  return_number: string;
  order_id: string;
  order_item_id: string;
  user_id?: string;
  reason: string;
  quantity: number;
  return_status: ReturnStatus;
  refund_amount?: number;
  add_to_stock: boolean;
  requested_at: string;
  approved_at?: string;
  refunded_at?: string;
  updated_at: string;
}

// Settings Types
export interface DeliverySetting {
  id: string;
  region_name: string;
  delivery_charge: number;
  estimated_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CODSetting {
  id: string;
  is_enabled: boolean;
  cod_charge: number;
  min_amount?: number;
  max_amount?: number;
  created_at: string;
  updated_at: string;
}

export interface ReturnSetting {
  id: string;
  is_enabled: boolean;
  return_window_days: number;
  allow_sale_product_return: boolean;
  allow_discount_product_return: boolean;
  restock_returned_product: boolean;
  created_at: string;
  updated_at: string;
}

export interface ThemeSetting {
  id: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  button_color?: string;
  button_style?: string;
  card_style?: string;
  border_radius?: string;
  header_style?: string;
  footer_style?: string;
  font_family?: string;
  theme_preset?: string;
  created_at: string;
  updated_at: string;
}

export interface WebsiteSetting {
  id: string;
  store_name?: string;
  logo_url?: string;
  favicon_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  support_information?: string;
  social_media?: Record<string, string>;
  created_at: string;
  updated_at: string;
}

// Wishlist Types
export interface Wishlist {
  id: string;
  user_id: string;
  product_id: string;
  variant_id?: string;
  created_at: string;
}
