import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

const VISITOR_ID = /^[A-Za-z0-9-]{8,64}$/;

// Public: records one storefront page view. Never fails loudly — tracking must not affect shoppers.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const visitorId = typeof body?.visitorId === 'string' ? body.visitorId : '';
  const path = typeof body?.path === 'string' ? body.path.slice(0, 255) : '';

  if (!VISITOR_ID.test(visitorId) || !path.startsWith('/') || path.startsWith('/admin')) {
    return new NextResponse(null, { status: 204 });
  }

  const { error } = await supabaseServer.from('site_visits').insert({ visitor_id: visitorId, path });
  if (error) console.error('Visit tracking failed (has migration 006 been run?):', error.message);
  return new NextResponse(null, { status: 204 });
}
