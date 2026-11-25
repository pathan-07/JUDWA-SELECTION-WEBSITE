export interface ReelsSettings {
  autoScroll: boolean;
}

export const REELS_SETTINGS_STORAGE_KEY = 'judwa_reels_settings';

export const DEFAULT_REELS_SETTINGS: ReelsSettings = {
  autoScroll: true,
};

export function loadReelsSettings(): ReelsSettings {
  if (typeof window === 'undefined') return DEFAULT_REELS_SETTINGS;
  try {
    const raw = localStorage.getItem(REELS_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_REELS_SETTINGS;
    return { ...DEFAULT_REELS_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_REELS_SETTINGS;
  }
}

export function saveReelsSettings(settings: ReelsSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REELS_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  void import('./settingsSync').then(m => m.pushSetting(REELS_SETTINGS_STORAGE_KEY));
  window.dispatchEvent(new Event('storage'));
}
