'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import InfoPage, { InfoSection } from '@/components/InfoPage';
import { DEFAULT_SHIPPING_SETTINGS, loadShippingSettings } from '@/lib/shippingSettings';

export default function ShippingPolicyPage() {
  const [shipping, setShipping] = useState(DEFAULT_SHIPPING_SETTINGS);

  useEffect(() => {
    setShipping(loadShippingSettings());
  }, []);

  const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

  return (
    <InfoPage eyebrow="Delivery" title="Shipping Policy" intro="We deliver across India.">
      <InfoSection title="Shipping charges">
        {shipping.freeShippingAbove > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Free shipping</strong> on orders of {rupees(shipping.freeShippingAbove)} and above.
            </li>
            <li>
              Orders below {rupees(shipping.freeShippingAbove)} have a delivery charge of {rupees(shipping.shippingCharge)}.
            </li>
          </ul>
        ) : (
          <p><strong>Free shipping</strong> on all orders.</p>
        )}
      </InfoSection>

      <InfoSection title="Delivery time">
        <ul className="list-disc pl-5 space-y-1">
          <li>Orders are packed and dispatched within 1–2 working days.</li>
          <li>Delivery usually takes 3–7 working days depending on your location.</li>
          <li>Delays can happen during festivals, sales or due to weather and courier issues.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Cash on Delivery">
        <p>COD is available on most pin codes. A small COD charge may apply and is shown at checkout.</p>
      </InfoSection>

      <InfoSection title="Order tracking">
        <p>
          Once your order is shipped, you can check its status on the{' '}
          <Link href="/track-order" className="underline hover:text-gold-600">Track Order</Link> page.
        </p>
      </InfoSection>

      <InfoSection title="Wrong address or failed delivery">
        <p>
          Please double-check your address and phone number at checkout. If a parcel returns to us because of a wrong address
          or the customer being unavailable, re-shipping charges may apply.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
