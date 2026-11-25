import { SaveTarget, fetchContent, saveContent } from './contentClient';

export interface SiteReview {
  id: string;
  productId: string; // STORE_REVIEW_ID for a review of the shop/website itself
  productName: string;
  customer: string;
  rating: number; // 1-5
  text: string;
  photo?: string;
  date: string; // YYYY-MM-DD
  status: 'approved' | 'hidden' | 'pending'; // customer reviews start as pending until the admin approves
  featured: boolean; // shown in "What Parents Say" on the homepage
  adminAdded: boolean;
  orderNumber?: string; // never sent to the storefront
}

export const STORE_REVIEW_ID = 'store';
export const STORE_REVIEW_NAME = 'JUDWA SELECTION (Website & Service)';

/** Storefront gets only visible reviews; pass `admin: true` in the admin panel to include hidden ones. */
export async function loadReviews({ admin = false } = {}): Promise<SiteReview[]> {
  const stored = await fetchContent<SiteReview[]>('reviews', { admin });
  return Array.isArray(stored) ? stored : [];
}

export function saveReviews(reviews: SiteReview[]): Promise<SaveTarget> {
  return saveContent('reviews', reviews);
}

export function ratingSummary(reviews: SiteReview[]) {
  const count = reviews.length;
  const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  return { count, average: Math.round(average * 10) / 10 };
}
