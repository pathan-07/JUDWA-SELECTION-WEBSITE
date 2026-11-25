import type { Metadata } from 'next';
import Link from 'next/link';
import InfoPage, { InfoSection } from '@/components/InfoPage';

export const metadata: Metadata = { title: 'Size Guide | JUDWA SELECTION' };

const KIDS_CHART = [
  { size: '0-3M', height: '56–62', chest: '40–42', waist: '40–42' },
  { size: '3-6M', height: '62–68', chest: '42–44', waist: '42–44' },
  { size: '6-12M', height: '68–80', chest: '44–48', waist: '44–46' },
  { size: '1-2Y', height: '80–92', chest: '48–51', waist: '46–48' },
  { size: '2-3Y', height: '92–98', chest: '51–53', waist: '48–50' },
  { size: '3-4Y', height: '98–104', chest: '53–55', waist: '50–51' },
  { size: '4-5Y', height: '104–110', chest: '55–57', waist: '51–53' },
  { size: '5-6Y', height: '110–116', chest: '57–59', waist: '53–54' },
  { size: '6-7Y', height: '116–122', chest: '59–62', waist: '54–56' },
  { size: '7-8Y', height: '122–128', chest: '62–65', waist: '56–58' },
  { size: '8-9Y', height: '128–134', chest: '65–68', waist: '58–60' },
  { size: '9-10Y', height: '134–140', chest: '68–71', waist: '60–62' },
  { size: '10-11Y', height: '140–146', chest: '71–74', waist: '62–64' },
  { size: '11-12Y', height: '146–152', chest: '74–77', waist: '64–66' },
  { size: '12-13Y', height: '152–158', chest: '77–80', waist: '66–68' },
  { size: '13-14Y', height: '158–164', chest: '80–84', waist: '68–70' },
];

const UNIFORM_CHART = [
  { size: '26', age: '4–5 years', chest: '66' },
  { size: '28', age: '6–7 years', chest: '71' },
  { size: '30', age: '8–9 years', chest: '76' },
  { size: '32', age: '10–11 years', chest: '81' },
  { size: '34', age: '12–13 years', chest: '86' },
  { size: '36', age: '14–15 years', chest: '91' },
];

const th = 'px-3 py-2 text-left font-semibold text-ink-900 bg-cream whitespace-nowrap';
const td = 'px-3 py-2 border-t border-ink-100 whitespace-nowrap';

export default function SizeGuidePage() {
  return (
    <InfoPage eyebrow="Find the perfect fit" title="Size Guide" intro="All measurements are in centimetres and are approximate. Fit can vary slightly by style.">
      <InfoSection title="How to measure">
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Height:</strong> stand straight without shoes, measure from head to heel.</li>
          <li><strong>Chest:</strong> measure around the fullest part of the chest, under the arms.</li>
          <li><strong>Waist:</strong> measure around the natural waistline, above the belly button.</li>
          <li>Between two sizes? Choose the bigger size — kids grow fast!</li>
        </ul>
      </InfoSection>

      <InfoSection title="Kids & baby wear (by age)">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Size</th>
                <th className={th}>Height (cm)</th>
                <th className={th}>Chest (cm)</th>
                <th className={th}>Waist (cm)</th>
              </tr>
            </thead>
            <tbody>
              {KIDS_CHART.map(row => (
                <tr key={row.size}>
                  <td className={`${td} font-semibold text-ink-900`}>{row.size}</td>
                  <td className={td}>{row.height}</td>
                  <td className={td}>{row.chest}</td>
                  <td className={td}>{row.waist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoSection>

      <InfoSection title="School uniform shirts (numeric size)">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Size</th>
                <th className={th}>Approx. age</th>
                <th className={th}>Chest (cm)</th>
              </tr>
            </thead>
            <tbody>
              {UNIFORM_CHART.map(row => (
                <tr key={row.size}>
                  <td className={`${td} font-semibold text-ink-900`}>{row.size}</td>
                  <td className={td}>{row.age}</td>
                  <td className={td}>{row.chest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </InfoSection>

      <p className="text-center text-sm">
        Need help choosing? <Link href="/contact" className="font-semibold underline hover:text-gold-600">Ask us on WhatsApp</Link>
      </p>
    </InfoPage>
  );
}
