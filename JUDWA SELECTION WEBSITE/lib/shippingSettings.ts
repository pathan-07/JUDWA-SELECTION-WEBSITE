export interface ShippingSettings {
  freeShippingAbove: number;
  shippingCharge: number;
}

export const SHIPPING_SETTINGS_STORAGE_KEY = 'judwa_shipping_settings';

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  freeShippingAbove: 499,
  shippingCharge: 50,
};

export function loadShippingSettings(): ShippingSettings {
  if (typeof window === 'undefined') return DEFAULT_SHIPPING_SETTINGS;
  try {
    const raw = localStorage.getItem(SHIPPING_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SHIPPING_SETTINGS;
    return { ...DEFAULT_SHIPPING_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SHIPPING_SETTINGS;
  }
}

export function saveShippingSettings(settings: ShippingSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SHIPPING_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  void import('./settingsSync').then(m => m.pushSetting(SHIPPING_SETTINGS_STORAGE_KEY));
  window.dispatchEvent(new Event('storage'));
}

export function calculateShipping(subtotal: number, settings: ShippingSettings): number {
  return subtotal >= settings.freeShippingAbove ? 0 : settings.shippingCharge;
}

export function freeShippingText(settings: ShippingSettings): string {
  return settings.freeShippingAbove > 0
    ? `Free Shipping on orders above ₹${settings.freeShippingAbove.toLocaleString('en-IN')}`
    : 'Free Shipping on all orders';
}
