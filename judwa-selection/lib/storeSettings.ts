export interface StoreSettings {
  storeName: string;
  tagline: string;
  phones: string[];
  email: string;
  address: string;
}

export const STORE_SETTINGS_STORAGE_KEY = 'judwa_store_settings';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'JUDWA SELECTION',
  tagline: 'Premium kids wear and school uniforms with quality, comfort, and style.',
  phones: ['+91 9104128259', '+91 9104228259'],
  email: 'info@judwaselection.com',
  address: 'Panpur, Patiya, Perfect Complex, Himatnagar, Gujarat 383001',
};

export function loadStoreSettings(): StoreSettings {
  if (typeof window === 'undefined') return DEFAULT_STORE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORE_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_STORE_SETTINGS;
    return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}

export function saveStoreSettings(settings: StoreSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  void import('./settingsSync').then(m => m.pushSetting(STORE_SETTINGS_STORAGE_KEY));
  window.dispatchEvent(new Event('storage'));
}
