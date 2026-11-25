import { SaveTarget, fetchContent, saveContent } from './contentClient';

export interface SiteReel {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl?: string;
  ctaLabel: string;
  ctaLink: string;
  isActive: boolean;
}

export const REELS_STORAGE_KEY = 'judwa_reels';

export const DEFAULT_REELS: SiteReel[] = [
  {
    id: '1',
    title: 'New Season Collection',
    thumbnail: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=600&fit=crop',
    ctaLabel: 'Shop Collection',
    ctaLink: '/products?category=boys',
    isActive: true,
  },
  {
    id: '2',
    title: 'School Uniform Ready',
    thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=600&fit=crop',
    ctaLabel: 'Shop Uniforms',
    ctaLink: '/school-uniforms',
    isActive: true,
  },
  {
    id: '3',
    title: 'Festive Kids Fashion',
    thumbnail: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=600&fit=crop',
    ctaLabel: 'Explore Festive',
    ctaLink: '/products?category=girls',
    isActive: true,
  },
  {
    id: '4',
    title: 'Fresh Arrivals',
    thumbnail: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=600&fit=crop',
    ctaLabel: 'See New Arrivals',
    ctaLink: '/products',
    isActive: true,
  },
  {
    id: '5',
    title: 'Weekend Comfort Wear',
    thumbnail: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=600&fit=crop',
    ctaLabel: 'Shop Now',
    ctaLink: '/products',
    isActive: true,
  },
];

export async function loadReels(): Promise<SiteReel[]> {
  const stored = await fetchContent<SiteReel[]>('reels');
  return Array.isArray(stored) && stored.length > 0 ? stored : DEFAULT_REELS;
}

export function saveReels(reels: SiteReel[]): Promise<SaveTarget> {
  return saveContent('reels', reels);
}
