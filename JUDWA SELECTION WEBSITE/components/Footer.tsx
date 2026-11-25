'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, MessageCircle, Users } from 'lucide-react';
import { DEFAULT_SOCIAL_LINKS, loadSocialLinks, whatsappChatUrl } from '@/lib/socialLinks';
import { DEFAULT_STORE_SETTINGS, loadStoreSettings } from '@/lib/storeSettings';
import { DEFAULT_TAX_SETTINGS, loadTaxSettings } from '@/lib/taxSettings';
import {
  DEFAULT_FOOTER_SETTINGS,
  FOOTER_HELP_LINKS,
  FOOTER_POLICY_LINKS,
  FOOTER_SHOP_LINKS,
  loadFooterSettings,
  visibleLinks,
} from '@/lib/footerSettings';

const MD_COLS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

export default function Footer() {
  const [store, setStore] = useState(DEFAULT_STORE_SETTINGS);
  const [tax, setTax] = useState(DEFAULT_TAX_SETTINGS);
  const [footer, setFooter] = useState(DEFAULT_FOOTER_SETTINGS);
  const [social, setSocial] = useState(DEFAULT_SOCIAL_LINKS);

  useEffect(() => {
    const sync = () => {
      setStore(loadStoreSettings());
      setTax(loadTaxSettings());
      setFooter(loadFooterSettings());
      setSocial(loadSocialLinks());
    };
    sync();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const shopLinks = visibleLinks(FOOTER_SHOP_LINKS, footer);  const helpLinks = visibleLinks(FOOTER_HELP_LINKS, footer);
  const policyLinks = footer.showPolicies ? visibleLinks(FOOTER_POLICY_LINKS, footer) : [];
  const showShop = footer.showShop && shopLinks.length > 0;
  const showHelp = footer.showHelp && helpLinks.length > 0;
  const columnCount = [footer.showAbout, showShop, showHelp, footer.showContact].filter(Boolean).length;
  const showBottom = footer.showCopyright || policyLinks.length > 0 || (tax.showGstinInFooter && Boolean(tax.gstin));

  const socialIcons = [
    { label: 'WhatsApp', url: whatsappChatUrl(social.whatsapp), Icon: MessageCircle },
    { label: 'WhatsApp Group', url: social.whatsappGroup, Icon: Users },
    { label: 'Instagram', url: social.instagram, Icon: Instagram },
    { label: 'Facebook', url: social.facebook, Icon: Facebook },
    { label: 'YouTube', url: social.youtube, Icon: Youtube },
    { label: 'X (Twitter)', url: social.twitter, Icon: Twitter },
  ].filter(item => item.url);
  const hasSocial = socialIcons.length > 0 || social.custom.length > 0;
  // Offers are shared on WhatsApp (there is no email list)
  const updatesUrl = social.whatsappGroup || whatsappChatUrl(social.whatsapp);

  return (
    <footer className="bg-ink-950 text-gray-100">
      {/* Stay Updated */}
      {footer.showNewsletter && updatesUrl && (
      <div className="border-b border-ink-800">
        <div className="container py-10 sm:py-16">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
            <div>
              <h3 className="font-serif text-2xl font-semibold mb-2 text-white">Stay Updated</h3>
              <p className="text-gray-400">Get special offers and the latest from {store.storeName} on WhatsApp</p>
            </div>
            <div className="md:text-right">
              <a
                href={updatesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gold-600 hover:bg-gold-700 text-white hover:text-white px-6 py-3 font-medium tracking-wide transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                {social.whatsappGroup ? 'Join our WhatsApp group' : 'Chat on WhatsApp'}
              </a>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Main Footer Content */}
      <div className="container py-10 sm:py-12">
        {columnCount > 0 && (
        <div className={`grid grid-cols-2 ${MD_COLS[columnCount]} gap-x-6 gap-y-8 md:gap-8 ${showBottom ? 'mb-10 sm:mb-12' : ''}`}>
          {/* About */}
          {footer.showAbout && (
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-serif text-lg font-semibold mb-4 text-white">{store.storeName}</h4>
            <p className="text-gray-400 text-sm mb-4">{store.tagline}</p>
            {footer.showSocialIcons && hasSocial && (
            <div className="space-y-3">
              {socialIcons.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {socialIcons.map(({ label, url, Icon }) => (
                    <a
                      key={label}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="w-9 h-9 rounded-full border border-ink-700 flex items-center justify-center text-gray-300 hover:text-gold-400 hover:border-gold-500 transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              )}
              {social.custom.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {social.custom.map(link => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gold-400 transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            )}
          </div>
          )}

          {/* Shop */}
          {showShop && (
          <div>
            <h5 className="text-sm font-bold mb-4 uppercase tracking-wide text-white">Shop</h5>
            <ul className="space-y-2 text-sm">
              {shopLinks.map(link => (
                <li key={link.id}>
                  <Link href={link.href} className="text-gray-400 hover:text-gold-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          )}

          {/* Customer Service */}
          {showHelp && (
          <div>
            <h5 className="text-sm font-bold mb-4 uppercase tracking-wide text-white">Help & Support</h5>
            <ul className="space-y-2 text-sm">
              {helpLinks.map(link => (
                <li key={link.id}>
                  <Link href={link.href} className="text-gray-400 hover:text-gold-400 transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          )}

          {/* Contact */}
          {footer.showContact && (
          <div className="col-span-2 md:col-span-1">
            <h5 className="text-sm font-bold mb-4 uppercase tracking-wide text-white">Contact</h5>
            <div className="space-y-3 text-sm">
              {store.phones.length > 0 && (
                <div className="flex gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0 text-gold-500 mt-0.5" />
                  <div>
                    {store.phones.map(phone => (
                      <a key={phone} href={`tel:${phone.replace(/\s+/g, '')}`} className="block text-gray-400 hover:text-gold-400">
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {store.email && (
                <div className="flex gap-2 min-w-0">
                  <Mail className="h-4 w-4 flex-shrink-0 text-gold-500 mt-0.5" />
                  <a href={`mailto:${store.email}`} className="text-gray-400 hover:text-gold-400 break-all">{store.email}</a>
                </div>
              )}
              {store.address && (
                <div className="flex gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-gold-500 mt-0.5" />
                  <p className="text-gray-400 text-xs whitespace-pre-line">{store.address}</p>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
        )}

        {/* Bottom Footer */}
        {showBottom && (
        <div className={`${columnCount > 0 ? 'border-t border-ink-800 pt-8' : ''}`}>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
            <div>
              {footer.showCopyright && (
                <p className="text-gray-400">&copy; {new Date().getFullYear()} {store.storeName}. All rights reserved.</p>
              )}
              {tax.showGstinInFooter && tax.gstin && (
                <p className="text-gray-500 text-xs mt-1">GSTIN: {tax.gstin}</p>
              )}
            </div>
            <div className="flex flex-wrap md:justify-end gap-x-6 gap-y-2">
              {policyLinks.map(link => (
                <Link key={link.id} href={link.href} className="hover:text-gold-400 transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>
    </footer>
  );
}
