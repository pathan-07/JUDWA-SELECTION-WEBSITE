import { Banknote, CreditCard, Gift, Headphones, Heart, Lock, Package, RotateCcw, ShieldCheck, Star, Trophy, Truck } from 'lucide-react';

export const FEATURE_ICONS = {
  truck: Truck,
  trophy: Trophy,
  lock: Lock,
  shield: ShieldCheck,
  returns: RotateCcw,
  gift: Gift,
  star: Star,
  heart: Heart,
  card: CreditCard,
  cash: Banknote,
  support: Headphones,
  package: Package,
} as const;

export type FeatureIconKey = keyof typeof FEATURE_ICONS;

export interface FeatureItem {
  icon: FeatureIconKey;
  title: string;
  subtitle: string;
}

export interface FeatureStripSettings {
  enabled: boolean;
  items: FeatureItem[];
}

export const FEATURE_STRIP_STORAGE_KEY = 'judwa_feature_strip';

export const AMOUNT_TOKEN = '{amount}';

export const DEFAULT_FEATURE_STRIP: FeatureStripSettings = {
  enabled: true,
  items: [
    { icon: 'truck', title: 'Free Shipping', subtitle: `On orders above ${AMOUNT_TOKEN}` },
    { icon: 'trophy', title: 'Quality Guaranteed', subtitle: 'Premium fabrics & crafts' },
    { icon: 'lock', title: 'Secure Payment', subtitle: '100% safe transactions' },
  ],
};

export function loadFeatureStrip(): FeatureStripSettings {
  if (typeof window === 'undefined') return DEFAULT_FEATURE_STRIP;
  try {
    const raw = localStorage.getItem(FEATURE_STRIP_STORAGE_KEY);
    if (!raw) return DEFAULT_FEATURE_STRIP;
    const parsed = JSON.parse(raw) as Partial<FeatureStripSettings>;
    const items = DEFAULT_FEATURE_STRIP.items.map((def, i) => {
      const item = { ...def, ...parsed.items?.[i] };
      return item.icon in FEATURE_ICONS ? item : { ...item, icon: def.icon };
    });
    return { enabled: parsed.enabled ?? true, items };
  } catch {
    return DEFAULT_FEATURE_STRIP;
  }
}

export function saveFeatureStrip(settings: FeatureStripSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FEATURE_STRIP_STORAGE_KEY, JSON.stringify(settings));
  void import('./settingsSync').then(m => m.pushSetting(FEATURE_STRIP_STORAGE_KEY));
  window.dispatchEvent(new Event('storage'));
}

export function resolveFeatureText(text: string, freeShippingAbove: number): string {
  if (!text.includes(AMOUNT_TOKEN)) return text;
  if (freeShippingAbove <= 0) return 'On all orders';
  return text.split(AMOUNT_TOKEN).join(`₹${freeShippingAbove.toLocaleString('en-IN')}`);
}
