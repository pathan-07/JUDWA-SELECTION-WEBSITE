import { SaveTarget, fetchContent, saveContent } from './contentClient';
import { DEFAULT_SIZE_GROUPS, getSchoolSizeGroup } from './sizes';

export interface SizePriceOverride {
  size: string;
  shirtPrice?: number;
  pantPrice?: number;
}

export interface UniformPair {
  id: string;
  schoolName: string;
  image?: string; // full uniform set photo shown to customers
  shirtName: string;
  shirtPrice: number;
  shirtImage?: string;
  pantName: string;
  pantPrice: number;
  pantImage?: string;
  comboPrice: number | null; // null = no override, use shirtPrice + pantPrice
  shirtSizes?: string[];
  pantSizes?: string[];
  availableSizes?: string[]; // legacy: one list for both; used when shirtSizes/pantSizes are missing
  sizePrices?: SizePriceOverride[]; // per-size price overrides for shirt/pant
  isActive: boolean;
}

export const DEFAULT_UNIFORM_PAIRS: UniformPair[] = [
  {
    id: '1',
    schoolName: 'St. Xavier School',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&h=1000&fit=crop',
    shirtName: 'St. Xavier Shirt',
    shirtPrice: 350,
    pantName: 'St. Xavier Pant',
    pantPrice: 400,
    comboPrice: 699,
    availableSizes: ['26', '28', '30', '32', '34', '36'],
    isActive: true,
  },
  {
    id: '2',
    schoolName: 'Delhi Public School',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=1000&fit=crop',
    shirtName: 'DPS Shirt',
    shirtPrice: 320,
    pantName: 'DPS Pant',
    pantPrice: 380,
    comboPrice: null,
    availableSizes: ['26', '28', '30', '32', '34', '36'],
    isActive: true,
  },
];

export async function loadUniformPairs({ admin = false } = {}): Promise<UniformPair[]> {
  const stored = await fetchContent<UniformPair[]>('uniforms', { admin });
  return Array.isArray(stored) && stored.length > 0 ? stored : DEFAULT_UNIFORM_PAIRS;
}

export function saveUniformPairs(pairs: UniformPair[]): Promise<SaveTarget> {
  return saveContent('uniforms', pairs);
}

const DEFAULT_SCHOOL_SIZES = getSchoolSizeGroup(DEFAULT_SIZE_GROUPS)?.sizes ?? [];

function legacySizes(pair: UniformPair): string[] {
  return pair.availableSizes && pair.availableSizes.length > 0 ? pair.availableSizes : DEFAULT_SCHOOL_SIZES;
}

/** Shirt sizes a customer can pick (same list the server validates against). */
export function getShirtSizes(pair: UniformPair): string[] {
  return pair.shirtSizes && pair.shirtSizes.length > 0 ? pair.shirtSizes : legacySizes(pair);
}

/** Pant sizes a customer can pick (same list the server validates against). */
export function getPantSizes(pair: UniformPair): string[] {
  return pair.pantSizes && pair.pantSizes.length > 0 ? pair.pantSizes : legacySizes(pair);
}

/** Lowest price a customer could pay for this set (shown as "from ₹X"). */
export function getStartingPrice(pair: UniformPair): number {
  const shirtSizes = getShirtSizes(pair);
  const pantSizes = getPantSizes(pair);
  if (shirtSizes.length === 0 || pantSizes.length === 0) return getPairTotal(pair);
  return Math.min(...shirtSizes.flatMap(s => pantSizes.map(p => getSelectedSizeTotal(pair, s, p))));
}

/** Line-by-line bill for the chosen sizes. */
export function getUniformBill(pair: UniformPair, shirtSize: string, pantSize: string) {
  const shirtPrice = getShirtPriceForSize(pair, shirtSize);
  const pantPrice = getPantPriceForSize(pair, pantSize);
  const total = getSelectedSizeTotal(pair, shirtSize, pantSize);
  return { shirtPrice, pantPrice, discount: Math.max(0, shirtPrice + pantPrice - total), total };
}

export function getPairTotal(pair: UniformPair): number {
  return pair.comboPrice ?? pair.shirtPrice + pair.pantPrice;
}

export function getShirtPriceForSize(pair: UniformPair, size: string): number {
  const override = pair.sizePrices?.find(sp => sp.size === size);
  return override?.shirtPrice ?? pair.shirtPrice;
}

export function getPantPriceForSize(pair: UniformPair, size: string): number {
  const override = pair.sizePrices?.find(sp => sp.size === size);
  return override?.pantPrice ?? pair.pantPrice;
}

// Total for a specific shirt size + pant size combination, honoring per-size price overrides
export function getSelectedSizeTotal(pair: UniformPair, shirtSize: string, pantSize: string): number {
  const hasOverride =
    pair.sizePrices?.some(sp => sp.size === shirtSize && sp.shirtPrice !== undefined) ||
    pair.sizePrices?.some(sp => sp.size === pantSize && sp.pantPrice !== undefined);

  if (pair.comboPrice !== null && !hasOverride) {
    return pair.comboPrice;
  }

  return getShirtPriceForSize(pair, shirtSize) + getPantPriceForSize(pair, pantSize);
}
