'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CreditCard, Save } from 'lucide-react';
import {
  PaymentSettings,
  loadPaymentSettings,
  savePaymentSettings,
} from '@/lib/paymentSettings';

export default function AdminPaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({ codEnabled: true, codCharge: 100 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings(loadPaymentSettings());
  }, []);

  const handleSave = () => {
    setSaving(true);
    savePaymentSettings(settings);
    toast.success('Payment settings saved');
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-7 h-7 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Control Cash on Delivery and related charges</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-xl space-y-6">
        {/* COD Toggle */}
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-semibold text-gray-900">Cash on Delivery (COD)</p>
            <p className="text-sm text-gray-600">
              {settings.codEnabled
                ? 'Customers can pay cash when the order is delivered'
                : 'COD is hidden — customers must pay online'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.codEnabled}
              onChange={e => setSettings(prev => ({ ...prev, codEnabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
          </label>
        </div>

        {/* COD Charge */}
        <div className={settings.codEnabled ? '' : 'opacity-50 pointer-events-none'}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">COD Charge (₹)</label>
          <input
            type="number"
            value={settings.codCharge}
            onChange={e => setSettings(prev => ({ ...prev, codCharge: parseFloat(e.target.value) || 0 }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={0}
          />
          <p className="text-xs text-gray-500 mt-1">
            Added to the order total automatically whenever a customer chooses COD.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center gap-2 transition"
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>
    </div>
  );
}
