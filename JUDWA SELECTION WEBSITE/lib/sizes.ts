export interface SizeGroup {
  id: string;
  name: string;
  type: 'age' | 'numeric' | 'alpha';
  sizes: string[];
}

export const SIZES_STORAGE_KEY = 'judwa_admin_sizes';

export const DEFAULT_SIZE_GROUPS: SizeGroup[] = [
  {
    id: '1',
    name: 'Baby / Infant (Age)',
    type: 'age',
    sizes: ['0-3M', '3-6M', '6-12M', '1-2Y', '2-3Y'],
  },
  {
    id: '2',
    name: 'Kids (Age)',
    type: 'age',
    sizes: ['3-4Y', '4-5Y', '5-6Y', '6-7Y', '7-8Y', '8-9Y', '9-10Y', '10-11Y', '11-12Y', '12-13Y', '13-14Y', '14-15Y'],
  },
  {
    id: '3',
    name: 'School Uniform (Numeric)',
    type: 'numeric',
    sizes: ['26', '28', '30', '32', '34', '36'],
  },
  {
    id: '4',
    name: 'Standard (Alpha)',
    type: 'alpha',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
];

export function loadSizeGroups(): SizeGroup[] {
  if (typeof window === 'undefined') return DEFAULT_SIZE_GROUPS;
  try {
    const raw = localStorage.getItem(SIZES_STORAGE_KEY);
    if (!raw) return DEFAULT_SIZE_GROUPS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SIZE_GROUPS;
  } catch {
    return DEFAULT_SIZE_GROUPS;
  }
}

export function saveSizeGroups(groups: SizeGroup[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SIZES_STORAGE_KEY, JSON.stringify(groups));
  void import('./settingsSync').then(m => m.pushSetting(SIZES_STORAGE_KEY));
  window.dispatchEvent(new Event('storage'));
}

/** Find the size group whose name best matches a school/numeric uniform context. */
export function getSchoolSizeGroup(groups: SizeGroup[]): SizeGroup | undefined {
  return groups.find(g => g.type === 'numeric') || groups[0];
}
