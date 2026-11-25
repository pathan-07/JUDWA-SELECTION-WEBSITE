'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Heart, Filter, ArrowUpDown, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getCategories } from '@/lib/queries/products';
import { CatalogListItem, DEMO_CATALOG, loadProducts as loadSiteProducts } from '@/lib/productsData';
import { formatINR } from '@/lib/utils';
import {
  DEFAULT_PRODUCT_CARD_SETTINGS,
  buttonClasses,
  cardClasses,
  discountPercent,
  imageClasses,
  infoClasses,
  loadProductCardSettings,
} from '@/lib/productCardSettings';

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Boys' },
  { id: '2', name: 'Girls' },
  { id: '3', name: 'Unisex' },
];

const UNISEX_ID = '3';

// Menu links use readable names (?category=boys); products store the category id
const CATEGORY_SLUGS: Record<string, string> = { boys: '1', girls: '2', unisex: UNISEX_ID };

// ?type= menu links match words in the product name
const TYPE_FILTERS: Record<string, { label: string; keywords: string[]; exclude?: string[] }> = {
  tshirts: { label: 'T-Shirts', keywords: ['t-shirt', 'tshirt', 't shirt', 'tee'] },
  shirts: { label: 'Shirts', keywords: ['shirt'], exclude: ['t-shirt', 'tshirt', 't shirt', 'sweatshirt'] },
  jeans: { label: 'Jeans', keywords: ['jean', 'denim'] },
  trousers: { label: 'Trousers', keywords: ['trouser', 'pant', 'jogger'] },
  shorts: { label: 'Shorts', keywords: ['short'] },
  jackets: { label: 'Jackets', keywords: ['jacket', 'hoodie', 'sweatshirt'] },
  frocks: { label: 'Frocks', keywords: ['frock'] },
  dresses: { label: 'Dresses', keywords: ['dress', 'frock', 'gown'] },
  tops: { label: 'Tops', keywords: ['top'] },
  skirts: { label: 'Skirts', keywords: ['skirt'] },
  ethnic: { label: 'Ethnic Wear', keywords: ['ethnic', 'kurta', 'kurti', 'lehenga', 'choli', 'sherwani'] },
};

const SORT_OPTIONS = ['newest', 'price_asc', 'price_desc'];

// Unknown names (e.g. baby) match no products instead of silently showing everything
const categoryIdFromParam = (param: string) => (param ? CATEGORY_SLUGS[param] ?? param : null);

export default function ProductsPage() {
  // useSearchParams needs a Suspense boundary in the App Router
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const params = useSearchParams();
  const searchQuery = (params.get('search') ?? '').trim();
  const categoryParam = (params.get('category') ?? '').toLowerCase();
  const typeFilter = TYPE_FILTERS[(params.get('type') ?? '').toLowerCase()];
  const sortParam = params.get('sort') ?? '';
  const saleOnly = params.get('sale') === 'true';
  const hasUrlFilter = Boolean(searchQuery || categoryParam || typeFilter || sortParam || saleOnly);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryIdFromParam(categoryParam));
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.includes(sortParam) ? sortParam : 'newest');
  const [filterOpen, setFilterOpen] = useState(false);
  const [card, setCard] = useState(DEFAULT_PRODUCT_CARD_SETTINGS);

  // Follow menu links: the URL decides the starting category and sort
  useEffect(() => {
    setSelectedCategory(categoryIdFromParam(categoryParam));
  }, [categoryParam]);

  useEffect(() => {
    setSortBy(SORT_OPTIONS.includes(sortParam) ? sortParam : 'newest');
  }, [sortParam]);

  useEffect(() => {
    const readCard = () => setCard(loadProductCardSettings());
    readCard();
    window.addEventListener('storage', readCard);
    return () => window.removeEventListener('storage', readCard);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const filterAndSort = (list: CatalogListItem[]) => {
      // Unisex items belong in both Boys and Girls
      const inCategory = (id: string) =>
        id === selectedCategory || (id === UNISEX_ID && (selectedCategory === '1' || selectedCategory === '2'));
      const result = selectedCategory ? list.filter(p => inCategory(p.category_id)) : [...list];
      if (sortBy === 'price_asc') {
        result.sort((a, b) => a.selling_price - b.selling_price);
      } else if (sortBy === 'price_desc') {
        result.sort((a, b) => b.selling_price - a.selling_price);
      } else {
        result.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      }
      return result;
    };

    const loadData = async () => {
      // Seller-added products (database, or this browser until a database is connected)
      const [siteProducts, { data: categoryData }] = await Promise.all([loadSiteProducts(), getCategories()]);
      if (cancelled) return;

      const catalog = siteProducts
        .filter(p => p.is_active)
        .map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          selling_price: p.selling_price,
          mrp: p.mrp,
          category_id: p.category_id,
          image: p.images[0],
          created_at: p.created_at,
        }));

      setProducts(filterAndSort(catalog.length ? catalog : DEMO_CATALOG));
      setLoading(false);

      if (categoryData?.length) {
        const merged = new Map<string, { id: string; name: string }>();
        FALLBACK_CATEGORIES.forEach(cat => merged.set(cat.id, cat));
        categoryData.forEach((cat: any) => merged.set(cat.id, cat));
        setCategories(Array.from(merged.values()));
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, sortBy]);

  const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
  const categoryName = (id: string) => categories.find(cat => cat.id === id)?.name ?? '';
  const visibleProducts = products.filter(p => {
    const name = String(p.name ?? '').toLowerCase();
    if (saleOnly && !(Number(p.mrp) > Number(p.selling_price))) return false;
    if (typeFilter && !typeFilter.keywords.some(word => name.includes(word))) return false;
    if (typeFilter?.exclude?.some(word => name.includes(word))) return false;
    if (!searchTerms.length) return true;
    const haystack = `${name} ${categoryName(p.category_id)}`.toLowerCase();
    return searchTerms.every(term => haystack.includes(term));
  });

  const selectedCategoryName = selectedCategory ? categoryName(selectedCategory) : '';
  const heading = searchQuery
    ? `Results for “${searchQuery}”`
    : [
        saleOnly ? 'Offers' : sortParam === 'popular' ? 'Bestsellers' : sortParam === 'newest' ? 'New Arrivals' : '',
        selectedCategoryName && !typeFilter ? selectedCategoryName : '',
        typeFilter ? `${selectedCategoryName ? `${selectedCategoryName} ` : ''}${typeFilter.label}` : '',
      ]
        .filter(Boolean)
        .join(' · ') || (categoryParam ? 'Coming Soon' : 'All Products');

  return (
    <>
      <Header />

      <div className="min-h-screen bg-cream">
        <div className="container py-6 sm:py-8">
          <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
            <div className="min-w-0">
              <h1 className="font-serif text-2xl sm:text-3xl font-semibold truncate">
                {heading}
              </h1>
              {hasUrlFilter && !loading && (
                <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                  <span>
                    {visibleProducts.length} {visibleProducts.length === 1 ? 'product' : 'products'} found
                  </span>
                  <Link href="/products" className="inline-flex items-center gap-1 font-semibold text-gold-600">
                    <X className="h-3.5 w-3.5" /> {searchQuery ? 'Clear search' : 'View all'}
                  </Link>
                </div>
              )}
            </div>
            <button
              onClick={() => setFilterOpen(open => !open)}
              aria-expanded={filterOpen}
              className="md:hidden flex items-center gap-2 px-4 py-2 border border-ink-900 text-ink-900 text-xs font-semibold uppercase tracking-wide flex-shrink-0"
            >
              <Filter className="h-4 w-4" />
              {filterOpen ? 'Hide Filters' : 'Filters'}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Sidebar Filters */}
            <aside className={`${filterOpen ? 'block' : 'hidden'} md:block md:w-64 flex-shrink-0`}>
              <div className="bg-white border border-ink-100 rounded-lg p-5 sm:p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </h3>

                {/* Category Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Category</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`block w-full text-left px-3 py-2 rounded ${
                        selectedCategory === null ? 'bg-gold-50 text-gold-700 font-semibold' : 'hover:bg-ink-50'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`block w-full text-left px-3 py-2 rounded ${
                          selectedCategory === cat.id ? 'bg-gold-50 text-gold-700 font-semibold' : 'hover:bg-ink-50'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort By
                  </h4>
                  <div className="space-y-2">
                    {[
                      { value: 'newest', label: 'Newest' },
                      { value: 'price_asc', label: 'Price: Low to High' },
                      { value: 'price_desc', label: 'Price: High to Low' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="sort"
                          value={option.value}
                          checked={sortBy === option.value}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-auto accent-gold-600"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
                </div>
              ) : visibleProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {visibleProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug ?? product.id}`}
                      className={`${cardClasses(card)} flex flex-col`}
                    >
                      <div className={`relative ${imageClasses(card)} bg-white overflow-hidden group`}>
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            unoptimized={product.image.startsWith('data:')}
                            className="object-contain group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-ink-300">
                            <Heart className="h-10 w-10" />
                          </div>
                        )}
                        {product.discount_percent && product.discount_percent > 0 && (
                          <div className="absolute top-2 right-2 bg-ink-950 text-gold-300 px-2 py-0.5 text-[10px] sm:text-xs font-semibold">
                            {product.discount_percent}%
                          </div>
                        )}
                      </div>
                      <div className={`${infoClasses(card)} flex flex-col flex-1`}>
                        <h3 className="font-serif text-sm md:text-base font-semibold text-ink-900 line-clamp-2 mb-2">
                          {product.name}
                        </h3>
                        <div className={`flex flex-wrap items-baseline gap-x-2 ${card.align === 'center' ? 'justify-center' : ''}`}>
                          <span className="font-semibold text-ink-900">₹{product.selling_price}</span>
                          {product.mrp !== product.selling_price && (
                            <span className="text-gray-400 line-through text-sm">
                              ₹{product.mrp}
                            </span>
                          )}
                          {card.showDiscount && discountPercent(product.selling_price, product.mrp) > 0 && (
                            <span className="text-xs font-semibold text-gold-600">
                              {discountPercent(product.selling_price, product.mrp)}% off
                            </span>
                          )}
                        </div>
                        {card.showButton && (
                          <div className="mt-auto pt-3">
                            <span
                              className={`block w-full px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition ${buttonClasses(card)}`}
                            >
                              {card.buttonText}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {searchQuery ? `No products match “${searchQuery}”` : 'No products here yet — new stock is coming soon.'}
                  </p>
                  <Link href="/products" className="inline-block mt-4 font-semibold text-gold-600 underline">
                    Browse all products
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
