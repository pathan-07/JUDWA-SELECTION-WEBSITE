import { supabase } from './supabase';

type MediaFolder = 'products' | 'banners' | 'reels' | 'collections' | 'uniforms' | 'combos' | 'reviews';

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads an admin-selected image/video to Supabase Storage and returns its public URL.
 * Until a database is connected, returns a data URL so the admin panel still works locally.
 */
export async function uploadMedia(file: File, folder: MediaFolder): Promise<string> {
  let res: Response | null = null;
  try {
    res = await fetch('/api/admin/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType: file.type, folder }),
    });
  } catch {
    res = null;
  }

  if (res?.ok) {
    const { path, token, publicUrl } = await res.json();
    const { error } = await supabase.storage.from('media').uploadToSignedUrl(path, token, file, {
      contentType: file.type,
    });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    return publicUrl;
  }
  if (res?.status === 401) {
    throw new Error('Your admin session expired. Please log in again.');
  }
  if (res && res.status !== 503) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Upload failed');
  }

  return localFallback(file, folder);
}

// Phone photos are several MB; without a database they must fit in localStorage (~5MB total) and the 10MB request limit
async function compressImageToDataUrl(file: File, maxSide = 1200, quality = 0.8): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return readAsDataUrl(file);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return readAsDataUrl(file);
  }
}

const MAX_LOCAL_VIDEO_BYTES = 2 * 1024 * 1024;

async function localFallback(file: File, folder: MediaFolder): Promise<string> {
  if (file.type.startsWith('image/')) return compressImageToDataUrl(file, folder === 'banners' ? 1920 : 1200);
  if (file.size > MAX_LOCAL_VIDEO_BYTES) {
    throw new Error('Video is too large to save without the database. Connect Supabase to upload videos.');
  }
  return readAsDataUrl(file);
}
