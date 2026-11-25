'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PanelBottom, RotateCcw, Save } from 'lucide-react';
import {
  DEFAULT_FOOTER_SETTINGS,
  FOOTER_HELP_LINKS,
  FOOTER_POLICY_LINKS,
  FOOTER_SHOP_LINKS,
  FooterLink,
  FooterSectionKey,
  FooterSettings,
  loadFooterSettings,
  saveFooterSettings,
} from '@/lib/footerSettings';

const SECTIONS: { key: FooterSectionKey; label: string; hint: string }[] = [
  { key: 'showNewsletter', label: 'Stay Updated (WhatsApp)', hint: 'WhatsApp offers box at the top of the footer (uses your WhatsApp group or number from Social Links)' },
  { key: 'showAbout', label: 'Store name & about line', hint: 'Edit text in Settings → Store Settings' },
  { key: 'showSocialIcons', label: 'Social media icons', hint: 'Facebook / Instagram / X icons under the about line' },
  { key: 'showShop', label: '"Shop" column', hint: 'Home, Boys, Girls, Baby...' },
  { key: 'showHelp', label: '"Help & Support" column', hint: 'Track Order, Returns, FAQ...' },
  { key: 'showContact', label: '"Contact" column', hint: 'Phone, email, address from Store Settings' },
  { key: 'showCopyright', label: 'Copyright line', hint: '© Store name. All rights reserved.' },
  { key: 'showPolicies', label: 'Policy links', hint: 'Privacy, Terms, Shipping policy' },
];

const LINK_GROUPS: { title: string; section: FooterSectionKey; links: FooterLink[] }[] = [
  { title: 'Shop column links', section: 'showShop', links: FOOTER_SHOP_LINKS },
  { title: 'Help & Support links', section: 'showHelp', links: FOOTER_HELP_LINKS },
  { title: 'Policy links', section: 'showPolicies', links: FOOTER_POLICY_LINKS },
];

function Switch({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition ${on ? 'bg-blue-600' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  );
}

export default function AdminFooterSettingsPage() {
  const [settings, setSettings] = useState<FooterSettings>(DEFAULT_FOOTER_SETTINGS);

  useEffect(() => {
    setSettings(loadFooterSettings());
  }, []);

  const toggleSection = (key: FooterSectionKey) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleLink = (id: string) =>
    setSettings(prev => ({
      ...prev,
      hiddenLinks: prev.hiddenLinks.includes(id) ? prev.hiddenLinks.filter(x => x !== id) : [...prev.hiddenLinks, id],
    }));

  const hideMissingPages = () =>
    setSettings(prev => ({
      ...prev,
      hiddenLinks: Array.from(
        new Set([
          ...prev.hiddenLinks,
          ...[...FOOTER_SHOP_LINKS, ...FOOTER_HELP_LINKS, ...FOOTER_POLICY_LINKS].filter(l => !l.pageExists).map(l => l.id),
        ])
      ),
    }));

  const handleSave = () => {
    saveFooterSettings(settings);
    toast.success('Footer settings saved');
  };

  const handleReset = () => {
    setSettings(DEFAULT_FOOTER_SETTINGS);
    toast.info('Default footer restored — click Save to apply');
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <PanelBottom className="w-7 h-7 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Footer Settings</h2>
          <p className="text-sm text-gray-600 mt-1">Choose what to show at the bottom of the website</p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        <div className="bg-white rounded-lg shadow-md divide-y divide-gray-100">
          {SECTIONS.map(section => (
            <div key={section.key} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold text-gray-900">{section.label}</p>
                <p className="text-xs text-gray-500">{section.hint}</p>
              </div>
              <Switch on={settings[section.key]} onToggle={() => toggleSection(section.key)} label={section.label} />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-gray-900">Individual links</h3>
          <button
            type="button"
            onClick={hideMissingPages}
            className="px-3 py-1.5 text-sm font-semibold text-amber-700 border border-amber-300 bg-amber-50 rounded-lg hover:bg-amber-100"
          >
            Hide links whose page is not ready
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {LINK_GROUPS.map(group => (
            <div
              key={group.title}
              className={`bg-white rounded-lg shadow-md p-4 ${settings[group.section] ? '' : 'opacity-50'}`}
            >
              <p className="text-sm font-bold text-gray-700 mb-3">{group.title}</p>
              <div className="space-y-3">
                {group.links.map(link => (
                  <div key={link.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900">{link.label}</p>
                      {!link.pageExists && <p className="text-[11px] text-amber-600">Page not ready (404)</p>}
                    </div>
                    <Switch
                      on={!settings.hiddenLinks.includes(link.id)}
                      onToggle={() => toggleLink(link.id)}
                      label={link.label}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
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
