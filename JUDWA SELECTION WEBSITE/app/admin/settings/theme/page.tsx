'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Palette } from 'lucide-react';
import Link from 'next/link';
import { DEFAULT_THEME_COLOR, loadThemeColor, saveThemeColor, applyThemeColor } from '@/lib/themeSettings';

const PRESET_COLORS = [
  { name: 'Blue (Default)', value: '#2563eb' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Red', value: '#dc2626' },
];

export default function ThemeSettingsPage() {
  const [color, setColor] = useState(DEFAULT_THEME_COLOR);

  useEffect(() => {
    setColor(loadThemeColor());
  }, []);

  const handlePreview = (next: string) => {
    setColor(next);
    applyThemeColor(next);
  };

  const handleSave = () => {
    saveThemeColor(color);
    toast.success('Theme color saved! Your storefront now reflects the new brand color.');
  };

  const handleReset = () => {
    handlePreview(DEFAULT_THEME_COLOR);
    saveThemeColor(DEFAULT_THEME_COLOR);
    toast.success('Theme reset to default blue');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/settings">
              <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900 cursor-pointer" />
            </Link>
            <div className="flex items-center gap-3">
              <Palette className="w-7 h-7 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Theme Settings</h1>
                <p className="text-sm text-gray-600 mt-1">Change your storefront&apos;s brand color</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Front-End Color</h2>

          <div className="flex items-center gap-4 mb-6">
            <input
              type="color"
              value={color}
              onChange={e => handlePreview(e.target.value)}
              className="w-16 h-16 rounded-lg border border-gray-300 cursor-pointer"
            />
            <div>
              <p className="font-semibold text-gray-900">{color}</p>
              <p className="text-sm text-gray-500">Applies to the logo and primary buttons on your site</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Quick Presets</p>
            <div className="flex flex-wrap gap-3">
              {PRESET_COLORS.map(preset => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handlePreview(preset.value)}
                  className={`w-10 h-10 rounded-full border-2 transition ${
                    color.toLowerCase() === preset.value.toLowerCase() ? 'border-gray-900 scale-110' : 'border-white shadow'
                  }`}
                  style={{ backgroundColor: preset.value }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Save Theme
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
