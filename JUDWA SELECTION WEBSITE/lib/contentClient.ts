// Browser-side access to admin-managed content (products, banners, reels, collections).
// Uses the database via /api routes; until a database is connected it falls back to this browser's localStorage.

export type ContentKey = 'products' | 'banners' | 'reels' | 'collections' | 'uniforms' | 'combos' | 'reviews';
export type SaveTarget = 'server' | 'local';

const LOCAL_KEYS: Record<ContentKey, string> = {
  products: 'judwa_products',
  banners: 'judwa_banners',
  reels: 'judwa_reels',
  collections: 'judwa_collections',
  uniforms: 'judwa_school_pairs',
  combos: 'judwa_combos',
  reviews: 'judwa_reviews',
};

function readLocal<T>(key: ContentKey): T | null {
  try {
    const raw = localStorage.getItem(LOCAL_KEYS[key]);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeLocal(key: ContentKey, value: unknown) {
  try {
    localStorage.setItem(LOCAL_KEYS[key], JSON.stringify(value));
  } catch (err) {
    const isQuotaError = err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22);
    throw new Error(
      isQuotaError
        ? 'Browser storage is full. Connect the database (Supabase) or delete old images/videos, then try again.'
        : 'Failed to save.'
    );
  }
}

/** `admin: true` returns full data (e.g. purchase prices); the public endpoint strips seller-only fields. */
export async function fetchContent<T>(key: ContentKey, { admin = false } = {}): Promise<T | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch(admin ? `/api/admin/content/${key}` : `/api/content/${key}`, { cache: 'no-store' });
    if (res.ok) {
      const { value } = await res.json();
      // Nothing saved in the database yet: keep showing what this browser has, so the first admin save migrates it
      return (value ?? readLocal<T>(key)) as T | null;
    }
  } catch {
    // network error — fall through to local copy
  }
  return readLocal<T>(key);
}

export async function saveContent(key: ContentKey, value: unknown[]): Promise<SaveTarget> {
  let res: Response | null = null;
  try {
    res = await fetch(`/api/admin/content/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
  } catch {
    res = null;
  }

  if (res?.ok) {
    localStorage.removeItem(LOCAL_KEYS[key]);
    window.dispatchEvent(new Event('storage'));
    return 'server';
  }
  if (res?.status === 401) {
    throw new Error('Your admin session expired. Please log in again.');
  }
  if (res && res.status !== 503) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to save.');
  }

  // Database not connected yet
  writeLocal(key, value);
  window.dispatchEvent(new Event('storage'));
  return 'local';
}
