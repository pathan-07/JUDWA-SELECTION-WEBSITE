'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ComboSet, getComboMrp, getComboPrice, getComboSavePercent, loadCombos } from '@/lib/combosData';
import {
  DEFAULT_PRODUCT_CARD_SETTINGS,
  buttonClasses,
  cardClasses,
  imageClasses,
  infoClasses,
  loadProductCardSettings,
} from '@/lib/productCardSettings';

export default function CombosPage() {
  const [combos, setCombos] = useState<ComboSet[] | null>(null);
  const [card, setCard] = useState(DEFAULT_PRODUCT_CARD_SETTINGS);

  useEffect(() => {
    const readCard = () => setCard(loadProductCardSettings());
    readCard();
    window.addEventListener('storage', readCard);
    loadCombos().then(all => setCombos(all.filter(c => c.isActive)));
    return () => window.removeEventListener('storage', readCard);
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <span className="eyebrow">Bundle &amp; Save</span>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-ink-900 mt-1 mb-6 sm:mb-8">
            Combos &amp; Offers
          </h1>

          {combos === null ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/5] bg-ink-100 animate-pulse" />
              ))}
            </div>
          ) : combos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {combos.map(combo => {
                const photo = combo.image || combo.pieces.find(p => p.image)?.image;
                const price = getComboPrice(combo);
                const mrp = getComboMrp(combo);
                const save = getComboSavePercent(combo);
                return (
                  <Link key={combo.id} href={`/combos/${encodeURIComponent(combo.id)}`} className={`${cardClasses(card)} group flex flex-col`}>
                    <div className={`relative ${imageClasses(card)} bg-white overflow-hidden`}>
                      {photo ? (
                        <Image
                          src={photo}
                          alt={combo.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          unoptimized={photo.startsWith('data:')}
                          className="object-contain group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-ink-300">
                          <Package2 className="w-12 h-12" />
                        </div>
                      )}
                      {save > 0 && (
                        <span className="absolute top-2 left-2 bg-ink-950 text-gold-300 px-2 py-0.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wide">
                          Save {save}%
                        </span>
                      )}
                    </div>
                    <div className={`${infoClasses(card)} flex flex-col flex-1`}>
                      <p className="text-[10px] sm:text-xs font-semibold text-gold-600 uppercase tracking-wide mb-1">
                        {combo.pieces.length} items
                      </p>
                      <h2 className="font-serif text-sm sm:text-lg font-semibold text-ink-900 line-clamp-2 mb-2">{combo.name}</h2>
                      <div className={`flex flex-wrap items-baseline gap-x-2 mb-3 ${card.align === 'center' ? 'justify-center' : ''}`}>
                        <span className="text-lg sm:text-xl font-serif font-semibold text-ink-900">₹{price}</span>
                        {mrp > price && <span className="text-xs sm:text-sm text-gray-500 line-through">₹{mrp}</span>}
                      </div>
                      {card.showButton && (
                        <span
                          className={`mt-auto block w-full px-2 py-2 sm:py-2.5 text-center text-xs sm:text-sm font-semibold uppercase tracking-wide whitespace-nowrap transition ${buttonClasses(card)}`}
                        >
                          Select Sizes
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">No combo offers right now. Please check back soon.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
