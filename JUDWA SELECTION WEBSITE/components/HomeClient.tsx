'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Star, Play, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SiteBanner, loadBanners, DEFAULT_BANNERS } from '@/lib/banners';
import { SiteReel, loadReels } from '@/lib/reelsData';
import { SiteCollection, loadCollections } from '@/lib/collectionsData';
import { DEFAULT_SHIPPING_SETTINGS, freeShippingText, loadShippingSettings } from '@/lib/shippingSettings';
import { DEFAULT_ANNOUNCEMENT_SETTINGS, buildAnnouncements, loadAnnouncementSettings } from '@/lib/announcementSettings';
import { DEFAULT_HOMEPAGE_SETTINGS, loadHomepageSettings } from '@/lib/homepageSettings';
import { DEFAULT_BANNER_SIZE_SETTINGS, loadBannerSizeSettings } from '@/lib/bannerSizeSettings';
import { DEFAULT_REELS_SETTINGS, loadReelsSettings } from '@/lib/reelsSettings';
import { DEFAULT_FEATURE_STRIP, FEATURE_ICONS, loadFeatureStrip, resolveFeatureText } from '@/lib/featureStripSettings';
import {
  DEFAULT_PRODUCT_CARD_SETTINGS,
  buttonClasses,
  cardClasses,
  discountPercent,
  imageClasses,
  infoClasses,
  loadProductCardSettings,
} from '@/lib/productCardSettings';
import { DEFAULT_COMBOS, getComboMrp, getComboPrice, getComboSavePercent, loadCombos } from '@/lib/combosData';
import { loadProducts } from '@/lib/productsData';
import { loadReviews } from '@/lib/reviewsData';
import CategoryCards from '@/components/CategoryCards';
import { DEFAULT_CATEGORY_CARD_SETTINGS, loadCategoryCardSettings } from '@/lib/categoryCardSettings';

interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  rating: number;
  reviewCount?: number;
  category: string;
  badge?: string;
  createdAt?: string;
}

interface CategoryNavItem {
  label: string;
  href: string;
  image: string;
}


interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  text: string;
  photo?: string;
}

export interface HomeContent {
  banners: SiteBanner[];
  reels: SiteReel[];
  collections: SiteCollection[];
}

export default function HomeClient({ initialContent }: { initialContent: HomeContent | null }) {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [activeReel, setActiveReel] = useState<SiteReel | null>(null);
  const [loading, setLoading] = useState(false);
  // Seed with defaults so the hero renders on first paint instead of an empty black box
  const [banners, setBanners] = useState<SiteBanner[]>(() =>
    (initialContent?.banners ?? DEFAULT_BANNERS).filter(b => b.isActive)
  );
  const [reels, setReels] = useState<SiteReel[]>(() => initialContent?.reels.filter(r => r.isActive) ?? []);
  const [collectionBanners, setCollectionBanners] = useState<SiteCollection[]>(
    () => initialContent?.collections.filter(c => c.isActive) ?? []
  );
  const reelsScrollRef = useRef<HTMLDivElement>(null);
  const [shippingSettings, setShippingSettings] = useState(DEFAULT_SHIPPING_SETTINGS);
  const [announcementSettings, setAnnouncementSettings] = useState(DEFAULT_ANNOUNCEMENT_SETTINGS);
  const [homepageSettings, setHomepageSettings] = useState(DEFAULT_HOMEPAGE_SETTINGS);
  const [reelsSettings, setReelsSettings] = useState(DEFAULT_REELS_SETTINGS);
  const [featureStrip, setFeatureStrip] = useState(DEFAULT_FEATURE_STRIP);
  const [card, setCard] = useState(DEFAULT_PRODUCT_CARD_SETTINGS);
  const [categoryCard, setCategoryCard] = useState(DEFAULT_CATEGORY_CARD_SETTINGS);
  const [bannerSize, setBannerSize] = useState(DEFAULT_BANNER_SIZE_SETTINGS);
  const announcements = buildAnnouncements(announcementSettings, freeShippingText(shippingSettings));
  const announcementText = announcements.join('  ·  ');
  // Long custom text scrolls on desktop too instead of being cut off
  const fitsOneLine = announcementText.length <= 90;
  // Repeat short messages so one marquee copy is wider than a phone screen (no gap in the loop)
  const marqueeItems = Array.from({ length: Math.max(1, Math.ceil(60 / Math.max(1, announcementText.length))) }).flatMap(
    () => announcements
  );

  useEffect(() => {
    const readSettings = () => {
      setShippingSettings(loadShippingSettings());
      setAnnouncementSettings(loadAnnouncementSettings());
      setHomepageSettings(loadHomepageSettings());
      setReelsSettings(loadReelsSettings());
      setFeatureStrip(loadFeatureStrip());
      setCard(loadProductCardSettings());
      setCategoryCard(loadCategoryCardSettings());
      setBannerSize(loadBannerSizeSettings());
    };
    readSettings();
    // Settings arrive from the database shortly after load
    window.addEventListener('storage', readSettings);
    return () => window.removeEventListener('storage', readSettings);
  }, []);

  useEffect(() => {
    if (initialContent) return;
    let cancelled = false;
    Promise.all([loadBanners(), loadReels(), loadCollections()]).then(([b, r, c]) => {
      if (cancelled) return;
      setBanners(b.filter(item => item.isActive));
      setCurrentBannerIndex(0);
      setReels(r.filter(item => item.isActive));
      setCollectionBanners(c.filter(item => item.isActive));
    });
    return () => {
      cancelled = true;
    };
  }, [initialContent]);

  // Shown only until the seller adds products (demo items can't be ordered)
  const demoProducts: Product[] = [
    {
      id: '1',
      name: 'Blue Cotton T-Shirt',
      price: 499,
      mrp: 799,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop',
      rating: 4.5,
      category: 'Boys',
      badge: 'Sale',
    },
    {
      id: '2',
      name: 'Pink Floral Dress',
      price: 799,
      mrp: 1299,
      image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300&h=300&fit=crop',
      rating: 4.8,
      category: 'Girls',
      badge: 'New',
    },
    {
      id: '3',
      name: 'Denim Jeans',
      price: 899,
      mrp: 1499,
      image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=300&h=300&fit=crop',
      rating: 4.6,
      category: 'Unisex',
    },
    {
      id: '4',
      name: 'Casual Hoodie',
      price: 649,
      mrp: 1099,
      image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=300&h=300&fit=crop',
      rating: 4.7,
      category: 'Boys',
    },
    {
      id: '5',
      name: 'Summer Shorts',
      price: 349,
      mrp: 599,
      image: 'https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=300&h=300&fit=crop',
      rating: 4.4,
      category: 'Girls',
      badge: 'Hot',
    },
    {
      id: '6',
      name: 'Polo Shirt',
      price: 549,
      mrp: 899,
      image: 'https://images.unsplash.com/photo-1519238359922-989348752efb?w=300&h=300&fit=crop',
      rating: 4.5,
      category: 'Unisex',
    },
  ];

  // Category Navigation Strip
  const categoryNav: CategoryNavItem[] = [
    { label: 'Boys', href: '/products?category=boys', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=533&fit=crop' },
    { label: 'Girls', href: '/products?category=girls', image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=533&fit=crop' },
    { label: 'Baby', href: '/products?category=baby-boys', image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=533&fit=crop' },
    { label: 'School Uniforms', href: '/school-uniforms', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=533&fit=crop' },
    { label: 'T-Shirts', href: '/products?type=tshirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=533&fit=crop' },
    { label: 'Dresses', href: '/products?type=dresses', image: 'https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?w=400&h=533&fit=crop' },
    { label: 'Ethnic Wear', href: '/products?type=ethnic', image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=533&fit=crop' },
    { label: 'Combos', href: '/combos', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=533&fit=crop' },
  ];

  // Combo / Offer Section
  const [comboOffers, setComboOffers] = useState(() => DEFAULT_COMBOS.filter(c => c.isActive));
  const [siteProducts, setSiteProducts] = useState<Product[]>([]);
  const [featuredReviews, setFeaturedReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    loadReviews()
      .then(all =>
        setFeaturedReviews(
          all
            .filter(r => r.featured)
            .map(r => ({ id: r.id, name: r.customer, rating: r.rating, text: r.text, photo: r.photo }))
        )
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadCombos().then(all => setComboOffers(all.filter(c => c.isActive).slice(0, 4)));
    loadProducts().then(all =>
      setSiteProducts(
        all
          .filter(p => p.is_active)
          .map(p => ({
            id: p.slug || p.id,
            name: p.name,
            price: p.selling_price,
            mrp: p.mrp,
            image: p.images[0] || p.variants.find(v => v.images?.length)?.images?.[0] || '',
            rating: 0,
            category: p.categoryName || '',
            createdAt: p.created_at,
          }))
      )
    );
  }, []);

  const featuredProducts = siteProducts.length ? siteProducts.slice(0, 6) : demoProducts;
  const newArrivals = siteProducts.length
    ? [...siteProducts].sort((a, b) => ((a.createdAt ?? '') < (b.createdAt ?? '') ? 1 : -1)).slice(0, 10)
    : [...demoProducts].reverse();

  // What Parents Say (sample reviews until the admin features real ones)
  const demoReviews: ReviewItem[] = [
    { id: '1', name: 'Priya Sharma', rating: 5, text: 'Amazing quality fabric and perfect fit for my daughter. Will definitely order again!', photo: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=200&h=200&fit=crop' },
    { id: '2', name: 'Rahul Mehta', rating: 5, text: 'School uniforms fit perfectly and the material feels durable. Great value for money.', photo: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&h=200&fit=crop' },
    { id: '3', name: 'Anjali Patel', rating: 4, text: 'Lovely festive collection, my son looked adorable in the kurta set!', photo: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=200&h=200&fit=crop' },
  ];
  const reviews = featuredReviews.length ? featuredReviews : demoReviews;

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Auto-scroll reels strip so it starts playing through without needing a manual swipe
  useEffect(() => {
    const container = reelsScrollRef.current;
    if (!container || reels.length === 0 || !reelsSettings.autoScroll) return;

    let paused = false;
    let resumeTimer: ReturnType<typeof setTimeout>;
    const pause = () => {
      paused = true;
      clearTimeout(resumeTimer);
    };
    const resume = () => {
      resumeTimer = setTimeout(() => {
        paused = false;
      }, 2000);
    };

    container.addEventListener('pointerdown', pause);
    container.addEventListener('pointerup', resume);
    container.addEventListener('pointerleave', resume);

    const timer = setInterval(() => {
      if (paused) return;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (maxScroll <= 0) return;
      const next = container.scrollLeft + 1;
      container.scrollLeft = next >= maxScroll ? 0 : next;
    }, 30);

    return () => {
      clearInterval(timer);
      clearTimeout(resumeTimer);
      container.removeEventListener('pointerdown', pause);
      container.removeEventListener('pointerup', resume);
      container.removeEventListener('pointerleave', resume);
    };
  }, [reels.length, reelsSettings.autoScroll]);

  // Admin → Settings → Announcement Bar (shown above or below the hero)
  const announcementBar =
    announcements.length > 0 ? (
      <div className="bg-ink-950 text-gold-300 text-[11px] sm:text-xs py-2 uppercase tracking-[0.18em] overflow-hidden">
        {fitsOneLine && (
          <p className="hidden lg:block text-center text-gold-300 whitespace-nowrap">
            {announcements.join('  ·  ')}
          </p>
        )}
        {/* Seamless marquee so nothing is cut off */}
        <div className={`marquee flex ${fitsOneLine ? 'lg:hidden' : ''}`} aria-label={announcements.join(', ')}>
          <div className="marquee-track flex shrink-0 whitespace-nowrap" aria-hidden="true">
            {[0, 1].map(copy => (
              <span key={copy} className="flex shrink-0">
                {marqueeItems.map((text, i) => (
                  <span key={i} className="px-5 text-gold-300">
                    {text}
                    <span className="pl-10 text-gold-500">✦</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      <Header />

      <main className="min-h-screen bg-cream">
        {announcementSettings.position !== 'below' && announcementBar}

        {/* Hero Banner: edge-to-edge, shape set in Admin → Banners → Banner Size */}
        <section
          className="relative w-full aspect-[var(--hero-mobile)] md:aspect-[var(--hero-desktop)] overflow-hidden bg-ink-900"
          style={
            {
              '--hero-mobile': `${bannerSize.mobile.width} / ${bannerSize.mobile.height}`,
              '--hero-desktop': `${bannerSize.desktop.width} / ${bannerSize.desktop.height}`,
            } as React.CSSProperties
          }
        >
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              aria-hidden={index !== currentBannerIndex}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentBannerIndex ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={banner.image}
                alt={banner.title || 'Banner'}
                fill
                sizes="100vw"
                quality={85}
                priority={index === 0}
                unoptimized={banner.image.startsWith('data:')}
                className="object-cover object-center"
              />
              {banner.showText === true && (
                <div className="absolute inset-0 bg-gradient-to-r from-ink-950/45 via-ink-950/10 to-transparent" />
              )}
              <div className="relative h-full max-w-7xl mx-auto flex flex-col justify-end md:justify-center items-start px-5 pb-9 sm:px-10 sm:pb-12 md:pb-0 lg:px-16">
                {banner.showText === true && (
                  <>
                    <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-gold-300 mb-2 sm:mb-3">
                      Judwa Selection
                    </span>
                    <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-white leading-[1.1] mb-3 sm:mb-5 max-w-[16ch] md:max-w-xl line-clamp-2">
                      {banner.title}
                    </h1>
                    <p className="hidden md:block text-base lg:text-lg text-white/85 mb-7 max-w-md">{banner.subtitle}</p>
                  </>
                )}
                {banner.showButton !== false && (
                  <Link
                    href={banner.link}
                    className="inline-flex items-center gap-2 bg-white text-ink-950 hover:bg-ink-950 hover:text-white px-5 py-2 sm:px-8 sm:py-3 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] transition"
                  >
                    Shop Now <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
              {banner.showButton === false && (
                <Link href={banner.link} aria-label={banner.title || 'Open banner'} className="absolute inset-0" />
              )}
            </div>
          ))}

          <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                aria-label={`Show banner ${index + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  index === currentBannerIndex ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </section>

        {announcementSettings.position === 'below' && announcementBar}

        {/* Headline directly below the hero */}
        <section className="bg-white text-center px-4 pt-6 pb-4 sm:pt-10 sm:pb-6 md:pt-12 md:pb-8">
          <h2 className="font-serif text-[26px] leading-tight sm:text-4xl md:text-[44px] font-medium text-ink-950">
            Categories You Might Like
          </h2>
          <Link
            href="/products"
            className="inline-block mt-3 sm:mt-4 pb-1 border-b border-ink-950 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-ink-950 hover:text-gold-600 hover:border-gold-600 transition"
          >
            View All Collection
          </Link>
        </section>

        {/* Features Section (Admin → Settings → Homepage Highlights) */}
        {featureStrip.enabled && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 gap-px bg-ink-100 my-4 md:my-8 border border-ink-100">
              {featureStrip.items.map((item, index) => {
                const Icon = FEATURE_ICONS[item.icon];
                return (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row items-center text-center md:text-left gap-2 md:gap-4 px-2 py-4 sm:p-4 md:p-6 bg-white"
                  >
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-gold-600 flex-shrink-0" />
                    <div>
                      <h3 className="font-serif text-sm md:text-base font-semibold text-ink-900">{item.title}</h3>
                      {item.subtitle && (
                        <p className="text-xs md:text-sm text-gray-600">
                          {resolveFeatureText(item.subtitle, shippingSettings.freeShippingAbove)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Category cards (Admin → Settings → Category Card Design) */}
        <div className="bg-cream">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
            <CategoryCards items={categoryNav} settings={categoryCard} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Bestsellers Section */}
          <div className="py-6 sm:py-10">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <span className="eyebrow">Most Loved</span>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-ink-900 mt-1">Bestsellers</h2>
              </div>
              <Link href="/products?sort=popular" className="flex-shrink-0">
                <button className="px-4 sm:px-6 py-2 border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white text-xs sm:text-sm font-semibold uppercase tracking-wide whitespace-nowrap transition">
                  View All
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {featuredProducts.map(product => {
                return (
                  <div key={product.id} className={`${cardClasses(card)} h-full flex flex-col`}>
                    {/* Product Image */}
                    <div className={`relative ${imageClasses(card)} bg-white overflow-hidden`}>
                      <Link href={`/product/${product.id}`} className="absolute inset-0" aria-label={product.name}>
                        {product.image && (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 1024px) 50vw, 33vw"
                            loading="lazy"
                            unoptimized={product.image.startsWith('data:')}
                            className="object-contain"
                          />
                        )}
                      </Link>
                      {product.badge && (
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-ink-950 text-gold-300 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wide pointer-events-none">
                          {product.badge}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className={`${infoClasses(card)} flex flex-col flex-1`}>
                      {card.showCategory && product.category && (
                        <p className="text-[10px] sm:text-xs font-semibold text-gold-600 uppercase tracking-wide mb-1">
                          {product.category}
                        </p>
                      )}
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-serif text-sm sm:text-lg font-semibold text-ink-900 line-clamp-2 mb-2 cursor-pointer hover:text-gold-600">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Rating */}
                      {card.showRating && product.rating > 0 && (
                      <div className={`flex flex-wrap items-center gap-1 mb-2 sm:mb-3 ${card.align === 'center' ? 'justify-center' : ''}`}>
                        <div className="flex text-gold-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] sm:text-xs text-gray-600">
                          {product.rating} ({product.reviewCount ?? Math.round(product.rating * 25)})
                        </span>
                      </div>
                      )}

                      {/* Price */}
                      <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-3 sm:mb-4 ${card.align === 'center' ? 'justify-center' : ''}`}>
                        <span className="text-lg sm:text-2xl font-serif font-semibold text-ink-900">₹{product.price}</span>
                        {product.mrp > product.price && (
                          <span className="text-xs sm:text-sm text-gray-500 line-through">₹{product.mrp}</span>
                        )}
                        {card.showDiscount && discountPercent(product.price, product.mrp) > 0 && (
                          <span className="text-xs sm:text-sm font-semibold text-gold-600">
                            {discountPercent(product.price, product.mrp)}% off
                          </span>
                        )}
                      </div>

                      {/* Size/colour must be picked on the product page */}
                      {card.showButton && (
                        <Link
                          href={`/product/${product.id}`}
                          className={`mt-auto block w-full px-2 sm:px-4 py-2 sm:py-2.5 text-center text-xs sm:text-sm font-semibold uppercase tracking-wide whitespace-nowrap transition ${buttonClasses(card)}`}
                        >
                          {card.buttonText}
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* JUDWA Reels Section */}
          <div className="py-6 sm:py-10">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <span className="eyebrow">Watch &amp; Shop</span>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-ink-900 mt-1">JUDWA SELECTION Reels</h2>
              </div>
            </div>

            <div ref={reelsScrollRef} className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              {reels.map(reel => (
                <button
                  key={reel.id}
                  onClick={() => setActiveReel(reel)}
                  className="relative flex-shrink-0 w-40 sm:w-48 h-64 sm:h-72 rounded-2xl overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 group-hover:scale-110 transition duration-300">
                    {reel.videoUrl ? (
                      // Browsers only allow autoplay when muted; playsInline keeps iOS from going fullscreen
                      <video
                        src={reel.videoUrl}
                        poster={reel.thumbnail}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src={reel.thumbnail}
                        alt={reel.title}
                        fill
                        sizes="192px"
                        loading="lazy"
                        unoptimized={reel.thumbnail.startsWith('data:')}
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  {!reel.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition">
                        <Play className="w-5 h-5 text-gold-600 fill-gold-600 ml-0.5" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm line-clamp-2 text-left">{reel.title}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* New Arrivals Section */}
          <div className="py-6 sm:py-10">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div>
                <span className="eyebrow">Just In</span>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-ink-900 mt-1">New Arrivals</h2>
              </div>
              <Link href="/products?sort=newest" className="flex-shrink-0">
                <button className="px-4 sm:px-6 py-2 border border-ink-900 text-ink-900 hover:bg-ink-900 hover:text-white text-xs sm:text-sm font-semibold uppercase tracking-wide whitespace-nowrap transition">
                  View All
                </button>
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
              {newArrivals.map(product => (
                <Link key={product.id} href={`/product/${product.id}`} className="flex-shrink-0 w-48 sm:w-56">
                  <div className="bg-white border border-ink-100 hover:shadow-lg transition overflow-hidden h-full cursor-pointer">
                    <div className="relative h-48 sm:h-56 bg-white overflow-hidden">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="224px"
                          loading="lazy"
                          unoptimized={product.image.startsWith('data:')}
                          className="object-contain"
                        />
                      )}
                      <div className="absolute top-3 left-3 bg-ink-950 text-gold-300 px-2 py-1 text-xs font-semibold uppercase tracking-wide">
                        New
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-serif font-semibold text-ink-900 text-sm line-clamp-2 mb-1">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-serif font-semibold text-ink-900">₹{product.price}</span>
                        <span className="text-xs text-gray-500 line-through">₹{product.mrp}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Collection Banners */}
          <div className="py-6 sm:py-10">
            <span className="eyebrow">Curated</span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-ink-900 mt-1 mb-4 sm:mb-6">Shop by Collection</h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
              {collectionBanners.map(collection => (
                <Link key={collection.id} href={collection.link} className="block">
                  <div className="relative aspect-[3/4] sm:aspect-[4/5] md:aspect-auto md:h-80 overflow-hidden cursor-pointer group bg-ink-100">
                    <div className="absolute inset-0 group-hover:scale-110 transition duration-300">
                      <Image
                        src={collection.image}
                        alt={collection.name}
                        fill
                        sizes="33vw"
                        loading="lazy"
                        unoptimized={collection.image.startsWith('data:')}
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-2 sm:p-5 md:p-6">
                      <h3 className="font-serif text-xs sm:text-xl md:text-2xl font-semibold text-white leading-tight sm:mb-1 line-clamp-2">
                        {collection.name}
                      </h3>
                      <p className="hidden sm:block text-gray-200 text-sm leading-snug line-clamp-2">{collection.subtitle}</p>
                      <span className="mt-1 sm:mt-2 inline-flex items-center gap-1 text-gold-300 text-[9px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-widest">
                        Shop Now <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Combo / Offer Section */}
          <div className="py-6 sm:py-10">
            <div className="mb-4 sm:mb-6">
              <span className="eyebrow">Bundle &amp; Save</span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-ink-900 mt-1">Combos &amp; Offers</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {comboOffers.map(combo => {
                const photo = combo.image || combo.pieces.find(p => p.image)?.image;
                const price = getComboPrice(combo);
                const mrp = getComboMrp(combo);
                const save = getComboSavePercent(combo);
                return (
                <Link key={combo.id} href={`/combos/${encodeURIComponent(combo.id)}`}>
                  <div className="bg-white border border-ink-100 hover:shadow-lg transition overflow-hidden cursor-pointer h-full">
                    <div className="relative h-36 sm:h-44 bg-white">
                      {photo && (
                        <Image
                          src={photo}
                          alt={combo.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          loading="lazy"
                          unoptimized={photo.startsWith('data:')}
                          className="object-contain"
                        />
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-serif font-semibold text-ink-900 text-sm sm:text-base line-clamp-2 mb-2">{combo.name}</h3>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg sm:text-xl font-serif font-semibold text-ink-900">₹{price}</span>
                        {mrp > price && <span className="text-xs sm:text-sm text-gray-500 line-through">₹{mrp}</span>}
                      </div>
                      {save > 0 && (
                        <span className="text-xs font-semibold text-gold-600 uppercase tracking-wide">Save {save}%</span>
                      )}
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
          </div>

          {/* Customer Reviews: text + customer photo (photo hidden via Admin → Reviews toggle) */}
          <div className="py-6 sm:py-10">
            <div className="mb-4 sm:mb-6 text-center">
              <span className="eyebrow">Real Kids. Real Reviews.</span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-semibold text-ink-900 mt-1">What Parents Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white border border-ink-100 p-4 sm:p-6 flex flex-col">
                  <div className="flex text-gold-500 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                  <p className="font-serif text-ink-800 text-base sm:text-lg italic mb-3">&ldquo;{review.text}&rdquo;</p>
                  <p className="text-sm font-semibold text-ink-900 uppercase tracking-wide">{review.name}</p>
                  {homepageSettings.showRealKidsReviews && review.photo && (
                    <div className="relative mt-3 w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden bg-ink-50 border border-ink-100">
                      <Image
                        src={review.photo}
                        alt={`Photo shared by ${review.name}`}
                        fill
                        sizes="80px"
                        loading="lazy"
                        unoptimized={review.photo.startsWith('data:')}
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* JUDWA Reels Fullscreen Viewer */}
      {activeReel && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setActiveReel(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="relative w-full max-w-sm h-full sm:h-[85vh] sm:rounded-2xl overflow-hidden">
            {activeReel.videoUrl ? (
              <video
                src={activeReel.videoUrl}
                autoPlay
                loop
                controls
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <Image
                src={activeReel.thumbnail}
                alt={activeReel.title}
                fill
                sizes="384px"
                unoptimized={activeReel.thumbnail.startsWith('data:')}
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/40 pointer-events-none" />

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="font-serif text-white text-2xl font-semibold mb-4">{activeReel.title}</h3>
              <Link href={activeReel.ctaLink} onClick={() => setActiveReel(null)}>
                <button className="w-full px-6 py-3 bg-gold-600 hover:bg-gold-700 text-white text-sm font-semibold uppercase tracking-wide transition">
                  {activeReel.ctaLabel}
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
