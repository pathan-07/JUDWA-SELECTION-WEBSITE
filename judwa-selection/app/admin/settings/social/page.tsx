'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Facebook, Instagram, Link2, MessageCircle, Plus, Save, Share2, Trash2, Twitter, Users, Youtube } from 'lucide-react';
import {
  DEFAULT_SOCIAL_LINKS,
  SocialLinks,
  loadSocialLinks,
  normalizeUrl,
  saveSocialLinks,
} from '@/lib/socialLinks';

type UrlKey = Exclude<keyof SocialLinks, 'custom' | 'whatsapp'>;

const URL_FIELDS: { key: UrlKey; label: string; placeholder: string; icon: React.ReactNode }[] = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/judwaselection', icon: <Instagram className="w-5 h-5" /> },
  { key: 'whatsappGroup', label: 'WhatsApp group / channel', placeholder: 'https://chat.whatsapp.com/...', icon: <Users className="w-5 h-5" /> },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/judwaselection', icon: <Facebook className="w-5 h-5" /> },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@judwaselection', icon: <Youtube className="w-5 h-5" /> },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/judwaselection', icon: <Twitter className="w-5 h-5" /> },
];

const inputClass =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export default function AdminSocialLinksPage() {
  const [links, setLinks] = useState<SocialLinks>(DEFAULT_SOCIAL_LINKS);

  useEffect(() => {
    setLinks(loadSocialLinks());
  }, []);

  const updateCustom = (index: number, patch: Partial<SocialLinks['custom'][number]>) =>
    setLinks(prev => ({ ...prev, custom: prev.custom.map((c, i) => (i === index ? { ...c, ...patch } : c)) }));

  const handleSave = () => {
    const next: SocialLinks = { ...links, whatsapp: links.whatsapp.trim(), custom: [] };

    for (const field of URL_FIELDS) {
      const raw = links[field.key].trim();
      const url = normalizeUrl(raw);
      if (raw && !url) {
        toast.error(`${field.label} link is not valid`);
        return;
      }
      next[field.key] = url;
    }

    if (next.whatsapp && next.whatsapp.replace(/\D/g, '').length < 10) {
      toast.error('WhatsApp number should have at least 10 digits');
      return;
    }

    for (const item of links.custom) {
      const label = item.label.trim();
      const raw = item.url.trim();
      if (!label && !raw) continue;
      const url = normalizeUrl(raw);
      if (!label || !url) {
        toast.error('Each extra link needs a name and a valid URL');
        return;
      }
      next.custom.push({ label, url });
    }

    saveSocialLinks(next);
    setLinks(next);
    toast.success('Social links saved — website footer updated');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Share2 className="w-7 h-7 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Social Links</h2>
          <p className="text-sm text-gray-600 mt-1">Instagram, WhatsApp, YouTube and other links shown in the footer</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-xl space-y-5">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <MessageCircle className="w-5 h-5" /> WhatsApp chat number
          </label>
          <input
            type="tel"
            value={links.whatsapp}
            onChange={e => setLinks(prev => ({ ...prev, whatsapp: e.target.value }))}
            placeholder="+91 91041 28259"
            className={inputClass}
          />
          <p className="text-xs text-gray-500 mt-1">Customers tap the icon to start a WhatsApp chat with this number.</p>
        </div>

        {URL_FIELDS.map(field => (
          <div key={field.key}>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              {field.icon} {field.label}
            </label>
            <input
              value={links[field.key]}
              onChange={e => setLinks(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              className={inputClass}
            />
          </div>
        ))}

        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Link2 className="w-5 h-5" /> Extra links (optional)
          </p>
          <div className="space-y-2">
            {links.custom.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={item.label}
                  onChange={e => updateCustom(index, { label: e.target.value })}
                  placeholder="Name (e.g. Telegram)"
                  maxLength={30}
                  className={`${inputClass} w-2/5`}
                />
                <input
                  value={item.url}
                  onChange={e => updateCustom(index, { url: e.target.value })}
                  placeholder="https://..."
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setLinks(prev => ({ ...prev, custom: prev.custom.filter((_, i) => i !== index) }))}
                  aria-label="Remove link"
                  className="px-3 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setLinks(prev => ({ ...prev, custom: [...prev.custom, { label: '', url: '' }] }))}
            className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add link
          </button>
        </div>

        <p className="text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-3">
          Leave a box empty to hide that icon. Only filled links appear on the website.
        </p>

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
