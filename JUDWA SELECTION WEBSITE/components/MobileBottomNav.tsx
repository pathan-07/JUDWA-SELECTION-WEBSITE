'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Home, Grid3x3, Heart, User } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const readWishlist = () => {
      const wishlist = JSON.parse(localStorage.getItem('judwa_wishlist') || '[]');
      setWishlistCount(wishlist.length);
    };
    readWishlist();
    window.addEventListener('storage', readWishlist);
    return () => window.removeEventListener('storage', readWishlist);
  }, []);

  // Admin panel has its own navigation
  if (pathname?.startsWith('/admin')) return null;

  const items = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Categories', href: '/products', icon: Grid3x3 },
    { label: 'Wishlist', href: '/wishlist', icon: Heart, badge: wishlistCount },
    { label: 'Account', href: '/account', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-ink-100 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] pb-safe">
      <div className="grid grid-cols-4 h-16">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center gap-1 min-w-0 relative transition-colors ${
                isActive ? 'text-gold-600' : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gold-500" />}
              <span className="relative flex items-center justify-center w-6 h-6">
                <Icon className={`w-[22px] h-[22px] ${isActive ? 'fill-gold-100' : ''}`} />
                {!!item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-gold-600 text-white text-[10px] font-semibold leading-none rounded-full ring-2 ring-white flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </span>
              <span className="text-[11px] font-medium leading-none truncate max-w-full px-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
