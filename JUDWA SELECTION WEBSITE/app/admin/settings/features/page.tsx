'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LayoutGrid, RotateCcw, Save } from 'lucide-react';
import {
  AMOUNT_TOKEN,
  DEFAULT_FEATURE_STRIP,
  FEATURE_ICONS,
  FeatureIconKey,
  FeatureItem,
  FeatureStripSettings,
  loadFeatureStrip,
  resolveFeatureText,
  saveFeatureStrip,
} from '@/lib/featureStripSettings';
import { DEFAULT_SHIPPING_SETTINGS, loadShippingSettings } from '@/lib/shippingSettings';

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function AdminFeatureStripPage() {
  const [settings, setSettings] = useState<FeatureStripSettings>(DEFAULT_FEATURE_STRIP);
  const [freeShippingAbove, setFreeShippingAbove] = useState(DEFAULT_SHIPPING_SETTINGS.freeShippingAbove);

  useEffect(() => {
    setSettings(loadFeatureStrip());
    setFreeShippingAbove(loadShippingSettings().freeShippingAbove);
  }, []);

  const updateItem = (index: number, patch: Partial<FeatureItem>) =>
    setSettings(prev => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));

  const handleSave = () => {
    const items = settings.items.map(item => ({ ...item, title: item.title.trim(), subtitle: item.subtitle.trim() }));
    if (settings.enabled && items.some(item => !item.title)) {
      toast.error('Every box needs a heading');
      return;
    }
    const next = { ...settings, items };
    saveFeatureStrip(next);
    setSettings(next);
    toast.success('Homepage highlights saved');
  };

  const handleReset = () => {
    setSettings(DEFAULT_FEATURE_STRIP);
    toast.info('Default text restored — click Save to apply');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <LayoutGrid className="w-7 h-7 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Homepage Highlights</h2>
          <p className="text-sm text-gray-600 mt-1">The 3 boxes shown below &quot;View All Collection&quot; on the homepage</p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        <label className="bg-white rounded-lg shadow-md p-5 flex items-center justify-between gap-4 cursor-pointer">
          <div>
            <p className="font-semibold text-gray-900">Show on homepage</p>
            <p className="text-sm text-gray-600">Turn off to hide all 3 boxes</p>
          </div>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={e => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
            className="w-5 h-5"
          />
        </label>

        <div className="grid md:grid-cols-3 gap-4">
          {settings.items.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Box {index + 1}</p>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Icon</label>
                <div className="grid grid-cols-6 gap-1">
                  {(Object.keys(FEATURE_ICONS) as FeatureIconKey[]).map(key => {
                    const Icon = FEATURE_ICONS[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => updateItem(index, { icon: key })}
                        aria-label={key}
                        className={`p-1.5 rounded-md border flex items-center justify-center ${
                          item.icon === key ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Heading</label>
                <input
                  value={item.title}
                  onChange={e => updateItem(index, { title: e.target.value })}
                  maxLength={40}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Small text</label>
                <input
                  value={item.subtitle}
                  onChange={e => updateItem(index, { subtitle: e.target.value })}
                  maxLength={60}
                  className={inputClass}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
          Tip: write <code className="bg-white px-1 rounded">{AMOUNT_TOKEN}</code> to show the free-shipping amount from
          Shipping Settings (currently ₹{freeShippingAbove.toLocaleString('en-IN')}).
        </p>

        {/* Live preview */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Preview</p>
          <div className={`grid grid-cols-3 gap-px bg-ink-100 border border-ink-100 ${settings.enabled ? '' : 'opacity-40'}`}>
            {settings.items.map((item, index) => {
              const Icon = FEATURE_ICONS[item.icon];
              return (
                <div key={index} className="flex flex-col md:flex-row items-center text-center md:text-left gap-2 md:gap-3 p-3 bg-white">
                  <Icon className="w-7 h-7 text-gold-600 flex-shrink-0" />
                  <div>
                    <p className="font-serif text-sm font-semibold text-ink-900">{item.title}</p>
                    <p className="text-xs text-gray-600">{resolveFeatureText(item.subtitle, freeShippingAbove)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" /> Save Settings
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg flex items-center gap-2 transition"
          >
            <RotateCcw className="w-4 h-4" /> Reset to default
          </button>
        </div>
      </div>
    </div>
  );
}
