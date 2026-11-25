'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, ShoppingCart, Users, Package, DollarSign, Eye } from 'lucide-react';
import { getCatalogPotentialProfit } from '@/lib/productsData';

interface DashboardMetrics {
  totalOrders: number;
  totalSales: number;
  totalProfit: number;
  totalCustomers: number;
  lowStockProducts: number;
  pendingReviews: number;
  todayOrders: number;
  todaySales: number;
  todayProfit: number;
  monthlyProfit: number;
  viewsToday: number;
  viewsMonth: number;
  visitorsToday: number;
  visitorsMonth: number;
  catalogProfit: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalOrders: 0,
    totalSales: 0,
    totalProfit: 0,
    totalCustomers: 0,
    lowStockProducts: 0,
    pendingReviews: 0,
    todayOrders: 0,
    todaySales: 0,
    todayProfit: 0,
    monthlyProfit: 0,
    viewsToday: 0,
    viewsMonth: 0,
    visitorsToday: 0,
    visitorsMonth: 0,
    catalogProfit: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Customer data is protected by RLS, so the numbers come from a server route
        const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Dashboard request failed (${res.status})`);
        const data = await res.json();
        setMetrics(prev => ({
          ...prev,
          totalOrders: data.totalOrders,
          totalSales: data.totalSales,
          totalProfit: data.totalProfit,
          totalCustomers: data.totalCustomers,
          lowStockProducts: data.lowStockProducts,
          pendingReviews: data.pendingReviews,
          todayOrders: data.todayOrders,
          todaySales: data.todaySales,
          todayProfit: data.todayProfit,
          monthlyProfit: data.monthlyProfit,
          viewsToday: data.viewsToday,
          viewsMonth: data.viewsMonth,
          visitorsToday: data.visitorsToday,
          visitorsMonth: data.visitorsMonth,
        }));
      } catch (error) {
        console.error('Error loading dashboard metrics:', error);
      } finally {
        const catalogProfit = await getCatalogPotentialProfit();
        setMetrics(prev => ({ ...prev, catalogProfit }));
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  const MetricCard = ({
    icon: Icon,
    label,
    value,
    trend,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    trend?: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && <p className="text-green-600 text-sm mt-2">{trend}</p>}
        </div>
        <div className="bg-blue-100 p-3 rounded-lg">
          {Icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          icon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
          label="Total Orders"
          value={metrics.totalOrders}
          trend="Cancelled orders not counted"
        />
        <MetricCard
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
          label="Total Sales"
          value={`₹${(metrics.totalSales || 0).toLocaleString('en-IN')}`}
        />
        <MetricCard
          icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
          label="Total Profit"
          value={`₹${(metrics.totalProfit || 0).toLocaleString('en-IN')}`}
          trend="Selling price − purchase price"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={<Users className="h-6 w-6 text-indigo-600" />}
          label="Total Customers"
          value={metrics.totalCustomers}
        />
        <MetricCard
          icon={<Package className="h-6 w-6 text-orange-600" />}
          label="Low Stock Products"
          value={metrics.lowStockProducts}
        />
        <MetricCard
          icon={<Eye className="h-6 w-6 text-cyan-600" />}
          label="Pending Reviews"
          value={metrics.pendingReviews}
        />
        <MetricCard
          icon={<TrendingUp className="h-6 w-6 text-pink-600" />}
          label="Monthly Profit"
          value={`₹${(metrics.monthlyProfit || 0).toLocaleString('en-IN')}`}
        />
      </div>

      {/* Website Traffic */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          icon={<Eye className="h-6 w-6 text-cyan-600" />}
          label="Website Views Today"
          value={metrics.viewsToday}
          trend={`${metrics.visitorsToday} unique ${metrics.visitorsToday === 1 ? 'visitor' : 'visitors'}`}
        />
        <MetricCard
          icon={<Eye className="h-6 w-6 text-blue-600" />}
          label="Website Views This Month"
          value={metrics.viewsMonth}
          trend={`${metrics.visitorsMonth} unique ${metrics.visitorsMonth === 1 ? 'visitor' : 'visitors'}`}
        />
        <MetricCard
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
          label="Potential Profit (Current Stock)"
          value={`₹${(metrics.catalogProfit || 0).toLocaleString('en-IN')}`}
          trend="Selling price − purchase price × stock on hand"
        />
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Summary</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-500 text-sm">Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{metrics.todayOrders}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Sales</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">₹{(metrics.todaySales || 0).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Profit</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">₹{(metrics.todayProfit || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/products/new"
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-3 px-4 rounded-lg transition-colors text-center"
          >
            Add Product
          </a>
          <a
            href="/admin/products"
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-3 px-4 rounded-lg transition-colors text-center"
          >
            Manage Products
          </a>
          <a
            href="/admin/orders"
            className="bg-green-50 hover:bg-green-100 text-green-600 font-semibold py-3 px-4 rounded-lg transition-colors text-center"
          >
            View Orders
          </a>
          <a
            href="/admin/customers"
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold py-3 px-4 rounded-lg transition-colors text-center"
          >
            View Customers
          </a>
          <a
            href="/admin/banners"
            className="bg-purple-50 hover:bg-purple-100 text-purple-600 font-semibold py-3 px-4 rounded-lg transition-colors text-center"
          >
            Manage Banners
          </a>
          <a
            href="/admin/reels"
            className="bg-pink-50 hover:bg-pink-100 text-pink-600 font-semibold py-3 px-4 rounded-lg transition-colors text-center"
          >
            Manage Reels
          </a>
          <a
            href="/admin/analytics"
            className="bg-orange-50 hover:bg-orange-100 text-orange-600 font-semibold py-3 px-4 rounded-lg transition-colors text-center"
          >
            View Analytics
          </a>
          <a
            href="/admin/settings/email"
            className="bg-yellow-50 hover:bg-yellow-100 text-yellow-600 font-semibold py-3 px-4 rounded-lg transition-colors text-center"
          >
            Email Settings
          </a>
        </div>
      </div>
    </div>
  );
}
