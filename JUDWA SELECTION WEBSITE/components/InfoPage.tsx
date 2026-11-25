import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function InfoPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="text-center mb-8 sm:mb-10">
            <span className="eyebrow">{eyebrow}</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-ink-950 mt-2">{title}</h1>
            {intro && <p className="text-sm sm:text-base text-ink-500 mt-3 max-w-xl mx-auto">{intro}</p>}
            <div className="mx-auto mt-4 h-px w-16 bg-gold-500" />
          </div>
          <div className="space-y-6 text-ink-700 text-sm sm:text-base leading-relaxed">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-ink-100 rounded-xl p-5 sm:p-6">
      <h2 className="font-serif text-lg sm:text-xl font-semibold text-ink-900 mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
