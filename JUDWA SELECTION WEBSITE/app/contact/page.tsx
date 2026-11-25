'use client';

import { useEffect, useState } from 'react';
import { Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import InfoPage, { InfoSection } from '@/components/InfoPage';
import { DEFAULT_STORE_SETTINGS, loadStoreSettings } from '@/lib/storeSettings';

const inputClass =
  'w-full px-4 py-2.5 border border-ink-200 bg-white focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500';

export default function ContactPage() {
  const [store, setStore] = useState(DEFAULT_STORE_SETTINGS);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setStore(loadStoreSettings());
  }, []);

  const whatsappNumber = (store.phones[0] || '').replace(/\D/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Hello ${store.storeName}, I am ${name.trim()}.\n\n${message.trim()}`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <InfoPage eyebrow="We're here to help" title="Contact Us" intro="Questions about sizes, orders or school uniforms? Reach us any time.">
      <div className="grid sm:grid-cols-3 gap-4">
        {store.phones.length > 0 && (
          <div className="bg-white border border-ink-100 rounded-xl p-5 text-center">
            <Phone className="w-6 h-6 text-gold-600 mx-auto mb-2" />
            <p className="font-semibold text-ink-900 mb-1">Call us</p>
            {store.phones.map(phone => (
              <a key={phone} href={`tel:${phone.replace(/\s+/g, '')}`} className="block text-sm hover:text-gold-600">
                {phone}
              </a>
            ))}
          </div>
        )}
        {store.email && (
          <div className="bg-white border border-ink-100 rounded-xl p-5 text-center min-w-0">
            <Mail className="w-6 h-6 text-gold-600 mx-auto mb-2" />
            <p className="font-semibold text-ink-900 mb-1">Email</p>
            <a href={`mailto:${store.email}`} className="text-sm break-all hover:text-gold-600">
              {store.email}
            </a>
          </div>
        )}
        {store.address && (
          <div className="bg-white border border-ink-100 rounded-xl p-5 text-center">
            <MapPin className="w-6 h-6 text-gold-600 mx-auto mb-2" />
            <p className="font-semibold text-ink-900 mb-1">Visit our store</p>
            <p className="text-sm whitespace-pre-line">{store.address}</p>
          </div>
        )}
      </div>

      {whatsappNumber && (
        <InfoSection title="Send us a message">
          <p className="text-sm text-ink-500 mb-2">Your message opens in WhatsApp so we can reply quickly.</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              required
              maxLength={60}
              className={inputClass}
            />
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="How can we help?"
              required
              rows={4}
              maxLength={1000}
              className={inputClass}
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-ink-950 hover:bg-gold-600 text-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition"
              >
                <Send className="w-4 h-4" /> Send on WhatsApp
              </button>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-ink-950 text-ink-950 hover:bg-ink-950 hover:text-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition"
              >
                <MessageCircle className="w-4 h-4" /> Chat now
              </a>
            </div>
          </form>
        </InfoSection>
      )}
    </InfoPage>
  );
}
