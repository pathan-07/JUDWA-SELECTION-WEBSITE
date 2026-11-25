'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import InfoPage, { InfoSection } from '@/components/InfoPage';
import { DEFAULT_STORE_SETTINGS, loadStoreSettings } from '@/lib/storeSettings';

export default function PrivacyPolicyPage() {
  const [store, setStore] = useState(DEFAULT_STORE_SETTINGS);

  useEffect(() => {
    setStore(loadStoreSettings());
  }, []);

  return (
    <InfoPage eyebrow="Your data" title="Privacy Policy" intro={`How ${store.storeName} collects and uses your information.`}>
      <InfoSection title="Information we collect">
        <ul className="list-disc pl-5 space-y-1">
          <li>Name, phone number, email and delivery address you enter at checkout.</li>
          <li>Order details such as products, sizes and payment method.</li>
          <li>Basic usage data (pages visited) to improve the website.</li>
        </ul>
      </InfoSection>

      <InfoSection title="How we use it">
        <ul className="list-disc pl-5 space-y-1">
          <li>To process, deliver and support your orders.</li>
          <li>To contact you about your order by phone, SMS, WhatsApp or email.</li>
          <li>To send offers only if you have subscribed. You can unsubscribe any time.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Payments">
        <p>
          Online payments are handled by Razorpay. We do not see or store your card, UPI PIN or bank details.
        </p>
      </InfoSection>

      <InfoSection title="Sharing">
        <p>
          We never sell your data. We share only what is needed with delivery partners and payment providers to complete your
          order, or when required by law.
        </p>
      </InfoSection>

      <InfoSection title="Your choices">
        <p>
          You can ask us to update or delete your personal information by{' '}
          <Link href="/contact" className="underline hover:text-gold-600">contacting us</Link>
          {store.email ? <> at <a href={`mailto:${store.email}`} className="underline hover:text-gold-600">{store.email}</a></> : null}.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
