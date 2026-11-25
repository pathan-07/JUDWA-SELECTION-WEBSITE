import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { getContent, setContent } from '@/lib/siteContent';
import type { SiteProduct } from '@/lib/productsData';
import { STORE_REVIEW_ID, STORE_REVIEW_NAME, type SiteReview } from '@/lib/reviewsData';
import { notifyOwnerNewReview } from '@/lib/notifications';

const ORDER_NUMBER_RE = /^[A-Z0-9-]{4,50}$/i;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

interface ReviewableItem {
  productId: string;
  productName: string;
  reviewed: boolean;
}

// Products of a delivered order that can be reviewed, plus the shop itself. Combos/uniforms have no review page.
async function loadReviewable(orderNumber: string) {
  const { data: order, error } = await supabaseServer
    .from('orders')
    .select('order_status, order_items(product_id, product_name)')
    .eq('order_number', orderNumber)
    .maybeSingle();
  if (error) throw error;
  if (!order) return null;

  const [products, reviews] = await Promise.all([
    getContent<SiteProduct[]>('products').catch(() => null),
    getContent<SiteReview[]>('reviews'),
  ]);
  const allReviews = Array.isArray(reviews) ? reviews : [];
  const reviewedIds = new Set(allReviews.filter(r => r.orderNumber === orderNumber).map(r => r.productId));

  const items = new Map<string, ReviewableItem>();
  for (const item of order.order_items || []) {
    const id = String(item.product_id || '');
    if (!id || id.includes(':') || items.has(id)) continue;
    const product = (products || []).find(p => p.id === id);
    const productName = (product?.name || String(item.product_name || 'Product').split(' — ')[0]).trim();
    items.set(id, { productId: id, productName, reviewed: reviewedIds.has(id) });
  }
  items.set(STORE_REVIEW_ID, { productId: STORE_REVIEW_ID, productName: STORE_REVIEW_NAME, reviewed: reviewedIds.has(STORE_REVIEW_ID) });

  return { delivered: order.order_status === 'delivered', items: [...items.values()], allReviews };
}

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get('orderNumber') || '';
  if (!ORDER_NUMBER_RE.test(orderNumber)) {
    return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
  }
  try {
    const result = await loadReviewable(orderNumber);
    if (!result) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(
      { canReview: result.delivered, items: result.delivered ? result.items : [] },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Error loading reviewable items:', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

// A customer reviews one product (or the shop) from a delivered order. Saved as pending until the admin approves.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const orderNumber = typeof body?.orderNumber === 'string' ? body.orderNumber : '';
  const productId = typeof body?.productId === 'string' ? body.productId : '';
  const customer = typeof body?.customer === 'string' ? body.customer.trim().slice(0, 80) : '';
  const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 1000) : '';
  const rating = Number(body?.rating);

  if (!ORDER_NUMBER_RE.test(orderNumber) || !productId) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Please choose 1 to 5 stars' }, { status: 400 });
  }
  if (!customer || text.length < 3) {
    return NextResponse.json({ error: 'Please enter your name and a few words about it' }, { status: 400 });
  }

  try {
    const result = await loadReviewable(orderNumber);
    if (!result) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (!result.delivered) {
      return NextResponse.json({ error: 'You can write a review once your order is delivered' }, { status: 403 });
    }
    const item = result.items.find(i => i.productId === productId);
    if (!item) return NextResponse.json({ error: 'This product is not in your order' }, { status: 400 });
    if (item.reviewed) return NextResponse.json({ error: 'You have already reviewed this' }, { status: 409 });

    const review: SiteReview = {
      id: `${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      productId,
      productName: item.productName,
      customer,
      rating,
      text,
      date: new Date(Date.now() + IST_OFFSET_MS).toISOString().slice(0, 10),
      status: 'pending',
      featured: false,
      adminAdded: false,
      orderNumber,
    };
    await setContent('reviews', [review, ...result.allReviews]);
    await notifyOwnerNewReview({ orderNumber, customer, productName: item.productName, rating, text });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving review:', error);
    return NextResponse.json({ error: 'Could not save your review. Please try again.' }, { status: 503 });
  }
}
