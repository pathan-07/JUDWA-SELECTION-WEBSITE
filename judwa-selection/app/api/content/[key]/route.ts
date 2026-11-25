import { NextResponse } from 'next/server';
import { getContent, isContentKey, toPublicContent } from '@/lib/siteContent';

// Public read of storefront content (purchase prices and inactive products are stripped).
export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isContentKey(key)) {
    return NextResponse.json({ error: 'Unknown content' }, { status: 404 });
  }

  try {
    const value = await getContent(key);
    return NextResponse.json(
      { value: value === null ? null : toPublicContent(key, value) },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error(`Error reading content "${key}":`, error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
