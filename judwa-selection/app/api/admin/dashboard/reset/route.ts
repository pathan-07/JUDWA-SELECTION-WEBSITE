import { NextResponse } from 'next/server';
import { resetStatsNow } from '@/lib/statsReset';

// Starts dashboard/analytics counting from now (protected by proxy.ts). No orders are deleted.
export async function POST() {
  try {
    await resetStatsNow();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting dashboard stats:', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
