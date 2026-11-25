// Keeps admin settings the same on every device: pulls them from the database on page load,
// and pushes each change the admin saves.
import { toast } from 'sonner';
import { SYNCED_SETTING_KEYS, SettingsMap, SyncedSettingKey } from './settingsKeys';

let syncPromise: Promise<SettingsMap | null> | null = null;

/** Copies the database settings into localStorage (listeners are notified on change). Resolves with the server map. */
export function syncSettingsFromServer(): Promise<SettingsMap | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  syncPromise ??= (async () => {
    try {
      const res = await fetch('/api/content/settings', { cache: 'no-store' });
      if (!res.ok) return null;
      const { value } = (await res.json()) as { value: SettingsMap | null };
      const map = value ?? {};
      let changed = false;
      for (const key of SYNCED_SETTING_KEYS) {
        const raw = map[key];
        if (typeof raw === 'string' && localStorage.getItem(key) !== raw) {
          localStorage.setItem(key, raw);
          changed = true;
        }
      }
      if (changed) window.dispatchEvent(new Event('storage'));
      return map;
    } catch {
      return null;
    }
  })();
  return syncPromise;
}

/** Admin only: uploads settings saved in this browser before database sync existed. */
export async function uploadLocalOnlySettings(serverMap: SettingsMap) {
  for (const key of SYNCED_SETTING_KEYS) {
    if (serverMap[key] === undefined && localStorage.getItem(key) !== null) {
      await pushSetting(key);
    }
  }
}

/** Saves one setting (already written to localStorage) to the database. */
export async function pushSetting(key: SyncedSettingKey) {
  if (typeof window === 'undefined') return;
  try {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: localStorage.getItem(key) }),
    });
    if (res.status === 401) {
      toast.error('Your admin session expired. Please log in again — this setting was not saved for customers.');
    } else if (!res.ok) {
      toast.error('Saved on this device only — could not reach the database. Please try again.');
    }
  } catch {
    toast.error('Saved on this device only — could not reach the database. Please try again.');
  }
}
