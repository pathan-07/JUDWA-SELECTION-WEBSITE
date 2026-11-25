'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Truck, Save } from 'lucide-react';
import {
  ShippingSettings,
  DEFAULT_SHIPPING_SETTINGS,
  loadShippingSettings,
  saveShippingSettings,
  freeShippingText,
} from '@/lib/shippingSettings';

export default function AdminShippingSettingsPage() {
  const [settings, setSettings] = useState<ShippingSettings>(DEFAULT_SHIPPING_SETTINGS);

  useEffect(() => {
    setSettings(loadShippingSettings());
  }, []);

  const handleSave = () => {
    if (settings.freeShippingAbove < 0 || settings.shippingCharge < 0) {
      toast.error('Amounts cannot be negative');
      return;
    }
    saveShippingSettings(settings);
    toast.success('Shipping settings saved — website banner updated');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Truck className="w-7 h-7 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shipping Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Set the free-shipping amount and delivery charge</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-xl space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Free Shipping on orders above (₹)
          </label>
          <input
            type="number"
            value={settings.freeShippingAbove}
            onChange={e => setSettings(prev => ({ ...prev, freeShippingAbove: parseFloat(e.target.value) || 0 }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={0}
          />
          <p className="text-xs text-gray-500 mt-1">
            Orders at or above this amount get free delivery. Set 0 to make shipping free on every order.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Shipping charge below that amount (₹)
          </label>
          <input
            type="number"
            value={settings.shippingCharge}
            onChange={e => setSettings(prev => ({ ...prev, shippingCharge: parseFloat(e.target.value) || 0 }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={0}
          />
        </div>

        {/* Live preview of the storefront announcement bar */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Website banner preview</p>
          <div className="bg-ink-950 text-gold-300 text-center text-xs py-2 px-3 uppercase tracking-[0.18em] rounded">
            {freeShippingText(settings)}
          </div>
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
