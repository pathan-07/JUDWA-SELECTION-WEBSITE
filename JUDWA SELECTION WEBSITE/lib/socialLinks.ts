export interface CustomSocialLink {
  label: string;
  url: string;
}

export interface SocialLinks {
  whatsapp: string;
  whatsappGroup: string;
  instagram: string;
  facebook: string;
  youtube: string;
  twitter: string;
  custom: CustomSocialLink[];
}

export const SOCIAL_LINKS_STORAGE_KEY = 'judwa_social_links';

export const DEFAULT_SOCIAL_LINKS: SocialLinks = {
  whatsapp: '',
  whatsappGroup: '',
  instagram: '',
  facebook: '',
  youtube: '',
  twitter: '',
  custom: [],
};

export function loadSocialLinks(): SocialLinks {
  if (typeof window === 'undefined') return DEFAULT_SOCIAL_LINKS;
  try {
    const raw = localStorage.getItem(SOCIAL_LINKS_STORAGE_KEY);
    if (!raw) return DEFAULT_SOCIAL_LINKS;
    const parsed = { ...DEFAULT_SOCIAL_LINKS, ...JSON.parse(raw) };
    return { ...parsed, custom: Array.isArray(parsed.custom) ? parsed.custom : [] };
  } catch {
    return DEFAULT_SOCIAL_LINKS;
  }
}

export function saveSocialLinks(links: SocialLinks) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOCIAL_LINKS_STORAGE_KEY, JSON.stringify(links));
  void import('./settingsSync').then(m => m.pushSetting(SOCIAL_LINKS_STORAGE_KEY));
  window.dispatchEvent(new Event('storage'));
}

/** Adds https:// when missing and rejects non-web schemes (e.g. javascript:). Returns '' if invalid. */
export function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

/** Accepts a phone number and returns a wa.me chat link. */
export function whatsappChatUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  return `https://wa.me/${digits.length === 10 ? `91${digits}` : digits}`;
}
