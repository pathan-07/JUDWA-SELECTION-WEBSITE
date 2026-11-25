export interface AnnouncementSettings {
  enabled: boolean;
  showFreeShipping: boolean;
  messages: string[];
  position: 'above' | 'below';
}

export const ANNOUNCEMENT_STORAGE_KEY = 'judwa_announcement_settings';

export const DEFAULT_ANNOUNCEMENT_SETTINGS: AnnouncementSettings = {
  enabled: true,
  showFreeShipping: true,
  messages: ['COD Available', 'Easy 7-Day Returns'],
  position: 'above',
};

export function loadAnnouncementSettings(): AnnouncementSettings {
  if (typeof window === 'undefined') return DEFAULT_ANNOUNCEMENT_SETTINGS;
  try {
    const raw = localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY);
    if (!raw) return DEFAULT_ANNOUNCEMENT_SETTINGS;
    return { ...DEFAULT_ANNOUNCEMENT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ANNOUNCEMENT_SETTINGS;
  }
}

export function saveAnnouncementSettings(settings: AnnouncementSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, JSON.stringify(settings));
  void import('./settingsSync').then(m => m.pushSetting(ANNOUNCEMENT_STORAGE_KEY));
  window.dispatchEvent(new Event('storage'));
}

/** Final list of lines shown in the top bar (free-shipping line comes from Shipping Settings). */
export function buildAnnouncements(settings: AnnouncementSettings, freeShippingLine: string): string[] {
  if (!settings.enabled) return [];
  const lines = settings.messages.map(m => m.trim()).filter(Boolean);
  return settings.showFreeShipping ? [freeShippingLine, ...lines] : lines;
}
