import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseServer } from '@/lib/supabase';

const BUCKET = 'media';
const ALLOWED_TYPES = /^(image\/(jpeg|png|webp|gif|avif)|video\/(mp4|webm|quicktime))$/;
const FOLDERS = ['products', 'banners', 'reels', 'collections', 'uniforms', 'combos', 'reviews'];

// Returns a one-time signed URL so the admin's browser uploads directly to storage
// (large videos never pass through this server). Protected by proxy.ts.
export async function POST(request: NextRequest) {
  const { contentType, folder } = await request.json().catch(() => ({}));

  if (typeof contentType !== 'string' || !ALLOWED_TYPES.test(contentType)) {
    return NextResponse.json({ error: 'Only images (JPG, PNG, WEBP, GIF) and videos (MP4, WEBM, MOV) are allowed' }, { status: 400 });
  }
  const safeFolder = FOLDERS.includes(folder) ? folder : 'misc';
  const extension = contentType.split('/')[1].replace('quicktime', 'mov').replace('jpeg', 'jpg');
  const path = `${safeFolder}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`;

  try {
    const { data, error } = await supabaseServer.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) throw error;
    const { data: publicData } = supabaseServer.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ path, token: data.token, publicUrl: publicData.publicUrl });
  } catch (error) {
    console.error('Error creating upload URL:', error);
    return NextResponse.json({ error: 'Storage unavailable' }, { status: 503 });
  }
}
