import { NextRequest, NextResponse } from 'next/server';
import { getContent, setContent } from '@/lib/siteContent';
import { SettingsMap, isSyncedSettingKey } from '@/lib/settingsKeys';

const MAX_VALUE_LENGTH = 50_000;

// Saves one admin setting into the shared settings document (protected by proxy.ts)
export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const key = body?.key;
  const value = body?.value;
  if (typeof key !== 'string' || !isSyncedSettingKey(key)) {
    return NextResponse.json({ error: 'Unknown setting' }, { status: 400 });
  }
  if (value !== null && (typeof value !== 'string' || value.length > MAX_VALUE_LENGTH)) {
    return NextResponse.json({ error: 'Invalid value' }, { status: 400 });
  }

  try {
    const current = (await getContent<SettingsMap>('settings')) ?? {};
    const next: SettingsMap = { ...current };
    if (value === null) delete next[key];
    else next[key] = value;
    await setContent('settings', next);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving setting:', error);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
