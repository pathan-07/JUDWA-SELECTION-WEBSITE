'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Shirt } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UniformPair, loadUniformPairs, getStartingPrice } from '@/lib/uniformPairs';

export default function SchoolUniformSetsPage() {
  const [pairs, setPairs] = useState<UniformPair[] | null>(null);

  useEffect(() => {
    loadUniformPairs().then(all => setPairs(all.filter(p => p.isActive)));
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <span className="eyebrow">Back to School</span>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-ink-900 mt-1 mb-6 sm:mb-8">
            School Uniforms
          </h1>

          {pairs === null ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="aspect-[4/5] bg-ink-100 animate-pulse" />
              ))}
            </div>
          ) : pairs.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {pairs.map(pair => {
                const photo = pair.image || pair.shirtImage;
                return (
                  <Link
                    key={pair.id}
                    href={`/school-uniforms/${encodeURIComponent(pair.id)}`}
                    className="group block bg-white border border-ink-100 hover:shadow-lg transition overflow-hidden"
                  >
                    <div className="relative aspect-[4/5] bg-white overflow-hidden">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={`${pair.schoolName} uniform`}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          unoptimized={photo.startsWith('data:')}
                          className="object-contain group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-ink-300">
                          <Shirt className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 text-center">
                      <h2 className="font-serif text-sm sm:text-lg font-semibold text-ink-900 line-clamp-2">{pair.schoolName}</h2>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        Shirt + Pant from <span className="font-semibold text-ink-900">₹{getStartingPrice(pair)}</span>
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-ink-100 p-12 text-center text-gray-500">
              No school uniforms available yet.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
