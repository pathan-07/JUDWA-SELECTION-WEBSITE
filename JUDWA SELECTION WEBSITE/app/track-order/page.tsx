'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PackageSearch } from 'lucide-react';
import InfoPage from '@/components/InfoPage';

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = orderNumber.trim().replace(/^#/, '').toUpperCase();
    if (value) router.push(`/order-confirmation/${encodeURIComponent(value)}`);
  };

  return (
    <InfoPage eyebrow="Order status" title="Track Your Order" intro="Enter the order number from your confirmation message.">
      <form onSubmit={handleSubmit} className="bg-white border border-ink-100 rounded-xl p-6 sm:p-8 text-center space-y-4">
        <PackageSearch className="w-10 h-10 text-gold-600 mx-auto" />
        <input
          value={orderNumber}
          onChange={e => setOrderNumber(e.target.value)}
          placeholder="e.g. ORD123456781234"
          required
          maxLength={50}
          className="w-full max-w-sm mx-auto block px-4 py-3 border border-ink-200 text-center uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
        />
        <button
          type="submit"
          className="bg-ink-950 hover:bg-gold-600 text-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition"
        >
          Track Order
        </button>
      </form>
      <p className="text-center text-sm">
        Can&apos;t find your order number? <Link href="/contact" className="font-semibold underline hover:text-gold-600">Contact us</Link> with
        your phone number.
      </p>
    </InfoPage>
  );
}
