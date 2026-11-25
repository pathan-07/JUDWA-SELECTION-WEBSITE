import { NextRequest, NextResponse, after } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { getRazorpay, toPaise, verifyCheckoutSignature } from '@/lib/razorpay';
import { notifyOwnerNewOrder } from '@/lib/notifications';

// Called after the customer completes Razorpay checkout. The payment is only *authorised* here;
// money is captured when the admin accepts the order (see /api/admin/orders/[id]).
export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json();

    if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const { data: order, error: orderError } = await supabaseServer
      .from('orders')
      .select('id, order_number, total_amount, payment_status, notes, order_items(quantity)')
      .eq('id', orderId)
      .single();
    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // The Razorpay order must belong to this shop order
    const { data: paymentRow, error: paymentRowError } = await supabaseServer
      .from('payments')
      .select('id')
      .eq('order_id', order.id)
      .eq('razorpay_order_id', razorpay_order_id)
      .single();
    if (paymentRowError || !paymentRow) {
      return NextResponse.json({ error: 'Payment does not match this order' }, { status: 400 });
    }

    const payment = await getRazorpay().payments.fetch(razorpay_payment_id);
    const validState = payment.status === 'authorized' || payment.status === 'captured';
    if (!validState || Number(payment.amount) !== toPaise(Number(order.total_amount))) {
      return NextResponse.json({ error: 'Payment amount or status is invalid' }, { status: 400 });
    }

    const status = payment.status === 'captured' ? 'completed' : 'authorized';
    const now = new Date().toISOString();

    await supabaseServer
      .from('payments')
      .update({
        razorpay_payment_id,
        payment_status: status,
        razorpay_response: { razorpay_order_id, razorpay_payment_id, status: payment.status, method: payment.method },
        updated_at: now,
      })
      .eq('id', paymentRow.id);

    // Order stays "pending" until the admin accepts it
    const { error: updateError } = await supabaseServer
      .from('orders')
      .update({ payment_status: status, updated_at: now })
      .eq('id', order.id);
    if (updateError) throw updateError;

    // Only alert once, even if the browser retries verification
    if (order.payment_status === 'pending') {
      after(() =>
        notifyOwnerNewOrder({
          orderNumber: order.order_number,
          totalAmount: order.total_amount,
          paymentMethod: 'razorpay',
          itemCount: (order.order_items || []).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
          customerName: typeof order.notes === 'string' ? order.notes.split(' — ')[0] : undefined,
        })
      );
    }

    return NextResponse.json({
      success: true,
      order_number: order.order_number,
      payment_status: status,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
