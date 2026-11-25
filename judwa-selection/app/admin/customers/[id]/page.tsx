'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin, Loader, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface CustomerOrder {
  id: string;
  order_number: string;
  amount: number;
  status: string;
  date: string;
  items_count: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  city: string;
  state: string;
  joined_date: string;
  orders: CustomerOrder[];
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const customerId = params.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call
    const mockCustomer: Customer = {
      id: customerId,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+91 9999999999',
      total_orders: 5,
      total_spent: 9999,
      city: 'Himatnagar',
      state: 'Gujarat',
      joined_date: '2023-06-15',
      orders: [
        {
          id: '1',
          order_number: 'JW20240101001',
          amount: 1998,
          status: 'delivered',
          date: '2024-01-01',
          items_count: 3,
        },
        {
          id: '2',
          order_number: 'JW20240102002',
          amount: 2499,
          status: 'shipped',
          date: '2024-01-02',
          items_count: 2,
        },
        {
          id: '3',
          order_number: 'JW20240103003',
          amount: 1799,
          status: 'confirmed',
          date: '2024-01-03',
          items_count: 1,
        },
      ],
    };

    setCustomer(mockCustomer);
    setLoading(false);
  }, [customerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h1>
          <Link href="/admin/customers">
            <button className="text-blue-600 hover:text-blue-900 font-semibold">
              Back to Customers
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/admin/customers">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
            <p className="text-sm text-gray-600 mt-1">{customer.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Profile Card */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{customer.name}</h2>
              
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                  <Mail className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Email Address</p>
                    <p className="text-lg font-semibold text-gray-900">{customer.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                  <Phone className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="text-lg font-semibold text-gray-900">{customer.phone}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {customer.city}, {customer.state}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t border-gray-200 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Member Since</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(customer.joined_date).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="text-center border-l border-r border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Total Orders</p>
                  <p className="text-lg font-bold text-blue-600">{customer.total_orders}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Total Spent</p>
                  <p className="text-lg font-bold text-green-600">₹{customer.total_spent.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
              </div>

              {customer.orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Order ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Items</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900">Amount</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                        <th className="text-center py-3 px-4 font-semibold text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.orders.map(order => (
                        <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <Link href={`/admin/orders/${order.id}`}>
                              <span className="font-semibold text-blue-600 hover:text-blue-900 cursor-pointer">
                                {order.order_number}
                              </span>
                            </Link>
                          </td>
                          <td className="py-3 px-4 text-gray-900">
                            {new Date(order.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-center text-gray-900">{order.items_count}</td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900">
                            ₹{order.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.status)} capitalize`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Link href={`/admin/orders/${order.id}`}>
                              <button className="text-blue-600 hover:text-blue-900 font-semibold text-sm">
                                View
                              </button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No orders yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Active Orders</span>
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Completed Orders</span>
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Avg Order Value</span>
                  <span className="text-2xl font-bold text-gray-900">₹{Math.round(customer.total_spent / customer.total_orders)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition">
                  Send Email
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
                  Send SMS
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">
                  Block Customer
                </button>
              </div>
            </div>

            {/* Contact Methods */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Preferred Contact</h3>
              <div className="space-y-2">
                <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-900 font-semibold">
                  <Mail className="w-4 h-4" /> Email
                </a>
                <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-900 font-semibold">
                  <Phone className="w-4 h-4" /> Call
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
