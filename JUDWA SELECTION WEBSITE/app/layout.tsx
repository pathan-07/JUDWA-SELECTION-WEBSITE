import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { Toaster as SonnerToaster } from 'sonner';
import AppShell from '@/components/AppShell';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'JUDWA SELECTION - Premium Kids Wear Store',
  description: 'Premium kids wear and school uniforms from JUDWA SELECTION. Quality, comfort, and style for every little star.',
  keywords: 'kids wear, children clothing, school uniforms, baby clothes, Indian kids fashion',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://judwaselection.com',
    siteName: 'JUDWA SELECTION',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#171412" />
      </head>
      <body>
        <Toaster position="top-right" />
        <SonnerToaster position="top-right" richColors />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
