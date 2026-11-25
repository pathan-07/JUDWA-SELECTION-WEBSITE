'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign, AlertCircle, Eye, Loader } from 'lucide-react';
import Link from 'next/link';

interface Stat {
  current: number;
  change: number;
}

interface AnalyticsData {
  visits: { views: number; visitors: number };
  stats: { revenue: Stat; orders: Stat; customers: Stat; avgOrderValue: Stat };
  topProducts: { name: string; quantity: number; revenue: number }[];
  categories: { name: string; revenue: number; percent: number }[];
  daily: { date: string; revenue: number; orders: number }[];
  lowStockProducts: string[];
  recentOrders: { id: string; orderNumber: string; customer: string; amount: number; status: string; date: string }[];
}

const RANGE_LABELS: Record<string, string> = {
  '7days': 'Last 7 Days',
  '30days': 'Last 30 Days',
  '90days': 'Last 90 Days',
  year: 'Last 12 Months',
};

const CATEGORY_COLORS = ['bg-blue-600', 'bg-pink-600', 'bg-purple-600', 'bg-green-600', 'bg-orange-500', 'bg-cyan-600'];

const rupees = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('7days');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/admin/analytics?range=${dateRange}`, { cache: 'no-store' })
      .then(async res => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Could not load analytics');
        setData(await res.json());
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [dateRange]);

  const maxDaily = Math.max(1, ...(data?.daily.map(d => d.revenue) ?? [0]));

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'processing':
        return 'bg-indigo-100 text-indigo-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    change,
  }: {
    title: string;
    value: string | number;
    icon: any;
    change: number;
  }) => {
    const isPositive = change >= 0;
    return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-semibold mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-gray-500">vs previous period</span>
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Real sales from your orders (cancelled orders excluded)</p>
            </div>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              aria-label="Date range"
              className="w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold"
            >
              {Object.entries(RANGE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-8">{error}</div>
        )}
        {!loading && data && (
        <>
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={rupees(data.stats.revenue.current)}
            icon={DollarSign}
            change={data.stats.revenue.change}
          />
          <StatCard
            title="Total Orders"
            value={data.stats.orders.current}
            icon={ShoppingBag}
            change={data.stats.orders.change}
          />
          <StatCard
            title="Customers"
            value={data.stats.customers.current}
            icon={Users}
            change={data.stats.customers.change}
          />
          <StatCard
            title="Avg Order Value"
            value={rupees(data.stats.avgOrderValue.current)}
            icon={TrendingUp}
            change={data.stats.avgOrderValue.change}
          />
        </div>

        {/* Daily sales */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Daily Sales</h2>
          <div className="flex items-end gap-1 h-40">
            {data.daily.map(day => (
              <div key={day.date} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                <div
                  className={`w-full rounded-t ${day.revenue > 0 ? 'bg-blue-600' : 'bg-gray-200'}`}
                  style={{ height: `${Math.max(2, (day.revenue / maxDaily) * 100)}%` }}
                  title={`${new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}: ${rupees(day.revenue)} (${day.orders} orders)`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[11px] text-gray-500 mt-2">
            <span>{data.daily[0] && new Date(data.daily[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            <span>Today</span>
          </div>
        </div>

        {/* Website Traffic (stored in the database) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-50 p-3 rounded-lg text-cyan-600">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Website Visitors ({RANGE_LABELS[dateRange]})</p>
                <p className="text-2xl font-bold text-gray-900">{data.visits.visitors}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-gray-600 text-sm font-semibold">Page Views ({RANGE_LABELS[dateRange]})</p>
                <p className="text-2xl font-bold text-gray-900">{data.visits.views}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Products */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 sm:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Products</h2>
            {data.topProducts.length === 0 ? (
              <p className="text-gray-500">No sales in this period yet.</p>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Units Sold</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((product, index) => (
                    <tr key={`${product.name}-${index}`} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{index + 1}. {product.name}</p>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900">{product.quantity}</td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">{rupees(product.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>

          {/* Insights & Alerts */}
          <div className="space-y-6">
            {/* Revenue Breakdown */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue by Category</h3>
              {data.categories.length === 0 ? (
                <p className="text-sm text-gray-500">No sales in this period yet.</p>
              ) : (
              <div className="space-y-4">
                {data.categories.map((category, i) => (
                  <div key={category.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">{category.name}</span>
                      <span className="font-semibold text-gray-900">{category.percent}% · {rupees(category.revenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${CATEGORY_COLORS[i % CATEGORY_COLORS.length]} h-2 rounded-full`}
                        style={{ width: `${category.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>

            {/* Alerts */}
            {data.lowStockProducts.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-yellow-900 mb-1">Low Stock Alert</h4>
                  <p className="text-sm text-yellow-800">
                    {data.lowStockProducts.length} {data.lowStockProducts.length === 1 ? 'product has' : 'products have'} a size with 5 or fewer left:
                  </p>
                  <ul className="text-sm text-yellow-900 list-disc pl-5 mt-1">
                    {data.lowStockProducts.slice(0, 8).map((name, i) => <li key={`${name}-${i}`}>{name}</li>)}
                  </ul>
                  <Link href="/admin/products" className="inline-block text-yellow-900 font-semibold text-sm mt-2 hover:underline">
                    View Products →
                  </Link>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>
          {data.recentOrders.length === 0 ? (
            <p className="text-gray-500">No orders yet.</p>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link href={`/admin/orders/${order.id}`}>
                        <span className="font-semibold text-blue-600 hover:text-blue-900 cursor-pointer">
                          {order.orderNumber}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{order.customer}</td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      {rupees(order.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(order.status)} capitalize`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {new Date(order.date).toLocaleDateString('en-IN')}
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
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}
