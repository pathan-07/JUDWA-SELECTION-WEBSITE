import type { Metadata } from 'next';
import Link from 'next/link';
import InfoPage, { InfoSection } from '@/components/InfoPage';

export const metadata: Metadata = { title: 'Returns & Exchanges | JUDWA SELECTION' };

export default function ReturnsPage() {
  return (
    <InfoPage eyebrow="Easy 7-Day Returns" title="Returns & Exchanges" intro="Not the right size? No problem — we make returns and exchanges simple.">
      <InfoSection title="Return window">
        <p>You can request a return or size exchange within <strong>7 days of delivery</strong>.</p>
      </InfoSection>

      <InfoSection title="Conditions">
        <ul className="list-disc pl-5 space-y-1">
          <li>Product must be unused, unwashed and in its original condition.</li>
          <li>All tags and the original packaging must be intact.</li>
          <li>Innerwear, socks and items marked “non-returnable” cannot be returned for hygiene reasons.</li>
          <li>Customised or altered school uniforms cannot be returned, but can be exchanged if there is a defect.</li>
        </ul>
      </InfoSection>

      <InfoSection title="How to request a return">
        <ol className="list-decimal pl-5 space-y-1">
          <li>
            <Link href="/contact" className="underline hover:text-gold-600">Contact us</Link> on WhatsApp or phone with your
            order number.
          </li>
          <li>Tell us the item and the reason (size exchange, defect, etc.).</li>
          <li>We will arrange a pickup or share the return address.</li>
          <li>Once we receive and check the item, your exchange is shipped or refund is processed.</li>
        </ol>
      </InfoSection>

      <InfoSection title="Refunds">
        <ul className="list-disc pl-5 space-y-1">
          <li>Online payments are refunded to the original payment method within 5–7 working days after approval.</li>
          <li>Cash on Delivery orders are refunded by UPI or bank transfer.</li>
          <li>Shipping charges are non-refundable unless the product was damaged or wrong.</li>
        </ul>
      </InfoSection>

      <InfoSection title="Damaged or wrong product?">
        <p>
          Please share a photo/video within 48 hours of delivery and we will replace it at no extra cost.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
