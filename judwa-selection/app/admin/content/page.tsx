'use client';

import Link from 'next/link';
import { Image as ImageIcon, Clapperboard, Layers } from 'lucide-react';

export default function AdminContentPage() {
  const sections = [
    { title: 'Banners', description: 'Homepage hero banners with optional text overlay', href: '/admin/banners', icon: <ImageIcon className="w-8 h-8" /> },
    { title: 'Reels', description: 'Vertical video reels shown on the homepage', href: '/admin/reels', icon: <Clapperboard className="w-8 h-8" /> },
    { title: 'Collections', description: 'Curated collection cards (Boys, Girls, Uniforms...)', href: '/admin/collections', icon: <Layers className="w-8 h-8" /> },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Content</h2>
      <p className="text-sm text-gray-600 mb-6">Manage everything shown on the customer-facing homepage</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map(section => (
          <Link key={section.href} href={section.href}>
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:scale-105 transition-all cursor-pointer h-full">
              <div className="bg-blue-50 p-3 rounded-lg w-fit mb-4 text-blue-600">{section.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-sm text-gray-600">{section.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
