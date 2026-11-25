import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { getRazorpay, toPaise, ACCEPT_WINDOW_MINUTES } from '@/lib/razorpay';
import { ADMIN_COOKIE, isValidAdminToken } from '@/lib/adminAuth';
import { ADMIN_ORDER_SELECT, toAdminOrder } from '@/lib/adminOrders';

type Action = 'accept' | 'cancel' | 'status';

// Fulfilment steps the admin can set after accepting an order (in order)
const FULFILMENT_STEPS = ['confirmed', 'processing', 'shipped', 'delivered'] as const;
type FulfilmentStatus = (typeof FULFILMENT_STEPS)[number];

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabaseServer.from('orders').select(ADMIN_ORDER_SELECT).eq('id', id).maybeSingle();
  if (error) {
    console.error('Error loading order:', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  return NextResponse.json({ order: toAdminOrder(data) }, { headers: { 'Cache-Control': 'no-store' } });
}

function razorpayErrorMessage(error: any) {
  return error?.error?.description || error?.message || 'Payment gateway error';
}

// Admin actions on an order:
//  accept → captures the held (authorised) prepaid payment, so money is taken only now
//  cancel → refunds a captured payment, or lets an uncaptured hold lapse back to the customer
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // proxy.ts already guards /api/admin; checked again here because this route moves money
  if (!isValidAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { action, status } = (await request.json()) as { action: Action; status?: FulfilmentStatus };
  if (action !== 'accept' && action !== 'cancel' && action !== 'status') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const { data: order, error } = await supabaseServer
    .from('orders')
    .select('id, order_number, total_amount, payment_method, payment_status, order_status')
    .eq('id', id)
    .single();
  if (error || !order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const { data: paymentRow } = await supabaseServer
    .from('payments')
    .select('id, razorpay_payment_id')
    .eq('order_id', order.id)
    .not('razorpay_payment_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const isPrepaid = order.payment_method === 'razorpay';
  const now = new Date().toISOString();

  if (action === 'status') {
    if (!status || !FULFILMENT_STEPS.includes(status) || status === 'confirmed') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    if (!FULFILMENT_STEPS.includes(order.order_status)) {
      return NextResponse.json(
        { error: order.order_status === 'pending' ? 'Accept the order first' : `Order is ${order.order_status}` },
        { status: 409 }
      );
    }
    const { error: updateError } = await supabaseServer
      .from('orders')
      .update({
        order_status: status,
        // Cash is collected by the courier on delivery
        ...(status === 'delivered' && !isPrepaid && { payment_status: 'completed' }),
        updated_at: now,
      })
      .eq('id', order.id);
    if (updateError) {
      console.error('Error updating order status:', updateError);
      return NextResponse.json({ error: 'Could not update status' }, { status: 503 });
    }
    return NextResponse.json({ success: true, message: `Order marked as ${status}` });
  }

  try {
    if (action === 'accept') {
      if (order.order_status !== 'pending') {
        return NextResponse.json({ error: `Order is already ${order.order_status}` }, { status: 409 });
      }

      if (isPrepaid) {
        if (!paymentRow?.razorpay_payment_id) {
          return NextResponse.json({ error: 'Customer has not completed payment yet' }, { status: 409 });
        }
        const rzp = getRazorpay();
        const payment = await rzp.payments.fetch(paymentRow.razorpay_payment_id);

        if (payment.status === 'authorized') {
          if (Number(payment.amount) !== toPaise(Number(order.total_amount))) {
            return NextResponse.json({ error: 'Paid amount does not match order total' }, { status: 409 });
          }
          await rzp.payments.capture(payment.id, payment.amount, payment.currency);
        } else if (payment.status !== 'captured') {
          // e.g. the hold expired and Razorpay already returned the money
          return NextResponse.json(
            { error: `Payment can no longer be collected (status: ${payment.status})` },
            { status: 409 }
          );
        }

        await supabaseServer.from('payments').update({ payment_status: 'completed', updated_at: now }).eq('id', paymentRow.id);
      }

      await supabaseServer
        .from('orders')
        .update({ order_status: 'confirmed', ...(isPrepaid && { payment_status: 'completed' }), updated_at: now })
        .eq('id', order.id);

      return NextResponse.json({
        success: true,
        message: isPrepaid ? 'Order accepted — payment collected from customer' : 'Order accepted',
      });
    }

    // cancel
    if (order.order_status === 'cancelled' || order.order_status === 'delivered') {
      return NextResponse.json({ error: `Order is already ${order.order_status}` }, { status: 409 });
    }

    let message = 'Order cancelled';
    if (isPrepaid && paymentRow?.razorpay_payment_id) {
      const rzp = getRazorpay();
      const payment = await rzp.payments.fetch(paymentRow.razorpay_payment_id);

      if (payment.status === 'captured') {
        await rzp.payments.refund(payment.id, { speed: 'normal', receipt: `cancel-${order.order_number}`.slice(0, 40) });
        message = 'Order cancelled — full refund started (reaches customer in 5–7 working days)';
      } else if (payment.status === 'authorized') {
        // Razorpay has no API to release a hold early; it is returned automatically when the window ends
        message = `Order cancelled — customer was never charged; the held amount is released automatically within ${
          ACCEPT_WINDOW_MINUTES / 60
        } hours of payment`;
      }

      if (payment.status === 'captured' || payment.status === 'authorized') {
        await supabaseServer.from('payments').update({ payment_status: 'refunded', updated_at: now }).eq('id', paymentRow.id);
      }
    }

    await supabaseServer
      .from('orders')
      .update({
        order_status: 'cancelled',
        ...(isPrepaid && paymentRow?.razorpay_payment_id && { payment_status: 'refunded' }),
        updated_at: now,
      })
      .eq('id', order.id);

    return NextResponse.json({ success: true, message });
  } catch (err) {
    console.error(`Error during order ${action}:`, err);
    return NextResponse.json({ error: razorpayErrorMessage(err) }, { status: 502 });
  }
}
