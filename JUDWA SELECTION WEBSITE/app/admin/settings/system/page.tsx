'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ChevronRight, CreditCard, Save, Truck, Zap } from 'lucide-react';
import {
  TaxSettings,
  DEFAULT_TAX_SETTINGS,
  GST_RATES,
  isValidGstin,
  loadTaxSettings,
  saveTaxSettings,
} from '@/lib/taxSettings';

export default function AdminSystemSettingsPage() {
  const [settings, setSettings] = useState<TaxSettings>(DEFAULT_TAX_SETTINGS);

  useEffect(() => {
    setSettings(loadTaxSettings());
  }, []);

  const handleSave = () => {
    const gstin = settings.gstin.trim().toUpperCase();
    if (gstin && !isValidGstin(gstin)) {
      toast.error('GSTIN looks invalid. It should be 15 characters, e.g. 24ABCDE1234F1Z5');
      return;
    }
    const cleaned = { ...settings, gstin, showGstinInFooter: settings.showGstinInFooter && Boolean(gstin) };
    saveTaxSettings(cleaned);
    setSettings(cleaned);
    toast.success('Tax settings saved');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-7 h-7 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Payment gateway, shipping and GST</p>
        </div>
      </div>

      <div className="max-w-xl space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            href="/admin/settings/payment"
            className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3 hover:shadow-lg transition"
          >
            <CreditCard className="w-6 h-6 text-blue-600" />
            <span className="flex-1 font-semibold text-gray-900">Payment Settings</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
          <Link
            href="/admin/settings/shipping"
            className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3 hover:shadow-lg transition"
          >
            <Truck className="w-6 h-6 text-blue-600" />
            <span className="flex-1 font-semibold text-gray-900">Shipping Settings</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-5">
          <h3 className="text-lg font-bold text-gray-900">GST / Tax</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">GSTIN</label>
            <input
              value={settings.gstin}
              onChange={e => setSettings(prev => ({ ...prev, gstin: e.target.value.toUpperCase() }))}
              placeholder="24ABCDE1234F1Z5"
              maxLength={15}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg uppercase focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty if you are not GST registered.</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">GST rate on clothing (%)</label>
            <select
              value={settings.gstRate}
              onChange={e => setSettings(prev => ({ ...prev, gstRate: Number(e.target.value) }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {GST_RATES.map(rate => (
                <option key={rate} value={rate}>
                  {rate}%
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showGstinInFooter}
              onChange={e => setSettings(prev => ({ ...prev, showGstinInFooter: e.target.checked }))}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-700">Show GSTIN in the website footer</span>
          </label>

          <p className="text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
            Product prices are treated as GST-inclusive, so checkout totals do not change. The rate is saved for your records.
          </p>

          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
