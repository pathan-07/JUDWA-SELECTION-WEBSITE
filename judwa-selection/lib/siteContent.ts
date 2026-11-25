import 'server-only';
import { supabaseServer } from './supabase';

export const CONTENT_KEYS = ['products', 'banners', 'reels', 'collections', 'uniforms', 'combos', 'reviews', 'settings', 'stats_reset'] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];

export const isContentKey = (key: string): key is ContentKey => (CONTENT_KEYS as readonly string[]).includes(key);

/** Returns the stored JSON value, or null if nothing has been saved yet. Throws if the database is unreachable. */
export async function getContent<T = unknown>(key: ContentKey): Promise<T | null> {
  const { data, error } = await supabaseServer.from('site_content').select('value').eq('key', key).maybeSingle();
  if (error) throw error;
  return (data?.value as T) ?? null;
}

export async function setContent(key: ContentKey, value: unknown) {
  const { error } = await supabaseServer
    .from('site_content')
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/** Removes seller-only fields before content is sent to customers. */
export function toPublicContent(key: ContentKey, value: unknown) {
  if (key === 'products' && Array.isArray(value)) {
    return value
      .filter((p: any) => p?.is_active)
      .map(({ purchase_price, ...product }: any) => product);
  }
  if ((key === 'uniforms' || key === 'combos') && Array.isArray(value)) {
    return value.filter((pair: any) => pair?.isActive);
  }
  if (key === 'reviews' && Array.isArray(value)) {
    return value
      .filter((review: any) => review?.status === 'approved')
      .map(({ orderNumber, ...review }: any) => review);
  }
  return value;
}
