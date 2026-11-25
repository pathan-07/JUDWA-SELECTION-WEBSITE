'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { LayoutGrid, RotateCcw, Save } from 'lucide-react';
import CategoryCards, { CategoryCardItem } from '@/components/CategoryCards';
import {
  CategoryCardSettings,
  DEFAULT_CATEGORY_CARD_SETTINGS,
  loadCategoryCardSettings,
  saveCategoryCardSettings,
} from '@/lib/categoryCardSettings';

type Key = keyof CategoryCardSettings;

const CHOICES: { key: Key; label: string; options: { value: string; label: string }[]; hint?: string }[] = [
  {
    key: 'shape',
    label: 'Shape',
    options: [
      { value: 'portrait', label: 'Tall card 3:4' },
      { value: 'square', label: 'Square' },
      { value: 'circle', label: 'Circle' },
    ],
  },
  {
    key: 'size',
    label: 'Size',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
    ],
  },
  {
    key: 'style',
    label: 'Card style',
    hint: 'Not used for circles',
    options: [
      { value: 'bordered', label: 'Border' },
      { value: 'shadow', label: 'Shadow' },
      { value: 'minimal', label: 'Minimal' },
    ],
  },
  {
    key: 'corners',
    label: 'Corners',
    hint: 'Not used for circles',
    options: [
      { value: 'square', label: 'Sharp' },
      { value: 'rounded', label: 'Rounded' },
    ],
  },
  {
    key: 'label',
    label: 'Category name',
    hint: 'Circles always show the name below',
    options: [
      { value: 'below', label: 'Below image' },
      { value: 'overlay', label: 'On the image' },
    ],
  },
  {
    key: 'mobileLayout',
    label: 'On mobile',
    options: [
      { value: 'scroll', label: 'Swipe in one row' },
      { value: 'grid', label: 'Show all in rows' },
    ],
  },
];

const PREVIEW_ITEMS: CategoryCardItem[] = [
  { label: 'Boys', href: '#boys', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&h=533&fit=crop' },
  { label: 'Baby', href: '#baby', image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&h=533&fit=crop' },
  { label: 'School Uniforms', href: '#uniforms', image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=533&fit=crop' },
  { label: 'T-Shirts', href: '#tshirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=533&fit=crop' },
];

export default function AdminCategoryCardSettingsPage() {
  const [settings, setSettings] = useState<CategoryCardSettings>(DEFAULT_CATEGORY_CARD_SETTINGS);

  useEffect(() => {
    setSettings(loadCategoryCardSettings());
  }, []);

  const handleSave = () => {
    saveCategoryCardSettings(settings);
    toast.success('Category card design saved');
  };

  const handleReset = () => {
    setSettings(DEFAULT_CATEGORY_CARD_SETTINGS);
    toast.info('Default design restored — click Save to apply');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <LayoutGrid className="w-7 h-7 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Category Card Design</h2>
          <p className="text-sm text-gray-600 mt-1">Shape and style of the category cards on the homepage</p>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-5">
          {CHOICES.map(choice => (
            <div key={choice.key}>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {choice.label}
                {choice.hint && <span className="ml-2 text-xs font-normal text-gray-400">({choice.hint})</span>}
              </p>
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

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Preview</p>
          <div className="bg-cream p-4 rounded-lg overflow-hidden">
            <CategoryCards items={PREVIEW_ITEMS} settings={settings} />
          </div>
        </div>
      </div>
    </div>
  );
}
