'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import InfoPage, { InfoSection } from '@/components/InfoPage';
import { DEFAULT_STORE_SETTINGS, loadStoreSettings } from '@/lib/storeSettings';

export default function TermsPage() {
  const [store, setStore] = useState(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    setStore(loadStoreSettings());
  }, []);

  return (
    <InfoPage eyebrow="Legal" title="Terms & Conditions" intro={`Please read these terms before shopping with ${store.storeName}.`}>
      <InfoSection title="Orders">
        <ul className="list-disc pl-5 space-y-1">
          <li>An order is confirmed once you receive an order number.</li>
          <li>We may cancel an order if a product is out of stock or details are incorrect. Any amount paid will be refunded.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Prices & payment">
        <ul className="list-disc pl-5 space-y-1">
          <li>All prices are in Indian Rupees (₹) and include applicable taxes.</li>
          <li>Prices and offers can change without notice. The price at the time of ordering applies.</li>
          <li>Coupons cannot be combined unless stated.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Products">
        <p>
          We try to show colours and details accurately. Slight differences can occur due to screen settings and lighting.
          Sizes are approximate — please check the <Link href="/size-guide" className="underline hover:text-gold-600">Size Guide</Link>.
        </p>
      </InfoSection>

      <InfoSection title="Shipping, returns & refunds">
        <p>
          See our <Link href="/shipping-policy" className="underline hover:text-gold-600">Shipping Policy</Link> and{' '}
          <Link href="/returns" className="underline hover:text-gold-600">Returns</Link> page.
        </p>
      </InfoSection>

      <InfoSection title="Use of the website">
        <p>
          All images, logos and content on this website belong to {store.storeName} and may not be copied without
          permission.
        </p>
      </InfoSection>

      <InfoSection title="Governing law">
        <p>These terms are governed by the laws of India. Disputes are subject to the courts of Gujarat.</p>
      </InfoSection>

      <InfoSection title="Contact">
        <p>
          Questions about these terms? <Link href="/contact" className="underline hover:text-gold-600">Contact us</Link>.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
