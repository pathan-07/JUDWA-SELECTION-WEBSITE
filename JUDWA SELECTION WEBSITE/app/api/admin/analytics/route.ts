import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { getContent } from '@/lib/siteContent';
import { toAdminOrder } from '@/lib/adminOrders';
import type { SiteProduct } from '@/lib/productsData';
import { getVisitStats } from '@/lib/visitStats';
import { getStatsResetAt, laterOf } from '@/lib/statsReset';

const RANGES: Record<string, number> = { '7days': 7, '30days': 30, '90days': 90, year: 365 };
const LOW_STOCK_LIMIT = 5;
const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// India calendar date (YYYY-MM-DD) of a UTC timestamp; orders.created_at is stored in UTC without a zone
const istDate = (iso: string) => new Date(new Date(iso.endsWith('Z') ? iso : `${iso}Z`).getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

const percentChange = (current: number, previous: number) =>
  previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;

// Sales analytics for the admin (protected by proxy.ts). Cancelled orders are excluded from sales.
export async function GET(request: NextRequest) {
  const range = request.nextUrl.searchParams.get('range') || '7days';
  const days = RANGES[range] ?? 7;
  const now = Date.now();
  const resetAt = await getStatsResetAt();
  const periodStart = laterOf(new Date(now - days * DAY_MS).toISOString(), resetAt);
  const previousStart = laterOf(new Date(now - 2 * days * DAY_MS).toISOString(), resetAt);

  let recentQuery = supabaseServer
    .from('orders')
    .select('id, order_number, notes, total_amount, order_status, payment_status, payment_method, created_at')
    .order('created_at', { ascending: false })
    .limit(8);
  if (resetAt) recentQuery = recentQuery.gte('created_at', resetAt);

  const [ordersRes, recentRes, products, visits] = await Promise.all([
    supabaseServer
      .from('orders')
      .select('total_amount, guest_phone, created_at, order_items(product_id, product_name, quantity, item_total)')
      .neq('order_status', 'cancelled')
      .gte('created_at', previousStart)
      .limit(10000),
    recentQuery,
    getContent<SiteProduct[]>('products').catch(() => null),
    getVisitStats(periodStart),
  ]);

  if (ordersRes.error || recentRes.error) {
    console.error('Error loading analytics:', ordersRes.error || recentRes.error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const all = ordersRes.data || [];
  const current = all.filter(o => o.created_at >= periodStart.slice(0, 19));
  const previous = all.filter(o => o.created_at < periodStart.slice(0, 19));

  const summarize = (list: typeof all) => {
    const revenue = list.reduce((sum, o) => sum + Number(o.total_amount), 0);
    const customers = new Set(list.map(o => (o.guest_phone || '').replace(/\D/g, '').slice(-10)).filter(Boolean)).size;
    return { revenue, orders: list.length, customers, avgOrderValue: list.length ? Math.round(revenue / list.length) : 0 };
  };
  const now$ = summarize(current);
  const prev$ = summarize(previous);

  // Top products and category split for the selected period
  const categoryOf = new Map<string, string>((products || []).map(p => [p.id, p.categoryName || 'Other']));
  const productStats = new Map<string, { name: string; quantity: number; revenue: number }>();
  const categoryRevenue = new Map<string, number>();
  for (const order of current) {
    for (const item of order.order_items || []) {
      const id = String(item.product_id || item.product_name);
      const name = String(item.product_name || 'Product').split(' — ')[0];
      const stat = productStats.get(id) ?? { name, quantity: 0, revenue: 0 };
      stat.quantity += Number(item.quantity) || 0;
      stat.revenue += Number(item.item_total) || 0;
      productStats.set(id, stat);

      const category = id.startsWith('combo:')
        ? 'Combos'
        : id.startsWith('uniform:')
          ? 'School Uniforms'
          : categoryOf.get(id) || 'Other';
      categoryRevenue.set(category, (categoryRevenue.get(category) ?? 0) + (Number(item.item_total) || 0));
    }
  }
  const topProducts = [...productStats.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
  const itemsRevenue = [...categoryRevenue.values()].reduce((a, b) => a + b, 0);
  const categories = [...categoryRevenue.entries()]
    .map(([name, revenue]) => ({ name, revenue, percent: itemsRevenue ? Math.round((revenue / itemsRevenue) * 100) : 0 }))
    .sort((a, b) => b.revenue - a.revenue);

  // Daily sales for the chart (up to the last 30 days of the period)
  const chartDays = Math.min(days, 30);
  const daily = new Map<string, { revenue: number; orders: number }>();
  for (let i = chartDays - 1; i >= 0; i--) {
    daily.set(istDate(new Date(now - i * DAY_MS).toISOString()), { revenue: 0, orders: 0 });
  }
  for (const order of current) {
    const day = daily.get(istDate(order.created_at));
    if (day) {
      day.revenue += Number(order.total_amount);
      day.orders += 1;
    }
  }

  const lowStockProducts = (products || [])
    .filter(p => p.is_active && p.variants.some(v => (v.stock ?? 0) <= LOW_STOCK_LIMIT))
    .map(p => p.name.trim());

  return NextResponse.json(
    {
      range,
      visits,
      stats: {
        revenue: { current: now$.revenue, change: percentChange(now$.revenue, prev$.revenue) },
        orders: { current: now$.orders, change: percentChange(now$.orders, prev$.orders) },
        customers: { current: now$.customers, change: percentChange(now$.customers, prev$.customers) },
        avgOrderValue: { current: now$.avgOrderValue, change: percentChange(now$.avgOrderValue, prev$.avgOrderValue) },
      },
      topProducts,
      categories,
      daily: [...daily.entries()].map(([date, v]) => ({ date, ...v })),
      lowStockProducts,
      recentOrders: (recentRes.data || []).map(row => {
        const o = toAdminOrder(row);
        return { id: o.id, orderNumber: o.order_number, customer: o.customer_name, amount: o.total_amount, status: o.order_status, date: o.created_at };
      }),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
