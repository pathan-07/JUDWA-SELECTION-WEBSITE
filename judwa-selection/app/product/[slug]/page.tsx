'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Zap, Share2, Minus, Plus, Check, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getProductBySlug, getProductVariants } from '@/lib/queries/products';
import { loadProducts } from '@/lib/productsData';
import { SiteReview, loadReviews, ratingSummary } from '@/lib/reviewsData';
import { formatINR } from '@/lib/utils';
import { DEFAULT_SHIPPING_SETTINGS, freeShippingText, loadShippingSettings } from '@/lib/shippingSettings';
import toast from 'react-hot-toast';

const CATEGORY_SLUGS: Record<string, string> = { '1': 'boys', '2': 'girls', '3': 'unisex' };

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const DEMO_IMAGES: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
  '2': 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&h=800&fit=crop',
  '3': 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&h=800&fit=crop',
  '4': 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=800&h=800&fit=crop',
  '5': 'https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=800&h=800&fit=crop',
  '6': 'https://images.unsplash.com/photo-1519238359922-989348752efb?w=800&h=800&fit=crop',
};

// Fallback demo catalogue used until real products exist in Supabase.
// Keeps homepage/product links functional (same 6 IDs used on the homepage).
const DEMO_PRODUCTS: Record<string, any> = {
  '1': {
    id: '1', name: 'Blue Cotton T-Shirt', mrp: 799, selling_price: 499,
    short_description: 'Soft, breathable cotton tee for everyday comfort.',
    description: 'A classic crew-neck t-shirt made from 100% cotton, designed to keep kids comfortable all day long. Reinforced stitching for durability during active play.',
    category: { name: 'Boys', slug: 'boys' }, fabric: '100% Cotton', fit: 'Regular Fit',
    care_instructions: 'Machine wash cold, tumble dry low.',
  },
  '2': {
    id: '2', name: 'Pink Floral Dress', mrp: 1299, selling_price: 799,
    short_description: 'Pretty floral print dress for special occasions.',
    description: 'A lightweight floral dress with a flattering A-line cut, perfect for parties and everyday wear alike.',
    category: { name: 'Girls', slug: 'girls' }, fabric: 'Cotton Blend', fit: 'A-Line',
    care_instructions: 'Hand wash recommended, do not bleach.',
  },
  '3': {
    id: '3', name: 'Denim Jeans', mrp: 1499, selling_price: 899,
    short_description: 'Durable denim jeans built for everyday adventures.',
    description: 'Stretchable denim jeans with reinforced knees, designed to survive playground adventures while staying comfortable.',
    category: { name: 'Unisex', slug: 'unisex' }, fabric: 'Stretch Denim', fit: 'Slim Fit',
    care_instructions: 'Machine wash cold, inside out.',
  },
  '4': {
    id: '4', name: 'Casual Hoodie', mrp: 1099, selling_price: 649,
    short_description: 'Cozy fleece hoodie for cooler days.',
    description: 'A warm, soft fleece hoodie with a kangaroo pocket and adjustable drawstring hood, great for layering.',
    category: { name: 'Boys', slug: 'boys' }, fabric: 'Cotton Fleece', fit: 'Regular Fit',
    care_instructions: 'Machine wash cold, do not tumble dry.',
  },
  '5': {
    id: '5', name: 'Summer Shorts', mrp: 599, selling_price: 349,
    short_description: 'Lightweight shorts for hot summer days.',
    description: 'Breathable cotton shorts with an elastic waistband, perfect for summer play and travel.',
    category: { name: 'Girls', slug: 'girls' }, fabric: 'Cotton', fit: 'Regular Fit',
    care_instructions: 'Machine wash cold.',
  },
  '6': {
    id: '6', name: 'Polo Shirt', mrp: 899, selling_price: 549,
    short_description: 'Smart-casual polo for school or play.',
    description: 'A classic pique-knit polo shirt with a ribbed collar, smart enough for school and comfortable enough for play.',
    category: { name: 'Unisex', slug: 'unisex' }, fabric: 'Pique Cotton', fit: 'Regular Fit',
    care_instructions: 'Machine wash cold, iron on low heat.',
  },
};

const DEMO_SIZES = ['S', 'M', 'L', 'XL'];
const DEMO_COLORS = ['Blue', 'White'];

// "Pink" and "pink " typed by the seller are the same colour
const sameColor = (a?: string, b?: string) => (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase();

function uniqueColors(variants: { color: string }[]): string[] {
  const seen = new Map<string, string>();
  for (const v of variants) {
    const key = (v.color ?? '').trim().toLowerCase();
    if (key && !seen.has(key)) seen.set(key, v.color.trim());
  }
  return [...seen.values()];
}

function buildDemoVariants(productId: string, sellingPrice: number) {
  const variants: any[] = [];
  let index = 0;
  for (const size of DEMO_SIZES) {
    for (const color of DEMO_COLORS) {
      variants.push({
        id: `${productId}-v${index++}`,
        size,
        color,
        stock: 12,
        selling_price: sellingPrice,
      });
    }
  }
  return variants;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [gallery, setGallery] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [reviews, setReviews] = useState<SiteReview[]>([]);
  const [shippingSettings, setShippingSettings] = useState(DEFAULT_SHIPPING_SETTINGS);

  useEffect(() => {
    const readShipping = () => setShippingSettings(loadShippingSettings());
    readShipping();
    window.addEventListener('storage', readShipping);
    return () => window.removeEventListener('storage', readShipping);
  }, []);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        // Seller-added products take priority so they go live immediately
        const catalog = await loadProducts();
        const localProduct = catalog.find(p => p.id === slug || p.slug === slug);
        if (localProduct) {
          setProduct({
            id: localProduct.id,
            name: localProduct.name,
            mrp: localProduct.mrp,
            selling_price: localProduct.selling_price,
            short_description: localProduct.short_description,
            description: localProduct.description,
            fabric: localProduct.fabric,
            fit: localProduct.fit,
            care_instructions: localProduct.care_instructions,
            sold_last_month: localProduct.sold_last_month,
            category: {
              name: localProduct.categoryName,
              slug: CATEGORY_SLUGS[localProduct.category_id] || 'products',
            },
          });
          setVariants(localProduct.variants);
          setSelectedVariant(localProduct.variants[0] || null);
          setProductImages(localProduct.images);
          setGallery(localProduct.images.length > 0 ? localProduct.images : (localProduct.variants[0]?.images || []));
          setSelectedImage((localProduct.images[0] || localProduct.variants[0]?.images?.[0]) ?? null);
          setLoading(false);
          return;
        }

        // Demo items can't be ordered, so they only appear while the store has no real products
        if (catalog.length > 0) {
          setLoading(false);
          return;
        }

        // Demo items need no network round-trip, so they open instantly
        if (DEMO_PRODUCTS[slug]) {
          loadDemoFallback();
          setLoading(false);
          return;
        }

        const { data: productData } = await getProductBySlug(slug);
        if (productData) {
          setProduct(productData);

          const { data: variantData } = await getProductVariants(productData.id);
          setVariants(variantData || []);
          if (variantData && variantData.length > 0) {
            setSelectedVariant(variantData[0]);
          }
        } else {
          loadDemoFallback();
        }
      } catch (error) {
        console.error('Error loading product:', error);
        loadDemoFallback();
      } finally {
        setLoading(false);
      }
    };

    const loadDemoFallback = () => {
      const demo = DEMO_PRODUCTS[slug];
      if (!demo) return;
      setProduct(demo);
      if (DEMO_IMAGES[slug]) {
        setProductImages([DEMO_IMAGES[slug]]);
        setGallery([DEMO_IMAGES[slug]]);
        setSelectedImage(DEMO_IMAGES[slug]);
      }
      const demoVariants = buildDemoVariants(demo.id, demo.selling_price);
      setVariants(demoVariants);
      setSelectedVariant(demoVariants[0]);
    };

    loadProduct();
  }, [slug]);

  // Colour photos are uploaded on one size of a colour; use them for every size of that colour
  useEffect(() => {
    if (!selectedVariant) return;
    const colorPhotos: string[] = selectedVariant.images?.length
      ? selectedVariant.images
      : variants.find(v => sameColor(v.color, selectedVariant.color) && v.images?.length)?.images ?? [];
    if (colorPhotos.length > 0) {
      setGallery([...colorPhotos, ...productImages.filter(img => !colorPhotos.includes(img))]);
      setSelectedImage(colorPhotos[0]);
    } else if (productImages.length > 0) {
      setGallery(productImages);
      setSelectedImage(productImages[0]);
    }
  }, [selectedVariant, variants, productImages]);

  useEffect(() => {
    if (!product?.id) return;
    loadReviews()
      .then(all => setReviews(all.filter(r => r.productId === product.id).sort((a, b) => (a.date < b.date ? 1 : -1))))
      .catch(() => setReviews([]));
  }, [product?.id]);

  const rating = ratingSummary(reviews);

  const addSelectionToCart = (): boolean => {
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return false;
    }
    if (quantity <= 0) {
      toast.error('Please select a valid quantity');
      return false;
    }

    // Store in localStorage for now
    const cartKey = 'judwa_cart';
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');

    const cartItem = {
      id: `${product.id}-${selectedVariant.id}`,
      product_id: product.id,
      variant_id: selectedVariant.id,
      product_name: product.name,
      image: selectedVariant.images?.[0] || gallery[0] || selectedImage || '',
      size: selectedVariant.size,
      color: selectedVariant.color,
      selling_price: selectedVariant.selling_price,
      quantity,
    };

    const existingIndex = cart.findIndex((item: any) => item.id === cartItem.id);
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push(cartItem);
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    window.dispatchEvent(new Event('storage'));
    return true;
  };

  const handleAddToCart = () => {
    if (!addSelectionToCart()) return;
    toast.success(`Added ${quantity} item(s) to cart!`);
    setQuantity(1);
  };

  const handleBuyNow = () => {
    if (addSelectionToCart()) router.push('/checkout');
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${encodeURIComponent(slug)}`;
    // Share sheet and clipboard only work on https; plain-http (e.g. LAN testing) falls back to a copy box
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, text: `Check out ${product.name} on JUDWA SELECTION`, url });
      } catch {
        // user closed the share sheet
      }
      return;
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success('Product link copied');
      return;
    }
    window.prompt('Copy this product link:', url);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link href="/products" className="inline-block brand-bg text-white hover:text-white px-6 py-2.5 font-semibold uppercase tracking-wide text-sm">
            Back to Products
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const discount = product.mrp - product.selling_price;
  const discountPercent = Math.round((discount / product.mrp) * 100);

  return (
    <>
      <Header />

      <div className="bg-white">
        <div className="container py-5 sm:py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs sm:text-sm mb-4 sm:mb-6 text-gray-600 min-w-0">
            <Link href="/" className="flex-shrink-0">Home</Link>
            <span>/</span>
            <Link href="/products" className="flex-shrink-0">Products</Link>
            <span>/</span>
            {product.category && (
              <>
                <Link href={`/products?category=${encodeURIComponent(product.category.slug)}`} className="flex-shrink-0">{product.category.name}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8">
            {/* Product Image */}
            <div className="flex flex-col gap-3 sm:gap-4 min-w-0">
              <div className="relative bg-white border border-ink-100 rounded-lg overflow-hidden aspect-square">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized={selectedImage.startsWith('data:')}
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-ink-300">
                    <ShoppingCart className="h-16 w-16" />
                  </div>
                )}
                {discountPercent > 0 && (
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-ink-950 text-gold-300 px-2.5 py-1 text-xs sm:text-sm font-semibold tracking-wide">
                    -{discountPercent}%
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {gallery.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded cursor-pointer flex-shrink-0 border-2 overflow-hidden ${
                        selectedImage === img ? 'border-gold-500' : 'border-transparent'
                      }`}
                    >
                      <Image src={img} alt={`${product.name} ${i + 1}`} fill sizes="80px" unoptimized={img.startsWith('data:')} className="object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="min-w-0">
              {/* Title & Rating */}
              <div className="mb-5 sm:mb-6">
                {product.category && (
                  <span className="eyebrow">{product.category.name}</span>
                )}
                <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-900 mt-1 mb-2">{product.name}</h1>
                <div className="flex items-center gap-3">
                  {rating.count > 0 && (
                    <button
                      onClick={() => {
                        setActiveTab('reviews');
                        document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex items-center gap-2"
                    >
                      <span className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className={i <= Math.round(rating.average) ? 'text-gold-500' : 'text-gray-300'}>★</span>
                        ))}
                      </span>
                      <span className="text-gray-600 text-sm">
                        {rating.average} ({rating.count} {rating.count === 1 ? 'review' : 'reviews'})
                      </span>
                    </button>
                  )}
                  <button
                    onClick={handleShare}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 border border-ink-200 hover:border-gold-500 text-ink-900 text-xs font-semibold uppercase tracking-wide rounded-full transition"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                  </button>
                </div>
                {product.sold_last_month > 0 && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-gold-50 border border-gold-200 text-gold-800 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold">
                    <TrendingUp className="h-4 w-4 text-gold-600 flex-shrink-0" />
                    {product.sold_last_month.toLocaleString('en-IN')}+ sold in last month
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className="bg-cream border border-ink-100 rounded-lg p-4 mb-6">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mb-2">
                  <span className="font-serif text-3xl sm:text-4xl font-semibold text-ink-900">
                    {formatINR(product.selling_price)}
                  </span>
                  <span className="text-lg sm:text-xl text-gray-400 line-through">
                    {formatINR(product.mrp)}
                  </span>
                  <span className="bg-gold-50 text-gold-700 px-2.5 py-1 rounded font-semibold text-xs sm:text-sm">
                    Save {formatINR(discount)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  You save {discountPercent}% on this item
                </p>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-6">{product.short_description}</p>

              {/* Variants Selection */}
              {variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3">
                    Select Size & Color
                  </label>

                  {/* Size Selection */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">SIZE</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(new Set(variants.map((v) => v.size))).map((size) => (
                        <button
                          key={size}
                          onClick={() => {
                            const variant =
                              variants.find((v) => v.size === size && sameColor(v.color, selectedVariant?.color)) ||
                              variants.find((v) => v.size === size);
                            setSelectedVariant(variant);
                          }}
                          className={`min-w-[3rem] px-4 py-2 border rounded-lg font-medium transition-colors ${
                            selectedVariant?.size === size
                              ? 'bg-ink-900 text-white border-ink-900'
                              : 'border-gray-300 hover:border-gold-500'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-2">COLOR</p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueColors(variants).map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            const variant = variants.find(
                              (v) =>
                                sameColor(v.color, color) &&
                                v.size === selectedVariant?.size
                            ) || variants.find((v) => sameColor(v.color, color));
                            setSelectedVariant(variant);
                          }}
                          className={`px-4 py-2 border rounded-lg font-medium transition-colors ${
                            sameColor(selectedVariant?.color, color)
                              ? 'bg-ink-900 text-white border-ink-900'
                              : 'border-gray-300 hover:border-gold-500'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stock Status */}
                  {selectedVariant && (
                    <div className="mt-4 flex items-center gap-2">
                      {selectedVariant.stock > 0 ? (
                        <>
                          <Check className="h-5 w-5 text-green-600" />
                          <span className="text-green-600 font-medium">
                            {selectedVariant.stock} in stock
                          </span>
                        </>
                      ) : (
                        <span className="text-red-600 font-medium">Out of stock</span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-semibold">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center border-0 rounded-none px-0 focus:outline-none focus:ring-0"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-gray-600 hover:text-gray-900"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col min-[380px]:flex-row gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                  className="flex-1 bg-white border-2 border-ink-900 hover:bg-ink-50 disabled:border-gray-300 disabled:text-gray-400 text-ink-900 px-4 sm:px-6 py-3 rounded-lg font-semibold uppercase tracking-wide text-sm flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                  className="flex-1 brand-bg disabled:bg-gray-300 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold uppercase tracking-wide text-sm flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
                >
                  <Zap className="h-5 w-5" />
                  Buy Now
                </button>
              </div>

              {/* Additional Info */}
              <div className="border-t pt-6 space-y-3 text-sm">
                <div className="flex gap-2">
                  <span className="text-gray-600">✓ 100% Original Products</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600">✓ {freeShippingText(shippingSettings)}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600">✓ 7 Days Return Policy</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-600">✓ Secured Payments</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div id="product-tabs" className="border-t scroll-mt-24">
            <div className="flex gap-6 sm:gap-8 mb-6 sm:mb-8 border-b overflow-x-auto scrollbar-hide">
              {[
                { id: 'description', label: 'Description' },
                { id: 'specifications', label: 'Specifications' },
                { id: 'shipping', label: 'Shipping Info' },
                { id: 'reviews', label: rating.count > 0 ? `Reviews (${rating.count})` : 'Reviews' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 sm:py-4 font-medium border-b-2 whitespace-nowrap flex-shrink-0 transition-colors ${
                    activeTab === tab.id
                      ? 'text-ink-900 border-gold-500'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">Fabric</p>
                    <p className="text-gray-600">{product.fabric || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Fit</p>
                    <p className="text-gray-600">{product.fit || 'Regular'}</p>
                  </div>
                </div>
                {product.care_instructions && (
                  <div>
                    <p className="font-medium text-gray-900">Care Instructions</p>
                    <p className="text-gray-600">{product.care_instructions}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shipping' && (
              <div>
                <p className="text-gray-700 mb-4">
                  Estimated delivery: 3-5 business days within Gujarat, 5-7 business days outside.
                </p>
                <p className="text-gray-700">
                  {freeShippingText(shippingSettings)}. Cash on Delivery available.
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <>
              {reviews.length === 0 ? (
                <div className="py-4 text-gray-600">
                  <p>No reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {reviews.map(review => (
                    <div key={review.id} className="border border-ink-100 rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <span key={i} className={i <= review.rating ? 'text-gold-500' : 'text-gray-300'}>★</span>
                          ))}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-ink-800 mb-2">{review.text}</p>
                      <p className="text-sm font-semibold text-ink-900">
                        {review.customer}
                        {!review.adminAdded && <span className="ml-2 text-xs font-medium text-green-700">✓ Verified buyer</span>}
                      </p>
                      {review.photo && (
                        <div className="relative mt-3 w-20 h-20 rounded-md overflow-hidden border border-ink-100 bg-ink-50">
                          <Image
                            src={review.photo}
                            alt={`Photo from ${review.customer}`}
                            fill
                            sizes="80px"
                            unoptimized={review.photo.startsWith('data:')}
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="pb-4 text-sm text-gray-600">
                Bought this? Once your order is delivered, open it from{' '}
                <Link href="/track-order" className="font-semibold underline hover:text-gold-600">Track Order</Link> to write a review.
              </p>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
