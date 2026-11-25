'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Trash2, ShoppingCart, Star } from 'lucide-react';
import { formatINR, calculateDiscountPercent } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load wishlist from localStorage
    const wishlistKey = 'judwa_wishlist';
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
    setWishlistItems(wishlist);

    // TODO: Fetch actual products from database using wishlist product IDs
    // For now, using dummy data
    setProducts(wishlist);
    setLoading(false);
  }, []);

  const removeFromWishlist = (productId: string) => {
    const updated = wishlistItems.filter((item) => item.id !== productId);
    setWishlistItems(updated);

    const wishlistKey = 'judwa_wishlist';
    localStorage.setItem(wishlistKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    toast.success('Removed from wishlist');
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
            <p className="mt-4 text-gray-600">Loading wishlist...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <>
        <Header />
        <div className="container py-20 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-4">Your Wishlist is Empty</h2>
          <p className="text-gray-600 mb-8">Add products to your wishlist to view them later!</p>
          <Link
            href="/products"
            className="inline-block brand-bg text-white hover:text-white px-8 py-3 font-semibold uppercase tracking-wide text-sm transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="bg-white">
        <div className="container py-6 sm:py-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8">My Wishlist</h1>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {wishlistItems.map((product) => {
              const discountPercent = calculateDiscountPercent(product.mrp, product.selling_price);
              const productHref = `/product/${product.slug ?? product.id}`;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-ink-100 overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
                >
                  {/* Image */}
                  <div className="relative bg-white aspect-square overflow-hidden">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        unoptimized={product.image.startsWith('data:')}
                        className="object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-ink-300">
                        <ShoppingCart className="h-10 w-10" />
                      </div>
                    )}
                    {discountPercent > 0 && (
                      <div className="absolute top-2 right-2 bg-ink-950 text-gold-300 px-2 py-0.5 text-[10px] sm:text-xs font-semibold">
                        -{discountPercent}%
                      </div>
                    )}
                    <button
                      onClick={() => removeFromWishlist(product.id)}
                      aria-label="Remove from wishlist"
                      className="absolute top-2 left-2 bg-white/95 text-red-600 w-8 h-8 rounded-full shadow flex items-center justify-center hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-4 flex flex-col flex-1">
                    {/* Name */}
                    <Link href={productHref}>
                      <h3 className="font-serif text-sm sm:text-base font-semibold text-ink-900 hover:text-gold-600 line-clamp-2 mb-2 cursor-pointer">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-0.5 mb-2 sm:mb-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="h-3 w-3 sm:h-4 sm:w-4 fill-gold-500 text-gold-500"
                        />
                      ))}
                      <span className="text-[10px] sm:text-xs text-gray-600 ml-1">(12)</span>
                    </div>

                    {/* Pricing */}
                    <div className="flex flex-wrap items-baseline gap-x-2 mb-3 sm:mb-4">
                      <span className="font-serif text-base sm:text-lg font-semibold text-ink-900">
                        {formatINR(product.selling_price)}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-400 line-through">
                        {formatINR(product.mrp)}
                      </span>
                    </div>

                    {/* Size/colour must be chosen on the product page before adding to cart */}
                    <Link
                      href={productHref}
                      className="mt-auto w-full brand-bg text-white hover:text-white px-2 sm:px-4 py-2 font-semibold uppercase tracking-wide text-xs sm:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4 flex-shrink-0" />
                      Add to Cart
                    </Link>

                    <Link
                      href={productHref}
                      className="w-full block mt-2 border border-ink-200 hover:border-gold-500 text-ink-900 px-2 sm:px-4 py-2 font-semibold uppercase tracking-wide text-xs sm:text-sm text-center whitespace-nowrap transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
