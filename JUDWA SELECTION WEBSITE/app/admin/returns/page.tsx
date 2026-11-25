'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { RotateCcw, CheckCircle, XCircle, Truck, PackageCheck } from 'lucide-react';

interface ReturnRequest {
  id: string;
  orderNumber: string;
  customer: string;
  product: string;
  variant: string;
  quantity: number;
  reason: string;
  requestDate: string;
  status: 'requested' | 'approved' | 'rejected' | 'pickup_scheduled' | 'picked_up' | 'received' | 'refunded' | 'cancelled';
}

const statusColors: Record<ReturnRequest['status'], string> = {
  requested: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  pickup_scheduled: 'bg-purple-100 text-purple-800',
  picked_up: 'bg-indigo-100 text-indigo-800',
  received: 'bg-cyan-100 text-cyan-800',
  refunded: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([
    {
      id: '1',
      orderNumber: 'JW20240101001',
      customer: 'John Doe',
      product: 'Blue Cotton T-Shirt',
      variant: 'M / Blue',
      quantity: 1,
      reason: 'Size too small',
      requestDate: '2024-01-05',
      status: 'requested',
    },
    {
      id: '2',
      orderNumber: 'JW20240102002',
      customer: 'Jane Smith',
      product: 'Pink Floral Dress',
      variant: '4-5Y / Pink',
      quantity: 1,
      reason: 'Damaged on arrival',
      requestDate: '2024-01-06',
      status: 'approved',
    },
  ]);

  const updateStatus = (id: string, status: ReturnRequest['status']) => {
    setReturns(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
    toast.success(`Return marked as ${status.replace('_', ' ')}`);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <RotateCcw className="w-7 h-7 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Returns</h2>
          <p className="text-sm text-gray-600 mt-1">Review and process customer return requests</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Order</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Reason</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {returns.map(r => (
              <tr key={r.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-blue-600">{r.orderNumber}</td>
                <td className="py-3 px-4 text-gray-900">{r.customer}</td>
                <td className="py-3 px-4 text-gray-900">
                  {r.product}
                  <div className="text-xs text-gray-500">{r.variant} × {r.quantity}</div>
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">{r.reason}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[r.status]}`}>
                    {r.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    {r.status === 'requested' && (
                      <>
                        <button onClick={() => updateStatus(r.id, 'approved')} title="Approve" className="text-green-600 hover:text-green-800">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button onClick={() => updateStatus(r.id, 'rejected')} title="Reject" className="text-red-600 hover:text-red-800">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    {r.status === 'approved' && (
                      <button onClick={() => updateStatus(r.id, 'pickup_scheduled')} title="Schedule Pickup" className="text-purple-600 hover:text-purple-800">
                        <Truck className="w-5 h-5" />
                      </button>
                    )}
                    {(r.status === 'pickup_scheduled' || r.status === 'picked_up') && (
                      <button onClick={() => updateStatus(r.id, 'received')} title="Mark Received" className="text-cyan-600 hover:text-cyan-800">
                        <PackageCheck className="w-5 h-5" />
                      </button>
                    )}
                    {r.status === 'received' && (
                      <button
                        onClick={() => updateStatus(r.id, 'refunded')}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded"
                      >
                        Process Refund
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {returns.length === 0 && (
          <div className="text-center py-12 text-gray-500">No return requests yet</div>
        )}
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mt-8 border border-blue-200">
        <p className="text-blue-800 text-sm">
          Return system ON/OFF and return-window settings live under{' '}
          <a href="/admin/settings" className="underline font-semibold">Settings</a>.
        </p>
      </div>
    </div>
  );
}
