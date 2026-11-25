import { NextRequest, NextResponse, after } from 'next/server';
import { supabaseServer } from '@/lib/supabase';
import { createOrder, addOrderItems } from '@/lib/queries/orders';
import { notifyOwnerNewOrder } from '@/lib/notifications';
import { getContent, setContent } from '@/lib/siteContent';
import type { SiteProduct } from '@/lib/productsData';
import { DEFAULT_UNIFORM_PAIRS, UniformPair, getPantSizes, getSelectedSizeTotal, getShirtSizes } from '@/lib/uniformPairs';
import { ComboSelection, ComboSet, DEFAULT_COMBOS, describeComboSelection, getComboPrice, isValidComboSelection } from '@/lib/combosData';
import { DEFAULT_SHIPPING_SETTINGS, calculateShipping } from '@/lib/shippingSettings';
import { DEFAULT_PAYMENT_SETTINGS } from '@/lib/paymentSettings';
import { SettingsMap, readSetting } from '@/lib/settingsKeys';

const PAYMENT_METHODS = ['cod', 'razorpay'];
const MAX_ITEMS = 50;
const MAX_QTY_PER_ITEM = 20;

interface OrderLine {
  productId: string;
  variantId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  purchasePrice: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guest_email, guest_phone, items, payment_method, notes } = body;

    if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }
    if (!PAYMENT_METHODS.includes(payment_method)) {
      return NextResponse.json({ error: 'Payment method is required' }, { status: 400 });
    }
    if (typeof guest_phone !== 'string' || !/^[0-9+\-\s]{10,15}$/.test(guest_phone.trim())) {
      return NextResponse.json({ error: 'A valid phone number is required' }, { status: 400 });
    }

    // Prices and stock come from the catalog in the database, never from the browser
    let catalog: SiteProduct[];
    let uniforms: UniformPair[];
    let combos: ComboSet[];
    let settings: SettingsMap | null;
    try {
      const [storedProducts, storedUniforms, storedCombos, storedSettings] = await Promise.all([
        getContent<SiteProduct[]>('products'),
        getContent<UniformPair[]>('uniforms'),
        getContent<ComboSet[]>('combos'),
        getContent<SettingsMap>('settings'),
      ]);
      catalog = storedProducts ?? [];
      settings = storedSettings;
      // Same fallback the storefront shows until the admin saves real uniform sets / combos
      uniforms = storedUniforms?.length ? storedUniforms : DEFAULT_UNIFORM_PAIRS;
      combos = storedCombos?.length ? storedCombos : DEFAULT_COMBOS;
    } catch {
      return NextResponse.json({ error: 'Store database is not connected yet' }, { status: 503 });
    }

    const lines: OrderLine[] = [];
    const soldByVariant = new Map<string, number>();
    const unavailable = (itemIndex: number) =>
      NextResponse.json(
        { error: 'Some items in your cart are no longer available', unavailable_index: itemIndex },
        { status: 400 }
      );
    for (const [itemIndex, item] of items.entries()) {
      const quantity = Number(item?.quantity);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
        return NextResponse.json({ error: 'Invalid quantity' }, { status: 400 });
      }

      if (item?.kind === 'uniform') {
        const pair = uniforms.find(p => p.id === item.product_id && p.isActive);
        if (!pair || !getShirtSizes(pair).includes(item.shirt_size) || !getPantSizes(pair).includes(item.pant_size)) {
          return unavailable(itemIndex);
        }
        lines.push({
          productId: `uniform:${pair.id}`,
          variantId: `${item.shirt_size}|${item.pant_size}`,
          name: `${pair.schoolName} Uniform (Shirt + Pant)`,
          size: `Shirt ${item.shirt_size} / Pant ${item.pant_size}`,
          color: '-',
          quantity,
          price: getSelectedSizeTotal(pair, item.shirt_size, item.pant_size),
          purchasePrice: 0,
        });
        continue;
      }

      if (item?.kind === 'combo') {
        const combo = combos.find(c => c.id === item.product_id && c.isActive);
        if (!combo || !isValidComboSelection(combo, item.selections)) {
          return unavailable(itemIndex);
        }
        const description = describeComboSelection(combo, item.selections);
        // order_items.size is VARCHAR(50), so the full per-piece choice goes in product_name (VARCHAR(255))
        lines.push({
          productId: `combo:${combo.id}`,
          variantId: item.selections.map((s: ComboSelection) => `${s.size}/${s.color}`).join('|').slice(0, 100),
          name: `${combo.name} (Combo) — ${description}`.slice(0, 255),
          size: 'Combo',
          color: '-',
          quantity,
          price: getComboPrice(combo),
          purchasePrice: 0,
        });
        continue;
      }

      const product = catalog.find(p => p.id === item?.product_id && p.is_active);
      const variant = product?.variants.find(v => v.id === item?.variant_id);
      if (!product || !variant) {
        return unavailable(itemIndex);
      }
      const key = `${product.id}:${variant.id}`;
      const totalWanted = (soldByVariant.get(key) ?? 0) + quantity;
      if (totalWanted > (variant.stock ?? 0)) {
        return NextResponse.json(
          { error: `${product.name} (${variant.size}, ${variant.color}) has only ${variant.stock} left` },
          { status: 409 }
        );
      }
      soldByVariant.set(key, totalWanted);
      lines.push({
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        size: variant.size,
        color: variant.color,
        quantity,
        price: variant.selling_price ?? product.selling_price,
        purchasePrice: product.purchase_price ?? 0,
      });
    }

    const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    // Charges come from the admin's saved settings, never from the browser
    const shippingSettings = readSetting(settings, 'judwa_shipping_settings', DEFAULT_SHIPPING_SETTINGS);
    const paymentSettings = readSetting(settings, 'judwa_payment_settings', DEFAULT_PAYMENT_SETTINGS);
    if (payment_method === 'cod' && !paymentSettings.codEnabled) {
      return NextResponse.json({ error: 'Cash on Delivery is not available. Please pay online.' }, { status: 400 });
    }
    const deliveryCharge = Math.max(0, Number(calculateShipping(subtotal, shippingSettings)) || 0);
    const codCharge = payment_method === 'cod' ? Math.max(0, Number(paymentSettings.codCharge) || 0) : 0;
    const total = subtotal + deliveryCharge + codCharge;

    const { data: order, error: orderError } = await createOrder({
      user_id: null,
      guest_email: typeof guest_email === 'string' && guest_email ? guest_email.slice(0, 255) : null,
      guest_phone: guest_phone.trim(),
      shipping_address_id: null,
      subtotal,
      discount_amount: 0,
      delivery_charge: deliveryCharge,
      cod_charge: codCharge,
      total_amount: total,
      payment_method,
      notes: typeof notes === 'string' ? notes.slice(0, 1000) : null,
      order_status: 'pending',
      payment_status: 'pending',
    });

    if (orderError) throw orderError;

    const { error: itemsError } = await addOrderItems(
      lines.map(line => ({
        order_id: order.id,
        product_id: line.productId,
        variant_id: line.variantId,
        product_name: line.name,
        quantity: line.quantity,
        size: line.size,
        color: line.color,
        purchase_price: line.purchasePrice,
        selling_price: line.price,
        item_discount: 0,
        item_total: line.price * line.quantity,
      })) as any
    );
    if (itemsError) throw itemsError;

    // Reduce stock in the catalog (a failure here must not lose the order)
    if (soldByVariant.size > 0) {
      try {
        await setContent(
          'products',
          catalog.map(product => ({
            ...product,
            variants: product.variants.map(variant => {
              const sold = soldByVariant.get(`${product.id}:${variant.id}`);
              return sold ? { ...variant, stock: Math.max(0, variant.stock - sold) } : variant;
            }),
          }))
        );
      } catch (stockError) {
        console.error(`Stock update failed for order ${order.order_number}:`, stockError);
      }
    }

    // Prepaid orders alert the owner only after payment succeeds (see /api/payments/verify)
    if (payment_method === 'cod') {
      after(() =>
        notifyOwnerNewOrder({
          orderNumber: order.order_number,
          totalAmount: order.total_amount,
          paymentMethod: 'cod',
          itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
          customerName: typeof notes === 'string' ? notes.split(' — ')[0] : undefined,
        })
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// Public order lookup for the confirmation page. Returns no address/phone/email, since anyone can call it.
export async function GET(request: NextRequest) {
  const orderNumber = new URL(request.url).searchParams.get('orderNumber');
  if (!orderNumber || !/^[A-Z0-9-]{4,50}$/i.test(orderNumber)) {
    return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('orders')
    .select(
      'order_number, created_at, subtotal, delivery_charge, cod_charge, total_amount, payment_method, payment_status, order_status, order_items(product_name, size, color, quantity, item_total)'
    )
    .eq('order_number', orderNumber)
    .maybeSingle();

  if (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  return NextResponse.json({ order: data });
}
