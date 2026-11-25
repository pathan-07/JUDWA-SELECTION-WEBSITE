import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { createManualCaptureOrder } from '@/lib/razorpay';

// Creates the Razorpay order for an existing prepaid order. The amount always comes from the
// database order, never from the browser.
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();
    if (typeof orderId !== 'string' || !orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const { data: order, error } = await supabaseServer
      .from('orders')
      .select('id, order_number, total_amount, payment_method, payment_status')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (order.payment_method !== 'razorpay' || order.payment_status !== 'pending') {
      return NextResponse.json({ error: 'Order is not awaiting online payment' }, { status: 409 });
    }

    const rzpOrder = await createManualCaptureOrder(Number(order.total_amount), order.order_number);

    const { error: insertError } = await supabaseServer.from('payments').insert({
      order_id: order.id,
      razorpay_order_id: rzpOrder.id,
      amount: order.total_amount,
      payment_method: 'razorpay',
      payment_status: 'pending',
    });
    if (insertError) throw insertError;

    return NextResponse.json({
      razorpay_order_id: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_number: order.order_number,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Could not start online payment' }, { status: 500 });
  }
}
