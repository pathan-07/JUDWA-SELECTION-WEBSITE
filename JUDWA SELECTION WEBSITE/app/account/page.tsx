'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Heart, MapPin, MessageCircle, PackageSearch, RotateCcw, Ruler, ShoppingBag } from 'lucide-react';
import InfoPage from '@/components/InfoPage';

export default function AccountPage() {
  const [counts, setCounts] = useState({ cart: 0, wishlist: 0, addresses: 0 });

  useEffect(() => {
    const read = (key: string) => {
      try {
        const value = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(value) ? value : [];
      } catch {
        return [];
      }
    };
    const sync = () =>
      setCounts({
        cart: read('judwa_cart').reduce((sum: number, item: any) => sum + (Number(item?.quantity) || 0), 0),
        wishlist: read('judwa_wishlist').length,
        addresses: read('judwa_addresses').length,
      });
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const links = [
    { href: '/track-order', label: 'Track my order', hint: 'Check your order status', icon: PackageSearch },
    { href: '/cart', label: 'My cart', hint: `${counts.cart} item(s)`, icon: ShoppingBag },
    { href: '/wishlist', label: 'My wishlist', hint: `${counts.wishlist} saved`, icon: Heart },
    { href: '/checkout', label: 'Saved addresses', hint: `${counts.addresses} address(es) on this device`, icon: MapPin },
    { href: '/returns', label: 'Returns & exchanges', hint: 'Easy 7-day returns', icon: RotateCcw },
    { href: '/size-guide', label: 'Size guide', hint: 'Find the perfect fit', icon: Ruler },
    { href: '/contact', label: 'Help & contact', hint: 'Call or WhatsApp us', icon: MessageCircle },
  ];

  return (
    <InfoPage eyebrow="Welcome" title="My Account" intro="No sign-up needed — shop as a guest. Your cart, wishlist and addresses are saved on this device.">
      <div className="bg-white border border-ink-100 rounded-xl divide-y divide-ink-100">
        {links.map(({ href, label, hint, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-4 p-4 hover:bg-cream transition">
            <Icon className="w-5 h-5 text-gold-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink-900">{label}</p>
              <p className="text-xs text-ink-500">{hint}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-ink-300" />
          </Link>
        ))}
      </div>
    </InfoPage>
  );
}
