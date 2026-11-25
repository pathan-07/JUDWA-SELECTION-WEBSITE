'use client';

import { useState } from 'react';
import { Settings, Mail, ShoppingBag, Users, Zap, CreditCard, Palette, RotateCcw, Truck, Megaphone, LayoutGrid, LayoutTemplate, PanelBottom, Share2, Shapes } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface SettingCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

export default function AdminSettingsPage() {
  const [resetting, setResetting] = useState(false);

  const settingCards: SettingCard[] = [
    {
      title: 'Payment Settings',
      description: 'Turn Cash on Delivery on/off and set the COD charge',
      icon: <CreditCard className="w-8 h-8" />,
      href: '/admin/settings/payment',
    },
    {
      title: 'Announcement Bar',
      description: 'Show/hide the running top line and edit its text',
      icon: <Megaphone className="w-8 h-8" />,
      href: '/admin/settings/announcement',
    },
    {
      title: 'Homepage Highlights',
      description: 'Edit the 3 boxes (Free Shipping, Quality, Secure Payment) on the homepage',
      icon: <LayoutGrid className="w-8 h-8" />,
      href: '/admin/settings/features',
    },
    {
      title: 'Product Card Design',
      description: 'Change how product cards look (style, corners, image shape, button)',
      icon: <LayoutTemplate className="w-8 h-8" />,
      href: '/admin/settings/product-card',
    },
    {
      title: 'Category Card Design',
      description: 'Shape, size and style of homepage category cards',
      icon: <Shapes className="w-8 h-8" />,
      href: '/admin/settings/category-card',
    },
    {
      title: 'Social Links',
      description: 'Add Instagram, WhatsApp, YouTube, Facebook and other links',
      icon: <Share2 className="w-8 h-8" />,
      href: '/admin/settings/social',
    },
    {
      title: 'Footer Settings',
      description: 'Show or hide footer sections and links',
      icon: <PanelBottom className="w-8 h-8" />,
      href: '/admin/settings/footer',
    },
    {
      title: 'Shipping Settings',
      description: 'Set the free-shipping amount shown on the website banner',
      icon: <Truck className="w-8 h-8" />,
      href: '/admin/settings/shipping',
    },
    {
      title: 'Theme Settings',
      description: 'Change your storefront\'s front-end brand color',
      icon: <Palette className="w-8 h-8" />,
      href: '/admin/settings/theme',
    },
    {
      title: 'Email Settings',
      description: 'Configure SMTP, email templates, and notifications',
      icon: <Mail className="w-8 h-8" />,
      href: '/admin/settings/email',
    },
    {
      title: 'Store Settings',
      description: 'Manage store name, address, and contact info',
      icon: <ShoppingBag className="w-8 h-8" />,
      href: '/admin/settings/store',
    },
    {
      title: 'User & Roles',
      description: 'Admin access, password and logout',
      icon: <Users className="w-8 h-8" />,
      href: '/admin/settings/users',
    },
    {
      title: 'System Settings',
      description: 'Payment gateway, shipping, and GST',
      icon: <Zap className="w-8 h-8" />,
      href: '/admin/settings/system',
    },
  ];

  const handleResetDashboard = async () => {
    if (!window.confirm('Dashboard and Analytics will start counting from zero (orders, sales, profit, customers, visits). No orders are deleted — they stay in the Orders list. Continue?')) {
      return;
    }
    setResetting(true);
    const res = await fetch('/api/admin/dashboard/reset', { method: 'POST' }).catch(() => null);
    if (!res?.ok) {
      setResetting(false);
      toast.error('Could not reset. Please check your internet and try again.');
      return;
    }
    toast.success('Dashboard stats reset to zero');
    setResetting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your store configuration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {settingCards.map((setting) => (
            <Link key={setting.href} href={setting.href}>
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-105 transition-all cursor-pointer h-full">
                <div className="bg-blue-50 p-3 rounded-lg w-fit mb-4 text-blue-600">
                  {setting.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{setting.title}</h3>
                <p className="text-sm text-gray-600">{setting.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/products">
              <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition text-left">
                📦 Manage Products
              </button>
            </Link>
            <Link href="/admin/orders">
              <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition text-left">
                📋 View Orders
              </button>
            </Link>
            <Link href="/admin/analytics">
              <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition text-left">
                📊 View Analytics
              </button>
            </Link>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8 border border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-800 text-sm">
            Contact support at <span className="font-semibold">support@judwa.com</span> or visit our{' '}
            <a href="#" className="underline font-semibold">
              documentation
            </a>
            .
          </p>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-lg p-6 mt-8 border border-red-200">
          <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
            <RotateCcw className="w-5 h-5" /> Reset Dashboard Stats
          </h3>
          <p className="text-red-800 text-sm mb-4">
            Starts the Dashboard and Analytics counters (orders, sales, profit, customers, visits) from zero — useful
            after test orders. Orders are not deleted, and products, banners and other content are never touched.
          </p>
          <button
            onClick={handleResetDashboard}
            disabled={resetting}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition"
          >
            {resetting ? 'Resetting...' : 'Reset Dashboard Stats'}
          </button>
        </div>
      </div>
    </div>
  );
}
