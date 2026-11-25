// Admin settings that customers' browsers must see too. Each is stored in localStorage under this key
// and mirrored to the database (site_content "settings") so every device gets the same values.
export const SYNCED_SETTING_KEYS = [
  'judwa_announcement_settings',
  'judwa_banner_size_settings',
  'judwa_category_card_settings',
  'judwa_feature_strip',
  'judwa_footer_settings',
  'judwa_homepage_settings',
  'judwa_payment_settings',
  'judwa_product_card_settings',
  'judwa_reels_settings',
  'judwa_shipping_settings',
  'judwa_admin_sizes',
  'judwa_social_links',
  'judwa_store_settings',
  'judwa_tax_settings',
  'judwa_theme_color',
] as const;

export type SyncedSettingKey = (typeof SYNCED_SETTING_KEYS)[number];

/** Raw localStorage strings keyed by setting key. */
export type SettingsMap = Partial<Record<SyncedSettingKey, string>>;

export const isSyncedSettingKey = (key: string): key is SyncedSettingKey =>
  (SYNCED_SETTING_KEYS as readonly string[]).includes(key);

/** Parses one stored JSON setting, falling back to the defaults (also used on the server). */
export function readSetting<T extends object>(map: SettingsMap | null | undefined, key: SyncedSettingKey, defaults: T): T {
  const raw = map?.[key];
  if (!raw) return defaults;
  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}
