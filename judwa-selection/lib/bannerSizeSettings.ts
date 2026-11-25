export interface BannerSize {
  width: number;
  height: number;
}

export interface BannerSizeSettings {
  desktop: BannerSize;
  mobile: BannerSize;
}

export const BANNER_SIZE_STORAGE_KEY = 'judwa_banner_size_settings';

export const DEFAULT_BANNER_SIZE_SETTINGS: BannerSizeSettings = {
  desktop: { width: 1920, height: 768 },
  mobile: { width: 1080, height: 684 },
};

export const DESKTOP_BANNER_PRESETS: (BannerSize & { label: string })[] = [
  { label: 'Slim', width: 1920, height: 600 },
  { label: 'Standard', width: 1920, height: 768 },
  { label: 'Tall', width: 1920, height: 1000 },
  { label: 'Widescreen 16:9', width: 1920, height: 1080 },
];

export const MOBILE_BANNER_PRESETS: (BannerSize & { label: string })[] = [
  { label: 'Landscape', width: 1080, height: 684 },
  { label: 'Square 1:1', width: 1080, height: 1080 },
  { label: 'Portrait 4:5', width: 1080, height: 1350 },
];

export function isValidBannerSize(size: unknown): size is BannerSize {
  const s = size as BannerSize;
  return !!s && s.width >= 100 && s.height >= 100 && s.width <= 5000 && s.height <= 5000;
}

export function loadBannerSizeSettings(): BannerSizeSettings {
  if (typeof window === 'undefined') return DEFAULT_BANNER_SIZE_SETTINGS;
  try {
    const raw = localStorage.getItem(BANNER_SIZE_STORAGE_KEY);
    if (!raw) return DEFAULT_BANNER_SIZE_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<BannerSizeSettings>;
    return {
      desktop: isValidBannerSize(parsed.desktop) ? parsed.desktop : DEFAULT_BANNER_SIZE_SETTINGS.desktop,
      mobile: isValidBannerSize(parsed.mobile) ? parsed.mobile : DEFAULT_BANNER_SIZE_SETTINGS.mobile,
    };
  } catch {
    return DEFAULT_BANNER_SIZE_SETTINGS;
  }
}

export function saveBannerSizeSettings(settings: BannerSizeSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BANNER_SIZE_STORAGE_KEY, JSON.stringify(settings));
  void import('./settingsSync').then(m => m.pushSetting(BANNER_SIZE_STORAGE_KEY));
  window.dispatchEvent(new Event('storage'));
}
