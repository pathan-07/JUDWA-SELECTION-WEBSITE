'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Clock, MapPin, DollarSign, XCircle } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { DEFAULT_STORE_SETTINGS, loadStoreSettings } from '@/lib/storeSettings';
import OrderReviews from '@/components/OrderReviews';

const STATUS_STEPS = [
  { value: 'pending', label: 'Order Placed', hint: 'We have received your order' },
  { value: 'confirmed', label: 'Confirmed', hint: 'Your order has been accepted' },
  { value: 'processing', label: 'Processing', hint: "We're packing your order" },
  { value: 'shipped', label: 'Shipped', hint: 'Your order is on the way' },
  { value: 'delivered', label: 'Delivered', hint: 'Enjoy your purchase!' },
];

interface OrderConfirmationPageProps {
  params: Promise<{
    orderNumber: string;
  }>;
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderNumber } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    const readStore = () => setStore(loadStoreSettings());
    readStore();
    window.addEventListener('storage', readStore);
    return () => window.removeEventListener('storage', readStore);
  }, []);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
        }
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Header />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find your order. Please contact support.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Back to Home
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const isCancelled = order.order_status === 'cancelled';
  const currentStep = Math.max(0, STATUS_STEPS.findIndex(s => s.value === order.order_status));

  return (
    <>
      <Header />

      <div className="bg-white">
        <div className="container py-8">
          {/* Status Banner */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              {isCancelled ? (
                <XCircle className="h-20 w-20 text-red-600" />
              ) : (
                <CheckCircle className="h-20 w-20 text-green-600" />
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {isCancelled ? 'Order Cancelled' : STATUS_STEPS[currentStep].value === 'pending' ? 'Order Placed!' : `Order ${STATUS_STEPS[currentStep].label}`}
            </h1>
            <p className="text-gray-600 text-lg">
              {isCancelled
                ? 'This order has been cancelled. Any online payment will be returned to you.'
                : 'Thank you for your purchase. Bookmark this page to check your order status anytime.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Order Number */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
              <p className="text-gray-600 text-sm font-medium mb-2">Order Number</p>
              <p className="text-2xl font-bold text-blue-600">{order.order_number}</p>
            </div>

            {/* Order Date */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
              <p className="text-gray-600 text-sm font-medium mb-2">Order Date</p>
              <p className="text-2xl font-bold text-green-600">
                {new Date(order.created_at).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Total Amount */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 text-center">
              <p className="text-gray-600 text-sm font-medium mb-2">Total Amount</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatINR(order.total_amount)}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Order Status */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold">Order Status</h2>
              </div>

              <div className="space-y-4">
                {isCancelled ? (
                  <p className="px-4 py-3 rounded-lg bg-red-50 text-red-700 font-semibold">Cancelled</p>
                ) : (
                  STATUS_STEPS.map((step, index) => {
                    const done = index <= currentStep;
                    return (
                      <div key={step.value} className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div
                            className={`flex items-center justify-center h-8 w-8 rounded-full font-bold ${
                              done ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                            }`}
                          >
                            {done ? '✓' : index + 1}
                          </div>
                        </div>
                        <div>
                          <p className={`font-bold ${done ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</p>
                          <p className="text-sm text-gray-600">
                            {index === 0 ? new Date(order.created_at).toLocaleString('en-IN') : step.hint}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold">Delivery</h2>
              </div>

              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-600">
                <p className="text-gray-700 text-sm">
                  Your order will be delivered to the address you entered at checkout. We will call you on the phone
                  number you provided if we need anything.
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-50 rounded-lg p-6 mb-12">
            <h2 className="text-xl font-bold mb-6">Order Items</h2>

            <div className="space-y-4">
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-4 flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-500 text-xs text-center">Image</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{item.product_name || 'Product'}</p>
                      {(item.size || item.color) && (
                        <p className="text-sm text-gray-600">
                          Size: {item.size} | Color: {item.color}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-bold text-gray-900">
                        {formatINR(item.item_total)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No items in this order</p>
              )}
            </div>

            {/* Order Summary */}
            <div className="mt-6 border-t pt-6 space-y-3 text-right">
              <div className="flex justify-end gap-4">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  {formatINR(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-end gap-4">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">
                  {order.delivery_charge > 0 ? formatINR(order.delivery_charge) : 'Free'}
                </span>
              </div>
              {order.cod_charge > 0 && (
                <div className="flex justify-end gap-4">
                  <span className="text-gray-600">COD charge:</span>
                  <span className="font-medium">{formatINR(order.cod_charge)}</span>
                </div>
              )}
              <div className="flex justify-end gap-4 text-lg font-bold border-t pt-3">
                <span>Total:</span>
                <span className="text-blue-600">{formatINR(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-gray-50 rounded-lg p-6 mb-12">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold">Payment Method</h2>
            </div>
            <p className="text-gray-900 font-medium">
              {order.payment_method === 'cod'
                ? 'Cash on Delivery (COD)'
                : 'Online Payment'}
            </p>
            {order.payment_status && (
              <p className="text-sm text-gray-600 mt-2">
                Status:{' '}
                <span
                  className={
                    order.payment_status === 'completed'
                      ? 'text-green-600 font-medium'
                      : 'text-yellow-600 font-medium'
                  }
                >
                  {order.payment_status === 'completed'
                    ? 'Paid'
                    : order.payment_status === 'authorized'
                      ? 'Amount held — charged after we accept your order'
                      : 'Pending'}
                </span>
              </p>
            )}
          </div>

          {order.order_status === 'delivered' && <OrderReviews orderNumber={order.order_number} />}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-8 py-3 rounded-lg font-bold text-center transition-colors"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Info Box */}
          <div className="mt-12 bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>✓ Save your order number <strong>{order.order_number}</strong> — use it on the Track Order page anytime</li>
              <li>✓ We will confirm your order and call you if we need anything</li>
              <li>✓ This page shows the latest status: confirmed, packed, shipped and delivered</li>
              <li>✓ Expected delivery: 3-5 business days</li>
              <li>✓ After delivery, come back to this page to rate your products</li>
              {(store.phones[0] || store.email) && (
                <li>
                  ✓ For queries, contact: {[store.email, store.phones[0]].filter(Boolean).join(' or ')}
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
