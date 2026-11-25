'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Image as ImageIcon,
  Inbox,
  Zap,
  ArrowLeft,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { syncSettingsFromServer, uploadLocalOnlySettings } from '@/lib/settingsSync';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  submenu?: Array<{ label: string; href: string }>;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isLoginPage = pathname === '/admin/login';
  const [settingsReady, setSettingsReady] = useState(false);
  useEffect(() => {
    if (isLoginPage) return;
    // Admin forms must start from the latest saved settings, not this browser's older copy
    syncSettingsFromServer().then(serverMap => {
      setSettingsReady(true);
      // One-time move of settings this browser saved before they were stored in the database
      if (serverMap) uploadLocalOnlySettings(serverMap);
    });
  }, [isLoginPage]);

  const closeMenu = () => setIsOpen(false);

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push('/admin');
  };

  const sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
    {
      label: 'Products',
      href: '/admin/products',
      icon: <Package className="h-5 w-5" />,
      submenu: [
        { label: 'All Products', href: '/admin/products' },
        { label: 'Add Product', href: '/admin/products/new' },
        { label: 'Categories', href: '/admin/categories' },
        { label: 'Sizes', href: '/admin/sizes' },
        { label: 'School Uniform Pairing', href: '/admin/school-pairing' },
        { label: 'Combos', href: '/admin/combos' },
        { label: 'Product Card Design', href: '/admin/settings/product-card' },
        { label: 'Category Card Design', href: '/admin/settings/category-card' },
      ],
    },
    {
      label: 'Orders',
      href: '/admin/orders',
      icon: <ShoppingCart className="h-5 w-5" />,
      submenu: [
        { label: 'All Orders', href: '/admin/orders' },
        { label: 'Pending', href: '/admin/orders?status=pending' },
        { label: 'Returns', href: '/admin/returns' },
      ],
    },
    { label: 'Customers', href: '/admin/customers', icon: <Users className="h-5 w-5" /> },
    {
      label: 'Content',
      href: '/admin/content',
      icon: <FileText className="h-5 w-5" />,
      submenu: [
        { label: 'Banners', href: '/admin/banners' },
        { label: 'Announcement Bar', href: '/admin/settings/announcement' },
        { label: 'Homepage Highlights', href: '/admin/settings/features' },
        { label: 'Footer', href: '/admin/settings/footer' },
        { label: 'Social Links', href: '/admin/settings/social' },
        { label: 'Reels', href: '/admin/reels' },
        { label: 'Collections', href: '/admin/collections' },
      ],
    },
    { label: 'Media', href: '/admin/media', icon: <ImageIcon className="h-5 w-5" /> },
    { label: 'Reviews', href: '/admin/reviews', icon: <Inbox className="h-5 w-5" /> },
    { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="h-5 w-5" /> },
    { label: 'Coupons', href: '/admin/coupons', icon: <Zap className="h-5 w-5" /> },
    { label: 'Settings', href: '/admin/settings', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 print:block print:h-auto print:bg-white">
      {/* Mobile backdrop: tap outside the menu to close it */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeMenu} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] bg-gray-900 text-white transform transition-transform duration-300 overflow-y-auto lg:static lg:translate-x-0 print:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-start justify-between">
          <div>
            <Link href="/admin" onClick={closeMenu} className="text-2xl font-bold">
              JUDWA
            </Link>
            <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
          </div>
          <button onClick={closeMenu} aria-label="Close menu" className="lg:hidden text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6">
          {sidebarItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>

              {item.submenu && (
                <div className="pl-12">
                  {item.submenu.map((subitem) => (
                    <Link
                      key={subitem.href}
                      href={subitem.href}
                      onClick={closeMenu}
                      className={`block py-2 text-sm transition-colors ${
                        pathname === subitem.href
                          ? 'text-blue-400'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {subitem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-6 mt-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden print:block print:overflow-visible">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center print:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {pathname !== '/admin' && (
            <button
              onClick={handleBack}
              className="ml-3 lg:ml-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          )}

          <div className="flex-1 ml-4">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="font-medium text-gray-900">Admin User</p>
              <p className="text-gray-500">admin@judwaselection.com</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-100 p-6 print:overflow-visible print:bg-white print:p-0">
          {settingsReady ? children : <div className="flex justify-center py-16 text-gray-500">Loading…</div>}
        </main>
      </div>
    </div>
  );
}
