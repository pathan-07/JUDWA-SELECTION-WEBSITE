'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ChevronLeft, Shirt } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  UniformPair,
  loadUniformPairs,
  getPantPriceForSize,
  getPantSizes,
  getShirtPriceForSize,
  getShirtSizes,
  getStartingPrice,
  getUniformBill,
} from '@/lib/uniformPairs';

function PieceSizePicker({
  label,
  name,
  image,
  sizes,
  value,
  onChange,
  priceFor,
}: {
  label: string;
  name: string;
  image?: string;
  sizes: string[];
  value: string;
  onChange: (size: string) => void;
  priceFor: (size: string) => number;
}) {
  const prices = sizes.map(priceFor);
  const minPrice = Math.min(...prices);
  const samePriceForAll = prices.every(p => p === prices[0]);

  return (
    <div className="bg-white border border-ink-100 p-3 sm:p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-14 h-14 flex-shrink-0 bg-white overflow-hidden">
          {image ? (
            <Image src={image} alt={name} fill sizes="56px" unoptimized={image.startsWith('data:')} className="object-contain" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-ink-300">
              <Shirt className="w-6 h-6" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gold-600 uppercase tracking-wide">{label}</p>
          <p className="text-sm font-semibold text-ink-900 truncate">{name}</p>
        </div>
        <p className="text-sm font-semibold text-ink-900 whitespace-nowrap">
          {value ? `₹${priceFor(value)}` : samePriceForAll ? `₹${minPrice}` : `from ₹${minPrice}`}
        </p>
      </div>

      <p className="text-xs text-gray-600 mb-2">
        Select {label.toLowerCase()} size {value && <span className="font-semibold text-ink-900">— {value}</span>}
      </p>
      <div className="flex flex-wrap gap-2">
        {sizes.map(size => (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            aria-pressed={value === size}
            className={`min-w-[3.25rem] px-3 py-2 border text-sm transition flex flex-col items-center leading-tight ${
              value === size
                ? 'bg-ink-900 border-ink-900 text-white'
                : 'bg-white border-ink-200 text-ink-900 hover:border-gold-500'
            }`}
          >
            <span className="font-semibold">{size}</span>
            {!samePriceForAll && (
              <span className={`text-[10px] ${value === size ? 'text-gold-200' : 'text-gray-500'}`}>₹{priceFor(size)}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SchoolUniformDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [pair, setPair] = useState<UniformPair | null | undefined>(undefined);
  const [shirtSize, setShirtSize] = useState('');
  const [pantSize, setPantSize] = useState('');

  useEffect(() => {
    loadUniformPairs().then(all => setPair(all.find(p => p.id === id && p.isActive) ?? null));
  }, [id]);

  if (pair === undefined) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] bg-cream" />
        <Footer />
      </>
    );
  }

  if (pair === null) {
    return (
      <>
        <Header />
        <div className="container py-20 text-center bg-cream">
          <h2 className="font-serif text-2xl font-semibold mb-4">Uniform not found</h2>
          <Link href="/school-uniforms" className="inline-block brand-bg text-white hover:text-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wide">
            Back to School Uniforms
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const photo = pair.image || pair.shirtImage;
  const ready = Boolean(shirtSize && pantSize);
  const bill = ready ? getUniformBill(pair, shirtSize, pantSize) : null;
  const total = bill ? bill.total : getStartingPrice(pair);

  const buyNow = () => {
    if (!ready) {
      toast.error(!shirtSize ? 'Please select shirt size' : 'Please select pant size');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('judwa_cart') || '[]');
    const cartItem = {
      id: `uniform-${pair.id}-${shirtSize}-${pantSize}`,
      kind: 'uniform',
      product_id: pair.id,
      variant_id: `${shirtSize}|${pantSize}`,
      shirt_size: shirtSize,
      pant_size: pantSize,
      product_name: `${pair.schoolName} Uniform (Shirt + Pant)`,
      image: photo || '',
      size: `Shirt ${shirtSize} / Pant ${pantSize}`,
      color: '-',
      selling_price: total,
      quantity: 1,
    };
    const existingIndex = cart.findIndex((item: any) => item.id === cartItem.id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(cartItem);
    }
    localStorage.setItem('judwa_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    router.push('/checkout');
  };

  return (
    <>
      <Header />
      <main className="bg-cream min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <Link href="/school-uniforms" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gold-600 mb-4">
            <ChevronLeft className="w-4 h-4" /> All schools
          </Link>

          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            <div className="relative h-[36vh] md:h-auto md:aspect-[4/5] bg-white overflow-hidden">
              {photo ? (
                <Image
                  src={photo}
                  alt={`${pair.schoolName} uniform`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized={photo.startsWith('data:')}
                  className="object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-ink-300">
                  <Shirt className="w-16 h-16" />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <span className="eyebrow">School Uniform</span>
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-900 mt-1">{pair.schoolName}</h1>
                <p className="text-sm text-gray-600 mt-1">Shirt + Pant set</p>
              </div>

              <PieceSizePicker
                label="Shirt"
                name={pair.shirtName}
                image={pair.shirtImage}
                sizes={getShirtSizes(pair)}
                value={shirtSize}
                onChange={setShirtSize}
                priceFor={size => getShirtPriceForSize(pair, size)}
              />
              <PieceSizePicker
                label="Pant"
                name={pair.pantName}
                image={pair.pantImage}
                sizes={getPantSizes(pair)}
                value={pantSize}
                onChange={setPantSize}
                priceFor={size => getPantPriceForSize(pair, size)}
              />

              {/* Bill updates automatically from the chosen sizes */}
              <div className="bg-white border border-ink-100 p-4">
                {bill ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shirt (size {shirtSize})</span>
                      <span className="text-ink-900">₹{bill.shirtPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pant (size {pantSize})</span>
                      <span className="text-ink-900">₹{bill.pantPrice}</span>
                    </div>
                    {bill.discount > 0 && (
                      <div className="flex justify-between text-green-700">
                        <span>Set discount</span>
                        <span>−₹{bill.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline border-t border-ink-100 pt-2">
                      <span className="font-semibold text-ink-900">Total</span>
                      <span className="font-serif text-2xl font-semibold text-ink-900">₹{bill.total}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-gray-600">Select shirt and pant size to see your bill</span>
                    <span className="font-serif text-xl font-semibold text-ink-900 whitespace-nowrap ml-3">from ₹{total}</span>
                  </div>
                )}
              </div>

              {/* Desktop button; on phones a fixed bar below is used instead */}
              <button
                onClick={buyNow}
                className="hidden md:block w-full brand-bg text-white py-3.5 font-semibold uppercase tracking-widest text-sm"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Fixed Buy Now bar above the mobile bottom navigation */}
        <div className="md:hidden fixed left-0 right-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 bg-white border-t border-ink-100 px-4 py-3 flex items-center gap-3">
          <div className="flex-shrink-0">
            <p className="text-[11px] text-gray-500 leading-none">{ready ? 'Total' : 'From'}</p>
            <p className="font-serif text-xl font-semibold text-ink-900">₹{total}</p>
          </div>
          <button onClick={buyNow} className="flex-1 brand-bg text-white py-3 font-semibold uppercase tracking-widest text-sm">
            Buy Now
          </button>
        </div>
        <div className="md:hidden h-20" />
      </main>
      <Footer />
    </>
  );
}
