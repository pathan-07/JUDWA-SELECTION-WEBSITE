'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Megaphone, Save, Plus, Trash2 } from 'lucide-react';
import {
  AnnouncementSettings,
  DEFAULT_ANNOUNCEMENT_SETTINGS,
  buildAnnouncements,
  loadAnnouncementSettings,
  saveAnnouncementSettings,
} from '@/lib/announcementSettings';
import { DEFAULT_SHIPPING_SETTINGS, freeShippingText, loadShippingSettings } from '@/lib/shippingSettings';

const MAX_LENGTH = 60;

export default function AdminAnnouncementSettingsPage() {
  const [settings, setSettings] = useState<AnnouncementSettings>(DEFAULT_ANNOUNCEMENT_SETTINGS);
  const [freeShippingLine, setFreeShippingLine] = useState(freeShippingText(DEFAULT_SHIPPING_SETTINGS));

  useEffect(() => {
    setSettings(loadAnnouncementSettings());
    setFreeShippingLine(freeShippingText(loadShippingSettings()));
  }, []);

  const updateMessage = (index: number, value: string) => {
    setSettings(prev => ({
      ...prev,
      messages: prev.messages.map((m, i) => (i === index ? value.slice(0, MAX_LENGTH) : m)),
    }));
  };

  const addMessage = () => {
    setSettings(prev => ({ ...prev, messages: [...prev.messages, ''] }));
  };

  const removeMessage = (index: number) => {
    setSettings(prev => ({ ...prev, messages: prev.messages.filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
    const cleaned = { ...settings, messages: settings.messages.map(m => m.trim()).filter(Boolean) };
    if (cleaned.enabled && buildAnnouncements(cleaned, freeShippingLine).length === 0) {
      toast.error('Add at least one line, or turn the announcement bar off');
      return;
    }
    saveAnnouncementSettings(cleaned);
    setSettings(cleaned);
    toast.success(cleaned.enabled ? 'Announcement bar updated' : 'Announcement bar hidden from website');
  };

  const preview = buildAnnouncements(settings, freeShippingLine);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="w-7 h-7 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Announcement Bar</h2>
          <p className="text-sm text-gray-600 mt-1">The running text line on the homepage, above or below the banner</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl space-y-6">
        {/* Show / hide */}
        <div className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-lg">
          <div>
            <p className="font-semibold text-gray-900">Show announcement bar</p>
            <p className="text-sm text-gray-600">
              {settings.enabled ? 'The running line is visible on the website' : 'The running line is hidden'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={e => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
          </label>
        </div>

        <div className={settings.enabled ? 'space-y-6' : 'space-y-6 opacity-50 pointer-events-none'}>
          {/* Position relative to the homepage banner */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Position on homepage</p>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: 'above', label: 'Above the banner', hint: 'Top of the page, under the menu' },
                { value: 'below', label: 'Below the banner', hint: 'Right after the big banner image' },
              ] as const).map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, position: option.value }))}
                  aria-pressed={settings.position === option.value}
                  className={`text-left p-3 rounded-lg border transition ${
                    settings.position === option.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <p className={`text-sm font-semibold ${settings.position === option.value ? 'text-blue-700' : 'text-gray-900'}`}>
                    {option.label}
                  </p>
                  <p className="text-xs text-gray-500">{option.hint}</p>
                </button>
              ))}
            </div>
          </div>
          {/* Free shipping line */}
          <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showFreeShipping}
              onChange={e => setSettings(prev => ({ ...prev, showFreeShipping: e.target.checked }))}
              className="mt-1 w-4 h-4 p-0"
            />
            <div>
              <p className="font-semibold text-gray-900">Show free-shipping line</p>
              <p className="text-sm text-gray-600">
                &ldquo;{freeShippingLine}&rdquo; — amount comes from Settings → Shipping Settings
              </p>
            </div>
          </label>

          {/* Custom lines */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Your messages</p>
            <div className="space-y-2">
              {settings.messages.map((message, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={e => updateMessage(index, e.target.value)}
                    placeholder="e.g. Diwali Sale – Flat 20% Off"
                    maxLength={MAX_LENGTH}
                    className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeMessage(index)}
                    aria-label="Remove message"
                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addMessage}
              className="mt-3 flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 hover:border-blue-500 text-gray-700 text-sm font-semibold rounded-lg transition"
            >
              <Plus className="w-4 h-4" /> Add message
            </button>
            <p className="text-xs text-gray-500 mt-2">Keep each message short (max {MAX_LENGTH} characters).</p>
          </div>
        </div>

        {/* Live preview */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Website preview</p>
          {preview.length > 0 ? (
            <div className="bg-ink-950 text-gold-300 text-center text-xs py-2 px-3 uppercase tracking-[0.18em] rounded">
              {preview.join('  ·  ')}
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 text-gray-500 text-center text-xs py-2 px-3 rounded">
              Announcement bar will not be shown
            </div>
          )}
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
