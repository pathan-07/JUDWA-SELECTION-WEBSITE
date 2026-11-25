'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, Loader, Printer, Download, XCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { DEFAULT_STORE_SETTINGS, loadStoreSettings } from '@/lib/storeSettings';
import { DEFAULT_TAX_SETTINGS, loadTaxSettings } from '@/lib/taxSettings';
import { buildInvoicePdf } from '@/lib/invoicePdf';
import { whatsappChatUrl } from '@/lib/socialLinks';

// Phones are saved as typed (e.g. 0910…); WhatsApp needs the plain 10-digit number
const customerWhatsApp = (phone: string) => whatsappChatUrl((phone || '').replace(/\D/g, '').slice(-10));

interface OrderItem {
  id: string;
  product_name: string;
  size: string;
  color: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'authorized' | 'completed' | 'failed' | 'refunded';
  payment_method: string;
  total_amount: number;
  subtotal: number;
  shipping_cost: number;
  items: OrderItem[];
  delivery_address: string;
  created_at: string;
}

const statusSteps = [
  { step: 1, label: 'Placed', value: 'pending' },
  { step: 2, label: 'Confirmed', value: 'confirmed' },
  { step: 3, label: 'Processing', value: 'processing' },
  { step: 4, label: 'Shipped', value: 'shipped' },
  { step: 5, label: 'Delivered', value: 'delivered' },
] as const;

const NEXT_STATUSES: Record<string, { value: 'processing' | 'shipped' | 'delivered'; label: string }[]> = {
  confirmed: [
    { value: 'processing', label: 'Mark as Processing' },
    { value: 'shipped', label: 'Mark as Shipped' },
    { value: 'delivered', label: 'Mark as Delivered' },
  ],
  processing: [
    { value: 'shipped', label: 'Mark as Shipped' },
    { value: 'delivered', label: 'Mark as Delivered' },
  ],
  shipped: [{ value: 'delivered', label: 'Mark as Delivered' }],
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'processing':
      return 'bg-indigo-100 text-indigo-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'authorized':
      return 'bg-blue-100 text-blue-800';
    case 'refunded':
      return 'bg-purple-100 text-purple-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [store, setStore] = useState(DEFAULT_STORE_SETTINGS);
  const [tax, setTax] = useState(DEFAULT_TAX_SETTINGS);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    setStore(loadStoreSettings());
    setTax(loadTaxSettings());
  }, []);

  const makePdf = () => buildInvoicePdf({ ...order!, subtotal: order!.subtotal ?? order!.total_amount - order!.shipping_cost }, store, tax.gstin);

  const printInvoice = async () => {
    // Phone browsers often ignore window.print(); open the PDF instead, which has its own print/share button
    if (!window.matchMedia('(pointer: coarse)').matches) {
      window.print();
      return;
    }
    const tab = window.open('', '_blank'); // opened synchronously so popup blockers allow it
    setPdfLoading(true);
    try {
      const doc = await makePdf();
      const url = URL.createObjectURL(doc.output('blob'));
      if (tab) tab.location.href = url;
      else window.location.href = url;
    } catch {
      tab?.close();
      toast.error('Could not create the invoice. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const downloadInvoice = async () => {
    setPdfLoading(true);
    try {
      const doc = await makePdf();
      doc.save(`Invoice-${order!.order_number}.pdf`);
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Could not create the invoice. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const updateStatus = async (status: 'processing' | 'shipped' | 'delivered') => {
    if (!order) return;
    if (!window.confirm(`Mark order #${order.order_number} as ${status}? The customer will see this on their order page.`)) return;
    setActionLoading(status);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', status }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        toast.error('Session expired, please log in again');
        router.replace('/admin/login');
        return;
      }
      if (!res.ok) {
        toast.error(data.error || 'Could not update status');
        return;
      }
      toast.success(data.message);
      setOrder(prev =>
        prev && {
          ...prev,
          order_status: status,
          payment_status: status === 'delivered' && prev.payment_method !== 'razorpay' ? 'completed' : prev.payment_status,
        }
      );
    } catch {
      toast.error('Network error, please try again');
    } finally {
      setActionLoading(null);
    }
  };

  const runAction = async (action: 'accept' | 'cancel') => {
    if (!order) return;
    const confirmText =
      action === 'accept'
        ? order.payment_method === 'razorpay'
          ? `Accept order #${order.order_number}? ₹${order.total_amount} will now be collected from the customer.`
          : `Accept order #${order.order_number}?`
        : `Cancel order #${order.order_number}? Any online payment will be returned to the customer.`;
    if (!window.confirm(confirmText)) return;

    setActionLoading(action);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        toast.error('Session expired, please log in again');
        router.replace('/admin/login');
        return;
      }
      if (!res.ok) {
        toast.error(data.error || 'Action failed');
        return;
      }
      toast.success(data.message);
      setOrder(prev =>
        prev && {
          ...prev,
          order_status: action === 'accept' ? 'confirmed' : 'cancelled',
          payment_status:
            prev.payment_method !== 'razorpay' ? prev.payment_status : action === 'accept' ? 'completed' : 'refunded',
        }
      );
    } catch {
      toast.error('Network error, please try again');
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => setOrder(data?.order ?? null))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <Link href="/admin/orders">
            <button className="text-blue-600 hover:text-blue-900 font-semibold">
              Back to Orders
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(s => s.value === order.order_status);
  const subtotal = order.subtotal ?? order.total_amount - order.shipping_cost;
  const paymentLabel = order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online (Prepaid)';

  return (
    <>
    {/* Printable invoice: only visible when printing / saving as PDF */}
    <div className="hidden print:block text-black [&_p]:text-black text-[12px] leading-snug">
      <div className="flex justify-between items-start gap-6 border-b-2 border-black pb-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{store.storeName}</h1>
          {store.address && <p className="whitespace-pre-line">{store.address}</p>}
          <p>{[store.phones.join(', '), store.email].filter(Boolean).join(' · ')}</p>
          {tax.gstin && <p className="font-semibold">GSTIN: {tax.gstin}</p>}
        </div>
        <div className="text-right flex-shrink-0">
          <h2 className="text-xl font-bold tracking-wide">{tax.gstin ? 'TAX INVOICE' : 'INVOICE'}</h2>
          <p>Order #: <strong>{order.order_number}</strong></p>
          <p>Date: {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
          <p>Payment: {paymentLabel} ({order.payment_status})</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1">From (Seller)</p>
          <p className="font-semibold text-[13px]">{store.storeName}</p>
          {store.address && <p className="whitespace-pre-line">{store.address}</p>}
          {store.phones.length > 0 && <p>Phone: {store.phones.join(', ')}</p>}
          {tax.gstin && <p>GSTIN: {tax.gstin}</p>}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1">Ship To (Customer)</p>
          <p className="font-semibold text-[13px]">{order.customer_name}</p>
          {order.delivery_address && <p className="whitespace-pre-wrap">{order.delivery_address}</p>}
          <p>Phone: {order.customer_phone}</p>
          {order.customer_email && <p>Email: {order.customer_email}</p>}
        </div>
      </div>

      <table className="w-full border-collapse mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-400 px-2 py-1.5 text-left w-8">#</th>
            <th className="border border-gray-400 px-2 py-1.5 text-left">Product</th>
            <th className="border border-gray-400 px-2 py-1.5 text-left">Size</th>
            <th className="border border-gray-400 px-2 py-1.5 text-left">Color</th>
            <th className="border border-gray-400 px-2 py-1.5 text-right">Qty</th>
            <th className="border border-gray-400 px-2 py-1.5 text-right">Price</th>
            <th className="border border-gray-400 px-2 py-1.5 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, i) => (
            <tr key={item.id}>
              <td className="border border-gray-400 px-2 py-1.5">{i + 1}</td>
              <td className="border border-gray-400 px-2 py-1.5">{item.product_name}</td>
              <td className="border border-gray-400 px-2 py-1.5">{item.size}</td>
              <td className="border border-gray-400 px-2 py-1.5">{item.color}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-right">{item.quantity}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-right">₹{item.price}</td>
              <td className="border border-gray-400 px-2 py-1.5 text-right">₹{item.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto w-64">
        <div className="flex justify-between py-0.5"><span>Subtotal</span><span>₹{subtotal}</span></div>
        <div className="flex justify-between py-0.5"><span>Shipping / COD charges</span><span>₹{order.shipping_cost}</span></div>
        <div className="flex justify-between border-t-2 border-black mt-1 pt-1 text-[14px] font-bold">
          <span>Total</span><span>₹{order.total_amount}</span>
        </div>
        {order.payment_method === 'cod' && order.payment_status !== 'completed' && (
          <p className="mt-1 font-semibold">Amount to collect on delivery: ₹{order.total_amount}</p>
        )}
      </div>

      <p className="mt-8 text-center">Thank you for shopping with {store.storeName}!</p>
      <p className="text-center text-[10px] text-gray-600">This is a computer-generated invoice.</p>
    </div>

    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white print:hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link href="/admin/orders">
              <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-sm text-gray-600 mt-1 truncate">Order #{order.order_number}</p>
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={printInvoice}
              disabled={pdfLoading}
              className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button
              onClick={downloadInvoice}
              disabled={pdfLoading}
              className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2 transition"
            >
              {pdfLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Timeline */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
          {order.order_status === 'cancelled' ? (
            <p className="px-4 py-3 rounded-lg bg-red-50 text-red-700 font-semibold">This order was cancelled.</p>
          ) : (
            <div className="grid grid-cols-5 gap-1">
              {statusSteps.map((step, index) => (
                <div key={step.value} className="flex flex-col items-center text-center relative">
                  {index > 0 && (
                    <div
                      className={`absolute top-4 sm:top-5 right-1/2 w-full h-1 ${index <= currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                    />
                  )}
                  <div
                    className={`relative z-[1] flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm font-semibold text-white ${
                      index <= currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    {index < currentStepIndex ? <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" /> : step.step}
                  </div>
                  <p className={`mt-2 text-[11px] sm:text-sm font-semibold ${index <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="text-lg font-semibold text-gray-900">{order.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900">{order.customer_email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">{order.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Delivery Address</h2>
              <p className="text-gray-900 whitespace-pre-wrap">{order.delivery_address}</p>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Size</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Color</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Qty</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Price</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map(item => (
                      <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{item.product_name}</td>
                        <td className="py-3 px-4 text-gray-900">{item.size}</td>
                        <td className="py-3 px-4 text-gray-900">{item.color}</td>
                        <td className="py-3 px-4 text-right text-gray-900">{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-gray-900">₹{item.price}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Accept / Cancel */}
            {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-3">
                <h2 className="text-lg font-bold text-gray-900">Order Action</h2>
                {order.payment_status === 'authorized' && (
                  <p className="text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    Payment is <strong>held</strong>, not yet collected. Accept to collect ₹{order.total_amount}, or
                    cancel to return it to the customer. Accept within 48 hours of payment, otherwise Razorpay returns the money automatically.
                  </p>
                )}
                {order.order_status === 'pending' && (
                  <button
                    onClick={() => runAction('accept')}
                    disabled={actionLoading !== null}
                    className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    {actionLoading === 'accept' ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Accept Order
                  </button>
                )}
                {NEXT_STATUSES[order.order_status]?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Update status (customer can see this)</p>
                    {NEXT_STATUSES[order.order_status].map((next, i) => (
                      <button
                        key={next.value}
                        onClick={() => updateStatus(next.value)}
                        disabled={actionLoading !== null}
                        className={`w-full px-4 py-2.5 font-semibold rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50 ${
                          i === 0 ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border border-blue-300 text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        {actionLoading === next.value && <Loader className="w-4 h-4 animate-spin" />}
                        {next.label}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => runAction('cancel')}
                  disabled={actionLoading !== null}
                  className="w-full px-4 py-2.5 border-2 border-red-600 text-red-600 hover:bg-red-50 disabled:opacity-50 font-semibold rounded-lg flex items-center justify-center gap-2 transition"
                >
                  {actionLoading === 'cancel' ? <Loader className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Cancel Order{order.payment_method === 'razorpay' ? ' & Refund' : ''}
                </button>
              </div>
            )}

            {/* Ask the customer for a review */}
            {order.order_status === 'delivered' && customerWhatsApp(order.customer_phone) && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-3">
                <h2 className="text-lg font-bold text-gray-900">Ask for a Review</h2>
                <p className="text-sm text-gray-600">Send the customer a WhatsApp message with the link to rate their order.</p>
                <a
                  href={`${customerWhatsApp(order.customer_phone)}?text=${encodeURIComponent(
                    `Hi ${order.customer_name || ''}, thank you for shopping with JUDWA SELECTION! Your order #${order.order_number} has been delivered. We'd love your review: ${window.location.origin}/order-confirmation/${order.order_number}#review`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
                >
                  Send Review Link on WhatsApp
                </a>
              </div>
            )}

            {/* Payment Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-semibold text-gray-900 capitalize">{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status</span>
                  <span className={`px-2 py-1 rounded text-sm font-semibold ${getPaymentStatusColor(order.payment_status)} capitalize`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{order.total_amount - order.shipping_cost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-900">₹{order.shipping_cost}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-blue-600">₹{order.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Order Status Badge */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Status</h2>
              <span className={`px-3 py-2 rounded-lg text-sm font-semibold inline-block w-full text-center ${getStatusBadgeColor(order.order_status)} capitalize`}>
                {order.order_status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
