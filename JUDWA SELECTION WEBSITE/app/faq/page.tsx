import type { Metadata } from 'next';
import Link from 'next/link';
import InfoPage from '@/components/InfoPage';

export const metadata: Metadata = { title: 'FAQ | JUDWA SELECTION' };

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'How do I choose the right size?',
    a: (
      <>
        Check our <Link href="/size-guide" className="underline hover:text-gold-600">Size Guide</Link>. If your child is
        between two sizes, we recommend the bigger size.
      </>
    ),
  },
  {
    q: 'Is Cash on Delivery available?',
    a: 'Yes, Cash on Delivery is available on most orders. You can also pay online with UPI, cards or net banking.',
  },
  {
    q: 'How long does delivery take?',
    a: (
      <>
        Orders are usually delivered in 3–7 working days, depending on your location. See our{' '}
        <Link href="/shipping-policy" className="underline hover:text-gold-600">Shipping Policy</Link>.
      </>
    ),
  },
  {
    q: 'Can I return or exchange a product?',
    a: (
      <>
        Yes, you can request a return or size exchange within 7 days of delivery. Read the{' '}
        <Link href="/returns" className="underline hover:text-gold-600">Returns</Link> page for details.
      </>
    ),
  },
  {
    q: 'How do I track my order?',
    a: (
      <>
        Use the <Link href="/track-order" className="underline hover:text-gold-600">Track Order</Link> page with the order
        number from your confirmation.
      </>
    ),
  },
  {
    q: 'Do you have uniforms for my child’s school?',
    a: (
      <>
        See the schools we supply on the <Link href="/school-uniforms" className="underline hover:text-gold-600">School
        Uniforms</Link> page. If your school is not listed, <Link href="/contact" className="underline hover:text-gold-600">contact us</Link>.
      </>
    ),
  },
  {
    q: 'Is online payment safe?',
    a: 'Yes. Payments are processed by Razorpay over a secure connection. We never see or store your card details.',
  },
];

export default function FaqPage() {
  return (
    <InfoPage eyebrow="Help" title="Frequently Asked Questions" intro="Quick answers to the questions parents ask us most.">
      <div className="space-y-3">
        {FAQS.map(item => (
          <details key={item.q} className="group bg-white border border-ink-100 rounded-xl p-5 open:shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink-900">
              {item.q}
              <span className="text-gold-600 text-xl leading-none transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-ink-600">{item.a}</p>
          </details>
        ))}
      </div>
      <p className="text-center text-sm">
        Still have a question? <Link href="/contact" className="font-semibold underline hover:text-gold-600">Contact us</Link>
      </p>
    </InfoPage>
  );
}
