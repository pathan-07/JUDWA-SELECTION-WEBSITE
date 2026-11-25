// Seller-managed product catalog (stored in the database via lib/contentClient)
import { SaveTarget, fetchContent, saveContent } from './contentClient';

export interface SiteProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  selling_price: number;
  images?: string[]; // color-specific photos, uploaded separately from the main product gallery
}

export interface SiteProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  short_description: string;
  category_id: string;
  categoryName?: string;
  mrp: number;
  selling_price: number;
  purchase_price?: number;
  sold_last_month?: number; // entered by the seller, shown to customers on the product page
  fabric?: string;
  fit?: string;
  care_instructions?: string;
  is_active: boolean;
  images: string[];
  variants: SiteProductVariant[];
  created_at: string;
  updated_at: string;
}

export const PRODUCTS_STORAGE_KEY = 'judwa_products';

export interface CatalogListItem {
  id: string;
  slug: string;
  name: string;
  selling_price: number;
  mrp: number;
  category_id: string;
  image: string;
  created_at: string;
}

// Shown on listing pages until the seller adds products (ids match the product page's demo fallback)
export const DEMO_CATALOG: CatalogListItem[] = [
  { id: '1', slug: '1', name: 'Blue Cotton T-Shirt', selling_price: 499, mrp: 799, category_id: '1', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop', created_at: '2024-01-06' },
  { id: '2', slug: '2', name: 'Pink Floral Dress', selling_price: 799, mrp: 1299, category_id: '2', image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&h=600&fit=crop', created_at: '2024-01-05' },
  { id: '3', slug: '3', name: 'Denim Jeans', selling_price: 899, mrp: 1499, category_id: '3', image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&h=600&fit=crop', created_at: '2024-01-04' },
  { id: '4', slug: '4', name: 'Casual Hoodie', selling_price: 649, mrp: 1099, category_id: '1', image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&h=600&fit=crop', created_at: '2024-01-03' },
  { id: '5', slug: '5', name: 'Summer Shorts', selling_price: 349, mrp: 599, category_id: '2', image: 'https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=600&h=600&fit=crop', created_at: '2024-01-02' },
  { id: '6', slug: '6', name: 'Polo Shirt', selling_price: 549, mrp: 899, category_id: '3', image: 'https://images.unsplash.com/photo-1519238359922-989348752efb?w=600&h=600&fit=crop', created_at: '2024-01-01' },
];

/** Storefront callers get active products without purchase prices; pass `admin: true` in the admin panel. */
export async function loadProducts({ admin = false } = {}): Promise<SiteProduct[]> {
  const stored = await fetchContent<SiteProduct[]>('products', { admin });
  return Array.isArray(stored) ? stored : [];
}

export function saveProducts(products: SiteProduct[]): Promise<SaveTarget> {
  return saveContent('products', products);
}

export async function getProductBySlugOrId(idOrSlug: string): Promise<SiteProduct | undefined> {
  return (await loadProducts()).find(p => p.id === idOrSlug || p.slug === idOrSlug);
}

export function getTotalStock(product: SiteProduct): number {
  return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
}

// Profit if all current stock sold at the listed selling price (no real order history exists yet)
export function getPotentialProfit(product: SiteProduct): number {
  if (!product.purchase_price) return 0;
  return (product.selling_price - product.purchase_price) * getTotalStock(product);
}

export async function getCatalogPotentialProfit(): Promise<number> {
  return (await loadProducts({ admin: true }))
    .filter(p => p.is_active)
    .reduce((sum, p) => sum + getPotentialProfit(p), 0);
}
