'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Save, ShoppingBag, Trash2 } from 'lucide-react';
import {
  StoreSettings,
  DEFAULT_STORE_SETTINGS,
  loadStoreSettings,
  saveStoreSettings,
} from '@/lib/storeSettings';

const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function AdminStoreSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    setSettings(loadStoreSettings());
  }, []);

  const update = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const updatePhone = (index: number, value: string) =>
    update('phones', settings.phones.map((p, i) => (i === index ? value : p)));

  const handleSave = () => {
    const cleaned: StoreSettings = {
      storeName: settings.storeName.trim(),
      tagline: settings.tagline.trim(),
      phones: settings.phones.map(p => p.trim()).filter(Boolean),
      email: settings.email.trim(),
      address: settings.address.trim(),
    };
    if (!cleaned.storeName) {
      toast.error('Store name is required');
      return;
    }
    if (cleaned.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned.email)) {
      toast.error('Please enter a valid email');
      return;
    }
    saveStoreSettings(cleaned);
    setSettings(cleaned);
    toast.success('Store details saved — website footer updated');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="w-7 h-7 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Store Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Store name, contact details and address shown on the website</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-xl space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Store name</label>
          <input value={settings.storeName} onChange={e => update('storeName', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">About line (footer)</label>
          <textarea
            value={settings.tagline}
            onChange={e => update('tagline', e.target.value)}
            rows={2}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone numbers</label>
          <div className="space-y-2">
            {settings.phones.map((phone, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={e => updatePhone(index, e.target.value)}
                  placeholder="+91 98765 43210"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => update('phones', settings.phones.filter((_, i) => i !== index))}
                  aria-label="Remove phone"
                  className="px-3 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => update('phones', [...settings.phones, ''])}
            className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add phone
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
          <input type="email" value={settings.email} onChange={e => update('email', e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Store address</label>
          <textarea
            value={settings.address}
            onChange={e => update('address', e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>
    </div>
  );
}
