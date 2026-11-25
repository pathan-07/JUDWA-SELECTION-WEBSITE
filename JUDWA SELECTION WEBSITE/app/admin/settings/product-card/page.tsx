'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LayoutTemplate, RotateCcw, Save, Star } from 'lucide-react';
import {
  DEFAULT_PRODUCT_CARD_SETTINGS,
  ProductCardSettings,
  buttonClasses,
  cardClasses,
  discountPercent,
  imageClasses,
  infoClasses,
  loadProductCardSettings,
  saveProductCardSettings,
} from '@/lib/productCardSettings';

type ChoiceKey = 'style' | 'corners' | 'imageShape' | 'align' | 'buttonStyle';
type ToggleKey = 'showCategory' | 'showRating' | 'showDiscount' | 'showButton';

const CHOICES: { key: ChoiceKey; label: string; options: { value: string; label: string }[] }[] = [
  {
    key: 'style',
    label: 'Card style',
    options: [
      { value: 'bordered', label: 'Border' },
      { value: 'shadow', label: 'Shadow' },
      { value: 'minimal', label: 'Minimal' },
    ],
  },
  {
    key: 'corners',
    label: 'Corners',
    options: [
      { value: 'square', label: 'Sharp' },
      { value: 'rounded', label: 'Rounded' },
    ],
  },
  {
    key: 'imageShape',
    label: 'Image shape',
    options: [
      { value: 'square', label: 'Square 1:1' },
      { value: 'portrait', label: 'Tall 3:4' },
    ],
  },
  {
    key: 'align',
    label: 'Text alignment',
    options: [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
    ],
  },
  {
    key: 'buttonStyle',
    label: 'Button style',
    options: [
      { value: 'filled', label: 'Filled' },
      { value: 'outline', label: 'Outline' },
    ],
  },
];

const TOGGLES: { key: ToggleKey; label: string }[] = [
  { key: 'showCategory', label: 'Show category name' },
  { key: 'showRating', label: 'Show star rating' },
  { key: 'showDiscount', label: 'Show "% off"' },
  { key: 'showButton', label: 'Show button' },
];

const PREVIEW = {
  name: 'Blue Cotton T-Shirt',
  category: 'Boys',
  price: 499,
  mrp: 799,
  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
};

export default function AdminProductCardSettingsPage() {
  const [settings, setSettings] = useState<ProductCardSettings>(DEFAULT_PRODUCT_CARD_SETTINGS);

  useEffect(() => {
    setSettings(loadProductCardSettings());
  }, []);

  const handleSave = () => {
    const next = { ...settings, buttonText: settings.buttonText.trim() || DEFAULT_PRODUCT_CARD_SETTINGS.buttonText };
    saveProductCardSettings(next);
    setSettings(next);
    toast.success('Product card design saved');
  };

  const handleReset = () => {
    setSettings(DEFAULT_PRODUCT_CARD_SETTINGS);
    toast.info('Default design restored — click Save to apply');
  };

  const off = discountPercent(PREVIEW.price, PREVIEW.mrp);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <LayoutTemplate className="w-7 h-7 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Card Design</h2>
          <p className="text-sm text-gray-600 mt-1">How products look on the homepage and the All Products page</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6 max-w-5xl">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-5">
          {CHOICES.map(choice => (
            <div key={choice.key}>
              <p className="text-sm font-semibold text-gray-700 mb-2">{choice.label}</p>
              <div className="flex flex-wrap gap-2">
                {choice.options.map(option => {
                  const active = settings[choice.key] === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, [choice.key]: option.value }))}
                      className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
                        active ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            {TOGGLES.map(toggle => (
              <label key={toggle.key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[toggle.key]}
                  onChange={e => setSettings(prev => ({ ...prev, [toggle.key]: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">{toggle.label}</span>
              </label>
            ))}
          </div>

          {settings.showButton && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Button text</label>
              <input
                value={settings.buttonText}
                onChange={e => setSettings(prev => ({ ...prev, buttonText: e.target.value }))}
                maxLength={20}
                placeholder="Add to Cart"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
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

        {/* Live preview */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Preview</p>
          <div className="bg-cream p-4 rounded-lg">
            <div className={`${cardClasses(settings)} flex flex-col`}>
              <div className={`relative ${imageClasses(settings)} bg-ink-50 overflow-hidden`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PREVIEW.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className={`${infoClasses(settings)} flex flex-col`}>
                {settings.showCategory && (
                  <p className="text-[10px] font-semibold text-gold-600 uppercase tracking-wide mb-1">{PREVIEW.category}</p>
                )}
                <h3 className="font-serif text-base font-semibold text-ink-900 mb-2">{PREVIEW.name}</h3>
                {settings.showRating && (
                  <div className="flex text-gold-500 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                )}
                <div className={`flex flex-wrap items-baseline gap-x-2 mb-3 ${settings.align === 'center' ? 'justify-center' : ''}`}>
                  <span className="text-lg font-serif font-semibold text-ink-900">₹{PREVIEW.price}</span>
                  <span className="text-xs text-gray-500 line-through">₹{PREVIEW.mrp}</span>
                  {settings.showDiscount && <span className="text-xs font-semibold text-gold-600">{off}% off</span>}
                </div>
                {settings.showButton && (
                  <span
                    className={`block w-full px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide ${buttonClasses(settings)}`}
                  >
                    {settings.buttonText || DEFAULT_PRODUCT_CARD_SETTINGS.buttonText}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
