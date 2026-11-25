import { supabaseServer } from '../supabase';
import { Product, ProductVariant, Category } from '../types';

/**
 * Get all active products with optional filters
 */
export const getProducts = async (
  limit: number = 12,
  offset: number = 0,
  filters?: {
    category_id?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }
) => {
  try {
    let query = supabaseServer
      .from('products')
      .select('*, category:categories(*)')
      .eq('is_active', true);

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.minPrice) {
      query = query.gte('selling_price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte('selling_price', filters.maxPrice);
    }

    if (filters?.sortBy === 'price_asc') {
      query = query.order('selling_price', { ascending: true });
    } else if (filters?.sortBy === 'price_desc') {
      query = query.order('selling_price', { ascending: false });
    } else if (filters?.sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return { data, count, error: null };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: null, count: 0, error };
  }
};

/**
 * Get single product by ID
 */
export const getProductById = async (productId: string) => {
  try {
    const { data, error } = await supabaseServer
      .from('products')
      .select('*, category:categories(*), school:schools(*)')
      .eq('id', productId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { data: null, error };
  }
};

/**
 * Get product by slug
 */
export const getProductBySlug = async (slug: string) => {
  try {
    const { data, error } = await supabaseServer
      .from('products')
      .select('*, category:categories(*), school:schools(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { data: null, error };
  }
};

/**
 * Get product variants
 */
export const getProductVariants = async (productId: string) => {
  try {
    const { data, error } = await supabaseServer
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('size', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching variants:', error);
    return { data: null, error };
  }
};

/**
 * Get single variant by ID
 */
export const getVariantById = async (variantId: string) => {
  try {
    const { data, error } = await supabaseServer
      .from('product_variants')
      .select('*')
      .eq('id', variantId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching variant:', error);
    return { data: null, error };
  }
};

/**
 * Get all categories
 */
export const getCategories = async () => {
  try {
    const { data, error } = await supabaseServer
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    // Expected until the database is connected; callers fall back to built-in categories
    console.warn('Categories unavailable, using defaults:', error);
    return { data: null, error };
  }
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (limit: number = 6) => {
  try {
    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .limit(limit);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return { data: null, error };
  }
};

/**
 * Get best sellers (most ordered products)
 */
export const getBestsellers = async (limit: number = 8) => {
  try {
    const { data, error } = await supabaseServer
      .from('products')
      .select('*, order_items(count)')
      .eq('is_active', true)
      .order('order_items', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching bestsellers:', error);
    return { data: null, error };
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (categoryId: string, limit: number = 12, offset: number = 0) => {
  try {
    const { data, error, count } = await supabaseServer
      .from('products')
      .select('*', { count: 'exact' })
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return { data, count, error: null };
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return { data: null, count: 0, error };
  }
};

/**
 * Search products
 */
export const searchProducts = async (query: string, limit: number = 12) => {
  try {
    const { data, error } = await supabaseServer
      .from('products')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error searching products:', error);
    return { data: null, error };
  }
};

/**
 * Track product view
 */
export const trackProductView = async (productId: string, sessionToken?: string) => {
  try {
    const { data, error } = await supabaseServer
      .from('product_views')
      .insert({
        product_id: productId,
        session_token: sessionToken,
        view_count: 1,
      })
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error tracking product view:', error);
    return { data: null, error };
  }
};

/**
 * Get recently viewed products
 */
export const getRecentlyViewed = async (sessionToken: string, limit: number = 6) => {
  try {
    const { data, error } = await supabaseServer
      .from('recently_viewed')
      .select('product:products(*)')
      .eq('session_token', sessionToken)
      .order('viewed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching recently viewed:', error);
    return { data: null, error };
  }
};

/**
 * Add to recently viewed
 */
export const addRecentlyViewed = async (productId: string, sessionToken: string) => {
  try {
    // First check if already exists
    const { data: existing } = await supabaseServer
      .from('recently_viewed')
      .select('id')
      .eq('product_id', productId)
      .eq('session_token', sessionToken)
      .single();

    if (existing) {
      // Update viewed_at
      const { data, error } = await supabaseServer
        .from('recently_viewed')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } else {
      // Insert new
      const { data, error } = await supabaseServer
        .from('recently_viewed')
        .insert({
          product_id: productId,
          session_token: sessionToken,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    }
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
    return { data: null, error };
  }
};
