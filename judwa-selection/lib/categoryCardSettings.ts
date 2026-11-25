export type CategoryShape = 'portrait' | 'square' | 'circle';
export type CategoryStyle = 'bordered' | 'shadow' | 'minimal';
export type CategoryCorners = 'square' | 'rounded';
export type CategorySize = 'small' | 'medium' | 'large';
export type CategoryLabel = 'below' | 'overlay';
export type CategoryMobileLayout = 'scroll' | 'grid';

export interface CategoryCardSettings {
  shape: CategoryShape;
  style: CategoryStyle;
  corners: CategoryCorners;
  size: CategorySize;
  label: CategoryLabel;
  mobileLayout: CategoryMobileLayout;
}

export const CATEGORY_CARD_STORAGE_KEY = 'judwa_category_card_settings';

export const DEFAULT_CATEGORY_CARD_SETTINGS: CategoryCardSettings = {
  shape: 'portrait',
  style: 'bordered',
  corners: 'square',
  size: 'medium',
  label: 'below',
  mobileLayout: 'scroll',
};

export function loadCategoryCardSettings(): CategoryCardSettings {
  if (typeof window === 'undefined') return DEFAULT_CATEGORY_CARD_SETTINGS;
  try {
    const raw = localStorage.getItem(CATEGORY_CARD_STORAGE_KEY);
    if (!raw) return DEFAULT_CATEGORY_CARD_SETTINGS;
    return { ...DEFAULT_CATEGORY_CARD_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CATEGORY_CARD_SETTINGS;
  }
}

export function saveCategoryCardSettings(settings: CategoryCardSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CATEGORY_CARD_STORAGE_KEY, JSON.stringify(settings));
  void import('./settingsSync').then(m => m.pushSetting(CATEGORY_CARD_STORAGE_KEY));
  window.dispatchEvent(new Event('storage'));
}

const SCROLL_WIDTH: Record<CategorySize, string> = {
  small: 'w-[26%] sm:w-[20%]',
  medium: 'w-[38%] sm:w-[28%]',
  large: 'w-[48%] sm:w-[36%]',
};

const MOBILE_GRID: Record<CategorySize, string> = {
  small: 'grid grid-cols-4',
  medium: 'grid grid-cols-3',
  large: 'grid grid-cols-2',
};

const DESKTOP_GRID: Record<CategorySize, string> = {
  small: 'md:grid md:grid-cols-6 lg:grid-cols-8',
  medium: 'md:grid md:grid-cols-4 lg:grid-cols-8',
  large: 'md:grid md:grid-cols-4',
};

/** Circles always show the label under the image, without a frame. */
export function effectiveCategorySettings(s: CategoryCardSettings): CategoryCardSettings {
  return s.shape === 'circle' ? { ...s, label: 'below', style: 'minimal' } : s;
}

export function categoryContainerClasses(s: CategoryCardSettings): string {
  const mobile =
    s.mobileLayout === 'scroll'
      ? 'flex overflow-x-auto md:overflow-visible scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x scroll-pl-4 md:scroll-pl-0'
      : MOBILE_GRID[s.size];
  return `${mobile} ${DESKTOP_GRID[s.size]} gap-3 sm:gap-4`;
}

export function categoryItemClasses(s: CategoryCardSettings): string {
  const width = s.mobileLayout === 'scroll' ? `flex-shrink-0 snap-start ${SCROLL_WIDTH[s.size]} md:w-auto` : '';
  const frame =
    s.style === 'bordered'
      ? 'bg-white border border-ink-100 hover:shadow-lg'
      : s.style === 'shadow'
        ? 'bg-white shadow-md hover:shadow-xl'
        : '';
  const round = s.corners === 'rounded' && s.style !== 'minimal' ? 'rounded-2xl' : '';
  return `${width} ${frame} ${round} group flex flex-col overflow-hidden transition`;
}

export function categoryImageClasses(s: CategoryCardSettings): string {
  if (s.shape === 'circle') return 'aspect-square rounded-full';
  const aspect = s.shape === 'square' ? 'aspect-square' : 'aspect-[3/4]';
  const round = s.style === 'minimal' && s.corners === 'rounded' ? 'rounded-2xl' : '';
  return `${aspect} ${round}`;
}

export function categoryLabelClasses(s: CategoryCardSettings): string {
  const text = s.size === 'small' ? 'text-xs sm:text-sm' : s.size === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-base';
  return `${text} ${s.style === 'minimal' ? 'pt-2' : 'px-2 py-2.5'}`;
}
