'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChevronRight, MapPin, Phone, Mail, CreditCard } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { loadPaymentSettings, PaymentSettings } from '@/lib/paymentSettings';
import { DEFAULT_SHIPPING_SETTINGS, calculateShipping, loadShippingSettings } from '@/lib/shippingSettings';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [step, setStep] = useState(1); // 1: Address, 2: Shipping, 3: Payment
  const [loading, setLoading] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  // Shipping State
  const [shippingMethod, setShippingMethod] = useState('standard');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({ codEnabled: true, codCharge: 100 });
  const [shippingSettings, setShippingSettings] = useState(DEFAULT_SHIPPING_SETTINGS);

  useEffect(() => {
    const readSettings = () => {
      setShippingSettings(loadShippingSettings());
      const settings = loadPaymentSettings();
      setPaymentSettings(settings);
      if (!settings.codEnabled) {
        setPaymentMethod('razorpay');
      }
    };
    readSettings();
    window.addEventListener('storage', readSettings);
    return () => window.removeEventListener('storage', readSettings);
  }, []);

  useEffect(() => {
    // Load cart
    const cartKey = 'judwa_cart';
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    setCartItems(cart);

    // Load addresses
    const addressesKey = 'judwa_addresses';
    const savedAddresses = JSON.parse(localStorage.getItem(addressesKey) || '[]');
    setAddresses(savedAddresses);
    if (savedAddresses.length > 0) {
      setSelectedAddress(0);
    }
  }, []);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const saveAddress = () => {
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.addressLine1 ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    const newAddresses = [...addresses, formData];
    setAddresses(newAddresses);

    const addressesKey = 'judwa_addresses';
    localStorage.setItem(addressesKey, JSON.stringify(newAddresses));

    setSelectedAddress(newAddresses.length - 1);
    setShowAddressForm(false);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });

    toast.success('Address saved successfully');
  };

  const handleCheckout = async () => {
    if (selectedAddress === null) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!shippingMethod) {
      toast.error('Please select a shipping method');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setLoading(true);

    try {
      const address = addresses[selectedAddress];
      const subtotal = cartItems.reduce((sum, item) => sum + item.selling_price * item.quantity, 0);
      const shippingCost = calculateShipping(subtotal, shippingSettings);

      const orderData = {
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          ...(item.kind === 'uniform' && { kind: 'uniform', shirt_size: item.shirt_size, pant_size: item.pant_size }),
          ...(item.kind === 'combo' && { kind: 'combo', selections: item.selections }),
        })),
        guest_email: address.email || null,
        guest_phone: address.phone,
        notes: `${address.fullName} — ${address.addressLine1}, ${address.addressLine2 ? `${address.addressLine2}, ` : ''}${address.city}, ${address.state} ${address.pincode}`,
        delivery_charge: shippingCost,
        cod_charge: paymentMethod === 'cod' ? paymentSettings.codCharge : 0,
        payment_method: paymentMethod,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const { error, unavailable_index } = await response.json().catch(() => ({ error: null }));
        if (typeof unavailable_index === 'number' && cartItems[unavailable_index]) {
          // Drop the stale item (e.g. deleted product) so the customer can still order the rest
          const removed = cartItems[unavailable_index];
          const remaining = cartItems.filter((_, i) => i !== unavailable_index);
          localStorage.setItem('judwa_cart', JSON.stringify(remaining));
          window.dispatchEvent(new Event('storage'));
          setCartItems(remaining);
          throw new Error(
            `"${removed.product_name || removed.name || 'An item'}" is no longer available and was removed from your cart. Please check your order and try again.`
          );
        }
        throw new Error(error || 'Failed to place order. Please try again.');
      }
      const { order } = await response.json();

      if (paymentMethod === 'razorpay') {
        // Amount is taken from the saved order on the server; the payment is only held until we accept the order
        const payResponse = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: order.id }),
        });
        if (!payResponse.ok) {
          throw new Error('Failed to start payment');
        }
        const rzp = await payResponse.json();

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          const options = {
            key: rzp.key_id,
            amount: rzp.amount,
            currency: rzp.currency,
            name: 'JUDWA SELECTION',
            description: `Order #${order.order_number}`,
            order_id: rzp.razorpay_order_id,
            handler: async (response: any) => {
              try {
                const verifyResponse = await fetch('/api/payments/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId: order.id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });

                if (!verifyResponse.ok) {
                  throw new Error('Payment verification failed');
                }

                localStorage.removeItem('judwa_cart');
                window.dispatchEvent(new Event('storage'));
                setCartItems([]);

                toast.success('Order placed! You will be charged only after we accept your order.');
                window.location.href = `/order-confirmation/${order.order_number}`;
              } catch (error) {
                toast.error('Payment verification failed. Please contact support.');
                console.error(error);
              }
            },
            prefill: {
              name: address.fullName,
              email: address.email,
              contact: address.phone,
            },
          };

          (window as any).Razorpay && new (window as any).Razorpay(options).open();
        };
        document.body.appendChild(script);
      } else if (paymentMethod === 'cod') {
        localStorage.removeItem('judwa_cart');
        window.dispatchEvent(new Event('storage'));
        setCartItems([]);

        toast.success('Order placed successfully!');
        window.location.href = `/order-confirmation/${order.order_number}`;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <div className="container py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Your Cart is Empty</h2>
          <Link href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Products
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.selling_price * item.quantity, 0);
  const shippingCost = calculateShipping(subtotal, shippingSettings);
  const total = subtotal + shippingCost;

  return (
    <>
      <Header />

      <div className="bg-white">
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              {/* Step Indicator */}
              <div className="flex items-center gap-4 mb-8">
                {[
                  { step: 1, label: 'Address' },
                  { step: 2, label: 'Shipping' },
                  { step: 3, label: 'Payment' },
                ].map((s, index) => (
                  <React.Fragment key={s.step}>
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                        step >= s.step
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step > s.step ? '✓' : s.step}
                    </div>
                    {index < 2 && (
                      <div
                        className={`flex-1 h-1 ${
                          step > s.step ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Step 1: Address */}
              {step === 1 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-bold mb-6">Delivery Address</h2>

                  {addresses.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {addresses.map((addr, index) => (
                        <label
                          key={index}
                          className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                          style={{
                            borderColor: selectedAddress === index ? '#2563eb' : '#e5e7eb',
                            backgroundColor:
                              selectedAddress === index ? '#eff6ff' : '#f9fafb',
                          }}
                        >
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddress === index}
                            onChange={() => setSelectedAddress(index)}
                            className="mt-1"
                          />
                          <div>
                            <p className="font-bold">{addr.fullName}</p>
                            <p className="text-sm text-gray-600">{addr.addressLine1}</p>
                            {addr.addressLine2 && (
                              <p className="text-sm text-gray-600">{addr.addressLine2}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              {addr.city}, {addr.state} {addr.pincode}
                            </p>
                            <p className="text-sm text-gray-600">Phone: {addr.phone}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}

                  {!showAddressForm && (
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-3 rounded-lg font-bold transition-colors mb-6"
                    >
                      + Add New Address
                    </button>
                  )}

                  {showAddressForm && (
                    <div className="bg-white p-6 rounded-lg border-2 border-blue-200 mb-6">
                      <h3 className="font-bold mb-4">Add New Address</h3>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <input
                          type="text"
                          name="fullName"
                          placeholder="Full Name"
                          value={formData.fullName}
                          onChange={handleAddressChange}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={handleAddressChange}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <input
                        type="email"
                        name="email"
                        placeholder="Email (Optional)"
                        value={formData.email}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <input
                        type="text"
                        name="addressLine1"
                        placeholder="Address Line 1"
                        value={formData.addressLine1}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <input
                        type="text"
                        name="addressLine2"
                        placeholder="Address Line 2 (Optional)"
                        value={formData.addressLine2}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={formData.city}
                          onChange={handleAddressChange}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          name="state"
                          placeholder="State"
                          value={formData.state}
                          onChange={handleAddressChange}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          name="pincode"
                          placeholder="Pincode"
                          value={formData.pincode}
                          onChange={handleAddressChange}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={saveAddress}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                        >
                          Save Address
                        </button>
                        <button
                          onClick={() => setShowAddressForm(false)}
                          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg font-bold transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setStep(2)}
                    disabled={selectedAddress === null}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Shipping <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Step 2: Shipping */}
              {step === 2 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-bold mb-6">Shipping Method</h2>

                  <div className="space-y-3 mb-6">
                    <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border-blue-600 bg-blue-50">
                      <input
                        type="radio"
                        name="shipping"
                        value="standard"
                        checked={shippingMethod === 'standard'}
                        onChange={(e) => setShippingMethod(e.target.value)}
                      />
                      <div>
                        <p className="font-bold">Standard Shipping</p>
                        <p className="text-sm text-gray-600">
                          {shippingCost === 0
                            ? 'FREE - Delivery in 3-5 days'
                            : `${formatINR(shippingCost)} - Delivery in 3-5 days`}
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      Continue to Payment <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-bold mb-6">Payment Method</h2>

                  <div className="space-y-2 mb-6">
                    {paymentSettings.codEnabled && (
                      <label
                        className={`flex items-center gap-2.5 px-3 py-2.5 border rounded-lg cursor-pointer transition-colors ${
                          paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="cod"
                          checked={paymentMethod === 'cod'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-4 h-4 p-0 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">Cash on Delivery (COD)</p>
                          <p className="text-xs text-gray-600">
                            Pay on delivery{paymentSettings.codCharge > 0 ? ` • COD charge ${formatINR(paymentSettings.codCharge)}` : ''}
                          </p>
                        </div>
                      </label>
                    )}

                    <label
                      className={`flex items-center gap-2.5 px-3 py-2.5 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === 'razorpay' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 p-0 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5" /> Online Payment
                        </p>
                        <p className="text-xs text-gray-600">UPI, Cards, Wallets • charged only after we accept your order</p>
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleCheckout}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                      {loading
                        ? 'Processing...'
                        : `Place Order • ${formatINR(total + (paymentMethod === 'cod' ? paymentSettings.codCharge : 0))}`}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-20">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-gray-600 text-xs">
                          {item.size} | {item.color} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatINR(item.selling_price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        formatINR(shippingCost)
                      )}
                    </span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">COD Charge</span>
                      <span className="font-medium">{formatINR(paymentSettings.codCharge)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg p-3 border-2 border-blue-600">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatINR(
                        total + (paymentMethod === 'cod' ? paymentSettings.codCharge : 0)
                      )}
                    </span>
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
