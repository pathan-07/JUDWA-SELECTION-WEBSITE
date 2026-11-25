export interface FooterLink {
  id: string;
  label: string;
  href: string;
  /** False when the page is not built yet (link would show a 404). */
  pageExists: boolean;
}

export const FOOTER_SHOP_LINKS: FooterLink[] = [
  { id: 'home', label: 'Home', href: '/', pageExists: true },
  { id: 'boys', label: 'Boys', href: '/products?category=boys', pageExists: true },
  { id: 'girls', label: 'Girls', href: '/products?category=girls', pageExists: true },
  { id: 'baby', label: 'Baby', href: '/products?category=baby-boys', pageExists: true },
  { id: 'uniforms', label: 'School Uniforms', href: '/school-uniforms', pageExists: true },
  { id: 'combos', label: 'Combos & Offers', href: '/combos', pageExists: true },
];

export const FOOTER_HELP_LINKS: FooterLink[] = [
  { id: 'track', label: 'Track Order', href: '/track-order', pageExists: true },
  { id: 'returns', label: 'Returns', href: '/returns', pageExists: true },
  { id: 'faq', label: 'FAQ', href: '/faq', pageExists: true },
  { id: 'contact', label: 'Contact Us', href: '/contact', pageExists: true },
  { id: 'size-guide', label: 'Size Guide', href: '/size-guide', pageExists: true },
  { id: 'about', label: 'About Us', href: '/about', pageExists: true },
];

export const FOOTER_POLICY_LINKS: FooterLink[] = [
  { id: 'privacy', label: 'Privacy Policy', href: '/privacy-policy', pageExists: true },
  { id: 'terms', label: 'Terms & Conditions', href: '/terms-conditions', pageExists: true },
  { id: 'shipping', label: 'Shipping Policy', href: '/shipping-policy', pageExists: true },
];

export interface FooterSettings {
  showNewsletter: boolean;
  showAbout: boolean;
  showSocialIcons: boolean;
  showShop: boolean;
  showHelp: boolean;
  showContact: boolean;
  showCopyright: boolean;
  showPolicies: boolean;
  hiddenLinks: string[];
}

export type FooterSectionKey = Exclude<keyof FooterSettings, 'hiddenLinks'>;

export const FOOTER_SETTINGS_STORAGE_KEY = 'judwa_footer_settings';

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
  showNewsletter: true,
  showAbout: true,
  showSocialIcons: true,
  showShop: true,
  showHelp: true,
  showContact: true,
  showCopyright: true,
  showPolicies: true,
  hiddenLinks: [],
};

export function loadFooterSettings(): FooterSettings {
  if (typeof window === 'undefined') return DEFAULT_FOOTER_SETTINGS;
  try {
    const raw = localStorage.getItem(FOOTER_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_FOOTER_SETTINGS;
    return { ...DEFAULT_FOOTER_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_FOOTER_SETTINGS;
  }
}

export function saveFooterSettings(settings: FooterSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FOOTER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  void import('./settingsSync').then(m => m.pushSetting(FOOTER_SETTINGS_STORAGE_KEY));
  window.dispatchEvent(new Event('storage'));
}

export function visibleLinks(links: FooterLink[], settings: FooterSettings): FooterLink[] {
  return links.filter(link => !settings.hiddenLinks.includes(link.id));
}
