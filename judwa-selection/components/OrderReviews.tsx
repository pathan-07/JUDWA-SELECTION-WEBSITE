'use client';

import { useEffect, useState } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { STORE_REVIEW_ID } from '@/lib/reviewsData';

interface ReviewableItem {
  productId: string;
  productName: string;
  reviewed: boolean;
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
          className="p-0.5"
        >
          <Star className={`w-7 h-7 ${n <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}

function ReviewForm({ orderNumber, item, onDone }: { orderNumber: string; item: ReviewableItem; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [customer, setCustomer] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error('Please tap the stars to rate');
      return;
    }
    setSending(true);
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, productId: item.productId, rating, customer, text }),
    }).catch(() => null);
    const data = await res?.json().catch(() => null);
    setSending(false);
    if (!res?.ok) {
      toast.error(data?.error || 'Could not send your review. Please try again.');
      return;
    }
    toast.success('Thank you for your review!');
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <StarPicker value={rating} onChange={setRating} />
      <input
        type="text"
        value={customer}
        onChange={e => setCustomer(e.target.value)}
        placeholder="Your name"
        maxLength={80}
        required
        className="rounded-lg border-gray-300 text-sm"
      />
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={item.productId === STORE_REVIEW_ID ? 'How was your shopping experience?' : 'How was the quality, fit and fabric?'}
        maxLength={1000}
        rows={3}
        required
        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
      />
      <button
        type="submit"
        disabled={sending}
        className="brand-bg text-white hover:text-white disabled:opacity-60 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide"
      >
        {sending ? 'Sending…' : 'Submit Review'}
      </button>
    </form>
  );
}

/** "Rate your order" box on the order page; only shows once the order is delivered. */
export default function OrderReviews({ orderNumber }: { orderNumber: string }) {
  const [items, setItems] = useState<ReviewableItem[]>([]);

  useEffect(() => {
    fetch(`/api/reviews?orderNumber=${encodeURIComponent(orderNumber)}`, { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : null))
      .then(data => setItems(data?.canReview ? data.items : []))
      .catch(() => setItems([]));
  }, [orderNumber]);

  if (items.length === 0) return null;

  const markReviewed = (productId: string) =>
    setItems(prev => prev.map(i => (i.productId === productId ? { ...i, reviewed: true } : i)));

  return (
    <div id="review" className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-8 scroll-mt-24">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Rate Your Order</h2>
      <p className="text-sm text-gray-600 mb-6">Your review helps other parents choose. It appears on the website after a quick check.</p>
      <div className="divide-y divide-gray-200">
        {items.map(item => (
          <div key={item.productId} className="py-5 first:pt-0 last:pb-0">
            <p className="font-semibold text-gray-900 mb-3">{item.productName}</p>
            {item.reviewed ? (
              <p className="flex items-center gap-2 text-sm text-green-700">
                <CheckCircle className="w-5 h-5" /> Thank you — you have reviewed this.
              </p>
            ) : (
              <ReviewForm orderNumber={orderNumber} item={item} onDone={() => markReviewed(item.productId)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
