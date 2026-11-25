import { SaveTarget, fetchContent, saveContent } from './contentClient';

/** One item inside a combo (e.g. "T-Shirt 1"), with its own photo, sizes and colours. */
export interface ComboPiece {
  id: string;
  name: string;
  image?: string;
  price: number;
  sizes: string[];
  colors: string[];
}

export interface ComboSet {
  id: string;
  name: string;
  description?: string;
  image?: string; // main photo shown on cards
  pieces: ComboPiece[];
  comboPrice: number | null; // null = sum of piece prices
  isActive: boolean;
}

export interface ComboSelection {
  pieceId: string;
  size: string;
  color: string;
}

const KIDS_SIZES = ['2-3Y', '3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y', '10-11Y', '11-12Y'];
const UNIFORM_SIZES = ['26', '28', '30', '32', '34', '36'];

export const DEFAULT_COMBOS: ComboSet[] = [
  {
    id: '1',
    name: 'Pick Any 2 T-Shirts',
    description: 'Choose size and colour for each T-shirt.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop',
    pieces: [
      { id: 'a', name: 'T-Shirt 1', price: 499, sizes: KIDS_SIZES, colors: ['White', 'Navy', 'Red', 'Yellow'] },
      { id: 'b', name: 'T-Shirt 2', price: 499, sizes: KIDS_SIZES, colors: ['White', 'Navy', 'Red', 'Yellow'] },
    ],
    comboPrice: 699,
    isActive: true,
  },
  {
    id: '2',
    name: 'Pick Any 2 Bottoms',
    description: 'Mix and match two bottoms in different sizes or colours.',
    image: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=600&h=600&fit=crop',
    pieces: [
      { id: 'a', name: 'Bottom 1', price: 699, sizes: KIDS_SIZES, colors: ['Blue Denim', 'Black', 'Khaki'] },
      { id: 'b', name: 'Bottom 2', price: 699, sizes: KIDS_SIZES, colors: ['Blue Denim', 'Black', 'Khaki'] },
    ],
    comboPrice: 999,
    isActive: true,
  },
  {
    id: '3',
    name: 'School Uniform Combo',
    description: 'Shirt and pant — pick a separate size for each.',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=600&fit=crop',
    pieces: [
      { id: 'a', name: 'School Shirt', price: 950, sizes: UNIFORM_SIZES, colors: ['White', 'Sky Blue'] },
      { id: 'b', name: 'School Pant', price: 950, sizes: UNIFORM_SIZES, colors: ['Navy', 'Grey'] },
    ],
    comboPrice: 1499,
    isActive: true,
  },
  {
    id: '4',
    name: 'Festive Kids Combo',
    description: 'Kurta and pajama set for festivals.',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=600&h=600&fit=crop',
    pieces: [
      { id: 'a', name: 'Kurta', price: 999, sizes: KIDS_SIZES, colors: ['Cream', 'Maroon', 'Yellow'] },
      { id: 'b', name: 'Pajama', price: 800, sizes: KIDS_SIZES, colors: ['White', 'Cream'] },
    ],
    comboPrice: 1299,
    isActive: true,
  },
];

export async function loadCombos({ admin = false } = {}): Promise<ComboSet[]> {
  const stored = await fetchContent<ComboSet[]>('combos', { admin });
  return Array.isArray(stored) && stored.length > 0 ? stored : DEFAULT_COMBOS;
}

export function saveCombos(combos: ComboSet[]): Promise<SaveTarget> {
  return saveContent('combos', combos);
}

/** Price if each piece were bought separately (shown struck-through). */
export function getComboMrp(combo: ComboSet): number {
  return combo.pieces.reduce((sum, piece) => sum + piece.price, 0);
}

export function getComboPrice(combo: ComboSet): number {
  return combo.comboPrice ?? getComboMrp(combo);
}

export function getComboSavePercent(combo: ComboSet): number {
  const mrp = getComboMrp(combo);
  const price = getComboPrice(combo);
  return mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
}

/** True when every piece has exactly one valid size (and colour, if the piece has colours). Same check runs on the server. */
export function isValidComboSelection(combo: ComboSet, selections: unknown): selections is ComboSelection[] {
  if (!Array.isArray(selections) || selections.length !== combo.pieces.length) return false;
  return combo.pieces.every(piece => {
    const pick = selections.find((s: any) => s?.pieceId === piece.id);
    if (!pick || typeof pick.size !== 'string' || typeof pick.color !== 'string') return false;
    if (!piece.sizes.includes(pick.size)) return false;
    return piece.colors.length === 0 ? pick.color === '' : piece.colors.includes(pick.color);
  });
}

/** Human-readable choice list, e.g. "T-Shirt 1: 4-5Y, Red · T-Shirt 2: 6-7Y, Navy". */
export function describeComboSelection(combo: ComboSet, selections: ComboSelection[]): string {
  return combo.pieces
    .map(piece => {
      const pick = selections.find(s => s.pieceId === piece.id);
      if (!pick) return null;
      return `${piece.name}: ${pick.size}${pick.color ? `, ${pick.color}` : ''}`;
    })
    .filter(Boolean)
    .join(' · ');
}
