import { SaveTarget, fetchContent, saveContent } from './contentClient';

export interface SiteBanner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  isActive: boolean;
  order: number;
  showText?: boolean;
  showButton?: boolean;
}

export const BANNERS_STORAGE_KEY = 'judwa_banners';

export const DEFAULT_BANNERS: SiteBanner[] = [
  {
    id: '1',
    title: 'Summer Collection 2024',
    subtitle: 'Discover vibrant colors & fresh styles for kids',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1920&h=1000&fit=crop',
    link: '/products?category=boys',
    isActive: true,
    order: 1,
    showText: true,
  },
  {
    id: '2',
    title: 'Back to School Sale',
    subtitle: 'Up to 50% off on school uniforms & casual wear',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=1920&h=1000&fit=crop',
    link: '/products?category=girls',
    isActive: true,
    order: 2,
    showText: true,
  },
  {
    id: '3',
    title: 'Premium Kids Fashion',
    subtitle: 'Comfort meets style for your little ones',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&h=1000&fit=crop',
    link: '/products',
    isActive: true,
    order: 3,
    showText: true,
  },
];

export async function loadBanners(): Promise<SiteBanner[]> {
  const stored = await fetchContent<SiteBanner[]>('banners');
  return Array.isArray(stored) && stored.length > 0 ? stored : DEFAULT_BANNERS;
}

export function saveBanners(banners: SiteBanner[]): Promise<SaveTarget> {
  return saveContent('banners', banners);
}
