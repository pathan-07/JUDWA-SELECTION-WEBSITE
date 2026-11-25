import 'server-only';
import crypto from 'crypto';
import Razorpay from 'razorpay';

// Admin must accept a prepaid order within this window; after it, Razorpay auto-releases the money to the customer.
export const ACCEPT_WINDOW_MINUTES = 2880; // 48 hours

let client: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys are not configured');
  }
  client ??= new Razorpay({ key_id, key_secret });
  return client;
}

export const toPaise = (rupees: number) => Math.round(rupees * 100);

/** Creates an order whose payment is only authorised (held), not captured. */
export function createManualCaptureOrder(amountRupees: number, receipt: string) {
  return getRazorpay().orders.create({
    amount: toPaise(amountRupees),
    currency: 'INR',
    receipt: receipt.slice(0, 40),
    payment: {
      capture: 'manual',
      capture_options: {
        manual_expiry_period: ACCEPT_WINDOW_MINUTES,
        refund_speed: 'normal',
      },
    } as any, // SDK types wrongly require automatic_expiry_period for manual capture
  });
}

export function verifyCheckoutSignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret || typeof signature !== 'string') return false;
  const expected = crypto.createHmac('sha256', secret).update(`${razorpayOrderId}|${razorpayPaymentId}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
