'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Heart, Menu, X, User, ChevronDown, ChevronRight, Phone } from 'lucide-react';
import { trackPageView } from '@/lib/analytics';

interface MenuLink {
  label: string;
  href: string;
}

interface MenuSection {
  label: string;
  href: string;
  children?: MenuLink[];
}

const drawerSections: MenuSection[] = [
  { label: 'Home', href: '/' },
  { label: 'New Arrivals', href: '/products?sort=newest' },
  {
    label: 'Boys',
    href: '/products?category=boys',
    children: [
      { label: 'T-Shirts', href: '/products?category=boys&type=tshirts' },
      { label: 'Shirts', href: '/products?category=boys&type=shirts' },
      { label: 'Jeans', href: '/products?category=boys&type=jeans' },
      { label: 'Trousers', href: '/products?category=boys&type=trousers' },
      { label: 'Shorts', href: '/products?category=boys&type=shorts' },
      { label: 'Jackets', href: '/products?category=boys&type=jackets' },
    ],
  },
  {
    label: 'Girls',
    href: '/products?category=girls',
    children: [
      { label: 'Frocks', href: '/products?category=girls&type=frocks' },
      { label: 'Dresses', href: '/products?category=girls&type=dresses' },
      { label: 'Tops', href: '/products?category=girls&type=tops' },
      { label: 'Jeans', href: '/products?category=girls&type=jeans' },
      { label: 'Skirts', href: '/products?category=girls&type=skirts' },
      { label: 'Ethnic Wear', href: '/products?category=girls&type=ethnic' },
    ],
  },
  {
    label: 'Baby',
    href: '/products?category=baby',
    children: [
      { label: 'Baby Boys', href: '/products?category=baby-boys' },
      { label: 'Baby Girls', href: '/products?category=baby-girls' },
      { label: 'Newborn', href: '/products?category=newborn' },
    ],
  },
  {
    label: 'School Uniforms',
    href: '/school-uniforms',
    children: [
      { label: 'Shirt + Pant Sets', href: '/school-uniforms' },
      { label: 'Uniform Combos', href: '/combos' },
    ],
  },
  { label: 'Bestsellers', href: '/products?sort=popular' },
  { label: 'Combos', href: '/combos' },
  { label: 'Offers', href: '/products?sale=true' },
];

const drawerFooterLinks: MenuLink[] = [
  { label: 'Track Order', href: '/track-order' },
  { label: 'Returns', href: '/returns' },
  { label: 'Help & FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'About Us', href: '/about' },
  { label: 'Policies', href: '/privacy-policy' },
];

const deskNavItems = [
  { label: 'Boys', href: '/products?category=boys' },
  { label: 'Girls', href: '/products?category=girls' },
  { label: 'Baby', href: '/products?category=baby-boys' },
  { label: 'School Uniforms', href: '/school-uniforms' },
  { label: 'Combos', href: '/combos' },
  { label: 'New Arrivals', href: '/products?sort=newest' },
];

function CountBadge({ count, className }: { count: number; className: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={`absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold leading-none text-white ring-2 ring-white flex items-center justify-center ${className}`}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    (document.activeElement as HTMLElement | null)?.blur();
  };

  useEffect(() => {
    trackPageView();
  }, []);

  useEffect(() => {
    const readCounts = () => {
      const cart = JSON.parse(localStorage.getItem('judwa_cart') || '[]');
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0));

      const wishlist = JSON.parse(localStorage.getItem('judwa_wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };

    readCounts();
    window.addEventListener('storage', readCounts);
    return () => window.removeEventListener('storage', readCounts);
  }, []);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const toggleSection = (label: string) => {
    setExpandedSection(prev => (prev === label ? null : label));
  };

  return (
    <header className="bg-white border-b border-ink-100 sticky top-0 z-50">
      <div className="container">
        {/* Desktop Header */}
        <div className="hidden xl:flex justify-between items-center py-5 gap-6">
          <Link href="/" className="font-serif font-semibold text-2xl tracking-wide brand-text flex-shrink-0 whitespace-nowrap">
            JUDWA SELECTION
          </Link>

          <nav className="flex gap-6">
            {deskNavItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-ink-600 hover:text-gold-600 transition-colors text-xs font-semibold uppercase tracking-widest whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 flex-1 justify-end min-w-0">
            <form onSubmit={submitSearch} role="search" className="max-w-xs w-full min-w-0">
              <div className="relative">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                  className="w-full pl-3 pr-9 py-2 border border-ink-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-cream"
                />
                <button type="submit" aria-label="Search" className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-ink-400 hover:text-gold-600">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            <Link href="/account" aria-label="Account" className="w-10 h-10 flex items-center justify-center text-ink-700 hover:text-gold-600 transition-colors">
              <User className="h-5 w-5" />
            </Link>

            <Link href="/wishlist" aria-label="Wishlist" className="relative w-10 h-10 flex items-center justify-center text-ink-700 hover:text-gold-600 transition-colors">
              <Heart className="h-5 w-5" />
              <CountBadge count={wishlistCount} className="bg-gold-600" />
            </Link>

            <Link href="/cart" aria-label={`Cart (${cartCount} items)`} className="relative w-10 h-10 flex items-center justify-center text-ink-700 hover:text-gold-600 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              <CountBadge count={cartCount} className="bg-ink-900" />
            </Link>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="xl:hidden flex items-center py-2.5 gap-1.5 sm:gap-3">
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            className="w-10 h-10 -ml-2 flex items-center justify-center text-ink-700 flex-shrink-0"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link href="/" className="font-serif font-semibold text-sm min-[360px]:text-base sm:text-xl leading-none brand-text flex-shrink-0 whitespace-nowrap">
            JUDWA SELECTION
          </Link>

          <form onSubmit={submitSearch} role="search" className="relative flex-1 min-w-0 ml-1">
            <input
              type="search"
              enterKeyHint="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              aria-label="Search products"
              className="w-full h-9 pl-2.5 min-[360px]:pl-3 pr-8 py-0 border border-ink-200 rounded-full text-[13px] min-[360px]:text-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500 bg-cream"
            />
            <button type="submit" aria-label="Search" className="absolute right-0.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-ink-400">
              <Search className="h-4 w-4" />
            </button>
          </form>

          <Link href="/wishlist" aria-label="Wishlist" className="relative w-10 h-10 flex items-center justify-center text-ink-700 flex-shrink-0">
            <Heart className="h-[22px] w-[22px]" />
            <CountBadge count={wishlistCount} className="bg-gold-600" />
          </Link>

          <Link href="/cart" aria-label={`Cart (${cartCount} items)`} className="relative w-10 h-10 -mr-1 flex items-center justify-center text-ink-700 flex-shrink-0">
            <ShoppingCart className="h-[22px] w-[22px]" />
            <CountBadge count={cartCount} className="bg-ink-900" />
          </Link>
        </div>
      </div>

      {/* Mobile Hamburger Drawer */}
      {isMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="absolute top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <span className="font-serif font-semibold text-xl brand-text">JUDWA SELECTION</span>
              <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-gray-800">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="py-2">
              {drawerSections.map(section => (
                <div key={section.label} className="border-b border-gray-100">
                  {section.children ? (
                    <>
                      <button
                        onClick={() => toggleSection(section.label)}
                        className="w-full flex items-center justify-between px-5 py-3 text-left text-gray-800 font-semibold hover:bg-gray-50"
                      >
                        {section.label}
                        <ChevronDown
                          className={`h-4 w-4 text-gray-400 transition-transform ${
                            expandedSection === section.label ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedSection === section.label && (
                        <div className="bg-gray-50 pb-2">
                          <Link
                            href={section.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-1 px-8 py-2 text-sm font-semibold text-gold-600"
                          >
                            View All {section.label} <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                          {section.children.map(child => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setIsMenuOpen(false)}
                              className="block px-8 py-2 text-sm text-gray-600 hover:text-gold-600"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={section.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-5 py-3 text-gray-800 font-semibold hover:bg-gray-50"
                    >
                      {section.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            <div className="py-2">
              {drawerFooterLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-5 py-2.5 text-sm text-gray-600 hover:text-gold-600"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-2 mx-5 mb-6 p-4 bg-cream border border-ink-100 rounded-lg flex items-center gap-3">
              <Phone className="h-5 w-5 text-gold-600 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-gray-900">Need help?</p>
                <p className="text-gray-600">+91 9104128259</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

