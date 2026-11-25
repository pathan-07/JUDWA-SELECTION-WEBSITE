import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { ADMIN_ORDER_SELECT, toAdminOrder } from '@/lib/adminOrders';

// Admin order list (protected by proxy.ts)
export async function GET() {
  const { data, error } = await supabaseServer
    .from('orders')
    .select(ADMIN_ORDER_SELECT)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('Error loading orders:', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
  return NextResponse.json({ orders: (data || []).map(toAdminOrder) }, { headers: { 'Cache-Control': 'no-store' } });
}
