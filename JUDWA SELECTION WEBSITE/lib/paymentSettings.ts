export interface PaymentSettings {
  codEnabled: boolean;
  codCharge: number;
}

export const PAYMENT_SETTINGS_STORAGE_KEY = 'judwa_payment_settings';

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  codEnabled: true,
  codCharge: 100,
};

export function loadPaymentSettings(): PaymentSettings {
  if (typeof window === 'undefined') return DEFAULT_PAYMENT_SETTINGS;
  try {
    const raw = localStorage.getItem(PAYMENT_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_PAYMENT_SETTINGS;
    return { ...DEFAULT_PAYMENT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PAYMENT_SETTINGS;
  }
}

export function savePaymentSettings(settings: PaymentSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PAYMENT_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  void import('./settingsSync').then(m => m.pushSetting(PAYMENT_SETTINGS_STORAGE_KEY));
  window.dispatchEvent(new Event('storage'));
}
