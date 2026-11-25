import 'server-only';

interface NewOrderAlert {
  orderNumber: string;
  totalAmount: number;
  paymentMethod: string;
  itemCount: number;
  customerName?: string;
}

const formatRupees = (amount: number) => `₹${Number(amount).toLocaleString('en-IN')}`;

/**
 * Alerts the shop owner about a new order via Telegram and/or WhatsApp (CallMeBot), whichever is configured.
 * Never throws — a failed alert must not fail the order.
 */
export async function notifyOwnerNewOrder(order: NewOrderAlert) {
  const phone = process.env.OWNER_WHATSAPP_NUMBER;
  const apiKey = process.env.CALLMEBOT_API_KEY;
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const hasWhatsApp = Boolean(phone && apiKey);
  const hasTelegram = Boolean(telegramToken && telegramChatId);
  if (!hasWhatsApp && !hasTelegram) {
    console.warn(
      'Owner order alert skipped: set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID or OWNER_WHATSAPP_NUMBER + CALLMEBOT_API_KEY in .env.local'
    );
    return;
  }

  const payment =
    order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (amount held — accept order to collect)';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  const text = [
    '🛍️ New order received — JUDWA SELECTION',
    `Order: #${order.orderNumber}`,
    order.customerName ? `Customer: ${order.customerName}` : null,
    `Items: ${order.itemCount}`,
    `Amount: ${formatRupees(order.totalAmount)}`,
    `Payment: ${payment}`,
    appUrl ? `Open: ${appUrl}/admin/orders` : null,
  ]
    .filter(Boolean)
    .join('\n');

  await Promise.all([
    hasTelegram && sendTelegram(telegramToken!, telegramChatId!, text, order.orderNumber),
    hasWhatsApp && sendWhatsApp(phone!, apiKey!, text, order.orderNumber),
  ]);
}

/** Tells the owner a customer review is waiting for approval (Telegram only). Never throws. */
export async function notifyOwnerNewReview(review: { orderNumber: string; customer: string; productName: string; rating: number; text: string }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const text = [
    `⭐ New review (${review.rating}/5) — waiting for approval`,
    `${review.productName}`,
    `By: ${review.customer} (order #${review.orderNumber})`,
    `"${review.text.slice(0, 300)}"`,
    appUrl ? `Approve: ${appUrl}/admin/reviews` : null,
  ]
    .filter(Boolean)
    .join('\n');
  await sendTelegram(token, chatId, text, review.orderNumber);
}

async function sendTelegram(token: string, chatId: string, text: string, orderNumber: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error(`Owner Telegram alert failed (HTTP ${res.status}) for order ${orderNumber}`);
    }
  } catch (error) {
    console.error(`Owner Telegram alert failed for order ${orderNumber}:`, error);
  }
}

async function sendWhatsApp(phone: string, apiKey: string, text: string, orderNumber: string) {
  const url =
    'https://api.callmebot.com/whatsapp.php' +
    `?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
      console.error(`Owner WhatsApp alert failed (HTTP ${res.status}) for order ${orderNumber}`);
    }
  } catch (error) {
    console.error(`Owner WhatsApp alert failed for order ${orderNumber}:`, error);
  }
}
