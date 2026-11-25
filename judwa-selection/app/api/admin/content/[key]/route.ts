import { NextRequest, NextResponse } from 'next/server';
import { getContent, isContentKey, setContent } from '@/lib/siteContent';

const MAX_ITEMS = 2000;

// Admin read (full data incl. purchase prices) and write. Protected by proxy.ts.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isContentKey(key)) {
    return NextResponse.json({ error: 'Unknown content' }, { status: 404 });
  }
  try {
    return NextResponse.json({ value: await getContent(key) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error(`Error reading content "${key}":`, error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!isContentKey(key)) {
    return NextResponse.json({ error: 'Unknown content' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const value = body?.value;
  if (!Array.isArray(value) || value.length > MAX_ITEMS || value.some(item => typeof item !== 'object' || !item?.id)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }

  try {
    await setContent(key, value);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error saving content "${key}":`, error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
