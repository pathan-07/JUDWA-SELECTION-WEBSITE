import { connection } from 'next/server';
import HomeClient from '@/components/HomeClient';
import { getContent } from '@/lib/siteContent';
import { DEFAULT_BANNERS, SiteBanner } from '@/lib/banners';
import { DEFAULT_REELS, SiteReel } from '@/lib/reelsData';
import { DEFAULT_COLLECTIONS, SiteCollection } from '@/lib/collectionsData';

const orDefault = <T,>(value: T[] | null, fallback: T[]) => (Array.isArray(value) && value.length > 0 ? value : fallback);

export default async function Home() {
  // Render per request so admin changes show up immediately
  await connection();

  try {
    const [banners, reels, collections] = await Promise.all([
      getContent<SiteBanner[]>('banners'),
      getContent<SiteReel[]>('reels'),
      getContent<SiteCollection[]>('collections'),
    ]);
    return (
      <HomeClient
        initialContent={{
          banners: orDefault(banners, DEFAULT_BANNERS),
          reels: orDefault(reels, DEFAULT_REELS),
          collections: orDefault(collections, DEFAULT_COLLECTIONS),
        }}
      />
    );
  } catch {
    // Database not connected yet: the client loads this browser's saved content instead
    return <HomeClient initialContent={null} />;
  }
}
