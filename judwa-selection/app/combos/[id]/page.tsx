'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ChevronLeft, Package2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  ComboPiece,
  ComboSelection,
  ComboSet,
  describeComboSelection,
  getComboMrp,
  getComboPrice,
  getComboSavePercent,
  loadCombos,
} from '@/lib/combosData';

type Picks = Record<string, { size: string; color: string }>;

function OptionButtons({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={value === option}
          className={`min-w-[3.25rem] px-3 py-2 border text-sm font-semibold transition ${
            value === option ? 'bg-ink-900 border-ink-900 text-white' : 'bg-white border-ink-200 text-ink-900 hover:border-gold-500'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function PiecePicker({
  piece,
  fallbackImage,
  pick,
  onChange,
}: {
  piece: ComboPiece;
  fallbackImage?: string;
  pick: { size: string; color: string };
  onChange: (next: { size: string; color: string }) => void;
}) {
  const image = piece.image || fallbackImage;
  return (
    <div className="bg-white border border-ink-100 p-3 sm:p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-white overflow-hidden">
          {image ? (
            <Image src={image} alt={piece.name} fill sizes="80px" unoptimized={image.startsWith('data:')} className="object-contain" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-ink-300">
              <Package2 className="w-6 h-6" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm sm:text-base font-semibold text-ink-900">{piece.name}</p>
          <p className="text-xs text-gray-500">Worth ₹{piece.price}</p>
        </div>
      </div>

      <p className="text-xs text-gray-600 mb-2">
        Size {pick.size && <span className="font-semibold text-ink-900">— {pick.size}</span>}
      </p>
      <OptionButtons options={piece.sizes} value={pick.size} onChange={size => onChange({ ...pick, size })} />

      {piece.colors.length > 0 && (
        <>
          <p className="text-xs text-gray-600 mt-3 mb-2">
            Colour {pick.color && <span className="font-semibold text-ink-900">— {pick.color}</span>}
          </p>
          <OptionButtons options={piece.colors} value={pick.color} onChange={color => onChange({ ...pick, color })} />
        </>
      )}
    </div>
  );
}

export default function ComboDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [combo, setCombo] = useState<ComboSet | null | undefined>(undefined);
  const [picks, setPicks] = useState<Picks>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadCombos().then(all => setCombo(all.find(c => c.id === id && c.isActive) ?? null));
  }, [id]);

  if (combo === undefined) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] bg-cream" />
        <Footer />
      </>
    );
  }

  if (combo === null) {
    return (
      <>
        <Header />
        <div className="container py-20 text-center bg-cream">
          <h2 className="font-serif text-2xl font-semibold mb-4">Combo not found</h2>
          <Link href="/combos" className="inline-block brand-bg text-white hover:text-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wide">
            Back to Combos
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const photo = combo.image || combo.pieces.find(p => p.image)?.image;
  const price = getComboPrice(combo);
  const mrp = getComboMrp(combo);
  const save = getComboSavePercent(combo);
  const pickFor = (piece: ComboPiece) => picks[piece.id] ?? { size: '', color: '' };

  const missing = combo.pieces.find(piece => {
    const pick = pickFor(piece);
    return !pick.size || (piece.colors.length > 0 && !pick.color);
  });

  const addToCart = (): boolean => {
    if (missing) {
      const pick = pickFor(missing);
      toast.error(`Please select ${!pick.size ? 'size' : 'colour'} for ${missing.name}`);
      return false;
    }
    const selections: ComboSelection[] = combo.pieces.map(piece => ({ pieceId: piece.id, ...pickFor(piece) }));
    const description = describeComboSelection(combo, selections);

    const cart = JSON.parse(localStorage.getItem('judwa_cart') || '[]');
    const cartItem = {
      id: `combo-${combo.id}-${selections.map(s => `${s.size}/${s.color}`).join('|')}`,
      kind: 'combo',
      product_id: combo.id,
      variant_id: selections.map(s => `${s.size}/${s.color}`).join('|'),
      selections,
      product_name: `${combo.name} (Combo)`,
      image: photo || '',
      size: description,
      color: '-',
      selling_price: price,
      quantity,
    };
    const existingIndex = cart.findIndex((item: any) => item.id === cartItem.id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }
    localStorage.setItem('judwa_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    return true;
  };

  const handleAddToCart = () => {
    if (!addToCart()) return;
    toast.success(`Added ${quantity} combo(s) to cart!`);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    if (addToCart()) router.push('/checkout');
  };

  return (
    <>
      <Header />
      <main className="bg-cream min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <Link href="/combos" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gold-600 mb-4">
            <ChevronLeft className="w-4 h-4" /> All combos
          </Link>

          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            <div className="relative aspect-square md:aspect-[4/5] bg-white overflow-hidden md:sticky md:top-24 md:self-start">
              {photo ? (
                <Image
                  src={photo}
                  alt={combo.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized={photo.startsWith('data:')}
                  className="object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-ink-300">
                  <Package2 className="w-16 h-16" />
                </div>
              )}
              {save > 0 && (
                <span className="absolute top-3 left-3 bg-ink-950 text-gold-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  Save {save}%
                </span>
              )}
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <span className="eyebrow">Combo Offer</span>
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-900 mt-1">{combo.name}</h1>
                {combo.description && <p className="text-sm text-gray-600 mt-1">{combo.description}</p>}
                <div className="flex flex-wrap items-baseline gap-x-3 mt-3">
                  <span className="font-serif text-3xl font-semibold text-ink-900">₹{price}</span>
                  {mrp > price && (
                    <>
                      <span className="text-lg text-gray-400 line-through">₹{mrp}</span>
                      <span className="text-sm font-semibold text-gold-600">You save ₹{mrp - price}</span>
                    </>
                  )}
                </div>
              </div>

              {combo.pieces.map(piece => (
                <PiecePicker
                  key={piece.id}
                  piece={piece}
                  fallbackImage={photo}
                  pick={pickFor(piece)}
                  onChange={next => setPicks(prev => ({ ...prev, [piece.id]: next }))}
                />
              ))}

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Quantity</span>
                <div className="flex items-center border border-ink-200 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="px-3 py-1.5 text-lg"
                  >
                    −
                  </button>
                  <span className="px-3 text-sm font-semibold min-w-[2rem] text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(q => Math.min(20, q + 1))}
                    aria-label="Increase quantity"
                    className="px-3 py-1.5 text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="hidden md:grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="w-full border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white py-3.5 font-semibold uppercase tracking-widest text-sm transition"
                >
                  Add to Cart
                </button>
                <button onClick={handleBuyNow} className="w-full brand-bg text-white py-3.5 font-semibold uppercase tracking-widest text-sm">
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed bar above the mobile bottom navigation */}
        <div className="md:hidden fixed left-0 right-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 bg-white border-t border-ink-100 px-4 py-3 flex items-center gap-2">
          <div className="flex-shrink-0 mr-1">
            <p className="text-[11px] text-gray-500 leading-none">Total</p>
            <p className="font-serif text-lg font-semibold text-ink-900">₹{price * quantity}</p>
          </div>
          <button
            onClick={handleAddToCart}
            className="flex-1 border border-ink-900 text-ink-900 py-3 font-semibold uppercase tracking-wider text-xs"
          >
            Add to Cart
          </button>
          <button onClick={handleBuyNow} className="flex-1 brand-bg text-white py-3 font-semibold uppercase tracking-wider text-xs">
            Buy Now
          </button>
        </div>
        <div className="md:hidden h-20" />
      </main>
      <Footer />
    </>
  );
}
