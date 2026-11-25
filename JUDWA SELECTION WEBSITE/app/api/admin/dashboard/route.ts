import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { getContent } from '@/lib/siteContent';
import type { SiteProduct } from '@/lib/productsData';
import { getVisitStats } from '@/lib/visitStats';
import { getStatsResetAt, laterOf } from '@/lib/statsReset';

const LOW_STOCK_LIMIT = 5;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// Start of the current day / month in India, as a UTC ISO string (orders.created_at is stored in UTC)
function istStart(kind: 'day' | 'month') {
  const ist = new Date(Date.now() + IST_OFFSET_MS);
  const start = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), kind === 'day' ? ist.getUTCDate() : 1);
  return new Date(start - IST_OFFSET_MS).toISOString();
}

// Dashboard numbers (protected by proxy.ts). Cancelled orders are not counted as sales.
export async function GET() {
  const resetAt = await getStatsResetAt();
  let ordersQuery = supabaseServer
    .from('orders')
    .select('total_amount, order_status, guest_phone, created_at, order_items(selling_price, purchase_price, quantity)')
    .neq('order_status', 'cancelled')
    .limit(10000);
  if (resetAt) ordersQuery = ordersQuery.gte('created_at', resetAt);

  const [ordersRes, reviewsRes, products] = await Promise.all([
    ordersQuery,
    supabaseServer.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    getContent<SiteProduct[]>('products').catch(() => null),
  ]);

  if (ordersRes.error) {
    console.error('Error loading dashboard:', ordersRes.error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const orders = ordersRes.data || [];
  const dayStart = laterOf(istStart('day'), resetAt);
  const monthStart = laterOf(istStart('month'), resetAt);
  const [visitsToday, visitsMonth] = await Promise.all([getVisitStats(dayStart), getVisitStats(monthStart)]);

  const profitOf = (order: (typeof orders)[number]) =>
    (order.order_items || []).reduce(
      (sum: number, item: any) =>
        // Items without a purchase price (combos/uniforms) count as 0 profit rather than full price
        sum + (Number(item.purchase_price) > 0 ? (Number(item.selling_price) - Number(item.purchase_price)) * item.quantity : 0),
      0
    );
  const summarize = (list: typeof orders) => ({
    count: list.length,
    sales: list.reduce((sum, o) => sum + Number(o.total_amount), 0),
    profit: list.reduce((sum, o) => sum + profitOf(o), 0),
  });

  const all = summarize(orders);
  const today = summarize(orders.filter(o => o.created_at >= dayStart));
  const month = summarize(orders.filter(o => o.created_at >= monthStart));
  const customers = new Set(orders.map(o => (o.guest_phone || '').replace(/\D/g, '').slice(-10)).filter(Boolean)).size;
  const lowStockProducts = (products || []).filter(
    p => p.is_active && p.variants.some(v => (v.stock ?? 0) <= LOW_STOCK_LIMIT)
  ).length;

  return NextResponse.json(
    {
      totalOrders: all.count,
      totalSales: all.sales,
      totalProfit: all.profit,
      totalCustomers: customers,
      lowStockProducts,
      pendingReviews: reviewsRes.count || 0,
      todayOrders: today.count,
      todaySales: today.sales,
      todayProfit: today.profit,
      monthlyProfit: month.profit,
      monthlySales: month.sales,
      viewsToday: visitsToday.views,
      visitorsToday: visitsToday.visitors,
      viewsMonth: visitsMonth.views,
      visitorsMonth: visitsMonth.visitors,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
