export interface HomepageSettings {
  showRealKidsReviews: boolean;
}

export const HOMEPAGE_SETTINGS_STORAGE_KEY = 'judwa_homepage_settings';

export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  showRealKidsReviews: true,
};

export function loadHomepageSettings(): HomepageSettings {
  if (typeof window === 'undefined') return DEFAULT_HOMEPAGE_SETTINGS;
  try {
    const raw = localStorage.getItem(HOMEPAGE_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_HOMEPAGE_SETTINGS;
    return { ...DEFAULT_HOMEPAGE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_HOMEPAGE_SETTINGS;
  }
}

export function saveHomepageSettings(settings: HomepageSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HOMEPAGE_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  void import('./settingsSync').then(m => m.pushSetting(HOMEPAGE_SETTINGS_STORAGE_KEY));
  window.dispatchEvent(new Event('storage'));
}
