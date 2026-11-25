// Seller-configurable storefront brand color (Admin → Settings → Theme)
export const THEME_STORAGE_KEY = 'judwa_theme_color';
export const DEFAULT_THEME_COLOR = '#171412'; // premium near-black, pairs with the gold accent

function shade(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + percent));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function loadThemeColor(): string {
  if (typeof window === 'undefined') return DEFAULT_THEME_COLOR;
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_COLOR;
  } catch {
    return DEFAULT_THEME_COLOR;
  }
}

export function saveThemeColor(color: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_STORAGE_KEY, color);
  void import('./settingsSync').then(m => m.pushSetting(THEME_STORAGE_KEY));
  applyThemeColor(color);
  window.dispatchEvent(new Event('storage'));
}

export function applyThemeColor(color: string) {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty('--brand-primary', color);
  document.documentElement.style.setProperty('--brand-primary-hover', shade(color, -24));
}
