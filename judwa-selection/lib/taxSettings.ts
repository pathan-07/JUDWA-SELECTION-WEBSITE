export interface TaxSettings {
  gstin: string;
  gstRate: number;
  showGstinInFooter: boolean;
}

export const TAX_SETTINGS_STORAGE_KEY = 'judwa_tax_settings';

export const DEFAULT_TAX_SETTINGS: TaxSettings = {
  gstin: '',
  gstRate: 5,
  showGstinInFooter: false,
};

export const GST_RATES = [0, 5, 12, 18];

export function loadTaxSettings(): TaxSettings {
  if (typeof window === 'undefined') return DEFAULT_TAX_SETTINGS;
  try {
    const raw = localStorage.getItem(TAX_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_TAX_SETTINGS;
    return { ...DEFAULT_TAX_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TAX_SETTINGS;
  }
}

export function saveTaxSettings(settings: TaxSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TAX_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  void import('./settingsSync').then(m => m.pushSetting(TAX_SETTINGS_STORAGE_KEY));
  window.dispatchEvent(new Event('storage'));
}

// Indian GSTIN: 2-digit state code, 10-char PAN, entity digit, 'Z', checksum
export function isValidGstin(gstin: string): boolean {
  return /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin);
}
