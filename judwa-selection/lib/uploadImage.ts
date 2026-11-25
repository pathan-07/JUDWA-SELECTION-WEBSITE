import { supabaseServer } from './supabase';

export const uploadProductImage = async (
  file: File,
  productId?: string
): Promise<{ url: string; path: string } | null> => {
  try {
    if (!file) return null;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please upload an image file');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    const timestamp = Date.now();
    const fileName = `${productId || 'product'}-${timestamp}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = `products/${fileName}`;

    // Upload to Supabase storage
    const { data, error } = await supabaseServer.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicData } = supabaseServer.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return {
      url: publicData.publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadGalleryImages = async (
  files: File[],
  productId?: string
): Promise<Array<{ url: string; path: string }>> => {
  const results: Array<{ url: string; path: string }> = [];

  for (const file of files) {
    try {
      const result = await uploadProductImage(file, productId);
      if (result) {
        results.push(result);
      }
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      // Continue with next file
    }
  }

  return results;
};

export const deleteProductImage = async (filePath: string): Promise<boolean> => {
  try {
    const { error } = await supabaseServer.storage
      .from('product-images')
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};
