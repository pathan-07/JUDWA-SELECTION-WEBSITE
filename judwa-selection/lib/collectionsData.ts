import { SaveTarget, fetchContent, saveContent } from './contentClient';

export interface SiteCollection {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
}

export const COLLECTIONS_STORAGE_KEY = 'judwa_collections';

export const DEFAULT_COLLECTIONS: SiteCollection[] = [
  {
    id: '1',
    name: 'Boys Collection',
    subtitle: 'Stylish & comfortable styles',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&h=500&fit=crop',
    link: '/products?category=boys',
    isActive: true,
  },
  {
    id: '2',
    name: 'Girls Collection',
    subtitle: 'Trendy & adorable collection',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=500&h=500&fit=crop',
    link: '/products?category=girls',
    isActive: true,
  },
  {
    id: '3',
    name: 'School Uniforms',
    subtitle: 'Comfort, quality & perfect fit',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&h=500&fit=crop',
    link: '/school-uniforms',
    isActive: true,
  },
  {
    id: '4',
    name: 'Summer Collection',
    subtitle: 'Light & breezy everyday wear',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=500&h=500&fit=crop',
    link: '/products?collection=summer',
    isActive: true,
  },
  {
    id: '5',
    name: 'Festive Collection',
    subtitle: 'Make every occasion special',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop',
    link: '/products?collection=festive',
    isActive: true,
  },
  {
    id: '6',
    name: 'Weekend Wear',
    subtitle: 'Relaxed styles for playtime',
    image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=500&h=500&fit=crop',
    link: '/products?collection=weekend',
    isActive: true,
  },
];

export async function loadCollections(): Promise<SiteCollection[]> {
  const stored = await fetchContent<SiteCollection[]>('collections');
  return Array.isArray(stored) && stored.length > 0 ? stored : DEFAULT_COLLECTIONS;
}

export function saveCollections(collections: SiteCollection[]): Promise<SaveTarget> {
  return saveContent('collections', collections);
}
