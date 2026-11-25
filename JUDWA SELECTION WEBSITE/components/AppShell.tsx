'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import MobileBottomNav from './MobileBottomNav';
import { loadThemeColor, applyThemeColor } from '@/lib/themeSettings';
import { syncSettingsFromServer } from '@/lib/settingsSync';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  useEffect(() => {
    applyThemeColor(loadThemeColor());
    syncSettingsFromServer().then(() => applyThemeColor(loadThemeColor()));
  }, []);

  return (
    <>
      <div className={isAdmin ? '' : 'pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0'}>{children}</div>
      {!isAdmin && <MobileBottomNav />}
    </>
  );
}
