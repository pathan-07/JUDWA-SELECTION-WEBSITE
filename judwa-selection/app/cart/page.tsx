'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { DEFAULT_SHIPPING_SETTINGS, calculateShipping, loadShippingSettings } from '@/lib/shippingSettings';
import { loadProducts } from '@/lib/productsData';
import { loadCombos } from '@/lib/combosData';
import { loadUniformPairs } from '@/lib/uniformPairs';
import toast from 'react-hot-toast';

const CART_KEY = 'judwa_cart';

/** Older cart items were saved without a photo; look it up from the catalog once. */
async function fillMissingImages(cart: any[]): Promise<any[] | null> {
  if (cart.every(item => item.image)) return null;
  const [products, combos, uniforms] = await Promise.all([loadProducts(), loadCombos(), loadUniformPairs()]);
  return cart.map(item => {
    if (item.image) return item;
    let image = '';
    if (item.kind === 'combo') {
      const combo = combos.find(c => c.id === item.product_id);
      image = combo?.image || combo?.pieces.find(p => p.image)?.image || '';
    } else if (item.kind === 'uniform') {
      const pair = uniforms.find(p => p.id === item.product_id);
      image = pair?.image || pair?.shirtImage || '';
    } else {
      const product = products.find(p => p.id === item.product_id);
      const variant = product?.variants.find(v => v.id === item.variant_id);
      image = variant?.images?.[0] || product?.images[0] || '';
    }
    return image ? { ...item, image } : item;
  });
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [shippingSettings, setShippingSettings] = useState(DEFAULT_SHIPPING_SETTINGS);

  useEffect(() => {
    const readShipping = () => setShippingSettings(loadShippingSettings());
    window.addEventListener('storage', readShipping);
    return () => window.removeEventListener('storage', readShipping);
  }, []);

  useEffect(() => {
    setShippingSettings(loadShippingSettings());
    const cart = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    setCartItems(cart);

    fillMissingImages(cart)
      .then(filled => {
        if (!filled) return;
        // Re-read so a quantity change made while loading isn't lost
        const latest = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
        const merged = latest.map((item: any) => item.image ? item : { ...item, image: filled.find(f => f.id === item.id)?.image || '' });
        localStorage.setItem(CART_KEY, JSON.stringify(merged));
        setCartItems(merged);
      })
      .catch(() => {});
  }, []);

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updated = [...cartItems];
    updated[index].quantity = newQuantity;
    setCartItems(updated);

    const cartKey = 'judwa_cart';
    localStorage.setItem(cartKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const removeItem = (index: number) => {
    const updated = cartItems.filter((_, i) => i !== index);
    setCartItems(updated);

    const cartKey = 'judwa_cart';
    localStorage.setItem(cartKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    toast.success('Item removed from cart');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.selling_price * item.quantity, 0);
  const shippingCost = calculateShipping(subtotal, shippingSettings);
  const total = subtotal + shippingCost;

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="container py-20 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link
            href="/products"
            className="inline-block brand-bg text-white hover:text-white px-8 py-3 font-semibold uppercase tracking-wide text-sm transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="bg-white">
        <div className="container py-6 sm:py-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8">Shopping Cart</h1>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 min-w-0">
              <div className="bg-cream border border-ink-100 rounded-lg divide-y divide-ink-100">
                {cartItems.map((item, index) => (
                  <div key={index} className="p-3 sm:p-4 flex gap-3 sm:gap-4">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white border border-ink-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.product_name || 'Product'}
                          fill
                          sizes="96px"
                          unoptimized={item.image.startsWith('data:')}
                          className="object-contain"
                        />
                      ) : (
                        <ShoppingBag className="h-7 w-7 text-ink-300" />
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-sm sm:text-base font-semibold text-ink-900 mb-1 line-clamp-2">{item.product_name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        Size: <span className="font-medium">{item.size}</span> | Color:{' '}
                        <span className="font-medium">{item.color}</span>
                      </p>
                      <p className="font-semibold text-sm sm:text-base text-ink-900">
                        {formatINR(item.selling_price)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
                      <div className="flex items-center border border-ink-200 rounded bg-white">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          className="p-1.5 text-gray-600 hover:text-gray-900"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-2 text-sm font-medium min-w-[1.5rem] text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          aria-label="Increase quantity"
                          className="p-1.5 text-gray-600 hover:text-gray-900"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(index)}
                        aria-label="Remove item"
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>

                      <p className="text-sm font-bold text-gray-900 whitespace-nowrap">
                        {formatINR(item.selling_price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <Link
                  href="/products"
                  className="text-gold-700 hover:text-gold-600 font-medium flex items-center gap-2"
                >
                  <span>← Continue Shopping</span>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 min-w-0">
              <div className="bg-cream border border-ink-100 rounded-lg p-4 sm:p-6 lg:sticky lg:top-24">
                <h2 className="font-serif text-xl font-semibold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6 border-b pb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatINR(shippingCost)
                      )}
                    </span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="text-xs text-gray-500">
                      Add {formatINR(shippingSettings.freeShippingAbove - subtotal)} more for free shipping
                      (orders above {formatINR(shippingSettings.freeShippingAbove)})
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="bg-white rounded-lg p-4 mb-6 border-2 border-gold-500">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="font-serif text-2xl sm:text-3xl font-semibold text-ink-900">
                      {formatINR(total)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full brand-bg text-white hover:text-white px-6 py-3 rounded-lg font-semibold uppercase tracking-wide text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  Proceed to Checkout <ArrowRight className="h-5 w-5" />
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 space-y-2 text-xs text-gray-600">
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span>100% Original Products</span>
                  </div>
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex gap-2">
                    <span>✓</span>
                    <span>Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
