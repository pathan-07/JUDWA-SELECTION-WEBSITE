import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE, SESSION_DAYS, createAdminToken, isCorrectAdminPassword } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  const { password } = await request.json().catch(() => ({ password: null }));

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Admin login is not configured (set ADMIN_PASSWORD and ADMIN_SECRET_KEY)' }, { status: 503 });
  }

  if (!isCorrectAdminPassword(password)) {
    // Slow down password guessing
    await new Promise(resolve => setTimeout(resolve, 800));
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, createAdminToken()!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && request.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  return response;
}
