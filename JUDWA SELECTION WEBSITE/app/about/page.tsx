import type { Metadata } from 'next';
import Link from 'next/link';
import InfoPage, { InfoSection } from '@/components/InfoPage';

export const metadata: Metadata = { title: 'About Us | JUDWA SELECTION' };

export default function AboutPage() {
  return (
    <InfoPage eyebrow="Our Story" title="About JUDWA SELECTION" intro="Comfortable, good-quality kids wear and school uniforms at honest prices.">
      <InfoSection title="Who we are">
        <p>
          JUDWA SELECTION is a family-run kids wear store. We pick every piece for comfort, durability and style — so
          children can play freely and parents can shop with confidence.
        </p>
      </InfoSection>

      <InfoSection title="What we offer">
        <ul className="list-disc pl-5 space-y-1">
          <li>Everyday and festive wear for boys and girls</li>
          <li>
            <Link href="/school-uniforms" className="underline hover:text-gold-600">School uniforms</Link> — shirt and
            pant sets matched to your school
          </li>
          <li>
            Value <Link href="/combos" className="underline hover:text-gold-600">combo packs</Link>
          </li>
        </ul>
      </InfoSection>

      <InfoSection title="Why shop with us">
        <ul className="list-disc pl-5 space-y-1">
          <li>Cash on Delivery and secure online payments</li>
          <li>
            Easy <Link href="/returns" className="underline hover:text-gold-600">7-day returns and size exchanges</Link>
          </li>
          <li>Quick help on WhatsApp and phone</li>
        </ul>
      </InfoSection>

      <InfoSection title="Get in touch">
        <p>
          Have a question about sizes, uniforms or an order?{' '}
          <Link href="/contact" className="font-semibold underline hover:text-gold-600">Contact us</Link> — we are happy to help.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
