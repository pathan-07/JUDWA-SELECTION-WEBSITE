export type CardStyle = 'bordered' | 'shadow' | 'minimal';
export type CardCorners = 'square' | 'rounded';
export type CardImageShape = 'square' | 'portrait';
export type CardAlign = 'left' | 'center';
export type CardButtonStyle = 'filled' | 'outline';

export interface ProductCardSettings {
  style: CardStyle;
  corners: CardCorners;
  imageShape: CardImageShape;
  align: CardAlign;
  showCategory: boolean;
  showRating: boolean;
  showDiscount: boolean;
  showButton: boolean;
  buttonText: string;
  buttonStyle: CardButtonStyle;
}

export const PRODUCT_CARD_STORAGE_KEY = 'judwa_product_card_settings';

export const DEFAULT_PRODUCT_CARD_SETTINGS: ProductCardSettings = {
  style: 'bordered',
  corners: 'square',
  imageShape: 'square',
  align: 'left',
  showCategory: true,
  showRating: true,
  showDiscount: true,
  showButton: true,
  buttonText: 'Add to Cart',
  buttonStyle: 'filled',
};

export function loadProductCardSettings(): ProductCardSettings {
  if (typeof window === 'undefined') return DEFAULT_PRODUCT_CARD_SETTINGS;
  try {
    const raw = localStorage.getItem(PRODUCT_CARD_STORAGE_KEY);
    if (!raw) return DEFAULT_PRODUCT_CARD_SETTINGS;
    return { ...DEFAULT_PRODUCT_CARD_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PRODUCT_CARD_SETTINGS;
  }
}

export function saveProductCardSettings(settings: ProductCardSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRODUCT_CARD_STORAGE_KEY, JSON.stringify(settings));
  void import('./settingsSync').then(m => m.pushSetting(PRODUCT_CARD_STORAGE_KEY));
  window.dispatchEvent(new Event('storage'));
}

const STYLE_CLASSES: Record<CardStyle, string> = {
  bordered: 'bg-white border border-ink-100 hover:shadow-lg',
  shadow: 'bg-white shadow-md hover:shadow-xl',
  minimal: 'bg-transparent',
};

export function cardClasses(s: ProductCardSettings): string {
  return `${STYLE_CLASSES[s.style]} ${s.corners === 'rounded' ? 'rounded-2xl' : ''} transition overflow-hidden`;
}

/** Minimal cards have no frame, so the image carries the rounding instead. */
export function imageClasses(s: ProductCardSettings): string {
  const aspect = s.imageShape === 'portrait' ? 'aspect-[3/4]' : 'aspect-square';
  const round = s.style === 'minimal' && s.corners === 'rounded' ? 'rounded-2xl' : '';
  return `${aspect} ${round}`;
}

export function infoClasses(s: ProductCardSettings): string {
  const pad = s.style === 'minimal' ? 'px-0.5 pt-3 pb-1' : 'p-3 sm:p-4';
  return `${pad} ${s.align === 'center' ? 'text-center items-center' : ''}`;
}

export function buttonClasses(s: ProductCardSettings): string {
  const shape = s.corners === 'rounded' ? 'rounded-full' : '';
  return s.buttonStyle === 'outline'
    ? `border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white ${shape}`
    : `brand-bg text-white hover:text-white ${shape}`;
}

export function discountPercent(price: number, mrp: number): number {
  return mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
}
